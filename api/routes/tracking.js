const express = require('express');
const Nurse = require('../models/Nurse');
const ServiceRequest = require('../models/ServiceRequest');
const router = express.Router();

function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 3959;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

router.post('/nurse/:nurseId/general-location', async (req, res) => {
  try {
    const { nurseId } = req.params;
    const { latitude, longitude, accuracy } = req.body;
    const nurse = await Nurse.findOne({ nurse_id: nurseId });
    if (!nurse) return res.status(404).json({ success: false, error: 'Nurse not found' });
    await nurse.updateGeneralLocation(latitude, longitude, accuracy);
    res.json({ success: true, message: 'General location updated' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/nurse/:nurseId/precise-location', async (req, res) => {
  try {
    const { nurseId } = req.params;
    const { latitude, longitude, accuracy, speed } = req.body;
    const nurse = await Nurse.findOne({ nurse_id: nurseId });
    if (!nurse) return res.status(404).json({ success: false, error: 'Nurse not found' });
    if (!nurse.precise_location.is_tracking) {
      return res.status(400).json({ success: false, error: 'Precise tracking not enabled for this nurse' });
    }
    await nurse.updatePreciseLocation(latitude, longitude, accuracy);
    if (nurse.active_job && nurse.active_job.request_id) {
      const request = await ServiceRequest.findOne({ request_id: nurse.active_job.request_id });
      if (request) {
        const patientCoords = request.patient_location.coordinates;
        const distanceToPatient = calculateDistance(latitude, longitude, patientCoords[1], patientCoords[0]);
        const estimatedMinutes = speed > 0 ? (distanceToPatient / speed) * 60 : distanceToPatient * 3;
        const estimatedArrival = new Date(Date.now() + estimatedMinutes * 60000);
        request.tracking_data.push({
          timestamp: new Date(),
          nurse_location: { type: 'Point', coordinates: [longitude, latitude] },
          distance_to_patient: distanceToPatient,
          estimated_arrival: estimatedArrival,
          speed: speed || 0,
          accuracy: accuracy || 5
        });
        await request.save();
      }
    }
    res.json({ success: true, message: 'Precise location updated' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/nurse/:nurseId/start-tracking/:requestId', async (req, res) => {
  try {
    const { nurseId, requestId } = req.params;
    const nurse = await Nurse.findOne({ nurse_id: nurseId });
    const request = await ServiceRequest.findOne({ request_id: requestId });
    if (!nurse || !request) return res.status(404).json({ success: false, error: 'Nurse or request not found' });
    await nurse.startPreciseTracking(requestId, request.patient_location);
    request.status = 'accepted';
    request.nurse_accepted_at = new Date();
    await request.save();
    res.json({ success: true, tracking_enabled: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/nurse/:nurseId/stop-tracking', async (req, res) => {
  try {
    const { nurseId } = req.params;
    const nurse = await Nurse.findOne({ nurse_id: nurseId });
    if (!nurse) return res.status(404).json({ success: false, error: 'Nurse not found' });
    await nurse.stopPreciseTracking();
    res.json({ success: true, tracking_enabled: false });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/request/:requestId/nurse-location', async (req, res) => {
  try {
    const { requestId } = req.params;
    const request = await ServiceRequest.findOne({ request_id: requestId })
      .populate('nurse_id', 'nurse_id first_name last_name precise_location current_status');
    if (!request) return res.status(404).json({ success: false, error: 'Request not found' });
    if (!request.nurse_id) return res.status(400).json({ success: false, error: 'No nurse assigned' });
    const nurse = request.nurse_id;
    const latestTracking = request.tracking_data.length > 0 ? request.tracking_data[request.tracking_data.length - 1] : null;
    res.json({
      success: true,
      nurse_info: {
        nurse_id: nurse.nurse_id,
        first_name: nurse.first_name,
        last_name: nurse.last_name,
        current_status: nurse.current_status
      },
      current_location: nurse.precise_location.is_tracking ? {
        latitude: nurse.precise_location.coordinates[1],
        longitude: nurse.precise_location.coordinates[0],
        accuracy: nurse.precise_location.accuracy,
        last_updated: nurse.precise_location.last_updated
      } : null,
      latest_tracking: latestTracking,
      is_tracking: nurse.precise_location.is_tracking,
      request_status: request.status
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/tracking/nurses/nearby
// Find closest available nurses using general location
router.get('/nurses/nearby', async (req, res) => {
  try {
    const { latitude, longitude, radius = 15, service_type } = req.query;

    if (!latitude || !longitude) {
      return res.status(400).json({
        success: false,
        error: 'Latitude and longitude required'
      });
    }

    const radiusInMeters = parseFloat(radius) * 1609.34;

    const nurses = await Nurse.find({
      general_location: {
        $near: {
          $geometry: { type: 'Point', coordinates: [parseFloat(longitude), parseFloat(latitude)] },
          $maxDistance: radiusInMeters
        }
      },
      account_status: 'active',
      verification_status: 'verified',
      is_online: true,
      current_status: 'available',
      'precise_location.is_tracking': false
    }).select('-password -documents').limit(10);

    const { calculateTotalPrice } = require('../config/pricing');

    const nursesWithPricing = nurses.map(nurse => {
      const distance = calculateDistance(
        parseFloat(latitude),
        parseFloat(longitude),
        nurse.general_location.coordinates[1],
        nurse.general_location.coordinates[0]
      );

      const pricing = calculateTotalPrice(
        service_type,
        distance,
        'normal',
        new Date()
      );

      return {
        nurse_id: nurse.nurse_id,
        first_name: nurse.first_name,
        last_name: nurse.last_name,
        specialties: nurse.specialties,
        years_experience: nurse.years_experience,
        average_rating: nurse.average_rating,
        total_completed_visits: nurse.total_completed_visits,
        distance_miles: Math.round(distance * 10) / 10,
        estimated_arrival_minutes: Math.round(distance * 3 + 5),
        pricing,
        general_location: nurse.general_location
      };
    });

    nursesWithPricing.sort((a, b) => a.distance_miles - b.distance_miles);

    res.json({ success: true, count: nursesWithPricing.length, nurses: nursesWithPricing });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;

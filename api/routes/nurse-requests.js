const express = require('express');
const ServiceRequest = require('../models/ServiceRequest');
const Nurse = require('../models/Nurse');
const router = express.Router();

// GET /api/requests/pending-for-nurse/:nurseId
// Get pending requests that a nurse can accept
router.get('/pending-for-nurse/:nurseId', async (req, res) => {
  try {
    const { nurseId } = req.params;

    const nurse = await Nurse.findOne({ nurse_id: nurseId });
    if (!nurse) {
      return res.status(404).json({
        success: false,
        error: 'Nurse not found'
      });
    }

    const requests = await ServiceRequest.find({
      status: 'pending',
      patient_location: {
        $near: {
          $geometry: nurse.general_location,
          $maxDistance: nurse.availability_radius * 1609.34
        }
      }
    })
    .populate('patient_id', 'first_name last_name phone average_rating')
    .sort({ requested_at: 1 })
    .limit(5);

    const requestsWithDistance = requests.map(request => {
      const distance = calculateDistance(
        nurse.general_location.coordinates[1],
        nurse.general_location.coordinates[0],
        request.patient_location.coordinates[1],
        request.patient_location.coordinates[0]
      );

      return {
        ...request.toObject(),
        distance_miles: Math.round(distance * 10) / 10,
        estimated_duration: Math.round(distance * 3 + 10)
      };
    });

    res.json({
      success: true,
      requests: requestsWithDistance
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// PUT /api/requests/:requestId/accept
// Accept a request
router.put('/:requestId/accept', async (req, res) => {
  try {
    const { requestId } = req.params;
    const { nurse_id } = req.body;

    const request = await ServiceRequest.findOne({
      request_id: requestId,
      status: 'pending'
    });

    if (!request) {
      return res.status(400).json({
        success: false,
        error: 'Request is no longer available'
      });
    }

    const nurse = await Nurse.findOne({
      nurse_id: nurse_id,
      is_online: true,
      current_status: 'available'
    });

    if (!nurse) {
      return res.status(400).json({
        success: false,
        error: 'Nurse is not available'
      });
    }

    request.nurse_id = nurse_id;
    request.status = 'accepted';
    request.nurse_accepted_at = new Date();
    await request.save();

    nurse.current_status = 'busy';
    await nurse.save();

    res.json({
      success: true,
      message: 'Request accepted successfully',
      request: request
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/nurses/:nurseId/stats/today
// Get today's statistics for a nurse
router.get('/:nurseId/stats/today', async (req, res) => {
  try {
    const { nurseId } = req.params;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayRequests = await ServiceRequest.find({
      nurse_id: nurseId,
      status: 'completed',
      service_completed_at: {
        $gte: today,
        $lt: tomorrow
      }
    });

    const earnings = todayRequests.reduce((sum, req) => sum + req.nurse_earnings, 0);
    const patients = todayRequests.length;

    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay());

    const weekRequests = await ServiceRequest.find({
      nurse_id: nurseId,
      status: 'completed',
      service_completed_at: {
        $gte: weekStart
      }
    });

    const weekEarnings = weekRequests.reduce((sum, req) => sum + req.nurse_earnings, 0);

    res.json({
      success: true,
      earnings: earnings,
      patients: patients,
      week_earnings: weekEarnings,
      week_patients: weekRequests.length
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

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

module.exports = router;

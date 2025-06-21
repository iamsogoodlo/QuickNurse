const express = require('express');
const Nurse = require('../models/Nurse');
const ServiceRequest = require('../models/ServiceRequest');
const router = express.Router();
// const authMiddleware = require('../middleware/auth'); // Placeholder for JWT auth middleware

// Calculate distance between two points (Haversine formula)
function calculateDistance(lat1, lon1, lat2, lon2) {
  if (lat1 == null || lon1 == null || lat2 == null || lon2 == null) return Infinity;
  const R = 3959; // Earth's radius in miles
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

// Dynamic pricing calculation
const calculateServicePrice = (basePriceInput, nurse, distance, urgency, timeOfDay) => {
  let basePrice = typeof basePriceInput === 'number' ? basePriceInput : parseFloat(basePriceInput) || 35; // Fallback base price
  let totalPrice = basePrice;
  
  let experienceMultiplier = 1.0;
  if (nurse.years_experience >= 10) experienceMultiplier = 1.25;
  else if (nurse.years_experience >= 5) experienceMultiplier = 1.15;
  else if (nurse.years_experience >= 2) experienceMultiplier = 1.05;
  
  if (nurse.average_rating >= 4.8) experienceMultiplier += 0.10;
  else if (nurse.average_rating >= 4.5) experienceMultiplier += 0.05;
  
  totalPrice *= Math.min(experienceMultiplier, 1.4); // Cap experience/rating bonus
  
  let distanceFee = 0;
  if (distance > 15) distanceFee = 25;
  else if (distance > 10) distanceFee = 18;
  else if (distance > 5) distanceFee = 10;
  else if (distance > 2) distanceFee = 5;
  
  totalPrice += distanceFee;
  
  let urgencyFeeNumeric = 0;
  if (urgency === 'urgent') {
    urgencyFeeNumeric = 15;
    totalPrice += urgencyFeeNumeric;
  }
  
  let surgeMultiplierValue = 1.0;
  const hour = timeOfDay; // Assuming timeOfDay is an hour (0-23)
  const dayOfWeek = new Date().getDay(); // 0 (Sun) - 6 (Sat)
  
  if (dayOfWeek === 0 || dayOfWeek === 6) surgeMultiplierValue += 0.15; // Weekend
  if (hour >= 18 && hour <= 22) surgeMultiplierValue += 0.10; // Evening
  if (hour >= 22 || hour < 6) surgeMultiplierValue += 0.25; // Late night
  
  totalPrice *= surgeMultiplierValue;
  
  const platformFee = Math.round(totalPrice * 0.20 * 100) / 100; // 20% platform fee, rounded to 2 decimal places
  const nurseEarnings = Math.round((totalPrice - platformFee) * 100) / 100;
  
  return {
    totalPrice: Math.round(totalPrice * 100) / 100,
    nurseEarnings,
    platformFee,
    breakdown: {
      basePrice,
      experienceMultiplier: parseFloat(experienceMultiplier.toFixed(2)),
      distanceFee,
      urgencyFee: urgencyFeeNumeric,
      surgeMultiplier: parseFloat(surgeMultiplierValue.toFixed(2))
    }
  };
};

// GET /api/nurses/nearby - Find available nurses near location
router.get('/nearby', async (req, res) => {
  try {
    const { lat, lng, radius = '15', specialty, service_type = 'general' } = req.query;

    const patientLat = parseFloat(lat);
    const patientLng = parseFloat(lng);
    const searchRadiusMiles = parseInt(radius, 10);

    if (isNaN(patientLat) || isNaN(patientLng)) {
      return res.status(400).json({
        success: false,
        error: 'Valid latitude and longitude are required parameters.'
      });
    }

    const radiusInMeters = searchRadiusMiles * 1609.34;

    const query = {
      general_location: {
        $nearSphere: {
          $geometry: {
            type: 'Point',
            coordinates: [patientLng, patientLat]
          },
          $maxDistance: radiusInMeters
        }
      },
      account_status: 'active',
      verification_status: 'verified',
      is_online: true,
      current_status: 'available'
    };

    if (specialty && specialty !== 'all') {
      query.specialties = { $in: [specialty] };
    }

    const nurses = await Nurse.find(query)
      .select('-password -verification_status -account_status -cancellation_rate -total_earnings -total_ratings -total_completed_visits') // Exclude sensitive/internal fields
      .limit(20);

    const serviceBasePrices = {
      'general': 35,
      'fever_check': 35,
      'blood_pressure': 30,
      'wound_care': 50,
      'medication_help': 45,
      'health_consultation': 25,
      'diabetes_care': 55,
      'iv_therapy': 65
    };

    const basePrice = serviceBasePrices[service_type] || serviceBasePrices['general'];
    const currentHour = new Date().getHours();

    const nursesWithPricing = nurses
      .filter(nurse => nurse.general_location && Array.isArray(nurse.general_location.coordinates) && nurse.general_location.coordinates.length === 2)
      .map(nurse => {
        const distance = calculateDistance(
          patientLat,
          patientLng,
          nurse.general_location.coordinates[1],
          nurse.general_location.coordinates[0]
        );

        const pricing = calculateServicePrice(
          basePrice,
          nurse,
          distance,
          'normal',
          currentHour
        );

        return {
          nurse_id: nurse.nurse_id,
          first_name: nurse.first_name,
          last_name: nurse.last_name,
          email: nurse.email,
          specialties: nurse.specialties,
          years_experience: nurse.years_experience,
          average_rating: nurse.average_rating,
          general_location: nurse.general_location,
          pricing,
          distance: parseFloat(distance.toFixed(1))
        };
    });


    res.json({ success: true, data: nursesWithPricing });

  } catch (error) {
    console.error("Error fetching nearby nurses:", error);
    res.status(500).json({ success: false, error: error.message || 'Server error while fetching nearby nurses.' });
  }
});


// PUT /api/nurses/status - Update nurse's online status and current working status
// This route should be protected by authentication middleware
router.put('/status', /* authMiddleware, */ async (req, res) => { // Assuming authMiddleware verifies nurse token and adds nurse.id to req
  try {
    // const nurseId = req.user.id; // Get nurse_id from authenticated user token
    // For now, let's assume nurse_id is passed in body for simplicity if authMiddleware isn't set up yet for this example
    // This is NOT secure for production. Use JWT auth.
    const { nurse_id_from_token_or_body, is_online, current_status } = req.body; 
    
    // In a real app with JWT:
    // const token = req.headers.authorization?.split(' ')[1];
    // if (!token) return res.status(401).json({ success: false, error: 'No token provided' });
    // const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // if (decoded.type !== 'nurse') return res.status(403).json({ success: false, error: 'Access forbidden: Not a nurse' });
    // const nurseId = decoded.id;

    const nurseId = nurse_id_from_token_or_body; // TEMPORARY: Replace with JWT user ID

    if (!nurseId) {
        return res.status(400).json({ success: false, error: 'Nurse ID is required.'})
    }

    const updateData = {};
    if (typeof is_online === 'boolean') {
      updateData.is_online = is_online;
    }
    if (current_status) {
      updateData.current_status = current_status;
    }

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ success: false, error: 'No update data provided (is_online or current_status).' });
    }

    const updatedNurse = await Nurse.findOneAndUpdate(
      { nurse_id: nurseId }, 
      { $set: updateData },
      { new: true, runValidators: true }
    ).select('-password');

    if (!updatedNurse) {
      return res.status(404).json({ success: false, error: 'Nurse not found.' });
    }

    res.json({ success: true, data: updatedNurse });

  } catch (error) {
    console.error("Error updating nurse status:", error);
    res.status(500).json({ success: false, error: error.message || 'Server error while updating nurse status.' });
  }
});


// GET /api/nurses/profile - Get current nurse's profile
// This route should be protected by authentication middleware
router.get('/profile', /* authMiddleware, */ async (req, res) => {
    try {
        // const nurseId = req.user.id; // From JWT
        // Temporary: assume nurse_id is passed via query for example if no auth
        const { nurse_id_from_query_or_token } = req.query; 
        const nurseId = nurse_id_from_query_or_token; // TEMPORARY

        if (!nurseId) {
            return res.status(400).json({ success: false, error: 'Nurse ID is required for profile.'})
        }

        const nurse = await Nurse.findOne({ nurse_id: nurseId }).select('-password');
        if (!nurse) {
            return res.status(404).json({ success: false, error: 'Nurse profile not found.' });
        }
        res.json({ success: true, data: nurse });
    } catch (error) {
        console.error("Error fetching nurse profile:", error);
        res.status(500).json({ success: false, error: error.message || 'Server error fetching nurse profile.' });
    }
});

// GET /api/nurses/dashboard - stats and new job opportunities
router.get('/dashboard', async (req, res) => {
  try {
    const { nurse_id } = req.query;
    if (!nurse_id) {
      return res.status(400).json({ success: false, error: 'nurse_id is required' });
    }

    const nurse = await Nurse.findOne({ nurse_id }).select('average_rating');
    if (!nurse) {
      return res.status(404).json({ success: false, error: 'Nurse not found' });
    }

    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0,0,0,0);

    const completed = await ServiceRequest.find({
      nurse_id,
      status: 'completed',
      service_completed_at: { $gte: startOfMonth }
    }).select('nurse_earnings');

    const monthlyRevenue = completed.reduce((sum, r) => sum + (r.nurse_earnings || 0), 0);
    const monthlyJobs = completed.length;

    const pendingRequests = await ServiceRequest.find({ status: 'pending' })
      .sort({ requested_at: -1 })
      .limit(5);

    const newRequests = pendingRequests.map(r => ({
      request_id: r.request_id,
      patient_display_name: 'Patient',
      service_type: r.service_type.replace(/_/g, ' '),
      approx_distance_miles: r.nurse_distance || 0,
      patient_city_state: r.patient_address ? `${r.patient_address.city}, ${r.patient_address.state}` : '',
      estimated_earnings: r.nurse_earnings || 0,
      requested_at: r.requested_at.toISOString(),
      status: 'pending'
    }));

    res.json({
      success: true,
      data: {
        monthly_revenue: monthlyRevenue,
        monthly_jobs: monthlyJobs,
        average_rating: nurse.average_rating || 0,
        new_requests: newRequests
      }
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});


module.exports = router;

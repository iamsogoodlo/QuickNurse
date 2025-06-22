const express = require('express');
const ServiceRequest = require('../models/ServiceRequest');
const router = express.Router();
const verifyNurseOnline = require('../utils/verifyNurseOnline');

// POST /api/servicerequests - create a new service request
router.post('/', async (req, res) => {
  try {
    const data = req.body;

    if (data.nurse_id) {
      const available = await verifyNurseOnline(data.nurse_id);
      if (!available) {
        return res.status(400).json({
          success: false,
          error: 'Selected nurse is not online or not available'
        });
      }
    }

    const request = new ServiceRequest(data);
    await request.save();
    res.json({ success: true, data: request });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = { router, verifyNurseOnline };

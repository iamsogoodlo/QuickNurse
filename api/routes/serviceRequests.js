const express = require('express');
const ServiceRequest = require('../models/ServiceRequest');
const router = express.Router();

// POST /api/servicerequests - create a new service request
router.post('/', async (req, res) => {
  try {
    const data = req.body;
    const request = new ServiceRequest(data);
    await request.save();
    res.json({ success: true, data: request });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;

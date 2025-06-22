const express = require('express');
const ServiceRequest = require('../models/ServiceRequest');
const { getIo } = require('../socket');
const router = express.Router();

// POST /api/servicerequests - create a new service request
router.post('/', async (req, res) => {
  try {
    const data = req.body;
    const request = new ServiceRequest(data);
    await request.save();
    try {
      const io = getIo();
      if (request.nurse_id) {
        io.to(`nurse_${request.nurse_id}`).emit('new_request', request);
      }
    } catch (e) {
      console.error('Socket emit failed:', e.message);
    }
    res.json({ success: true, data: request });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;

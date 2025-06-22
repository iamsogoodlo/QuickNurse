const express = require('express');
const OrderReceived = require('../models/OrderReceived');
const OrderFulfilled = require('../models/OrderFulfilled');
const Patient = require('../models/Patient');
const router = express.Router();

// POST /api/orders - create new order (received)
router.post('/', async (req, res) => {
  try {
    const data = req.body;
    const order = new OrderReceived(data);
    await order.save();
    await Patient.findOneAndUpdate(
      { patient_id: data.patientId },
      { last_placed_order: new Date() }
    );
    res.status(201).json({ success: true, data: order });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/orders/pending - list pending orders
router.get('/pending', async (req, res) => {
  try {
    const orders = await OrderReceived.find({ status: 'pending' }).sort({ createdAt: -1 }).limit(20);
    res.json({ success: true, data: orders });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PUT /api/orders/:id/accept - accept order
router.put('/:id/accept', async (req, res) => {
  try {
    const { id } = req.params;
    const { nurseId } = req.body;
    const order = await OrderReceived.findOne({ orderId: id, status: 'pending' });
    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not available' });
    }
    order.status = 'accepted';
    await order.save();

    const fulfilled = new OrderFulfilled({
      orderId: order.orderId,
      patientId: order.patientId,
      nurseId,
      serviceDetails: order.serviceDetails,
      status: 'accepted'
    });
    await fulfilled.save();

    res.json({ success: true, data: fulfilled });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PUT /api/orders/:id/complete - mark order complete
router.put('/:id/complete', async (req, res) => {
  try {
    const { id } = req.params;
    const fulfilled = await OrderFulfilled.findOne({ orderId: id });
    if (!fulfilled) {
      return res.status(404).json({ success: false, error: 'Fulfilled order not found' });
    }
    fulfilled.status = 'completed';
    fulfilled.serviceDetails.actualEndTime = new Date();
    await fulfilled.save();
    res.json({ success: true, data: fulfilled });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PUT /api/orders/:id/cancel - cancel order
router.put('/:id/cancel', async (req, res) => {
  try {
    const { id } = req.params;
    const { cancelledBy, reason } = req.body;
    const order = await OrderReceived.findOne({ orderId: id });
    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }
    order.status = 'cancelled';
    await order.save();
    await OrderFulfilled.deleteOne({ orderId: id });

    res.json({ success: true, message: 'Order cancelled' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});


// GET /api/orders/:id/match-nurses - simple matching by radius
router.get('/:id/match-nurses', async (req, res) => {
  try {
    const { id } = req.params;
    const order = await OrderReceived.findOne({ orderId: id });
    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }
    const radius = order.searchRadius || 10;
    const nurses = await require('../models/Nurse').find({
      general_location: {
        $near: {
          $geometry: { type: 'Point', coordinates: order.location.coordinates },
          $maxDistance: radius * 1609.34
        }
      },
      is_online: true,
      current_status: 'available'
    }).limit(20);
    res.json({ success: true, data: nurses });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;

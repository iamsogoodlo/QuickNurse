const mongoose = require('mongoose');

const orderReceivedSchema = new mongoose.Schema({
  orderId: { type: String, required: true, unique: true },
  patientId: { type: String, required: true },
  serviceDetails: {
    serviceType: String,
    description: String,
    duration: Number,
    urgency: String,
    scheduledDate: Date,
    scheduledTime: String,
    estimatedEndTime: Date
  },
  location: {
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String
    },
    coordinates: { type: [Number], index: '2dsphere' },
    locationType: String
  },
  requirements: {
    nurseSpecialties: [String],
    genderPreference: String,
    equipmentNeeded: [String],
    specialInstructions: String
  },
  pricing: {
    baseRate: Number,
    urgencyMultiplier: Number,
    estimatedTotal: Number,
    paymentMethod: String
  },
  status: { type: String, default: 'pending' },
  searchRadius: Number,
  rejectedBy: [String],
  requestedAt: { type: Date, default: Date.now },
  expiresAt: Date
}, { timestamps: true });

orderReceivedSchema.index({ location: '2dsphere' });
orderReceivedSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model('OrderReceived', orderReceivedSchema);

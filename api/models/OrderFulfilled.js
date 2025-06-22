const mongoose = require('mongoose');

const orderFulfilledSchema = new mongoose.Schema({
  orderId: { type: String, required: true, unique: true },
  patientId: { type: String, required: true },
  nurseId: { type: String, required: true },
  serviceDetails: {
    serviceType: String,
    description: String,
    actualDuration: Number,
    scheduledDate: Date,
    actualStartTime: Date,
    actualEndTime: Date
  },
  fulfillment: {
    acceptedAt: Date,
    nurseArrivalTime: Date,
    serviceStartTime: Date,
    serviceEndTime: Date,
    completionNotes: String,
    nurseNotes: String
  },
  pricing: {
    agreedRate: Number,
    actualTotal: Number,
    tip: Number,
    taxes: Number,
    platformFee: Number,
    nurseEarnings: Number
  },
  ratings: {
    patientRating: {
      score: Number,
      comment: String,
      ratedAt: Date
    },
    nurseRating: {
      score: Number,
      comment: String,
      ratedAt: Date
    }
  },
  status: String,
  cancellation: {
    cancelledBy: String,
    reason: String,
    cancelledAt: Date,
    refundAmount: Number
  }
}, { timestamps: true });

module.exports = mongoose.model('OrderFulfilled', orderFulfilledSchema);

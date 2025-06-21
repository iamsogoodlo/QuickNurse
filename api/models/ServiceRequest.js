const mongoose = require('mongoose');

const serviceRequestSchema = new mongoose.Schema({
  request_id: {
    type: String,
    required: true,
    unique: true,
    default: () => 'req_' + Date.now() + Math.random().toString(36).substr(2, 8)
  },
  patient_id: { type: String, required: true, ref: 'Patient' }, // Storing patient_id as string
  nurse_id: { type: String, ref: 'Nurse' }, // Storing nurse_id as string
  
  service_type: {
    type: String,
    required: true,
    enum: ['fever_check', 'blood_pressure', 'wound_care', 'medication_help', 
           'health_consultation', 'diabetes_care', 'iv_therapy', 'general'] // Added 'general' from frontend
  },
  urgency: { type: String, enum: ['normal', 'urgent'], default: 'normal' },
  special_instructions: String,
  
  patient_location: { // Storing geocoded coordinates from patient's address for the request
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], required: true, index: '2dsphere' }
  },
  address: { // Denormalized textual address for display
    street: String, city: String, state: String, zip_code: String,
    unit_number: String, access_instructions: String
  },
  
  base_price: { type: Number, required: true },
  distance_fee: { type: Number, default: 0 },
  urgency_fee: { type: Number, default: 0 },
  specialty_premium: { type: Number, default: 0 },
  time_surge_multiplier: { type: Number, default: 1.0 },
  total_price: { type: Number, required: true },
  nurse_earnings: { type: Number, required: true },
  platform_fee: { type: Number, required: true },
  
  status: {
    type: String,
    enum: ['pending', 'accepted', 'en_route', 'in_progress', 'completed', 'cancelled', 'no_show'],
    default: 'pending'
  },
  requested_at: { type: Date, default: Date.now },
  accepted_at: Date,
  nurse_arrived_at: Date,
  service_completed_at: Date,
  
  nurse_notes: String,
  clinical_observations: String,
  recommendations: String,
  patient_rating: { type: Number, min: 1, max: 5 },
  patient_feedback: String,
  
  payment_status: { type: String, enum: ['pending', 'completed', 'failed', 'refunded'], default: 'pending' },
  stripe_payment_intent_id: String // Example, if using Stripe
}, { timestamps: true });

module.exports = mongoose.model('ServiceRequest', serviceRequestSchema);
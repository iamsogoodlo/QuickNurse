const mongoose = require('mongoose');

const serviceRequestSchema = new mongoose.Schema({
  request_id: {
    type: String,
    required: true,
    unique: true,
    default: () => 'req_' + Date.now() + Math.random().toString(36).substr(2, 8)
  },

  patient_id: { type: String, required: true, ref: 'Patient' },
  nurse_id: { type: String, ref: 'Nurse' },

  // Service Details
  service_type: {
    type: String,
    required: true,
    enum: ['fever_vitals_check', 'blood_pressure_monitoring', 'wound_care_dressing',
           'medication_administration', 'health_consultation', 'diabetes_management',
           'iv_therapy', 'injection_service', 'post_surgery_care']
  },

  urgency: { type: String, enum: ['normal', 'urgent'], default: 'normal' },
  special_instructions: String,

  // Location Information
  patient_location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], required: true }
  },
  patient_address: {
    street: String,
    city: String,
    state: String,
    zip_code: String,
    unit_number: String,
    access_instructions: String
  },

  // Distance and Route Information
  nurse_distance: { type: Number },
  estimated_travel_time: { type: Number },
  actual_travel_time: { type: Number },

  // Fixed Pricing Structure
  service_base_price: { type: Number, required: true },
  distance_fee: { type: Number, default: 0 },
  urgency_surcharge: { type: Number, default: 0 },
  time_surcharge: { type: Number, default: 0 },
  total_price: { type: Number, required: true },
  nurse_earnings: { type: Number, required: true },
  platform_fee: { type: Number, required: true },

  // Status and Timing
  status: {
    type: String,
    enum: ['pending', 'nurse_assigned', 'accepted', 'en_route', 'arrived', 'in_progress', 'completed', 'cancelled', 'no_show'],
    default: 'pending'
  },

  requested_at: { type: Date, default: Date.now },
  nurse_assigned_at: Date,
  nurse_accepted_at: Date,
  nurse_departed_at: Date,
  nurse_arrived_at: Date,
  service_started_at: Date,
  service_completed_at: Date,

  // Real-time Tracking Data
  tracking_data: [{
    timestamp: Date,
    nurse_location: {
      type: { type: String, enum: ['Point'] },
      coordinates: [Number]
    },
    distance_to_patient: Number,
    estimated_arrival: Date,
    speed: Number,
    accuracy: Number
  }],

  // Service Documentation
  nurse_notes: String,
  clinical_observations: String,
  vitals_recorded: {
    temperature: Number,
    blood_pressure_systolic: Number,
    blood_pressure_diastolic: Number,
    heart_rate: Number,
    respiratory_rate: Number,
    oxygen_saturation: Number
  },

  recommendations: String,
  follow_up_needed: Boolean,

  // Feedback and Rating
  patient_rating: { type: Number, min: 1, max: 5 },
  patient_feedback: String,

  // Payment Information
  payment_status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed', 'refunded'],
    default: 'pending'
  },
  stripe_payment_intent_id: String
}, {
  timestamps: true
});

serviceRequestSchema.index({ patient_location: '2dsphere' });

module.exports = mongoose.model('ServiceRequest', serviceRequestSchema);

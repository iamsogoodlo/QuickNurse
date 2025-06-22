const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const nurseSchema = new mongoose.Schema({
  nurse_id: {
    type: String,
    required: true,
    unique: true,
    default: () => 'nurse_' + Date.now() + Math.random().toString(36).substr(2, 5)
  },

  // Basic Information
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true, minlength: 6 },
  first_name: { type: String, required: true },
  last_name: { type: String, required: true },
  phone: { type: String, required: true },
  date_of_birth: { type: Date },

  // License Information
  license_number: { type: String, required: true, unique: true },
  license_state: { type: String, required: true },
  license_type: { type: String, enum: ['RN', 'LPN', 'NP'], required: true },
  license_expiration_date: { type: Date },

  // Professional Details
  years_experience: { type: Number, required: true, min: 0 },
  specialties: [{
    type: String,
    enum: ['general', 'wound_care', 'pediatric', 'geriatric', 'diabetes', 'iv_therapy', 'cardiac']
  }],
  certifications: [{ type: String, enum: ['BLS', 'ACLS', 'PALS', 'CNA'] }],

  // Location Tracking
  general_location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number] },
    accuracy: { type: Number, default: 1000 },
    last_updated: { type: Date, default: Date.now }
  },
  precise_location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number] },
    accuracy: { type: Number },
    last_updated: Date,
    is_tracking: { type: Boolean, default: false }
  },

  address: {
    street: String,
    city: String,
    state: String,
    zip_code: String
  },

  // Document Verification
  documents: [{
    document_type: {
      type: String,
      enum: ['nursing_license', 'government_id', 'malpractice_insurance', 'bls_certification', 'acls_certification', 'resume', 'background_check'],
      required: true
    },
    file_url: { type: String, required: true },
    file_name: String,
    uploaded_at: { type: Date, default: Date.now },
    verification_status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'expired'],
      default: 'pending'
    },
    verified_by: String,
    verified_at: Date,
    expiration_date: Date,
    rejection_reason: String,
    notes: String
  }],

  // Real-time Status
  is_online: { type: Boolean, default: false },
  current_status: {
    type: String,
    enum: ['offline', 'available', 'busy', 'en_route', 'with_patient', 'break'],
    default: 'offline'
  },

  // Current Job Tracking
  active_job: {
    request_id: String,
    patient_location: {
      type: { type: String, enum: ['Point'] },
      coordinates: [Number]
    },
    estimated_arrival: Date,
    route_distance: Number,
    route_duration: Number,
    started_tracking_at: Date
  },

  // Performance Metrics
  total_completed_visits: { type: Number, default: 0 },
  average_rating: { type: Number, default: 0, min: 0, max: 5 },
  total_ratings: { type: Number, default: 0 },
  average_response_time: { type: Number, default: 0 },
  total_earnings: { type: Number, default: 0 },

  // Account Status
  account_status: {
    type: String,
    enum: ['pending_documents', 'under_review', 'active', 'inactive', 'suspended'],
    default: 'pending_documents'
  },
  verification_status: {
    type: String,
    enum: ['pending', 'documents_required', 'under_review', 'verified', 'rejected'],
    default: 'pending'
  },

  // Compliance
  background_check_status: {
    type: String,
    enum: ['pending', 'in_progress', 'passed', 'failed', 'expired'],
    default: 'pending'
  },

  approved_at: Date,
  approved_by: String
}, {
  timestamps: true
});

nurseSchema.index({ general_location: '2dsphere' });
nurseSchema.index({ precise_location: '2dsphere' });

nurseSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

nurseSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

nurseSchema.methods.updateGeneralLocation = function(lat, lng, accuracy = 1000) {
  this.general_location = {
    type: 'Point',
    coordinates: [lng, lat],
    accuracy: accuracy,
    last_updated: new Date()
  };
  return this.save();
};

nurseSchema.methods.startPreciseTracking = function(requestId, patientLocation) {
  this.precise_location.is_tracking = true;
  this.active_job = {
    request_id: requestId,
    patient_location: patientLocation,
    started_tracking_at: new Date()
  };
  return this.save();
};

nurseSchema.methods.updatePreciseLocation = function(lat, lng, accuracy = 5) {
  if (this.precise_location.is_tracking) {
    this.precise_location = {
      type: 'Point',
      coordinates: [lng, lat],
      accuracy: accuracy,
      last_updated: new Date(),
      is_tracking: true
    };
  }
  return this.save();
};

nurseSchema.methods.stopPreciseTracking = function() {
  this.precise_location.is_tracking = false;
  this.active_job = {};
  return this.save();
};

module.exports = mongoose.model('Nurse', nurseSchema);

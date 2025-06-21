const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const nurseSchema = new mongoose.Schema({
  nurse_id: {
    type: String,
    required: true,
    unique: true,
    default: () => 'nurse_' + Date.now() + Math.random().toString(36).substr(2, 5)
  },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true, minlength: 6 },
  first_name: { type: String, required: true },
  last_name: { type: String, required: true },
  phone: { type: String, required: true },
  license_number: { type: String, required: true, unique: true },
  license_state: { type: String, required: true },
  license_type: { type: String, enum: ['RN', 'LPN', 'NP'], required: true },
  years_experience: { type: Number, required: true, min: 0 },
  specialties: [{
    type: String,
    enum: ['general', 'wound_care', 'pediatric', 'geriatric', 'diabetes', 'iv_therapy', 'cardiac', 'mental_health']
  }],
  certifications: [{ type: String, enum: ['BLS', 'ACLS', 'PALS', 'CNA'] }],
  hourly_rate: { type: Number, required: true, min: 25, max: 150 }, // Max rate adjusted from original brief
  availability_radius: { type: Number, default: 10, min: 5, max: 25 },
  
  location: { // For storing geocoded coordinates from the address by backend
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], index: '2dsphere' } // [longitude, latitude]
  },
  address: { // Textual address provided by nurse
    street: String, city: String, state: String, zip_code: String
  },
  
  is_online: { type: Boolean, default: false },
  current_status: {
    type: String,
    enum: ['available', 'busy', 'en_route', 'with_patient', 'break', 'offline'],
    default: 'offline'
  },
  
  total_completed_visits: { type: Number, default: 0 },
  average_rating: { type: Number, default: 0, min: 0, max: 5 },
  total_ratings: { type: Number, default: 0 },
  cancellation_rate: { type: Number, default: 0 },
  total_earnings: { type: Number, default: 0 },
  
  account_status: { type: String, enum: ['pending', 'active', 'inactive', 'suspended'], default: 'pending' },
  verification_status: { type: String, enum: ['pending', 'verified', 'rejected'], default: 'pending' }
}, { timestamps: true });

// Ensure geospatial index is created if coordinates are present
// nurseSchema.index({ location: '2dsphere' }); // This is implicitly handled by `index: '2dsphere'` in coordinates

// Hash password before saving
nurseSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare password method
nurseSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('Nurse', nurseSchema);
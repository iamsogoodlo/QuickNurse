const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const patientSchema = new mongoose.Schema({
  patient_id: {
    type: String,
    required: true,
    unique: true,
    default: () => 'patient_' + Date.now() + Math.random().toString(36).substr(2, 5)
  },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true, minlength: 6 },
  first_name: { type: String, required: true },
  last_name: { type: String, required: true },
  phone: { type: String, required: true },
  date_of_birth: Date,
  
  address: {
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zip_code: { type: String, required: true },
    coordinates: { type: [Number], index: '2dsphere' } // [longitude, latitude] - to be geocoded by backend
  },
  
  medical_conditions: [String],
  allergies: [String],
  emergency_contacts: [{
    name: String,
    relationship: String,
    phone: String
  }],
  
  total_requests: { type: Number, default: 0 },
  completed_visits: { type: Number, default: 0 },
  total_spent: { type: Number, default: 0 },

  last_placed_order: Date,
  
  preferred_nurses: [{ type: mongoose.Schema.Types.String, ref: 'Nurse' }], // Storing nurse_id as string
  
  account_status: { type: String, enum: ['active', 'inactive', 'suspended'], default: 'active' }
}, { timestamps: true });

// Hash password before saving
patientSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare password method
patientSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('Patient', patientSchema);
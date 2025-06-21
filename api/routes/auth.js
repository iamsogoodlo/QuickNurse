const express = require('express');
const jwt = require('jsonwebtoken');
const Nurse = require('../models/Nurse');
const Patient = require('../models/Patient');
// const { geocodeAddress } = require('../utils/geocoding'); // Assuming a geocoding utility

const router = express.Router();

// Generate JWT token
const generateToken = (user, userType) => {
  return jwt.sign(
    { 
      id: userType === 'nurse' ? user.nurse_id : user.patient_id,
      email: user.email,
      type: userType
    },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

// POST /api/auth/nurse/register
router.post('/nurse/register', async (req, res) => {
  try {
    const {
      email, password, first_name, last_name, phone, 
      license_number, license_state, license_type, years_experience,
      specialties, certifications, hourly_rate, 
      address // Expecting textual address: { street, city, state, zip_code }
    } = req.body;

    // Basic validation
    if (!email || !password || !first_name || !last_name || !phone || !license_number || !address || !address.street || !address.city || !address.state || !address.zip_code) {
        return res.status(400).json({ success: false, error: 'Missing required fields for nurse registration.' });
    }
    
    const existingNurse = await Nurse.findOne({ 
      $or: [{ email }, { license_number }] 
    });
    
    if (existingNurse) {
      return res.status(400).json({
        success: false,
        error: 'Email or license number already registered'
      });
    }

    // Placeholder for geocoding the address - in a real app, integrate a geocoding service
    // const coordinates = await geocodeAddress(`${address.street}, ${address.city}, ${address.state} ${address.zip_code}`);
    // For now, we'll skip actual geocoding and assume it might be handled separately or not at all on registration
    // If coordinates are crucial for immediate use, this needs implementation.
    // For simplicity here, we're not saving coordinates directly from registration for the nurse's primary location.
    // The 'location' field in Nurse model can be updated later if needed (e.g., when nurse goes online)

    const nurse = new Nurse({
      email, password, first_name, last_name, phone,
      license_number, license_state, license_type, years_experience,
      specialties: specialties || ['general'],
      certifications: certifications || [],
      hourly_rate,
      address, // Save the textual address
      // location: coordinates ? { type: 'Point', coordinates } : undefined, // Example if geocoding
    });

    await nurse.save();
    const token = generateToken(nurse, 'nurse');

    res.status(201).json({
      success: true,
      token,
      nurse: {
        nurse_id: nurse.nurse_id,
        first_name: nurse.first_name,
        last_name: nurse.last_name,
        email: nurse.email,
        account_status: nurse.account_status,
        verification_status: nurse.verification_status,
        is_online: nurse.is_online, // Added from frontend expectations
        current_status: nurse.current_status // Added from frontend expectations
      }
    });

  } catch (error) {
    console.error("Nurse Registration Error:", error);
    res.status(500).json({ success: false, error: error.message || 'Server error during nurse registration.' });
  }
});

// POST /api/auth/nurse/login
router.post('/nurse/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ success: false, error: 'Email and password are required.' });
    }

    const nurse = await Nurse.findOne({ email });
    if (!nurse || !(await nurse.comparePassword(password))) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    const token = generateToken(nurse, 'nurse');

    res.json({
      success: true,
      token,
      nurse: { // Return data consistent with frontend AuthResponseData
        nurse_id: nurse.nurse_id,
        first_name: nurse.first_name,
        last_name: nurse.last_name,
        email: nurse.email,
        account_status: nurse.account_status,
        verification_status: nurse.verification_status,
        is_online: nurse.is_online,
        current_status: nurse.current_status
      }
    });

  } catch (error) {
    console.error("Nurse Login Error:", error);
    res.status(500).json({ success: false, error: error.message || 'Server error during nurse login.' });
  }
});

// POST /api/auth/patient/register
router.post('/patient/register', async (req, res) => {
  try {
    const {
      email, password, first_name, last_name, phone, 
      address, // Expecting textual address: { street, city, state, zip_code }
      date_of_birth, emergency_contacts
    } = req.body;

    if (!email || !password || !first_name || !last_name || !phone || !address || !address.street || !address.city || !address.state || !address.zip_code) {
        return res.status(400).json({ success: false, error: 'Missing required fields for patient registration.' });
    }

    const existingPatient = await Patient.findOne({ email });
    if (existingPatient) {
      return res.status(400).json({
        success: false,
        error: 'Email already registered'
      });
    }

    // Placeholder for geocoding the address
    // const coordinates = await geocodeAddress(`${address.street}, ${address.city}, ${address.state} ${address.zip_code}`);
    // For now, we're not saving coordinates on patient registration directly.
    // The patient_location for service requests will be geocoded when a request is made.

    const patient = new Patient({
      email, password, first_name, last_name, phone,
      date_of_birth,
      address: { // Save textual address
        street: address.street,
        city: address.city,
        state: address.state,
        zip_code: address.zip_code,
        // coordinates: coordinates ? coordinates : undefined // Example if geocoding
      },
      emergency_contacts: emergency_contacts || []
    });

    await patient.save();
    const token = generateToken(patient, 'patient');

    res.status(201).json({
      success: true,
      token,
      patient: {
        patient_id: patient.patient_id,
        first_name: patient.first_name,
        last_name: patient.last_name,
        email: patient.email,
        account_status: patient.account_status
      }
    });

  } catch (error) {
    console.error("Patient Registration Error:", error);
    res.status(500).json({ success: false, error: error.message || 'Server error during patient registration.' });
  }
});

// POST /api/auth/patient/login
router.post('/patient/login', async (req, res) => {
  try {
    const { email, password } = req.body;
     if (!email || !password) {
        return res.status(400).json({ success: false, error: 'Email and password are required.' });
    }

    const patient = await Patient.findOne({ email });
    if (!patient || !(await patient.comparePassword(password))) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    const token = generateToken(patient, 'patient');

    res.json({
      success: true,
      token,
      patient: { // Return data consistent with frontend AuthResponseData
        patient_id: patient.patient_id,
        first_name: patient.first_name,
        last_name: patient.last_name,
        email: patient.email,
        account_status: patient.account_status
      }
    });

  } catch (error) {
    console.error("Patient Login Error:", error);
    res.status(500).json({ success: false, error: error.message || 'Server error during patient login.' });
  }
});

module.exports = router;
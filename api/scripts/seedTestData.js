require('dotenv').config();
const connectDatabase = require('../db/connection');
const Nurse = require('../models/Nurse');
const Patient = require('../models/Patient');

const nurseData = [
  {
    email: 'nurse1@example.com',
    password: 'nursepass',
    first_name: 'Alice',
    last_name: 'Brown',
    phone: '555-1000',
    license_number: 'RN1001',
    license_state: 'NY',
    license_type: 'RN',
    years_experience: 5,
    specialties: ['general', 'wound_care'],
    account_status: 'active',
    verification_status: 'verified',
    is_online: true,
    current_status: 'available',
    general_location: { type: 'Point', coordinates: [-73.9855, 40.7580], accuracy: 50 },
    precise_location: { type: 'Point', coordinates: [-73.9855, 40.7580], accuracy: 10 }
  },
  {
    email: 'nurse2@example.com',
    password: 'nursepass',
    first_name: 'Carlos',
    last_name: 'Diaz',
    phone: '555-1001',
    license_number: 'RN1002',
    license_state: 'NY',
    license_type: 'RN',
    years_experience: 4,
    specialties: ['general', 'pediatric'],
    account_status: 'active',
    verification_status: 'verified',
    is_online: true,
    current_status: 'available',
    general_location: { type: 'Point', coordinates: [-73.9820, 40.7590], accuracy: 50 },
    precise_location: { type: 'Point', coordinates: [-73.9820, 40.7590], accuracy: 10 }
  },
  {
    email: 'nurse3@example.com',
    password: 'nursepass',
    first_name: 'Maria',
    last_name: 'Lee',
    phone: '555-1002',
    license_number: 'RN1003',
    license_state: 'NY',
    license_type: 'RN',
    years_experience: 7,
    specialties: ['general', 'iv_therapy'],
    account_status: 'active',
    verification_status: 'verified',
    is_online: true,
    current_status: 'available',
    general_location: { type: 'Point', coordinates: [-73.9900, 40.7570], accuracy: 50 },
    precise_location: { type: 'Point', coordinates: [-73.9900, 40.7570], accuracy: 10 }
  }
];

const patientData = [
  {
    email: 'patient1@example.com',
    password: 'patientpass',
    first_name: 'Bob',
    last_name: 'Smith',
    phone: '555-2000',
    address: {
      street: '123 Main St',
      city: 'New York',
      state: 'NY',
      zip_code: '10001',
      coordinates: [-73.9855, 40.7580]
    },
    medical_conditions: [],
    allergies: []
  },
  {
    email: 'patient2@example.com',
    password: 'patientpass',
    first_name: 'Jane',
    last_name: 'Doe',
    phone: '555-2001',
    address: {
      street: '456 Broadway',
      city: 'New York',
      state: 'NY',
      zip_code: '10002',
      coordinates: [-73.9855, 40.7580]
    },
    medical_conditions: [],
    allergies: []
  }
];

async function seed() {
  await connectDatabase();
  await Nurse.deleteMany({ email: { $in: nurseData.map(n => n.email) } });
  await Patient.deleteMany({ email: { $in: patientData.map(p => p.email) } });

  await Nurse.insertMany(nurseData);
  await Patient.insertMany(patientData);

  console.log('Seeded test nurses and patients');
  console.log('Nurse logins:');
  nurseData.forEach(n => console.log(`  ${n.email} / ${n.password}`));
  console.log('Patient logins:');
  patientData.forEach(p => console.log(`  ${p.email} / ${p.password}`));
  process.exit();
}

seed().catch(err => {
  console.error(err);
  process.exit(1);
});

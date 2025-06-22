// Fixed pricing structure - nurses cannot choose rates
const SERVICE_PRICING = {
  'fever_vitals_check': {
    name: 'Fever & Vitals Check',
    description: 'Temperature, pulse, blood pressure, basic assessment',
    base_price: 35,
    duration_minutes: 20,
    icon: '🌡️'
  },
  'blood_pressure_monitoring': {
    name: 'Blood Pressure Monitoring',
    description: 'Blood pressure check, heart rate monitoring',
    base_price: 30,
    duration_minutes: 15,
    icon: '💉'
  },
  'wound_care_dressing': {
    name: 'Wound Care & Dressing',
    description: 'Wound cleaning, dressing change, healing assessment',
    base_price: 55,
    duration_minutes: 30,
    icon: '🩹'
  },
  'medication_administration': {
    name: 'Medication Administration',
    description: 'Oral medication, injection administration',
    base_price: 45,
    duration_minutes: 25,
    icon: '💊'
  },
  'health_consultation': {
    name: 'Health Consultation',
    description: 'General health questions, symptom assessment',
    base_price: 25,
    duration_minutes: 20,
    icon: '💬'
  },
  'diabetes_management': {
    name: 'Diabetes Care',
    description: 'Blood sugar testing, insulin administration',
    base_price: 50,
    duration_minutes: 25,
    icon: '🩸'
  },
  'iv_therapy': {
    name: 'IV Therapy',
    description: 'IV insertion, fluid administration, monitoring',
    base_price: 75,
    duration_minutes: 45,
    icon: '🔬'
  },
  'injection_service': {
    name: 'Injection Service',
    description: 'Intramuscular or subcutaneous injections',
    base_price: 40,
    duration_minutes: 15,
    icon: '💉'
  },
  'post_surgery_care': {
    name: 'Post-Surgery Care',
    description: 'Surgical site assessment, drain care',
    base_price: 65,
    duration_minutes: 35,
    icon: '🏥'
  }
};

const calculateDistanceFee = (distanceMiles) => {
  if (distanceMiles <= 2) return 0;
  if (distanceMiles <= 5) return 5;
  if (distanceMiles <= 10) return 12;
  if (distanceMiles <= 15) return 20;
  if (distanceMiles <= 20) return 30;
  return 40; // 20+ miles
};

const calculateTimeSurcharge = (requestTime) => {
  const hour = requestTime.getHours();
  const dayOfWeek = requestTime.getDay();
  let surcharge = 0;
  if (dayOfWeek === 0 || dayOfWeek === 6 || (dayOfWeek === 5 && hour >= 18)) {
    surcharge += 10;
  }
  if (hour >= 18 && hour <= 22) {
    surcharge += 8;
  }
  if (hour >= 22 || hour <= 6) {
    surcharge += 15;
  }
  return surcharge;
};

const calculateTotalPrice = (serviceType, distanceMiles, urgency, requestTime) => {
  const service = SERVICE_PRICING[serviceType];
  if (!service) throw new Error('Invalid service type');
  let totalPrice = service.base_price;
  const distanceFee = calculateDistanceFee(distanceMiles);
  totalPrice += distanceFee;
  const urgencySurcharge = urgency === 'urgent' ? 15 : 0;
  totalPrice += urgencySurcharge;
  const timeSurcharge = calculateTimeSurcharge(requestTime);
  totalPrice += timeSurcharge;
  const platformFee = Math.round(totalPrice * 0.20);
  const nurseEarnings = totalPrice - platformFee;
  return {
    service_base_price: service.base_price,
    distance_fee: distanceFee,
    urgency_surcharge: urgencySurcharge,
    time_surcharge: timeSurcharge,
    total_price: totalPrice,
    nurse_earnings: nurseEarnings,
    platform_fee: platformFee,
    service_details: service
  };
};

module.exports = {
  SERVICE_PRICING,
  calculateDistanceFee,
  calculateTimeSurcharge,
  calculateTotalPrice
};


export interface MockDoctor {
  doctorId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  specialties: string[];
  ratePerHour: number;
  rating: number;
  totalReviews: number;
  yearsExperience: number;
  isAvailable: boolean;
  coordinates: [number, number];
  zone: string;
}

export interface MockPatient {
  patientId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  age: number;
  conditions: string[];
  careLevel: string;
  preferredGender: string;
  coordinates: [number, number];
  address: string;
  zone: string;
}

export interface MockOrder {
  orderId: string;
  patientId: string;
  serviceType: string;
  description: string;
  duration: number;
  urgency: string;
  scheduledDate: Date;
  status: string;
  doctorId?: string;
  estimatedTotal: number;
  location: { coordinates: [number, number]; address: string };
}

export const mockDoctors: MockDoctor[] = [
  // Zone 1 Downtown
  {
    doctorId: 'doc_dt_001',
    firstName: 'Amy',
    lastName: 'Stevens',
    email: 'amy.stevens@quicknurse.com',
    phone: '(555) 123-4567',
    specialties: ['Emergency Care', 'IV Therapy'],
    ratePerHour: 85,
    rating: 4.8,
    totalReviews: 127,
    yearsExperience: 8,
    isAvailable: true,
    coordinates: [40.7601, -73.9834],
    zone: 'downtown',
  },
  {
    doctorId: 'doc_dt_002',
    firstName: 'Carlos',
    lastName: 'Martinez',
    email: 'carlos.martinez@quicknurse.com',
    phone: '(555) 234-5678',
    specialties: ['Wound Care', 'Post-Op Care'],
    ratePerHour: 78,
    rating: 4.6,
    totalReviews: 89,
    yearsExperience: 6,
    isAvailable: false,
    coordinates: [40.7542, -73.9898],
    zone: 'downtown',
  },
  // Add a few more downtown doctors
  {
    doctorId: 'doc_dt_003',
    firstName: 'Julia',
    lastName: 'Nguyen',
    email: 'julia.nguyen@quicknurse.com',
    phone: '(555) 345-7890',
    specialties: ['Home Care'],
    ratePerHour: 75,
    rating: 4.5,
    totalReviews: 52,
    yearsExperience: 5,
    isAvailable: true,
    coordinates: [40.757, -73.982],
    zone: 'downtown',
  },
  {
    doctorId: 'doc_dt_004',
    firstName: 'Louis',
    lastName: 'Brown',
    email: 'louis.brown@quicknurse.com',
    phone: '(555) 456-2345',
    specialties: ['Cardiac'],
    ratePerHour: 90,
    rating: 4.7,
    totalReviews: 101,
    yearsExperience: 9,
    isAvailable: true,
    coordinates: [40.759, -73.986],
    zone: 'downtown',
  },
  // Zone 2 Suburban
  {
    doctorId: 'doc_sub_001',
    firstName: 'Jennifer',
    lastName: 'Park',
    email: 'jennifer.park@quicknurse.com',
    phone: '(555) 567-8901',
    specialties: ['Wound Care'],
    ratePerHour: 80,
    rating: 4.7,
    totalReviews: 64,
    yearsExperience: 7,
    isAvailable: true,
    coordinates: [40.7285, -74.075],
    zone: 'suburban',
  },
  {
    doctorId: 'doc_sub_002',
    firstName: 'Robert',
    lastName: 'Johnson',
    email: 'robert.johnson@quicknurse.com',
    phone: '(555) 678-9012',
    specialties: ['Emergency Care'],
    ratePerHour: 82,
    rating: 4.4,
    totalReviews: 45,
    yearsExperience: 6,
    isAvailable: true,
    coordinates: [40.731, -74.08],
    zone: 'suburban',
  },
  {
    doctorId: 'doc_sub_003',
    firstName: 'Alice',
    lastName: 'Li',
    email: 'alice.li@quicknurse.com',
    phone: '(555) 789-0123',
    specialties: ['Post-Op Care'],
    ratePerHour: 77,
    rating: 4.8,
    totalReviews: 70,
    yearsExperience: 5,
    isAvailable: true,
    coordinates: [40.726, -74.078],
    zone: 'suburban',
  },
  // Zone 3 Rural
  {
    doctorId: 'doc_ru_001',
    firstName: 'Maria',
    lastName: 'Garcia',
    email: 'maria.garcia@quicknurse.com',
    phone: '(555) 890-1234',
    specialties: ['Home Care'],
    ratePerHour: 70,
    rating: 4.5,
    totalReviews: 33,
    yearsExperience: 4,
    isAvailable: false,
    coordinates: [40.69, -74.044],
    zone: 'rural',
  },
  {
    doctorId: 'doc_ru_002',
    firstName: 'Kevin',
    lastName: "O'Brien",
    email: 'kevin.obrien@quicknurse.com',
    phone: '(555) 901-2345',
    specialties: ['Diabetes Care'],
    ratePerHour: 72,
    rating: 4.3,
    totalReviews: 40,
    yearsExperience: 5,
    isAvailable: true,
    coordinates: [40.692, -74.05],
    zone: 'rural',
  },
];

export const mockPatients: MockPatient[] = [
  // Downtown patients
  {
    patientId: 'pat_dt_001',
    firstName: 'Sarah',
    lastName: 'Johnson',
    email: 'sarah.johnson@email.com',
    phone: '(555) 345-6789',
    age: 67,
    conditions: ['Diabetes', 'Hypertension'],
    careLevel: 'intermediate',
    preferredGender: 'any',
    coordinates: [40.7567, -73.9876],
    address: '123 Main St, New York, NY 10001',
    zone: 'downtown',
  },
  {
    patientId: 'pat_dt_002',
    firstName: 'Mike',
    lastName: 'Chen',
    email: 'mike.chen@email.com',
    phone: '(555) 456-7890',
    age: 45,
    conditions: ['Post-Surgery Recovery'],
    careLevel: 'basic',
    preferredGender: 'male',
    coordinates: [40.7612, -73.9801],
    address: '456 Broadway Ave, New York, NY 10002',
    zone: 'downtown',
  },
  // Suburban patients
  {
    patientId: 'pat_sub_003',
    firstName: 'Emma',
    lastName: 'Rodriguez',
    email: 'emma.rodriguez@email.com',
    phone: '(555) 567-2345',
    age: 60,
    conditions: ['Arthritis'],
    careLevel: 'basic',
    preferredGender: 'any',
    coordinates: [40.7298, -74.0765],
    address: '789 Suburban Dr, Jersey City, NJ 07302',
    zone: 'suburban',
  },
  {
    patientId: 'pat_sub_004',
    firstName: 'David',
    lastName: 'Kim',
    email: 'david.kim@email.com',
    phone: '(555) 678-3456',
    age: 52,
    conditions: ['Hypertension'],
    careLevel: 'intermediate',
    preferredGender: 'female',
    coordinates: [40.725, -74.078],
    address: '321 Suburban Lane, Jersey City, NJ 07304',
    zone: 'suburban',
  },
  // Rural patients
  {
    patientId: 'pat_ru_005',
    firstName: 'Lisa',
    lastName: 'Thompson',
    email: 'lisa.thompson@email.com',
    phone: '(555) 789-4567',
    age: 70,
    conditions: ['Heart Disease'],
    careLevel: 'advanced',
    preferredGender: 'any',
    coordinates: [40.6892, -74.0445],
    address: '654 Rural Rd, Staten Island, NY 10301',
    zone: 'rural',
  },
  {
    patientId: 'pat_ru_006',
    firstName: 'James',
    lastName: 'Wilson',
    email: 'james.wilson@email.com',
    phone: '(555) 890-5678',
    age: 75,
    conditions: ['COPD'],
    careLevel: 'advanced',
    preferredGender: 'any',
    coordinates: [40.691, -74.05],
    address: '987 Countryside Ln, Staten Island, NY 10302',
    zone: 'rural',
  },
];

export const mockOrders: MockOrder[] = [
  {
    orderId: 'order_001',
    patientId: 'pat_dt_001',
    serviceType: 'Medication Management',
    description: 'Daily insulin administration and blood glucose monitoring',
    duration: 2,
    urgency: 'routine',
    scheduledDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
    status: 'pending',
    estimatedTotal: 170,
    location: {
      coordinates: [40.7567, -73.9876],
      address: '123 Main St, New York, NY 10001',
    },
  },
  {
    orderId: 'order_002',
    patientId: 'pat_sub_003',
    serviceType: 'Wound Care',
    description: 'Post-surgical wound dressing change and assessment',
    duration: 1.5,
    urgency: 'urgent',
    scheduledDate: new Date(Date.now() + 4 * 60 * 60 * 1000),
    status: 'accepted',
    doctorId: 'doc_sub_003',
    estimatedTotal: 125,
    location: {
      coordinates: [40.7298, -74.0765],
      address: '789 Suburban Dr, Jersey City, NJ 07302',
    },
  },
];



export interface GeoLocation {
  type: 'Point';
  coordinates: [number, number]; // [longitude, latitude]
}

export interface Address {
  street: string;
  city: string;
  state: string;
  zip_code: string;
  // lng and lat are no longer part of the Address type for direct input.
  // Coordinates will be derived by backend.
}

export enum LicenseType {
  RN = 'RN',
  LPN = 'LPN',
  NP = 'NP',
}

export enum NurseSpecialty {
  GENERAL = 'general',
  WOUND_CARE = 'wound_care',
  PEDIATRIC = 'pediatric',
  GERIATRIC = 'geriatric',
  DIABETES = 'diabetes',
  IV_THERAPY = 'iv_therapy',
  CARDIAC = 'cardiac',
  MENTAL_HEALTH = 'mental_health',
}

export enum NurseCertification {
  BLS = 'BLS',
  ACLS = 'ACLS',
  PALS = 'PALS',
  CNA = 'CNA',
}

export enum NurseStatus {
  AVAILABLE = 'available',
  BUSY = 'busy',
  EN_ROUTE = 'en_route',
  WITH_PATIENT = 'with_patient',
  BREAK = 'break',
  OFFLINE = 'offline',
}

export interface NurseProfile {
  nurse_id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  license_number: string;
  license_state: string;
  license_type: LicenseType;
  years_experience: number;
  specialties: NurseSpecialty[];
  certifications: NurseCertification[];
  hourly_rate: number;
  availability_radius?: number;
  location?: GeoLocation; // Made optional as backend will geocode address
  address?: Address; // Primary service address
  is_online: boolean;
  current_status: NurseStatus;
  total_completed_visits?: number;
  average_rating?: number;
  total_ratings?: number;
  cancellation_rate?: number;
  total_earnings?: number;
  account_status: 'pending' | 'active' | 'inactive' | 'suspended';
  verification_status: 'pending' | 'verified' | 'rejected';
}

export interface PatientProfile {
  patient_id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  date_of_birth?: string; // ISO string
  address: Address & { coordinates?: [number, number] }; // Coordinates are now optional from frontend perspective
  medical_conditions?: string[];
  allergies?: string[];
  emergency_contacts?: Array<{ name: string; relationship: string; phone: string }>;
  account_status: 'active' | 'inactive' | 'suspended';
}

export interface AuthResponseData {
  token: string;
  nurse?: Pick<NurseProfile, 'nurse_id' | 'first_name' | 'last_name' | 'email' | 'account_status' | 'verification_status' | 'is_online' | 'current_status'>;
  patient?: Pick<PatientProfile, 'patient_id' | 'first_name' | 'last_name' | 'email' | 'account_status'>;
}

export interface ApiError {
  message: string;
  details?: unknown;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string | ApiError;
  token?: string; // For auth responses
  // Accommodate backend's specific auth response structure
  nurse?: AuthResponseData['nurse'];
  patient?: AuthResponseData['patient'];
}

export interface PricingBreakdown {
    basePrice: number;
    experienceMultiplier: number;
    distanceFee: number;
    urgencyFee: number;
    surgeMultiplier: number;
}
export interface NearbyNurse {
  nurse_id: string;
  first_name: string;
  last_name: string;
  email: string; 
  specialties: NurseSpecialty[];
  years_experience: number;
  average_rating: number;
  hourly_rate: number;
  is_online: boolean;
  location: GeoLocation;
  pricing: {
    totalPrice: number;
    nurseEarnings: number;
    platformFee: number;
    breakdown: PricingBreakdown;
  };
  distance: number; 
}

export interface ServiceRequestSummaryForNurse {
  request_id: string;
  patient_display_name: string; // e.g., "Patient J.D." or similar for privacy
  service_type: string; // e.g., "Wound Care", "IV Therapy"
  approx_distance_miles?: number;
  patient_city_state: string; // e.g., "Los Angeles, CA"
  estimated_earnings: number;
  requested_at: string; // ISO date string
  status: 'pending' | 'accepted' | 'declined'; // For UI state primarily
}

export interface NurseDashboardStats {
  monthly_revenue: number;
  monthly_jobs: number;
  average_rating: number;
  new_requests: ServiceRequestSummaryForNurse[];
}

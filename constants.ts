
import { LicenseType, NurseSpecialty, NurseCertification, NurseStatus } from './types';

// Base URL for the backend API.
// `VITE_API_BASE_URL` can be provided at build time to override the default.
// Fallback to localhost for local development.
export const API_BASE_URL =
  (typeof import.meta !== 'undefined' &&
    (import.meta as any).env &&
    (import.meta as any).env.VITE_API_BASE_URL) ||
  'http://localhost:5001/api';

export const AUTH_ENDPOINTS = {
  NURSE_REGISTER: API_BASE_URL + '/auth/nurse/register',
  NURSE_LOGIN: API_BASE_URL + '/auth/nurse/login',
  PATIENT_REGISTER: API_BASE_URL + '/auth/patient/register',
  PATIENT_LOGIN: API_BASE_URL + '/auth/patient/login',
};

export const NURSE_ENDPOINTS = {
  NEARBY: API_BASE_URL + '/nurses/nearby',
  UPDATE_STATUS: API_BASE_URL + '/nurses/status', // Assumed endpoint
  PROFILE: API_BASE_URL + '/nurses/profile', // Assumed endpoint
  DASHBOARD: API_BASE_URL + '/nurses/dashboard', // Stats and new jobs
};

export const PATIENT_ENDPOINTS = {
  PROFILE: API_BASE_URL + '/patients/profile', // Assumed endpoint
};

export const SERVICE_REQUEST_ENDPOINTS = {
  CREATE: API_BASE_URL + '/servicerequests', // Assumed endpoint
  PATIENT_REQUESTS: API_BASE_URL + '/servicerequests/patient', // Assumed endpoint
  NURSE_REQUESTS: API_BASE_URL + '/servicerequests/nurse', // Assumed endpoint
};

export const LICENSE_TYPE_OPTIONS = Object.values(LicenseType);
export const NURSE_SPECIALTY_OPTIONS = Object.values(NurseSpecialty);
export const NURSE_CERTIFICATION_OPTIONS = Object.values(NurseCertification);
export const NURSE_STATUS_OPTIONS = Object.values(NurseStatus);

export const US_STATES = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
];
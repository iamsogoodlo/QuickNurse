import { apiService } from './api';
import { PATIENT_ENDPOINTS } from '../constants';
import { ApiResponse, PatientProfile } from '../types';

export const updatePatientProfile = async (
  profileData: Partial<PatientProfile>,
  token: string
): Promise<ApiResponse<PatientProfile>> => {
  return apiService<PatientProfile>(PATIENT_ENDPOINTS.PROFILE, 'PUT', profileData, token);
};

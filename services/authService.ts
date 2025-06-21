
import { apiService } from './api';
import { AUTH_ENDPOINTS } from '../constants';
import { ApiResponse, AuthResponseData } from '../types';

export const registerNurse = async (data: any): Promise<ApiResponse<AuthResponseData>> => {
  return apiService<AuthResponseData>(AUTH_ENDPOINTS.NURSE_REGISTER, 'POST', data);
};

export const loginNurse = async (credentials: any): Promise<ApiResponse<AuthResponseData>> => {
  return apiService<AuthResponseData>(AUTH_ENDPOINTS.NURSE_LOGIN, 'POST', credentials);
};

export const registerPatient = async (data: any): Promise<ApiResponse<AuthResponseData>> => {
  return apiService<AuthResponseData>(AUTH_ENDPOINTS.PATIENT_REGISTER, 'POST', data);
};

export const loginPatient = async (credentials: any): Promise<ApiResponse<AuthResponseData>> => {
  return apiService<AuthResponseData>(AUTH_ENDPOINTS.PATIENT_LOGIN, 'POST', credentials);
};

import { apiService } from './api';
import { SERVICE_REQUEST_ENDPOINTS, REQUESTS_ENDPOINTS } from '../constants';
import { ApiResponse, ServiceRequest } from '../types';

export interface CreateRequestPayload {
  patient_id: string;
  nurse_id: string;
  service_type: string;
  patient_location?: { type: 'Point'; coordinates: [number, number] };
  patient_address?: unknown;
  service_base_price?: number;
  distance_fee?: number;
  urgency_surcharge?: number;
  time_surcharge?: number;
  total_price?: number;
  nurse_earnings?: number;
  platform_fee?: number;
}

export const createServiceRequest = async (
  payload: CreateRequestPayload,
  token?: string | null
): Promise<ApiResponse<ServiceRequest>> => {
  return apiService<ServiceRequest>(SERVICE_REQUEST_ENDPOINTS.CREATE, 'POST', payload, token);
};

export const getPendingRequestsForNurse = async (
  nurseId: string,
  token?: string | null
): Promise<ApiResponse<ServiceRequest[]>> => {
  const url = `${REQUESTS_ENDPOINTS.PENDING_FOR_NURSE}/${nurseId}`;
  return apiService<ServiceRequest[]>(url, 'GET', undefined, token);
};

export const acceptServiceRequest = async (
  requestId: string,
  nurseId: string,
  token?: string | null
): Promise<ApiResponse<ServiceRequest>> => {
  const url = `${REQUESTS_ENDPOINTS.ACCEPT}/${requestId}/accept`;
  return apiService<ServiceRequest>(url, 'PUT', { nurse_id: nurseId }, token);
};

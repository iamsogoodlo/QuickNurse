import { apiService } from './api';
import { SERVICE_REQUEST_ENDPOINTS } from '../constants';
import { ApiResponse, ServiceRequest } from '../types';

export const createServiceRequest = async (
  data: Partial<ServiceRequest>,
  token?: string | null
): Promise<ApiResponse<ServiceRequest>> => {
  return apiService<ServiceRequest>(SERVICE_REQUEST_ENDPOINTS.CREATE, 'POST', data, token);
};


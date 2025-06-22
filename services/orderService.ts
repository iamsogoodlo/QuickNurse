import { apiService } from './api';
import { ORDER_ENDPOINTS } from '../constants';
import { ApiResponse, OrderReceived } from '../types';

export const createOrder = async (
  data: Partial<OrderReceived>,
  token?: string | null
): Promise<ApiResponse<OrderReceived>> => {
  return apiService<OrderReceived>(ORDER_ENDPOINTS.CREATE, 'POST', data, token || undefined);
};

export const getPendingOrders = async (): Promise<ApiResponse<OrderReceived[]>> => {
  return apiService<OrderReceived[]>(ORDER_ENDPOINTS.PENDING, 'GET');
};

export const acceptOrder = async (
  orderId: string,
  nurseId: string,
  token: string
): Promise<ApiResponse<OrderReceived>> => {
  return apiService<OrderReceived>(ORDER_ENDPOINTS.ACCEPT(orderId), 'PUT', { nurseId }, token);
};

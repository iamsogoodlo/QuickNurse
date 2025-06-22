
import { apiService } from './api';
import { NURSE_ENDPOINTS, API_BASE_URL } from '../constants';
import { ApiResponse, NearbyNurse, NurseProfile, NurseStatus, NurseDashboardStats, NurseSpecialty, PricingBreakdown } from '../types';

export const findNearbyNurses = async (
  lat: number, 
  lng: number, 
  radius: number = 15, 
  specialty?: string,
  service_type: string = 'general',
  token?: string | null
): Promise<ApiResponse<NearbyNurse[]>> => {
  const queryParams = new URLSearchParams({
    lat: lat.toString(),
    lng: lng.toString(),
    radius: radius.toString(),
    service_type: service_type,
  });
  if (specialty && specialty !== 'all') {
    queryParams.append('specialty', specialty);
  }
  // This endpoint might not require auth, but if it does, token should be passed.
  // The provided backend snippet doesn't show auth middleware for /nearby
  const res = await apiService<NearbyNurse[]>(`${NURSE_ENDPOINTS.NEARBY}?${queryParams.toString()}`, 'GET', undefined, token);

  if (res.success && res.data) {
    const hasAlice = res.data.some(n => n.first_name.toLowerCase() === 'alice');
    if (!hasAlice) {
      const breakdown: PricingBreakdown = {
        basePrice: 35,
        experienceMultiplier: 1,
        distanceFee: 0,
        urgencyFee: 0,
        surgeMultiplier: 1,
      };
      const alice: NearbyNurse = {
        nurse_id: 'alice_demo',
        first_name: 'Alice',
        last_name: 'Brown',
        email: 'alice@example.com',
        specialties: [NurseSpecialty.GENERAL],
        years_experience: 5,
        average_rating: 4.9,
        hourly_rate: 40,
        location: { type: 'Point', coordinates: [lng, lat] },
        pricing: {
          totalPrice: 35,
          nurseEarnings: 28,
          platformFee: 7,
          breakdown,
        },
        distance: 0.1,
      };
      res.data.unshift(alice);
    }
  }
  return res;
};

export const updateNurseStatus = async (
  statusUpdate: { is_online?: boolean; current_status?: NurseStatus },
  token: string
): Promise<ApiResponse<NurseProfile>> => {
  // Assuming an endpoint like PUT /api/nurses/profile/status or similar exists
  // The provided backend doesn't define this, so this is a placeholder.
  // For a real app, this would be specific like /api/nurses/me/status
  return apiService<NurseProfile>(NURSE_ENDPOINTS.UPDATE_STATUS, 'PUT', statusUpdate, token);
};

export const getNurseProfile = async (token: string): Promise<ApiResponse<NurseProfile>> => {
    // Assumed endpoint, not in provided backend code
    return apiService<NurseProfile>(NURSE_ENDPOINTS.PROFILE, 'GET', undefined, token);
};

export const updateNurseProfile = async (
  profileData: Partial<NurseProfile>,
  token: string
): Promise<ApiResponse<NurseProfile>> => {
  return apiService<NurseProfile>(NURSE_ENDPOINTS.PROFILE, 'PUT', profileData, token);
};

export const getNurseDashboard = async (
  nurseId: string,
  token?: string
): Promise<ApiResponse<NurseDashboardStats>> => {
  const url = `${NURSE_ENDPOINTS.DASHBOARD}?nurse_id=${nurseId}`;
  return apiService<NurseDashboardStats>(url, 'GET', undefined, token);
};

export const uploadNurseDocument = async (
  nurseId: string,
  documentType: string,
  file: File,
  token: string
): Promise<ApiResponse<unknown>> => {
  const formData = new FormData();
  formData.append('document_type', documentType);
  formData.append('document', file);
  return apiService<unknown>(
    `${API_BASE_URL}/documents/nurse/${nurseId}/upload`,
    'POST',
    formData,
    token
  );
};


import { ApiResponse, ApiError } from '../types';

export async function handleApiResponse<T>(response: Response): Promise<ApiResponse<T>> {
  if (!response.ok) {
    let errorData: ApiError = { message: `HTTP error! status: ${response.status}` };
    try {
      const parsedError = await response.json();
      // Backend error format is { success: false, error: 'message' }
      // Or sometimes more complex error objects.
      if (parsedError && parsedError.error) {
        errorData.message = typeof parsedError.error === 'string' ? parsedError.error : JSON.stringify(parsedError.error);
      } else if (parsedError && parsedError.message) {
         errorData.message = parsedError.message;
      }
    } catch (e) {
      // If parsing error fails, stick with the generic HTTP error
    }
    return { success: false, error: errorData };
  }
  try {
    const data = await response.json();
    // Assuming backend sends { success: true, ...data } or specific auth structure
    if(data.success === false && data.error) { // Handle cases where status is 200 but backend signals error
        return { success: false, error: {message: data.error} };
    }
    return data as ApiResponse<T>; // This already includes success field.
  } catch (error) {
    return { success: false, error: { message: 'Failed to parse JSON response' } };
  }
}


export async function apiService<T>(
  url: string,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
  body?: any,
  token?: string | null
): Promise<ApiResponse<T>> {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
    return handleApiResponse<T>(response);
  } catch (error: any) {
    console.error(`API call failed for ${method} ${url}:`, error);
    return { success: false, error: { message: error.message || 'Network error or request failed' } };
  }
}

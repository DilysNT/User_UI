import { Tour, TourListResponse, TourDetailResponse } from '../types/tour';

const API_BASE_URL = 'http://localhost:5000/api';

// Tạo instance axios (nếu chưa cài axios thì dùng fetch)
const apiCall = async <T>(endpoint: string, options?: RequestInit): Promise<T> => {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });

  if (!response.ok) {
    throw new Error(`API call failed: ${response.status} ${response.statusText}`);
  }

  return response.json();
};

// Lấy danh sách tất cả tours
export const getTours = async (): Promise<TourListResponse> => {
  return apiCall<TourListResponse>('/tours');
};

// Lấy chi tiết tour theo ID
export const getTourById = async (id: string): Promise<TourDetailResponse | null> => {
  const tours = await apiCall<TourListResponse>('/tours');
  return tours.find(tour => tour.id === id) || null;
};

// Lấy tours theo agency
export const getToursByAgency = async (agencyId: string): Promise<TourListResponse> => {
  return apiCall<TourListResponse>(`/tours?agency_id=${agencyId}`);
};

// Tạo tour mới
export const createTour = async (tourData: Partial<Tour>): Promise<TourDetailResponse> => {
  return apiCall<TourDetailResponse>('/tours', {
    method: 'POST',
    body: JSON.stringify(tourData),
  });
};

// Cập nhật tour
export const updateTour = async (id: string, tourData: Partial<Tour>): Promise<TourDetailResponse> => {
  return apiCall<TourDetailResponse>(`/tours/${id}`, {
    method: 'PUT',
    body: JSON.stringify(tourData),
  });
};

// Xóa tour
export const deleteTour = async (id: string): Promise<void> => {
  return apiCall<void>(`/tours/${id}`, {
    method: 'DELETE',
  });
}; 
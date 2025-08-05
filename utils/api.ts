// Utility functions for API calls with proper error handling
export const API_BASE_URL = 'http://localhost:5000/api';

// Get auth token from localStorage
export const getAuthToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('authToken') || localStorage.getItem('token');
  }
  return null;
};

// Create headers with optional auth
export const createHeaders = (includeAuth = false) => {
  const headers: Record<string, string> = {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  };
  
  if (includeAuth) {
    const token = getAuthToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }
  
  return headers;
};

// Generic API call with error handling
export const apiCall = async (endpoint: string, options: RequestInit = {}) => {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      mode: 'cors',
      ...options,
      headers: {
        ...createHeaders(),
        ...options.headers,
      },
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`API call failed for ${endpoint}:`, error);
    throw error;
  }
};

// Specific API calls
export const fetchTours = async (includeAuth = false) => {
  try {
    const headers = createHeaders(includeAuth);
    const response = await fetch(`${API_BASE_URL}/tours`, {
      mode: 'cors',
      headers,
    });
    
    if (response.ok) {
      return await response.json();
    } else {
      console.log('Tours API failed:', response.status, response.statusText);
      return null;
    }
  } catch (error) {
    console.error('Tours API error:', error);
    return null;
  }
};

export const fetchLocations = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/locations`, {
      mode: 'cors',
    });
    
    if (response.ok) {
      return await response.json();
    } else {
      return null;
    }
  } catch (error) {
    console.error('Locations API error:', error);
    return null;
  }
};

export const fetchDepartureLocations = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/departure-locations/with-count`, {
      mode: 'cors',
    });
    
    if (response.ok) {
      return await response.json();
    } else {
      return null;
    }
  } catch (error) {
    console.error('Departure locations API error:', error);
    return null;
  }
};

// Fallback data
export const FALLBACK_DATA = {
  locations: [
    { id: '1', name: 'Đà Lạt' },
    { id: '2', name: 'Đà Nẵng' },
    { id: '3', name: 'Hà Nội' },
    { id: '4', name: 'Hồ Chí Minh' },
    { id: '5', name: 'Nha Trang' },
    { id: '6', name: 'Phú Quốc' },
    { id: '7', name: 'Hội An' },
    { id: '8', name: 'Sapa' }
  ],
  
  departureLocations: ['Hồ Chí Minh', 'Hà Nội', 'Đà Nẵng', 'Cần Thơ'],
  
  tourNames: [
    'Tour khám phá Đà Lạt 3N2Đ',
    'Tour Đà Nẵng - Hội An 4N3Đ', 
    'Tour Hà Nội - Sapa 3N2Đ',
    'Tour Phú Quốc 4N3Đ',
    'Tour Nha Trang 3N2Đ',
    'Tour Đà Lạt tham quan thác Elephant',
    'Tour Đà Nẵng Bà Nà Hills',
    'Tour Hội An phố cổ'
  ]
};

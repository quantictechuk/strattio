// API client with auth token handling

const API_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

// Auth token management
export const authService = {
  getToken: () => localStorage.getItem('access_token'),
  getRefreshToken: () => localStorage.getItem('refresh_token'),
  setTokens: (accessToken, refreshToken) => {
    localStorage.setItem('access_token', accessToken);
    localStorage.setItem('refresh_token', refreshToken);
  },
  clearTokens: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
  },
  getUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },
  setUser: (user) => {
    localStorage.setItem('user', JSON.stringify(user));
  }
};

// API request helper
export const apiRequest = async (endpoint, options = {}) => {
  const token = authService.getToken();
  
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers
  };
  
  const config = {
    ...options,
    headers
  };
  
  try {
    const response = await fetch(`${API_URL}${endpoint}`, config);
    
    if (response.status === 401) {
      // Token expired, try refresh
      const refreshed = await refreshAccessToken();
      if (refreshed) {
        // Retry original request
        const retryHeaders = { ...headers, Authorization: `Bearer ${authService.getToken()}` };
        const retryResponse = await fetch(`${API_URL}${endpoint}`, { ...config, headers: retryHeaders });
        return handleResponse(retryResponse);
      } else {
        authService.clearTokens();
        window.location.href = '/login';
        throw new Error('Session expired');
      }
    }
    
    return handleResponse(response);
    
  } catch (error) {
    console.error('API request error:', error);
    throw error;
  }
};

const handleResponse = async (response) => {
  const contentType = response.headers.get('content-type');
  
  if (contentType && contentType.includes('application/json')) {
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.detail || data.message || 'Request failed');
    }
    
    return data;
  }
  
  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }
  
  return response;
};

const refreshAccessToken = async () => {
  const refreshToken = authService.getRefreshToken();
  if (!refreshToken) return false;
  
  try {
    const response = await fetch(`${API_URL}/api/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: refreshToken })
    });
    
    if (response.ok) {
      const data = await response.json();
      authService.setTokens(data.access_token, refreshToken);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Token refresh error:', error);
    return false;
  }
};

// API methods
export const api = {
  // Auth
  auth: {
    register: (data) => apiRequest('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
    login: (data) => apiRequest('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
    me: () => apiRequest('/api/auth/me')
  },
  
  // Plans
  plans: {
    list: (userId) => apiRequest(`/api/plans?user_id=${userId}`),
    create: (data, userId) => apiRequest('/api/plans', {
      method: 'POST',
      body: JSON.stringify({ ...data, user_id: userId })
    }),
    get: (planId, userId) => apiRequest(`/api/plans/${planId}?user_id=${userId}`),
    update: (planId, data, userId) => apiRequest(`/api/plans/${planId}?user_id=${userId}`, {
      method: 'PATCH',
      body: JSON.stringify(data)
    }),
    delete: (planId, userId) => apiRequest(`/api/plans/${planId}?user_id=${userId}`, {
      method: 'DELETE'
    }),
    generate: (planId, userId) => apiRequest(`/api/plans/${planId}/generate?user_id=${userId}`, {
      method: 'POST'
    }),
    status: (planId, userId) => apiRequest(`/api/plans/${planId}/status?user_id=${userId}`),
    duplicate: (planId, userId) => apiRequest(`/api/plans/${planId}/duplicate?user_id=${userId}`, {
      method: 'POST'
    })
  },
  
  // Sections
  sections: {
    list: (planId, userId) => apiRequest(`/api/plans/${planId}/sections?user_id=${userId}`),
    get: (planId, sectionId, userId) => apiRequest(`/api/plans/${planId}/sections/${sectionId}?user_id=${userId}`),
    update: (planId, sectionId, data, userId) => apiRequest(`/api/plans/${planId}/sections/${sectionId}?user_id=${userId}`, {
      method: 'PATCH',
      body: JSON.stringify(data)
    }),
    regenerate: (planId, sectionId, userId) => apiRequest(`/api/plans/${planId}/sections/${sectionId}/regenerate?user_id=${userId}`, {
      method: 'POST'
    })
  },
  
  // Financials
  financials: {
    get: (planId, userId) => apiRequest(`/api/plans/${planId}/financials?user_id=${userId}`)
  },
  
  // Compliance
  compliance: {
    get: (planId, userId) => apiRequest(`/api/plans/${planId}/compliance?user_id=${userId}`)
  },
  
  // Exports
  exports: {
    create: (planId, format, userId) => apiRequest('/api/exports', {
      method: 'POST',
      body: JSON.stringify({ plan_id: planId, format, user_id: userId })
    }),
    download: (exportId, userId) => apiRequest(`/api/exports/${exportId}/download?user_id=${userId}`)
  },
  
  // Subscriptions
  subscriptions: {
    current: (userId) => apiRequest(`/api/subscriptions/current?user_id=${userId}`),
    usage: (userId) => apiRequest(`/api/subscriptions/usage?user_id=${userId}`)
  }
};

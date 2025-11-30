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
    list: () => apiRequest('/api/plans'),
    create: (data) => apiRequest('/api/plans', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
    get: (planId) => apiRequest(`/api/plans/${planId}`),
    update: (planId, data) => apiRequest(`/api/plans/${planId}`, {
      method: 'PATCH',
      body: JSON.stringify(data)
    }),
    delete: (planId) => apiRequest(`/api/plans/${planId}`, {
      method: 'DELETE'
    }),
    generate: (planId) => apiRequest(`/api/plans/${planId}/generate`, {
      method: 'POST'
    }),
    status: (planId) => apiRequest(`/api/plans/${planId}/status`),
    duplicate: (planId) => apiRequest(`/api/plans/${planId}/duplicate`, {
      method: 'POST'
    })
  },
  
  // Sections
  sections: {
    list: (planId) => apiRequest(`/api/${planId}/sections`),
    get: (planId, sectionId) => apiRequest(`/api/${planId}/sections/${sectionId}`),
    update: (planId, sectionId, data) => apiRequest(`/api/${planId}/sections/${sectionId}`, {
      method: 'PATCH',
      body: JSON.stringify(data)
    }),
    regenerate: (planId, sectionId) => apiRequest(`/api/${planId}/sections/${sectionId}/regenerate`, {
      method: 'POST'
    })
  },
  
  // Financials
  financials: {
    get: (planId) => apiRequest(`/api/${planId}/financials`)
  },
  
  // Compliance
  compliance: {
    get: (planId) => apiRequest(`/api/${planId}/compliance`)
  },
  
  // Exports
  exports: {
    create: (planId, format) => apiRequest('/api/exports', {
      method: 'POST',
      body: JSON.stringify({ plan_id: planId, format })
    }),
    download: (exportId) => apiRequest(`/api/exports/${exportId}/download`)
  },
  
  // Subscriptions
  subscriptions: {
    current: () => apiRequest('/api/subscriptions/current'),
    usage: () => apiRequest('/api/subscriptions/usage')
  }
};

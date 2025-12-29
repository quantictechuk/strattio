// API client with auth token handling

// Normalize API URL - remove trailing slash to prevent double slashes
const getApiUrl = () => {
  const url = process.env.REACT_APP_BACKEND_URL || 'https://strattio-backend.vercel.app';
  return url.replace(/\/+$/, ''); // Remove trailing slashes
};

const API_URL = getApiUrl();

// Helper to build API URLs safely (prevents double slashes)
const buildApiUrl = (endpoint) => {
  // Remove leading slashes from endpoint
  const cleanEndpoint = endpoint.replace(/^\/+/, '');
  // Ensure single slash between base URL and endpoint
  return `${API_URL}/${cleanEndpoint}`;
};

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

const refreshAccessToken = async () => {
  const refreshToken = authService.getRefreshToken();
  if (!refreshToken) return false;
  
  try {
    const response = await fetch(buildApiUrl('api/auth/refresh'), {
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

// API request helper - SIMPLIFIED to avoid body consumption issues
export const apiRequest = async (endpoint, options = {}) => {
  const makeRequest = async (token) => {
    const headers = {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers
    };
    
    try {
      // Use helper to build URL safely (prevents double slashes)
      const url = buildApiUrl(endpoint);
      const response = await fetch(url, {
        ...options,
        headers
      });
      
      return response;
    } catch (networkError) {
      // Handle network errors (backend not running, CORS, etc.)
      console.error('Network error:', networkError);
      throw new Error(`Unable to connect to server. Please check if the backend is running. (${networkError.message})`);
    }
  };
  
  try {
    // First attempt with current token
    let response = await makeRequest(authService.getToken());
    
    // If 401, try to refresh token and retry ONCE
    if (response.status === 401) {
      const refreshed = await refreshAccessToken();
      if (refreshed) {
        // Retry with new token
        response = await makeRequest(authService.getToken());
      } else {
        authService.clearTokens();
        window.location.href = '/';
        throw new Error('Session expired');
      }
    }
    
    return handleResponse(response);
    
  } catch (error) {
    console.error('API request error:', error);
    // Re-throw with better error message if it's a network error
    const errorMsg = error.message || String(error);
    if (errorMsg.includes('Failed to fetch') || errorMsg.includes('Load failed') || errorMsg.includes('network') || error.name === 'TypeError') {
      throw new Error('Unable to connect to server. Please check if the backend is running at ' + API_URL);
    }
    throw error;
  }
};

const handleResponse = async (response) => {
  const contentType = response.headers.get('content-type');
  
  if (contentType && contentType.includes('application/json')) {
    const data = await response.json();
    
    if (!response.ok) {
      // Provide more specific error messages
      if (response.status === 404) {
        throw new Error(data.detail || data.message || `Endpoint not found (${response.status}). Please ensure the backend server is running and has been restarted.`);
      }
      throw new Error(data.detail || data.message || `Request failed with status ${response.status}`);
    }
    
    return data;
  }
  
  if (!response.ok) {
    if (response.status === 404) {
      throw new Error(`Endpoint not found (${response.status}). Please ensure the backend server is running and has been restarted.`);
    }
    throw new Error(`Request failed with status ${response.status}`);
  }
  
  return response;
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
    regenerate: (planId, sectionId, options = {}) => apiRequest(`/api/${planId}/sections/${sectionId}/regenerate`, {
      method: 'POST',
      body: JSON.stringify(options)
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
  },
  
  // Stripe Payments
  stripe: {
    createCheckout: (packageId, originUrl) => apiRequest('/api/stripe/checkout/session', {
      method: 'POST',
      body: JSON.stringify({ package_id: packageId, origin_url: originUrl })
    }),
    getCheckoutStatus: (sessionId) => apiRequest(`/api/stripe/checkout/status/${sessionId}`)
  },
  
  // Contact
  contact: {
    send: (formData) => apiRequest('/api/contact', {
      method: 'POST',
      body: JSON.stringify(formData)
    })
  },
  
  // Companies
  companies: {
    list: () => apiRequest('/api/companies'),
    get: (companyId) => apiRequest(`/api/companies/${companyId}`),
    create: (data) => apiRequest('/api/companies', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
    update: (companyId, data) => apiRequest(`/api/companies/${companyId}`, {
      method: 'PATCH',
      body: JSON.stringify(data)
    }),
    delete: (companyId) => apiRequest(`/api/companies/${companyId}`, {
      method: 'DELETE'
    })
  },
  
  // SWOT Analysis
  swot: {
    get: (planId) => apiRequest(`/api/${planId}/swot`),
    regenerate: (planId) => apiRequest(`/api/${planId}/swot/regenerate`, {
      method: 'POST'
    })
  },
  
  // Competitor Analysis
  competitors: {
    get: (planId) => apiRequest(`/api/${planId}/competitors`),
    regenerate: (planId) => apiRequest(`/api/${planId}/competitors/regenerate`, {
      method: 'POST'
    })
  },
  
  // Audit Logs
  auditLogs: {
    list: (params = {}) => {
      const queryParams = new URLSearchParams(params).toString();
      return apiRequest(`/api/audit-logs${queryParams ? '?' + queryParams : ''}`);
    },
    getEntity: (entityType, entityId, params = {}) => {
      const queryParams = new URLSearchParams(params).toString();
      return apiRequest(`/api/audit-logs/entity/${entityType}/${entityId}${queryParams ? '?' + queryParams : ''}`);
    },
    getStats: (days = 30) => apiRequest(`/api/audit-logs/stats?days=${days}`)
  },
  
  // Business Model Canvas
  canvas: {
    get: (planId) => apiRequest(`/api/${planId}/canvas`),
    generate: (planId) => apiRequest(`/api/${planId}/canvas/generate`, {
      method: 'POST'
    })
  },
  users: {
    update: (data) => apiRequest('/api/auth/me', {
      method: 'PATCH',
      body: JSON.stringify(data)
    }),
    changePassword: (data) => apiRequest('/api/auth/me/password', {
      method: 'PATCH',
      body: JSON.stringify(data)
    }),
    delete: () => apiRequest('/api/auth/me', {
      method: 'DELETE'
    })
  },
  admin: {
    analytics: {
      overview: () => apiRequest('/api/admin/analytics/overview'),
      users: () => apiRequest('/api/admin/analytics/users'),
      revenue: (days = 30) => apiRequest(`/api/admin/analytics/revenue?days=${days}`)
    },
    users: {
      list: (skip = 0, limit = 50, search = '') => {
        const params = new URLSearchParams({ skip: skip.toString(), limit: limit.toString() });
        if (search) params.append('search', search);
        return apiRequest(`/api/admin/users?${params.toString()}`);
      },
      get: (userId) => apiRequest(`/api/admin/users/${userId}`),
      changePassword: (userId, newPassword) => apiRequest(`/api/admin/users/${userId}/password`, {
        method: 'POST',
        body: JSON.stringify({ user_id: userId, new_password: newPassword })
      })
    },
    changePassword: (newPassword) => apiRequest('/api/admin/admin/password', {
      method: 'POST',
      body: JSON.stringify({ new_password: newPassword })
    }),
    admins: {
      list: () => apiRequest('/api/admin/admins'),
      create: (adminData) => apiRequest('/api/admin/admins', {
        method: 'POST',
        body: JSON.stringify(adminData)
      })
    }
  }
};

const API_BASE_URL = '/api';

async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const defaultHeaders = {
    'Content-Type': 'application/json',
  };

  const config = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, config);
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `API Request failed with status ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`API Error on ${endpoint}:`, error);
    throw error;
  }
}

export const api = {
  getHealth: () => request('/health'),
  getSchemes: () => request('/schemes'),
  getSchemeById: (id) => request(`/schemes/${id}`),
  getRecommendation: (payload) => request('/recommend', { method: 'POST', body: JSON.stringify(payload) }),
  calculateEmi: (payload) => request('/calculator/emi', { method: 'POST', body: JSON.stringify(payload) }),
  getStates: () => request('/locations/states'),
  getDistricts: (state) => request(`/locations/districts/${encodeURIComponent(state)}`),
  getPartners: (payload) => request('/partners/nearby', { method: 'POST', body: JSON.stringify(payload) }),
  getPartnerById: (id) => request(`/partners/${id}`),
  sendChat: (payload) => request('/chat', { method: 'POST', body: JSON.stringify(payload) }),
};

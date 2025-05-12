const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = {
  post: async (endpoint, data) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify(data),
      });
      const responseData = await response.json();
      if (!response.ok) {
        throw new Error(responseData.message || `Request failed with status ${response.status}`);
      }
      return responseData;
    } catch (error) {
      throw new Error(error.message || 'Network error');
    }
  },

  get: async (endpoint) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${BASE_URL}${endpoint}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });
      const responseData = await response.json();
      if (!response.ok) {
        throw new Error(responseData.message || `Request failed with status ${response.status}`);
      }
      return responseData;
    } catch (error) {
      throw new Error(error.message || 'Network error');
    }
  },

  put: async (endpoint, data) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${BASE_URL}${endpoint}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify(data),
      });
      const responseData = await response.json();
      if (!response.ok) {
        throw new Error(responseData.message || `Request failed with status ${response.status}`);
      }
      return responseData;
    } catch (error) {
      throw new Error(error.message || 'Network error');
    }
  },

  delete: async (endpoint) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${BASE_URL}${endpoint}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });
      const responseData = await response.json();
      if (!response.ok) {
        throw new Error(responseData.message || `Request failed with status ${response.status}`);
      }
      return responseData;
    } catch (error) {
      throw new Error(error.message || 'Network error');
    }
  },
};

export default api;
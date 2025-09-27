import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

class APIClient {
  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 10000,
    });
    this.setupInterceptors();
  }

  setupInterceptors() {
    // Request interceptor to add auth token
    this.client.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('accessToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor to handle token refresh
    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            const refreshToken = localStorage.getItem('refreshToken');
            if (refreshToken) {
              const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
                refreshToken,
              });

              const { accessToken, refreshToken: newRefreshToken } = response.data.data.tokens;
              
              localStorage.setItem('accessToken', accessToken);
              localStorage.setItem('refreshToken', newRefreshToken);
              
              originalRequest.headers.Authorization = `Bearer ${accessToken}`;
              return this.client(originalRequest);
            }
          } catch (refreshError) {
            // Refresh failed, redirect to login
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            window.location.href = '/login';
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      }
    );
  }

  async get(url, config) {
    return this.client.get(url, config);
  }

  async post(url, data, config) {
    return this.client.post(url, data, config);
  }

  async put(url, data, config) {
    return this.client.put(url, data, config);
  }

  async patch(url, data, config) {
    return this.client.patch(url, data, config);
  }

  async delete(url, config) {
    return this.client.delete(url, config);
  }
}

const apiClient = new APIClient();

// Auth API
export const authAPI = {
  login: (credentials) => apiClient.post('/auth/login', credentials),
  register: (userData) => apiClient.post('/auth/register', userData),
  logout: () => apiClient.post('/auth/logout'),
  refreshToken: (refreshToken) => apiClient.post('/auth/refresh', { refreshToken }),
  getProfile: () => apiClient.get('/users/profile'),
};

// Cases / Missing persons API
const fetchMissingPersons = (params) => apiClient.get('/missingpeople/getallpersons', { params });

export const casesAPI = {
  getCases: (params) => fetchMissingPersons(params),
  getAllCases: (params) => fetchMissingPersons(params),
  createCase: (caseData) => apiClient.post('/missingpeople/addperson', caseData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  updateCase: (id, caseData) => apiClient.put(`/missingpeople/updateperson/${id}`, caseData),
  deleteCase: (adhaarNumber) => apiClient.delete(`/missingpeople/deleteperson/${adhaarNumber}`),
  getCaseById: (adhaarNumber) => apiClient.get(`/missingpeople/getperson/${adhaarNumber}`),
  addSighting: (id, payload) => apiClient.post(`/missingpeople/${id}/sightings`, payload),
};

// Users API
export const usersAPI = {
  getProfile: () => apiClient.get('/users/profile'),
  updateProfile: (userData) => apiClient.put('/users/profile', userData),
  changePassword: (passwordData) => apiClient.put('/users/change-password', passwordData),
};

// Admin API
export const adminAPI = {
  getAllUsers: () => apiClient.get('/admin/users'),
  deleteUser: (userId) => apiClient.delete(`/admin/users/${userId}`),
  updateUserRole: (userId, role) => apiClient.put(`/admin/users/${userId}/role`, { role }),
  getMissingPersons: (params) => fetchMissingPersons(params),
  approveMissingPerson: (id) => apiClient.patch(`/missingpeople/${id}/approve`),
  markMissingPersonFound: (id) => apiClient.patch(`/missingpeople/${id}/mark-found`),
};

export default apiClient;
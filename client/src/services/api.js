const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

function getAuthHeaders() {
  const token = localStorage.getItem('placement_admin_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function handleResponse(response) {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const errorMsg = data.message || `Request failed with status ${response.status}`;
    const err = new Error(errorMsg);
    err.status = response.status;
    err.data = data;
    throw err;
  }
  return data;
}

export const api = {
  // Public APIs
  async getCompanies(params = {}) {
    const query = new URLSearchParams();
    if (params.search) query.append('search', params.search);
    if (params.year) query.append('year', params.year);
    if (params.sort) query.append('sort', params.sort);
    if (params.page) query.append('page', params.page);
    if (params.limit) query.append('limit', params.limit);
    if (params.includeUnpublished) query.append('includeUnpublished', 'true');

    const res = await fetch(`${API_BASE_URL}/companies?${query.toString()}`);
    return handleResponse(res);
  },

  async getPublicStats() {
    const res = await fetch(`${API_BASE_URL}/companies/stats/summary`);
    return handleResponse(res);
  },

  async getCompanyById(id, includeUnpublished = false) {
    const query = includeUnpublished ? '?includeUnpublished=true' : '';
    const res = await fetch(`${API_BASE_URL}/companies/${id}${query}`);
    return handleResponse(res);
  },

  async getExperiences(params = {}) {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE_URL}/experiences?${query}`);
    return handleResponse(res);
  },

  async getExperienceById(id) {
    const res = await fetch(`${API_BASE_URL}/experiences/${id}`);
    return handleResponse(res);
  },

  // Admin Authentication
  async adminLogin(email, password) {
    const res = await fetch(`${API_BASE_URL}/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    return handleResponse(res);
  },

  async getAdminProfile() {
    const res = await fetch(`${API_BASE_URL}/admin/me`, {
      headers: { ...getAuthHeaders() },
    });
    return handleResponse(res);
  },

  // Admin Dashboard & Review Queue
  async getAdminStats() {
    const res = await fetch(`${API_BASE_URL}/admin/stats`, {
      headers: { ...getAuthHeaders() },
    });
    return handleResponse(res);
  },

  async getReviewQueue() {
    const res = await fetch(`${API_BASE_URL}/admin/review-queue`, {
      headers: { ...getAuthHeaders() },
    });
    return handleResponse(res);
  },

  async resolveReview(payload) {
    const res = await fetch(`${API_BASE_URL}/admin/resolve-review`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify(payload),
    });
    return handleResponse(res);
  },

  async getImportReports() {
    const res = await fetch(`${API_BASE_URL}/admin/import-reports`, {
      headers: { ...getAuthHeaders() },
    });
    return handleResponse(res);
  },

  // Admin CRUD for Companies
  async createCompany(data) {
    const res = await fetch(`${API_BASE_URL}/companies`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  async updateCompany(id, data) {
    const res = await fetch(`${API_BASE_URL}/companies/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  async deleteCompany(id) {
    const res = await fetch(`${API_BASE_URL}/companies/${id}`, {
      method: 'DELETE',
      headers: { ...getAuthHeaders() },
    });
    return handleResponse(res);
  },

  // Admin CRUD for Experiences
  async createExperience(data) {
    const res = await fetch(`${API_BASE_URL}/experiences`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  async updateExperience(id, data) {
    const res = await fetch(`${API_BASE_URL}/experiences/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  async deleteExperience(id) {
    const res = await fetch(`${API_BASE_URL}/experiences/${id}`, {
      method: 'DELETE',
      headers: { ...getAuthHeaders() },
    });
    return handleResponse(res);
  },

  // Admin CRUD for Rounds
  async updateRound(id, data) {
    const res = await fetch(`${API_BASE_URL}/rounds/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  async deleteRound(id) {
    const res = await fetch(`${API_BASE_URL}/rounds/${id}`, {
      method: 'DELETE',
      headers: { ...getAuthHeaders() },
    });
    return handleResponse(res);
  },

  // Admin CRUD for Questions
  async updateQuestion(id, data) {
    const res = await fetch(`${API_BASE_URL}/questions/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  async deleteQuestion(id) {
    const res = await fetch(`${API_BASE_URL}/questions/${id}`, {
      method: 'DELETE',
      headers: { ...getAuthHeaders() },
    });
    return handleResponse(res);
  },

  // Learning Materials API
  async getLearningMaterials(params = {}) {
    const query = new URLSearchParams();
    if (params.search) query.append('search', params.search);
    if (params.category) query.append('category', params.category);
    if (params.company) query.append('company', params.company);
    if (params.page) query.append('page', params.page);
    if (params.limit) query.append('limit', params.limit);
    if (params.includeUnpublished) query.append('includeUnpublished', 'true');

    const res = await fetch(`${API_BASE_URL}/learning-materials?${query.toString()}`);
    return handleResponse(res);
  },

  async getLearningMaterialById(id) {
    const res = await fetch(`${API_BASE_URL}/learning-materials/${id}`);
    return handleResponse(res);
  },

  async createLearningMaterial(formData) {
    const isFormData = typeof FormData !== 'undefined' && formData instanceof FormData;
    const headers = { ...getAuthHeaders() };
    if (!isFormData) {
      headers['Content-Type'] = 'application/json';
    }

    const res = await fetch(`${API_BASE_URL}/learning-materials`, {
      method: 'POST',
      headers,
      body: isFormData ? formData : JSON.stringify(formData),
    });
    return handleResponse(res);
  },

  async updateLearningMaterial(id, formData) {
    const isFormData = typeof FormData !== 'undefined' && formData instanceof FormData;
    const headers = { ...getAuthHeaders() };
    if (!isFormData) {
      headers['Content-Type'] = 'application/json';
    }

    const res = await fetch(`${API_BASE_URL}/learning-materials/${id}`, {
      method: 'PUT',
      headers,
      body: isFormData ? formData : JSON.stringify(formData),
    });
    return handleResponse(res);
  },

  async deleteLearningMaterial(id) {
    const res = await fetch(`${API_BASE_URL}/learning-materials/${id}`, {
      method: 'DELETE',
      headers: { ...getAuthHeaders() },
    });
    return handleResponse(res);
  },

  // Alumni Directory API
  async getAlumni(params = {}) {
    const query = new URLSearchParams();
    if (params.search) query.append('search', params.search);
    if (params.company) query.append('company', params.company);
    if (params.page) query.append('page', params.page);
    if (params.limit) query.append('limit', params.limit);
    if (params.includeUnpublished) query.append('includeUnpublished', 'true');

    const res = await fetch(`${API_BASE_URL}/alumni?${query.toString()}`);
    return handleResponse(res);
  },

  async getAlumniById(id) {
    const res = await fetch(`${API_BASE_URL}/alumni/${id}`);
    return handleResponse(res);
  },

  async createAlumni(data) {
    const res = await fetch(`${API_BASE_URL}/alumni`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  async updateAlumni(id, data) {
    const res = await fetch(`${API_BASE_URL}/alumni/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  async deleteAlumni(id) {
    const res = await fetch(`${API_BASE_URL}/alumni/${id}`, {
      method: 'DELETE',
      headers: { ...getAuthHeaders() },
    });
    return handleResponse(res);
  },

  async toggleFeaturedAlumni(id) {
    const res = await fetch(`${API_BASE_URL}/alumni/${id}/featured`, {
      method: 'PATCH',
      headers: { ...getAuthHeaders() },
    });
    return handleResponse(res);
  },
};

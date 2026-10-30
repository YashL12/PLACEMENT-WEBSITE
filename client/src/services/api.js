const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

// ── Client-side In-Memory Cache (makes navigation instant) ─────────────────────
const clientCache = new Map();
const DEFAULT_TTL_MS = 3 * 60 * 1000; // 3 minutes

function getCached(key) {
  const item = clientCache.get(key);
  if (!item) return null;
  if (Date.now() > item.expiresAt) {
    clientCache.delete(key);
    return null;
  }
  return item.data;
}

function setCached(key, data, ttlMs = DEFAULT_TTL_MS) {
  if (clientCache.size > 250) {
    const oldest = clientCache.keys().next().value;
    if (oldest) clientCache.delete(oldest);
  }
  clientCache.set(key, { data, expiresAt: Date.now() + ttlMs });
}

export function clearClientCache(prefix = null) {
  if (!prefix) {
    clientCache.clear();
  } else {
    for (const key of clientCache.keys()) {
      if (key.startsWith(prefix)) {
        clientCache.delete(key);
      }
    }
  }
}

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

async function fetchWithTimeout(url, options = {}, timeoutMs = 15000) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { ...options, signal: controller.signal });
    return res;
  } catch (err) {
    if (err.name === 'AbortError') {
      throw new Error('Network request timed out. Please check your internet connection.');
    }
    throw err;
  } finally {
    clearTimeout(timeoutId);
  }
}

export const api = {
  clearCache: clearClientCache,

  // ─── Public APIs ────────────────────────────────────────────────────────────
  async getCompanies(params = {}) {
    const query = new URLSearchParams();
    if (params.search) query.append('search', params.search);
    if (params.year) query.append('year', params.year);
    if (params.sort) query.append('sort', params.sort);
    if (params.page) query.append('page', params.page);
    if (params.limit) query.append('limit', params.limit);
    if (params.includeUnpublished) query.append('includeUnpublished', 'true');

    const cacheKey = `companies:${query.toString()}`;
    if (!params.includeUnpublished) {
      const cached = getCached(cacheKey);
      if (cached) return cached;
    }

    const res = await fetchWithTimeout(`${API_BASE_URL}/companies?${query.toString()}`);
    const data = await handleResponse(res);
    if (!params.includeUnpublished) {
      setCached(cacheKey, data, 60 * 1000);
    }
    return data;
  },

  async getPublicStats() {
    const cacheKey = 'stats:summary';
    const cached = getCached(cacheKey);
    if (cached) return cached;

    const res = await fetchWithTimeout(`${API_BASE_URL}/companies/stats/summary`);
    const data = await handleResponse(res);
    setCached(cacheKey, data, 2 * 60 * 1000);
    return data;
  },

  async getCompanyById(id, includeUnpublished = false) {
    const cacheKey = `company:${id}:${includeUnpublished}`;
    if (!includeUnpublished) {
      const cached = getCached(cacheKey);
      if (cached) return cached;
    }

    const query = includeUnpublished ? '?includeUnpublished=true' : '';
    const res = await fetchWithTimeout(`${API_BASE_URL}/companies/${id}${query}`, {
      headers: { ...getAuthHeaders() },
    });
    const data = await handleResponse(res);
    if (!includeUnpublished) {
      setCached(cacheKey, data, 2 * 60 * 1000);
    }
    return data;
  },

  async getExperiences(params = {}) {
    const query = new URLSearchParams(params).toString();
    const res = await fetchWithTimeout(`${API_BASE_URL}/experiences?${query}`);
    return handleResponse(res);
  },

  async getExperienceById(id) {
    const res = await fetchWithTimeout(`${API_BASE_URL}/experiences/${id}`);
    return handleResponse(res);
  },

  // ─── Admin Authentication & Credentials ─────────────────────────────────────
  async adminLogin(email, password) {
    const res = await fetchWithTimeout(`${API_BASE_URL}/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    return handleResponse(res);
  },

  async getAdminProfile() {
    const res = await fetchWithTimeout(`${API_BASE_URL}/admin/me`, {
      headers: { ...getAuthHeaders() },
    });
    return handleResponse(res);
  },

  async updateAdminCredentials(payload) {
    const res = await fetchWithTimeout(`${API_BASE_URL}/admin/credentials`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify(payload),
    });
    return handleResponse(res);
  },

  // ─── Admin Dashboard & Review Queue ─────────────────────────────────────────
  async getAdminStats() {
    const res = await fetchWithTimeout(`${API_BASE_URL}/admin/stats`, {
      headers: { ...getAuthHeaders() },
    });
    return handleResponse(res);
  },

  async getReviewQueue() {
    const res = await fetchWithTimeout(`${API_BASE_URL}/admin/review-queue`, {
      headers: { ...getAuthHeaders() },
    });
    return handleResponse(res);
  },

  async resolveReview(payload) {
    const res = await fetchWithTimeout(`${API_BASE_URL}/admin/resolve-review`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify(payload),
    });
    clearClientCache();
    return handleResponse(res);
  },

  async getImportReports() {
    const res = await fetchWithTimeout(`${API_BASE_URL}/admin/import-reports`, {
      headers: { ...getAuthHeaders() },
    });
    return handleResponse(res);
  },

  // ─── Admin CRUD for Companies ───────────────────────────────────────────────
  async createCompany(data) {
    const res = await fetchWithTimeout(`${API_BASE_URL}/companies`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify(data),
    });
    clearClientCache();
    return handleResponse(res);
  },

  async updateCompany(id, data) {
    const res = await fetchWithTimeout(`${API_BASE_URL}/companies/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify(data),
    });
    clearClientCache();
    return handleResponse(res);
  },

  async deleteCompany(id) {
    const res = await fetchWithTimeout(`${API_BASE_URL}/companies/${id}`, {
      method: 'DELETE',
      headers: { ...getAuthHeaders() },
    });
    clearClientCache();
    return handleResponse(res);
  },

  async uploadCompanyLogo(arg1, arg2) {
    let file = arg1;
    let companyId = null;

    if (arg1 instanceof File || arg1 instanceof Blob || (arg1 && typeof arg1 === 'object' && arg1.name)) {
      file = arg1;
      companyId = typeof arg2 === 'string' ? arg2 : null;
    } else if (typeof arg1 === 'string') {
      companyId = arg1;
      file = arg2;
    }

    const formData = new FormData();
    formData.append('logo', file);
    const endpoint = companyId
      ? `${API_BASE_URL}/companies/${companyId}/logo`
      : `${API_BASE_URL}/companies/upload-logo`;

    const res = await fetchWithTimeout(endpoint, {
      method: 'POST',
      headers: { ...getAuthHeaders() },
      body: formData,
    });
    clearClientCache();
    return handleResponse(res);
  },

  // ─── Admin CRUD for Experiences ─────────────────────────────────────────────
  async createExperience(data) {
    const res = await fetchWithTimeout(`${API_BASE_URL}/experiences`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify(data),
    });
    clearClientCache();
    return handleResponse(res);
  },

  async updateExperience(id, data) {
    const res = await fetchWithTimeout(`${API_BASE_URL}/experiences/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify(data),
    });
    clearClientCache();
    return handleResponse(res);
  },

  async deleteExperience(id) {
    const res = await fetchWithTimeout(`${API_BASE_URL}/experiences/${id}`, {
      method: 'DELETE',
      headers: { ...getAuthHeaders() },
    });
    clearClientCache();
    return handleResponse(res);
  },

  // ─── Admin CRUD for Rounds ──────────────────────────────────────────────────
  async updateRound(id, data) {
    const res = await fetchWithTimeout(`${API_BASE_URL}/rounds/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify(data),
    });
    clearClientCache();
    return handleResponse(res);
  },

  async deleteRound(id) {
    const res = await fetchWithTimeout(`${API_BASE_URL}/rounds/${id}`, {
      method: 'DELETE',
      headers: { ...getAuthHeaders() },
    });
    clearClientCache();
    return handleResponse(res);
  },

  // ─── Admin CRUD for Questions ───────────────────────────────────────────────
  async updateQuestion(id, data) {
    const res = await fetchWithTimeout(`${API_BASE_URL}/questions/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify(data),
    });
    clearClientCache();
    return handleResponse(res);
  },

  async deleteQuestion(id) {
    const res = await fetchWithTimeout(`${API_BASE_URL}/questions/${id}`, {
      method: 'DELETE',
      headers: { ...getAuthHeaders() },
    });
    clearClientCache();
    return handleResponse(res);
  },

  // ─── Learning Materials API ─────────────────────────────────────────────────
  async getLearningMaterials(params = {}) {
    const query = new URLSearchParams();
    if (params.search) query.append('search', params.search);
    if (params.category) query.append('category', params.category);
    if (params.company) query.append('company', params.company);
    if (params.page) query.append('page', params.page);
    if (params.limit) query.append('limit', params.limit);
    if (params.includeUnpublished) query.append('includeUnpublished', 'true');

    const cacheKey = `materials:${query.toString()}`;
    if (!params.includeUnpublished) {
      const cached = getCached(cacheKey);
      if (cached) return cached;
    }

    const res = await fetchWithTimeout(`${API_BASE_URL}/learning-materials?${query.toString()}`);
    const data = await handleResponse(res);
    if (!params.includeUnpublished) {
      setCached(cacheKey, data, 90 * 1000);
    }
    return data;
  },

  async getLearningMaterialById(id) {
    const res = await fetchWithTimeout(`${API_BASE_URL}/learning-materials/${id}`);
    return handleResponse(res);
  },

  async createLearningMaterial(formData) {
    const isFormData = typeof FormData !== 'undefined' && formData instanceof FormData;
    const headers = { ...getAuthHeaders() };
    if (!isFormData) {
      headers['Content-Type'] = 'application/json';
    }

    const res = await fetchWithTimeout(`${API_BASE_URL}/learning-materials`, {
      method: 'POST',
      headers,
      body: isFormData ? formData : JSON.stringify(formData),
    });
    clearClientCache();
    return handleResponse(res);
  },

  async updateLearningMaterial(id, formData) {
    const isFormData = typeof FormData !== 'undefined' && formData instanceof FormData;
    const headers = { ...getAuthHeaders() };
    if (!isFormData) {
      headers['Content-Type'] = 'application/json';
    }

    const res = await fetchWithTimeout(`${API_BASE_URL}/learning-materials/${id}`, {
      method: 'PUT',
      headers,
      body: isFormData ? formData : JSON.stringify(formData),
    });
    clearClientCache();
    return handleResponse(res);
  },

  async deleteLearningMaterial(id) {
    const res = await fetchWithTimeout(`${API_BASE_URL}/learning-materials/${id}`, {
      method: 'DELETE',
      headers: { ...getAuthHeaders() },
    });
    clearClientCache();
    return handleResponse(res);
  },

  // ─── Alumni Directory API ───────────────────────────────────────────────────
  async getAlumni(params = {}) {
    const query = new URLSearchParams();
    if (params.search) query.append('search', params.search);
    if (params.company) query.append('company', params.company);
    if (params.page) query.append('page', params.page);
    if (params.limit) query.append('limit', params.limit);
    if (params.includeUnpublished) query.append('includeUnpublished', 'true');

    const cacheKey = `alumni:${query.toString()}`;
    if (!params.includeUnpublished) {
      const cached = getCached(cacheKey);
      if (cached) return cached;
    }

    const res = await fetchWithTimeout(`${API_BASE_URL}/alumni?${query.toString()}`);
    const data = await handleResponse(res);
    if (!params.includeUnpublished) {
      setCached(cacheKey, data, 90 * 1000);
    }
    return data;
  },

  async getAlumniById(id) {
    const res = await fetchWithTimeout(`${API_BASE_URL}/alumni/${id}`);
    return handleResponse(res);
  },

  async createAlumni(data) {
    const res = await fetchWithTimeout(`${API_BASE_URL}/alumni`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify(data),
    });
    clearClientCache();
    return handleResponse(res);
  },

  async updateAlumni(id, data) {
    const res = await fetchWithTimeout(`${API_BASE_URL}/alumni/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify(data),
    });
    clearClientCache();
    return handleResponse(res);
  },

  async deleteAlumni(id) {
    const res = await fetchWithTimeout(`${API_BASE_URL}/alumni/${id}`, {
      method: 'DELETE',
      headers: { ...getAuthHeaders() },
    });
    clearClientCache();
    return handleResponse(res);
  },

  async toggleFeaturedAlumni(id) {
    const res = await fetchWithTimeout(`${API_BASE_URL}/alumni/${id}/featured`, {
      method: 'PATCH',
      headers: { ...getAuthHeaders() },
    });
    clearClientCache();
    return handleResponse(res);
  },

  // ─── Coding Practice APIs ─────────────────────────────────────────────────
  async getCodingMeta() {
    const cacheKey = 'coding:meta';
    const cached = getCached(cacheKey);
    if (cached) return cached;

    const res = await fetchWithTimeout(`${API_BASE_URL}/coding-questions/meta`);
    const data = await handleResponse(res);
    setCached(cacheKey, data, 5 * 60 * 1000);
    return data;
  },

  async getCodingStats() {
    const cacheKey = 'coding:stats';
    const cached = getCached(cacheKey);
    if (cached) return cached;

    const res = await fetchWithTimeout(`${API_BASE_URL}/coding-questions/stats`);
    const data = await handleResponse(res);
    setCached(cacheKey, data, 5 * 60 * 1000);
    return data;
  },

  async getCodingQuestions(params = {}) {
    const query = new URLSearchParams();
    if (params.category && params.category !== 'All') query.append('category', params.category);
    if (params.topic && params.topic !== 'All') query.append('topic', params.topic);
    if (params.difficulty && params.difficulty !== 'All') query.append('difficulty', params.difficulty);
    if (params.company && params.company !== 'All') query.append('company', params.company);
    if (params.platform && params.platform !== 'All') query.append('platform', params.platform);
    if (params.hasSolution) query.append('hasSolution', params.hasSolution);
    if (params.search) query.append('search', params.search);
    if (params.sort) query.append('sort', params.sort);
    if (params.page) query.append('page', params.page);
    if (params.limit) query.append('limit', params.limit);
    if (params.difficultyOrder) query.append('sort', params.difficultyOrder === 'desc' ? 'difficulty-desc' : 'difficulty-asc');

    const cacheKey = `coding:${query.toString()}`;
    const cached = getCached(cacheKey);
    if (cached) return cached;

    const res = await fetchWithTimeout(`${API_BASE_URL}/coding-questions?${query.toString()}`);
    const data = await handleResponse(res);
    setCached(cacheKey, data, 2 * 60 * 1000);
    return data;
  },

  async getCodingQuestionBySlug(slug) {
    const cacheKey = `coding:slug:${slug}`;
    const cached = getCached(cacheKey);
    if (cached) return cached;

    const res = await fetchWithTimeout(`${API_BASE_URL}/coding-questions/${encodeURIComponent(slug)}`);
    const data = await handleResponse(res);
    setCached(cacheKey, data, 5 * 60 * 1000);
    return data;
  },

  async getCodingQuestionsBySlugList(slugs) {
    const results = await Promise.allSettled(
      slugs.map((slug) =>
        fetchWithTimeout(`${API_BASE_URL}/coding-questions/${encodeURIComponent(slug)}`).then(handleResponse)
      )
    );
    return results
      .filter((r) => r.status === 'fulfilled' && r.value?.success)
      .map((r) => r.value.data);
  },

  async getCodingQuestionSolution(slug, lang) {
    const res = await fetchWithTimeout(
      `${API_BASE_URL}/coding-questions/${encodeURIComponent(slug)}/solution?lang=${encodeURIComponent(lang)}`
    );
    return handleResponse(res);
  },

  async executeCode(slug, lang, code) {
    const res = await fetchWithTimeout(`${API_BASE_URL}/execute`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slug, lang, code }),
    });
    return handleResponse(res);
  },
};

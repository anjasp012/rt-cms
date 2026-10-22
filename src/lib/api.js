const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api/v1';

function getJwt() {
  return localStorage.getItem('rt_jwt');
}

function getRefreshToken() {
  return localStorage.getItem('rt_refresh');
}

export function saveTokens(jwt, refreshToken, username) {
  if (jwt) localStorage.setItem('rt_jwt', jwt);
  if (refreshToken) localStorage.setItem('rt_refresh', refreshToken);
  if (username) localStorage.setItem('rt_username', username);
}

export function clearTokens() {
  localStorage.removeItem('rt_jwt');
  localStorage.removeItem('rt_refresh');
  localStorage.removeItem('rt_username');
}

function authHeaders() {
  const jwt = getJwt();
  return {
    'Content-Type': 'application/json',
    ...(jwt ? { Authorization: `Bearer ${jwt}` } : {}),
  };
}

async function request(url, options = {}) {
  let res = await fetch(url, {
    ...options,
    headers: {
      ...authHeaders(),
      ...(options.headers || {}),
    },
  });

  // Auto refresh token if 401 Unauthorized
  if (res.status === 401 && getRefreshToken()) {
    try {
      const refreshRes = await fetch(`${API_BASE}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: getRefreshToken() }),
      });
      if (refreshRes.ok) {
        const refreshData = await refreshRes.json();
        const newJwt = refreshData.data?.jwt;
        const newRefresh = refreshData.data?.refresh_token;
        saveTokens(newJwt, newRefresh);

        res = await fetch(url, {
          ...options,
          headers: {
            ...authHeaders(),
            ...(options.headers || {}),
          },
        });
      } else {
        clearTokens();
      }
    } catch (e) {
      clearTokens();
    }
  }

  if (!res.ok) {
    let errorDetail = 'Permintaan gagal';
    try {
      const errJson = await res.json();
      if (Array.isArray(errJson.detail)) {
        errorDetail = errJson.detail.map(d => d.msg || (typeof d === 'string' ? d : JSON.stringify(d))).join(', ');
      } else if (typeof errJson.detail === 'object' && errJson.detail !== null) {
        errorDetail = errJson.detail.responseMessage || errJson.detail.message || JSON.stringify(errJson.detail);
      } else {
        errorDetail = errJson.detail || errJson.responseMessage || errJson.message || 'Terjadi kesalahan pada server';
      }
    } catch (_) { }
    throw new Error(errorDetail);
  }

  return res.json();
}

export async function checkApiHealth() {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);
    const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://127.0.0.1:8000';
    const res = await fetch(`${backendUrl}/`, { signal: controller.signal });
    clearTimeout(timeoutId);
    return res.ok;
  } catch (err) {
    return false;
  }
}

export async function login(username, password) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  if (!res.ok) {
    let msg = 'Username atau password salah';
    try {
      const err = await res.json();
      msg = err.detail?.responseMessage || err.detail || msg;
    } catch (_) { }
    throw new Error(msg);
  }
  return res.json();
}

// 📊 1. HISTORI PEMAKAIAN MODUL
export async function fetchModuleUsage() {
  return request(`${API_BASE}/admin/module-usage`);
}

export async function fetchAnalytics() {
  return request(`${API_BASE}/admin/analytics`);
}



// 📬 2. MODERASI USULAN RISET PENGUNJUNG
export async function fetchSuggestions({ status = null, limit = 50, offset = 0 } = {}) {
  let url = `${API_BASE}/admin/suggestions?limit=${limit}&offset=${offset}`;
  if (status && status !== 'ALL') {
    url += `&status=${status}`;
  }
  return request(url);
}

export async function updateSuggestionStatus(id, status, admin_notes = null) {
  return request(`${API_BASE}/admin/suggestions/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status, admin_notes }),
  });
}

export async function bulkUpdateSuggestionStatus(ids, status) {
  return request(`${API_BASE}/admin/suggestions/bulk-status`, {
    method: 'POST',
    body: JSON.stringify({ ids, status }),
  });
}

export async function deleteSuggestion(id) {
  return request(`${API_BASE}/admin/suggestions/${id}`, {
    method: 'DELETE',
  });
}

export async function bulkDeleteSuggestions(ids) {
  return request(`${API_BASE}/admin/suggestions/bulk-delete`, {
    method: 'POST',
    body: JSON.stringify({ ids }),
  });
}

// 👥 3. CRUD MODUL PENGGUNA (PERSONA) & MODUL TANTANGAN (ZONA)
export async function fetchPersonas() {
  return request(`${API_BASE}/admin/personas`);
}

export async function createPersona(payload) {
  return request(`${API_BASE}/admin/personas`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function updatePersona(id, payload) {
  return request(`${API_BASE}/admin/personas/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

export async function deletePersona(id) {
  return request(`${API_BASE}/admin/personas/${id}`, {
    method: 'DELETE',
  });
}

// 🏛️ 3b. CRUD TANTANGAN (CHALLENGES / ZONES)
export async function fetchChallenges() {
  return request(`${API_BASE}/admin/challenges`);
}

export async function createChallenge(payload) {
  return request(`${API_BASE}/admin/challenges`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function updateChallenge(id, payload) {
  return request(`${API_BASE}/admin/challenges/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

export async function deleteChallenge(id) {
  return request(`${API_BASE}/admin/challenges/${id}`, {
    method: 'DELETE',
  });
}

// Aliases for backward compatibility
export const fetchZones = fetchChallenges;
export const createZone = createChallenge;
export const updateZone = updateChallenge;
export const deleteZone = deleteChallenge;

// 💡 4. KATALOG SOLUSI (SOLUTIONS / INNOVATIONS)
export async function fetchSolutions(challenge_id = null) {
  let url = `${API_BASE}/admin/solutions`;
  if (challenge_id) url += `?challenge_id=${challenge_id}`;
  return request(url);
}

export async function createSolution(payload) {
  return request(`${API_BASE}/admin/solutions`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function updateSolution(id, payload) {
  return request(`${API_BASE}/admin/solutions/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

export async function deleteSolution(id) {
  return request(`${API_BASE}/admin/solutions/${id}`, {
    method: 'DELETE',
  });
}

export async function updateSolutionRelevance(id, mappings) {
  return request(`${API_BASE}/admin/solutions/${id}/relevance`, {
    method: 'POST',
    body: JSON.stringify(mappings),
  });
}

// Aliases for backward compatibility
export const fetchInnovations = fetchSolutions;
export const createInnovation = createSolution;
export const updateInnovation = updateSolution;
export const deleteInnovation = deleteSolution;
export const updateInnovationRelevance = updateSolutionRelevance;

// 📰 5. PUBLICATIONS
export async function fetchPublications({ year = null, source = null, coverage = null, limit = 200, offset = 0 } = {}) {
  let url = `${API_BASE}/admin/publications?limit=${limit}&offset=${offset}`;
  if (year) url += `&year=${year}`;
  if (source) url += `&source=${encodeURIComponent(source)}`;
  if (coverage) url += `&coverage=${encodeURIComponent(coverage)}`;
  return request(url);
}

export async function createPublication(payload) {
  return request(`${API_BASE}/admin/publications`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function updatePublication(id, payload) {
  return request(`${API_BASE}/admin/publications/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

export async function deletePublication(id) {
  return request(`${API_BASE}/admin/publications/${id}`, {
    method: 'DELETE',
  });
}

export async function bulkDeletePublications(ids) {
  return request(`${API_BASE}/admin/publications/bulk-delete`, {
    method: 'POST',
    body: JSON.stringify({ ids }),
  });
}

// 📁 6. FILE UPLOAD
export async function uploadFile(file) {
  const formData = new FormData();
  formData.append('file', file);
  
  const jwt = localStorage.getItem('rt_jwt');
  const headers = {};
  if (jwt) headers['Authorization'] = `Bearer ${jwt}`;
  
  const res = await fetch(`${API_BASE}/admin/upload`, {
    method: 'POST',
    headers,
    body: formData,
  });
  
  if (!res.ok) {
    let errDetail = 'Gagal mengunggah file';
    try {
      const errJson = await res.json();
      errDetail = errJson.detail || errDetail;
    } catch (_) {}
    throw new Error(errDetail);
  }
  
  return res.json();
}

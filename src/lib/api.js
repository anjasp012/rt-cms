const API_BASE = 'http://127.0.0.1:8000/api/v1';

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
        window.location.reload();
      }
    } catch (e) {
      clearTokens();
    }
  }

  if (!res.ok) {
    let errorDetail = 'Permintaan gagal';
    try {
      const errJson = await res.json();
      errorDetail = errJson.detail?.responseMessage || errJson.detail || errJson.responseMessage || 'Terjadi kesalahan pada server';
    } catch (_) {}
    throw new Error(errorDetail);
  }

  return res.json();
}

export async function checkApiHealth() {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);
    const res = await fetch('http://127.0.0.1:8000/', { signal: controller.signal });
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
    } catch (_) {}
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

export async function fetchSettings() {
  return request(`${API_BASE}/admin/settings`);
}

export async function saveSettings(frontend_display_limit) {
  return request(`${API_BASE}/admin/settings`, {
    method: 'POST',
    body: JSON.stringify({ frontend_display_limit: parseInt(frontend_display_limit) }),
  });
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

// 👥 3. CRUD MODUL PENGGUNA (PERSONA) & TOKEN TANTANGAN (ZONA)
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

export async function fetchZones() {
  return request(`${API_BASE}/admin/zones`);
}

export async function createZone(payload) {
  return request(`${API_BASE}/admin/zones`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function updateZone(id, payload) {
  return request(`${API_BASE}/admin/zones/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

export async function deleteZone(id) {
  return request(`${API_BASE}/admin/zones/${id}`, {
    method: 'DELETE',
  });
}

// 💡 4. KATALOG INOVASI
export async function fetchInnovations(zone_id = null) {
  let url = `${API_BASE}/admin/innovations`;
  if (zone_id) url += `?zone_id=${zone_id}`;
  return request(url);
}

export async function createInnovation(payload) {
  return request(`${API_BASE}/admin/innovations`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function updateInnovation(id, payload) {
  return request(`${API_BASE}/admin/innovations/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

export async function deleteInnovation(id) {
  return request(`${API_BASE}/admin/innovations/${id}`, {
    method: 'DELETE',
  });
}

export async function updateInnovationRelevance(id, mappings) {
  return request(`${API_BASE}/admin/innovations/${id}/relevance`, {
    method: 'POST',
    body: JSON.stringify(mappings),
  });
}

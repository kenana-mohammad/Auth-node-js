const API = {
  base: '',

  async request(path, options = {}, retried = false) {
    const config = {
      credentials: 'include',
      headers: { ...(options.headers || {}) },
      ...options
    };

    if (config.body && !(config.body instanceof FormData)) {
      config.headers['Content-Type'] = 'application/json';
      config.body = JSON.stringify(config.body);
    }

    const res = await fetch(`${this.base}${path}`, config);
    let data;

    const contentType = res.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      data = await res.json();
    } else {
      data = await res.text();
    }

    if (res.status === 403 && !retried && path !== '/api/v1/auth/refresh' && path !== '/api/v1/auth/login') {
      const refreshed = await this.refreshToken();
      if (refreshed) {
        return this.request(path, options, true);
      }
    }

    return { ok: res.ok, status: res.status, data };
  },

  async refreshToken() {
    const res = await fetch(`${this.base}/api/v1/auth/refresh`, {
      method: 'PUT',
      credentials: 'include'
    });
    return res.ok;
  },

  health() {
    return this.request('/api/health');
  },

  auth: {
    register(body) {
      return API.request('/api/v1/auth/register', { method: 'POST', body });
    },
    login(body) {
      return API.request('/api/v1/auth/login', { method: 'POST', body });
    },
    logout() {
      return API.request('/api/v1/auth/logout', { method: 'POST' });
    },
    profile() {
      return API.request('/api/v1/auth/profile');
    },
    refresh() {
      return API.request('/api/v1/auth/refresh', { method: 'PUT' });
    }
  },

  users: {
    getAll() {
      return API.request('/api/v1/users');
    },
    getById(id) {
      return API.request(`/api/v1/users/${id}`);
    },
    create(body) {
      return API.request('/api/v1/users', { method: 'POST', body });
    },
    update(id, body) {
      return API.request(`/api/v1/users/${id}`, { method: 'PUT', body });
    },
    delete(id) {
      return API.request(`/api/v1/users/${id}`, { method: 'DELETE' });
    },
    adminTest() {
      return API.request('/api/v1/users/test');
    }
  },

  items: {
    getAll() {
      return API.request('/api/v1/items');
    },
    create(body) {
      return API.request('/api/v1/items', { method: 'POST', body });
    }
  },

  uploads: {
    local(file) {
      const form = new FormData();
      form.append('file', file);
      return API.request('/api/v1/uploads/local', { method: 'POST', body: form });
    },
    external(file) {
      const form = new FormData();
      form.append('file', file);
      return API.request('/api/v1/uploads/external', { method: 'POST', body: form });
    }
  }
};

function parseError(data) {
  if (!data) return 'Something went wrong';
  if (typeof data === 'string') return data;
  if (data.msg) return data.msg;
  if (data.message) return data.message;
  if (Array.isArray(data.errors)) return data.errors.map(e => e.msg || e.message).join(', ');
  if (data.error) return typeof data.error === 'string' ? data.error : 'Request failed';
  return 'Something went wrong';
}

function formatDate(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric'
  });
}

function resolveImageUrl(path) {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  const clean = path.replace(/\\/g, '/');
  if (clean.startsWith('/')) return clean;
  if (clean.startsWith('uploads/')) return '/' + clean;
  return '/uploads/' + clean;
}

function getInitials(name) {
  if (!name) return '?';
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
}

function escapeHtml(str) {
  if (str == null) return '';
  const div = document.createElement('div');
  div.textContent = String(str);
  return div.innerHTML;
}

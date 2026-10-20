export const API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:8080').replace(/\/$/, '');

export class ApiError extends Error {
  constructor(message, status = 0, errors = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.errors = errors; // field -> message, from Bean Validation on the server
  }
}

async function request(path, { method = 'GET', params, body, headers } = {}) {
  const url = new URL(API_BASE + path);
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== '' && value != null) url.searchParams.set(key, value);
    });
  }

  const allHeaders = { ...(body ? { 'Content-Type': 'application/json' } : {}), ...headers };

  let res;
  try {
    res = await fetch(url, {
      method,
      headers: Object.keys(allHeaders).length ? allHeaders : undefined,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError('Cannot reach the server. Check your connection and try again.');
  }

  const data = await res.json().catch(() => null); // 204 No Content has no body
  if (!res.ok) {
    throw new ApiError(data?.message || `Request failed (${res.status})`, res.status, data?.errors || {});
  }
  return data;
}

export const api = {
  get: (path, params, headers) => request(path, { params, headers }),
  post: (path, body, headers) => request(path, { method: 'POST', body, headers }),
  put: (path, body, headers) => request(path, { method: 'PUT', body, headers }),
  del: (path, headers) => request(path, { method: 'DELETE', headers }),
};

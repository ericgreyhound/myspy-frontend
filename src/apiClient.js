const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

if (!API_BASE_URL) {
  throw new Error('VITE_API_BASE_URL is not set');
}

export const apiUrl = (path = '') => `${API_BASE_URL}${path}`;

export function apiFetch(path, options) {
  return fetch(apiUrl(path), options);
}


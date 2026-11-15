// Base URL of the backend. Empty in development (Vite proxies /api to port 5000).
// For production, set VITE_API_URL=https://your-backend-url in a .env file.
const API_URL = import.meta.env.VITE_API_URL || "";

export async function request(path, { method = "GET", body, token } = {}) {
  const headers = {};
  if (body) headers["Content-Type"] = "application/json";
  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await fetch(`${API_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const error = new Error((data && data.error) || `Request failed: ${response.status}`);
    error.status = response.status;
    throw error;
  }
  return data;
}

export function getJSON(path) {
  return request(path);
}

import { useState, useEffect } from 'react';

function getApiBaseUrl() {
  const configuredUrl = import.meta.env.VITE_API_URL?.trim();
  if (import.meta.env.DEV) {
    return configuredUrl ? configuredUrl.replace(/\/$/, '') : 'http://localhost:9022';
  }
  return configuredUrl ? configuredUrl.replace(/\/$/, '') : 'http://localhost:9022';
}

function getAuthHeaders() {
  const headers = { 'Content-Type': 'application/json' };
  const token = import.meta.env.VITE_API_TOKEN?.trim();
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}

function extractDepartmentItems(payload) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.departments)) return payload.departments;
  if (Array.isArray(payload?.data?.departments)) return payload.data.departments;
  if (Array.isArray(payload?.results)) return payload.results;
  if (Array.isArray(payload?.data)) return payload.data;
  if (payload && typeof payload === 'object') {
    const nested = payload.data && typeof payload.data === 'object' ? payload.data : null;
    if (Array.isArray(nested?.departments)) return nested.departments;
    if (Array.isArray(nested?.data)) return nested.data;
  }
  return [];
}

// const DEFAULT_DEPARTMENTS = [
//   { id: 'computer-science', name: 'Computer Science and Engineering' },
//   { id: 'electronics', name: 'Electronics and Communication Engineering' },
//   { id: 'mechanical', name: 'Mechanical Engineering' },
//   { id: 'civil', name: 'Civil Engineering' },
//   { id: 'chemical', name: 'Chemical Engineering' },
//   { id: 'biotech', name: 'Biotechnology' },
//   { id: 'management', name: 'Management Studies' },
//   { id: 'pharmacy', name: 'Pharmacy' }
// ];

export function useDepartments() {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const API_URL = getApiBaseUrl();

    const endpoints = [
      import.meta.env.VITE_DEPARTMENTS_ENDPOINT?.trim(),
      '/api/event-departments'
    ]
      .filter(Boolean)
      .map((endpoint) => (endpoint.startsWith('/') ? endpoint : `/${endpoint}`));

    const tryFetch = async () => {
      setLoading(true);
      setError(null);

      let authError = false;
      for (const endpoint of endpoints) {
        try {
          const response = await fetch(`${API_URL}${endpoint}`, {
            headers: getAuthHeaders(),
            credentials: 'include',
          });

          if (!response.ok) {
            if (response.status === 401 || response.status === 403) {
              authError = true;
            }
            throw new Error(`HTTP ${response.status}`);
          }

          const payload = await response.json();
          const items = extractDepartmentItems(payload);
          if (items.length > 0) {
            const mapped = items.map((item) => {
              const id = item.id || item._id || item.departmentId || item.deptId || item.code || item.name || item.department || item.title || '';
              const name = item.name || item.department || item.title || item.code || item.id || item._id || '';
              return { id: String(id || name).trim(), name: String(name || id).trim() };
            }).filter((item) => item.id);

            if (!isMounted) return;
            setDepartments(mapped);
            setLoading(false);
            return;
          }

          console.warn(`Departments endpoint responded with no items: ${endpoint}`);
        } catch (err) {
          console.warn(`Failed to load departments from ${endpoint}:`, err.message);
          if (authError) {
            break;
          }
        }
      }

      if (!isMounted) return;
      setDepartments(DEFAULT_DEPARTMENTS);
      setLoading(false);
      setError(authError
        ? 'Departments backend requires authentication; using default department list.'
        : 'Departments not available from backend; using default department list.');
    };

    tryFetch();
    return () => { isMounted = false; };
  }, []);

  return { departments, loading, error };
}

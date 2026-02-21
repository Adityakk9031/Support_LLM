const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000'

async function apiFetch(path, options = {}) {
  const resp = await fetch(`${API_BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    },
    ...options
  })

  if (!resp.ok) {
    let detail = `Request failed (${resp.status})`
    try {
      const data = await resp.json()
      detail = data.detail || JSON.stringify(data)
    } catch (err) {
      // ignore
    }
    throw new Error(detail)
  }

  if (resp.status === 204) {
    return null
  }

  return resp.json()
}

export { API_BASE, apiFetch }
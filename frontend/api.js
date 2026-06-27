const BASE = '/api';

export async function fetchTodos(params = {}) {
  const qs = new URLSearchParams(params).toString();
  const res = await fetch(`${BASE}/todos${qs ? '?' + qs : ''}`);
  return res.json();
}

export async function fetchTodo(id) {
  const res = await fetch(`${BASE}/todos/${id}`);
  return res.json();
}

export async function createTodo(data) {
  const res = await fetch(`${BASE}/todos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return res.json();
}

export async function updateTodo(id, data) {
  const res = await fetch(`${BASE}/todos/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return res.json();
}

export async function toggleTodo(id) {
  const res = await fetch(`${BASE}/todos/${id}/toggle`, { method: 'PATCH' });
  return res.json();
}

export async function deleteTodo(id) {
  const res = await fetch(`${BASE}/todos/${id}`, { method: 'DELETE' });
  return res.json();
}

export async function clearCompleted() {
  const res = await fetch(`${BASE}/todos`, { method: 'DELETE' });
  return res.json();
}

export async function fetchStats() {
  const res = await fetch(`${BASE}/stats`);
  return res.json();
}

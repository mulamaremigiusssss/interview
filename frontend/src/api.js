const BASE = '/api';

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((body.errors || ['Something went wrong']).join(', '));
  return body;
}

export const listTickets = ({ status, page, limit }) => {
  const params = new URLSearchParams({ page, limit });
  if (status) params.set('status', status);
  return request(`/tickets?${params}`);
};

export const getStats = () => request('/tickets/stats');

export const createTicket = (ticket) =>
  request('/tickets', { method: 'POST', body: JSON.stringify(ticket) });

export const updateTicket = (id, changes) =>
  request(`/tickets/${id}`, { method: 'PATCH', body: JSON.stringify(changes) });

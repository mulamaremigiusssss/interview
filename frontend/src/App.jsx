import { useCallback, useEffect, useState } from 'react';
import { listTickets, getStats, createTicket, updateTicket } from './api.js';
import TicketForm from './components/TicketForm.jsx';
import TicketList from './components/TicketList.jsx';

const LIMIT = 5;
const STATUS_LABELS = { open: 'Open', in_progress: 'In progress', closed: 'Closed' };

export default function App() {
  const [tickets, setTickets] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [stats, setStats] = useState({ open: 0, in_progress: 0, closed: 0 });
  const [filter, setFilter] = useState('');
  const [page, setPage] = useState(1);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const [list, s] = await Promise.all([
        listTickets({ status: filter, page, limit: LIMIT }),
        getStats(),
      ]);
      setTickets(list.data);
      setPagination(list.pagination);
      setStats(s);
      setError('');
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [filter, page]);

  useEffect(() => {
    load();
  }, [load]);

  const handleCreate = async (ticket) => {
    await createTicket(ticket); // errors are surfaced by the form
    setPage(1);
    await load();
  };

  const handleUpdate = async (id, changes) => {
    try {
      await updateTicket(id, changes);
      await load();
    } catch (e) {
      setError(e.message);
    }
  };

  return (
    <main className="container">
      <h1>Mini Ticket Tracker</h1>

      <section className="stats">
        {Object.entries(STATUS_LABELS).map(([key, label]) => (
          <div key={key} className={`stat stat-${key}`}>
            <span className="stat-count">{stats[key]}</span>
            <span>{label}</span>
          </div>
        ))}
      </section>

      <TicketForm onCreate={handleCreate} />

      {error && <div className="error" role="alert">{error}</div>}

      <section className="card">
        <div className="toolbar">
          <h2>Tickets</h2>
          <label>
            Filter:{' '}
            <select value={filter} onChange={(e) => { setFilter(e.target.value); setPage(1); }}>
              <option value="">All</option>
              {Object.entries(STATUS_LABELS).map(([k, l]) => (
                <option key={k} value={k}>{l}</option>
              ))}
            </select>
          </label>
        </div>

        <TicketList tickets={tickets} loading={loading} onUpdate={handleUpdate} />

        <div className="pager">
          <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Previous</button>
          <span>Page {pagination.page} of {pagination.totalPages} ({pagination.total} tickets)</span>
          <button disabled={page >= pagination.totalPages} onClick={() => setPage((p) => p + 1)}>Next</button>
        </div>
      </section>
    </main>
  );
}

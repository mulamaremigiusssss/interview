export default function TicketList({ tickets, loading, onUpdate }) {
  if (loading && tickets.length === 0) return <p className="muted">Loading…</p>;
  if (tickets.length === 0) return <p className="muted">No tickets found.</p>;

  return (
    <ul className="tickets">
      {tickets.map((t) => (
        <li key={t.id} className="ticket">
          <div className="ticket-main">
            <strong>{t.title}</strong>
            {t.description && <p>{t.description}</p>}
            <small className="muted">{new Date(t.created_at).toLocaleString()}</small>
          </div>
          <div className="ticket-controls">
            <span className={`badge priority-${t.priority}`}>{t.priority}</span>
            <select
              value={t.status}
              onChange={(e) => onUpdate(t.id, { status: e.target.value })}
              aria-label={`Status for ${t.title}`}
            >
              <option value="open">Open</option>
              <option value="in_progress">In progress</option>
              <option value="closed">Closed</option>
            </select>
          </div>
        </li>
      ))}
    </ul>
  );
}

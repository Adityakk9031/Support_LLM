function TicketList({ tickets, onStatusChange, statusOptions }) {
  if (!tickets.length) {
    return <div className="muted">No tickets yet.</div>
  }

  return (
    <div className="ticket-list">
      {tickets.map((ticket) => (
        <div key={ticket.id} className="ticket-card">
          <div className="ticket-header">
            <h3>{ticket.title}</h3>
            <span className={`pill ${ticket.priority}`}>{ticket.priority}</span>
          </div>
          <p>{
            ticket.description.length > 160
              ? `${ticket.description.slice(0, 160)}...`
              : ticket.description
          }</p>
          <div className="ticket-meta">
            <span className="pill neutral">{ticket.category}</span>
            <span className="pill neutral">{new Date(ticket.created_at).toLocaleString()}</span>
          </div>
          <div className="ticket-actions">
            <label>
              Status
              <select
                value={ticket.status}
                onChange={(e) => onStatusChange(ticket.id, e.target.value)}
              >
                {statusOptions.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>
      ))}
    </div>
  )
}

export default TicketList
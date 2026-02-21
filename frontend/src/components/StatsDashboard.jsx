function StatsDashboard({ stats, loading }) {
  if (loading) {
    return <div className="muted">Loading stats...</div>
  }

  if (!stats) {
    return <div className="muted">Stats unavailable.</div>
  }

  return (
    <div className="stats">
      <div className="stat">
        <div className="stat-value">{stats.total_tickets}</div>
        <div className="stat-label">Total Tickets</div>
      </div>
      <div className="stat">
        <div className="stat-value">{stats.open_tickets}</div>
        <div className="stat-label">Open Tickets</div>
      </div>
      <div className="stat">
        <div className="stat-value">{stats.avg_tickets_per_day}</div>
        <div className="stat-label">Avg / Day</div>
      </div>

      <div className="stat-breakdown">
        <h4>Priority Breakdown</h4>
        {Object.entries(stats.priority_breakdown).map(([key, value]) => (
          <div key={key} className="breakdown-row">
            <span>{key}</span>
            <span>{value}</span>
          </div>
        ))}
      </div>

      <div className="stat-breakdown">
        <h4>Category Breakdown</h4>
        {Object.entries(stats.category_breakdown).map(([key, value]) => (
          <div key={key} className="breakdown-row">
            <span>{key}</span>
            <span>{value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default StatsDashboard
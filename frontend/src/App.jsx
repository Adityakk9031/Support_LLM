import { useCallback, useEffect, useMemo, useState } from 'react'
import { apiFetch } from './api'
import TicketForm from './components/TicketForm'
import TicketList from './components/TicketList'
import StatsDashboard from './components/StatsDashboard'
import Filters from './components/Filters'

const CATEGORY_OPTIONS = ['billing', 'technical', 'account', 'general']
const PRIORITY_OPTIONS = ['low', 'medium', 'high', 'critical']
const STATUS_OPTIONS = ['open', 'in_progress', 'resolved', 'closed']

function App() {
  const [tickets, setTickets] = useState([])
  const [stats, setStats] = useState(null)
  const [filters, setFilters] = useState({
    category: '',
    priority: '',
    status: '',
    search: ''
  })
  const [loadingTickets, setLoadingTickets] = useState(false)
  const [loadingStats, setLoadingStats] = useState(false)
  const [error, setError] = useState('')

  const queryString = useMemo(() => {
    const params = new URLSearchParams()
    if (filters.category) params.append('category', filters.category)
    if (filters.priority) params.append('priority', filters.priority)
    if (filters.status) params.append('status', filters.status)
    if (filters.search) params.append('search', filters.search)
    const qs = params.toString()
    return qs ? `?${qs}` : ''
  }, [filters])

  const fetchTickets = useCallback(async () => {
    setLoadingTickets(true)
    setError('')
    try {
      const data = await apiFetch(`/api/tickets/${queryString}`)
      setTickets(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoadingTickets(false)
    }
  }, [queryString])

  const fetchStats = useCallback(async () => {
    setLoadingStats(true)
    try {
      const data = await apiFetch('/api/tickets/stats/')
      setStats(data)
    } catch (err) {
      setStats(null)
    } finally {
      setLoadingStats(false)
    }
  }, [])

  useEffect(() => {
    fetchTickets()
  }, [fetchTickets])

  useEffect(() => {
    fetchStats()
  }, [fetchStats])

  const handleCreated = async (ticket) => {
    setTickets((prev) => [ticket, ...prev])
    fetchStats()
  }

  const handleStatusChange = async (id, status) => {
    try {
      const updated = await apiFetch(`/api/tickets/${id}/`, {
        method: 'PATCH',
        body: JSON.stringify({ status })
      })
      setTickets((prev) => prev.map((t) => (t.id === id ? updated : t)))
      fetchStats()
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className="app">
      <header className="app-header">
        <div>
          <h1>Support Ticket System</h1>
          <p>LLM-assisted triage with editable suggestions.</p>
        </div>
      </header>

      <section className="grid">
        <div className="panel">
          <h2>Submit Ticket</h2>
          <TicketForm onCreated={handleCreated} />
        </div>
        <div className="panel">
          <h2>Stats</h2>
          <StatsDashboard stats={stats} loading={loadingStats} />
        </div>
      </section>

      <section className="panel">
        <div className="panel-header">
          <h2>Tickets</h2>
          <Filters
            filters={filters}
            setFilters={setFilters}
            categories={CATEGORY_OPTIONS}
            priorities={PRIORITY_OPTIONS}
            statuses={STATUS_OPTIONS}
          />
        </div>

        {error && <div className="error">{error}</div>}
        {loadingTickets ? (
          <div className="muted">Loading tickets...</div>
        ) : (
          <TicketList
            tickets={tickets}
            onStatusChange={handleStatusChange}
            statusOptions={STATUS_OPTIONS}
          />
        )}
      </section>
    </div>
  )
}

export default App
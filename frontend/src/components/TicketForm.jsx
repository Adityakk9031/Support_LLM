import { useEffect, useRef, useState } from 'react'
import { apiFetch } from '../api'

const CATEGORY_OPTIONS = ['billing', 'technical', 'account', 'general']
const PRIORITY_OPTIONS = ['low', 'medium', 'high', 'critical']
const DEFAULT_CATEGORY = 'general'
const DEFAULT_PRIORITY = 'medium'

function TicketForm({ onCreated }) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState(DEFAULT_CATEGORY)
  const [priority, setPriority] = useState(DEFAULT_PRIORITY)
  const [loadingClassify, setLoadingClassify] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')
  const userChangedCategory = useRef(false)
  const userChangedPriority = useRef(false)

  useEffect(() => {
    if (!description.trim()) {
      setInfo('')
      return
    }

    const timer = setTimeout(() => {
      classifyDescription(description)
    }, 600)

    return () => clearTimeout(timer)
  }, [description])

  const classifyDescription = async (text) => {
    setLoadingClassify(true)
    setError('')
    try {
      const data = await apiFetch('/api/tickets/classify/', {
        method: 'POST',
        body: JSON.stringify({ description: text })
      })

      if (!userChangedCategory.current) {
        setCategory(data.suggested_category || DEFAULT_CATEGORY)
      }
      if (!userChangedPriority.current) {
        setPriority(data.suggested_priority || DEFAULT_PRIORITY)
      }
      setInfo('Suggestions updated from LLM.')
    } catch (err) {
      setInfo('Using fallback suggestions (LLM unavailable).')
      if (!userChangedCategory.current) setCategory(DEFAULT_CATEGORY)
      if (!userChangedPriority.current) setPriority(DEFAULT_PRIORITY)
    } finally {
      setLoadingClassify(false)
    }
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setSubmitting(true)
    setError('')

    try {
      const payload = {
        title,
        description,
        category,
        priority
      }
      const data = await apiFetch('/api/tickets/', {
        method: 'POST',
        body: JSON.stringify(payload)
      })

      onCreated(data)
      setTitle('')
      setDescription('')
      setCategory(DEFAULT_CATEGORY)
      setPriority(DEFAULT_PRIORITY)
      userChangedCategory.current = false
      userChangedPriority.current = false
      setInfo('Ticket submitted.')
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="form">
      <label>
        Title
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={200}
          required
        />
      </label>

      <label>
        Description
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={6}
          required
        />
      </label>

      <div className="row">
        <label>
          Category
          <select
            value={category}
            onChange={(e) => {
              userChangedCategory.current = true
              setCategory(e.target.value)
            }}
          >
            {CATEGORY_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>

        <label>
          Priority
          <select
            value={priority}
            onChange={(e) => {
              userChangedPriority.current = true
              setPriority(e.target.value)
            }}
          >
            {PRIORITY_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>
      </div>

      {loadingClassify && <div className="muted">Classifying description...</div>}
      {info && <div className="info">{info}</div>}
      {error && <div className="error">{error}</div>}

      <button type="submit" disabled={submitting}>
        {submitting ? 'Submitting...' : 'Submit Ticket'}
      </button>
    </form>
  )
}

export default TicketForm
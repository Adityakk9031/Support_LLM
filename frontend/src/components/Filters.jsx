import { useEffect, useState } from 'react'

function Filters({ filters, setFilters, categories, priorities, statuses }) {
  const [searchInput, setSearchInput] = useState(filters.search)

  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters((prev) => ({ ...prev, search: searchInput }))
    }, 400)

    return () => clearTimeout(timer)
  }, [searchInput, setFilters])

  return (
    <div className="filters">
      <input
        type="search"
        placeholder="Search title or description"
        value={searchInput}
        onChange={(e) => setSearchInput(e.target.value)}
      />

      <select
        value={filters.category}
        onChange={(e) => setFilters((prev) => ({ ...prev, category: e.target.value }))}
      >
        <option value="">All categories</option>
        {categories.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>

      <select
        value={filters.priority}
        onChange={(e) => setFilters((prev) => ({ ...prev, priority: e.target.value }))}
      >
        <option value="">All priorities</option>
        {priorities.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>

      <select
        value={filters.status}
        onChange={(e) => setFilters((prev) => ({ ...prev, status: e.target.value }))}
      >
        <option value="">All statuses</option>
        {statuses.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  )
}

export default Filters
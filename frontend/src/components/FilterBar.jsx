import { useState, useEffect } from 'react';
import { Search, X, Filter, Calendar } from 'lucide-react';
import './FilterBar.css';

function FilterBar({ filters, onFilterChange, availableManagers, availableStatuses, availableProjects }) {
  const [localSearchText, setLocalSearchText] = useState(filters.searchText);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      if (localSearchText !== filters.searchText) {
        onFilterChange({ ...filters, searchText: localSearchText });
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [localSearchText]);

  const handleManagerChange = (e) => {
    const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
    onFilterChange({ ...filters, managers: selectedOptions });
  };

  const handleStatusChange = (e) => {
    const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
    onFilterChange({ ...filters, statuses: selectedOptions });
  };

  const handleProjectChange = (e) => {
    const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
    onFilterChange({ ...filters, projects: selectedOptions });
  };

  const handleDateChange = (field, value) => {
    onFilterChange({
      ...filters,
      dateRange: {
        ...filters.dateRange,
        [field]: value ? new Date(value) : null
      }
    });
  };

  const handleClearFilters = () => {
    setLocalSearchText('');
    onFilterChange({
      searchText: '',
      managers: [],
      statuses: [],
      projects: [],
      dateRange: { start: null, end: null }
    });
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (filters.searchText) count++;
    if (filters.managers.length > 0) count++;
    if (filters.statuses.length > 0) count++;
    if (filters.projects.length > 0) count++;
    if (filters.dateRange.start || filters.dateRange.end) count++;
    return count;
  };

  const activeCount = getActiveFilterCount();

  return (
    <div className="filter-bar">
      <div className="filter-header">
        <div className="filter-title">
          <Filter size={20} />
          <h3>Filters</h3>
          {activeCount > 0 && (
            <span className="filter-badge">{activeCount} active</span>
          )}
        </div>
        {activeCount > 0 && (
          <button onClick={handleClearFilters} className="clear-filters-btn">
            <X size={16} />
            Clear All
          </button>
        )}
      </div>

      <div className="filter-controls">
        {/* Search Input */}
        <div className="filter-control">
          <label htmlFor="search-employee">
            <Search size={16} />
            Search Employee
          </label>
          <input
            id="search-employee"
            type="text"
            placeholder="Type employee name..."
            value={localSearchText}
            onChange={(e) => setLocalSearchText(e.target.value)}
            className="filter-input"
          />
        </div>

        {/* Manager Multi-Select Dropdown */}
        <div className="filter-control">
          <label htmlFor="filter-manager">
            Manager
            {filters.managers.length > 0 && (
              <span className="selected-count">({filters.managers.length} selected)</span>
            )}
          </label>
          <select
            id="filter-manager"
            multiple
            value={filters.managers}
            onChange={handleManagerChange}
            className="filter-select"
            size="5"
          >
            {availableManagers.map(manager => (
              <option key={manager} value={manager}>
                {manager}
              </option>
            ))}
          </select>
          <p className="filter-hint">Hold Ctrl/Cmd to select multiple</p>
        </div>

        {/* Status Multi-Select Dropdown */}
        <div className="filter-control">
          <label htmlFor="filter-status">
            Status
            {filters.statuses.length > 0 && (
              <span className="selected-count">({filters.statuses.length} selected)</span>
            )}
          </label>
          <select
            id="filter-status"
            multiple
            value={filters.statuses}
            onChange={handleStatusChange}
            className="filter-select"
            size="4"
          >
            {availableStatuses.map(status => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
          <p className="filter-hint">Hold Ctrl/Cmd to select multiple</p>
        </div>

        {/* Project Multi-Select Dropdown */}
        <div className="filter-control">
          <label htmlFor="filter-project">
            Project
            {filters.projects.length > 0 && (
              <span className="selected-count">({filters.projects.length} selected)</span>
            )}
          </label>
          <select
            id="filter-project"
            multiple
            value={filters.projects}
            onChange={handleProjectChange}
            className="filter-select"
            size="5"
          >
            {availableProjects.map(project => (
              <option key={project} value={project}>
                {project}
              </option>
            ))}
          </select>
          <p className="filter-hint">Hold Ctrl/Cmd to select multiple</p>
        </div>

        {/* Date Range Filter */}
        <div className="filter-control date-range">
          <label>
            <Calendar size={16} />
            Date Range
          </label>
          <div className="date-inputs">
            <div className="date-input-group">
              <label htmlFor="date-start" className="date-label">From</label>
              <input
                id="date-start"
                type="date"
                value={filters.dateRange.start ? filters.dateRange.start.toISOString().split('T')[0] : ''}
                onChange={(e) => handleDateChange('start', e.target.value)}
                className="filter-input date-input"
              />
            </div>
            <div className="date-input-group">
              <label htmlFor="date-end" className="date-label">To</label>
              <input
                id="date-end"
                type="date"
                value={filters.dateRange.end ? filters.dateRange.end.toISOString().split('T')[0] : ''}
                onChange={(e) => handleDateChange('end', e.target.value)}
                className="filter-input date-input"
                min={filters.dateRange.start ? filters.dateRange.start.toISOString().split('T')[0] : ''}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default FilterBar;

// Made with Bob
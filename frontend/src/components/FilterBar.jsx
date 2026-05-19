import { useState, useEffect, useRef } from 'react';
import { Search, X, Filter, Calendar } from 'lucide-react';
import './FilterBar.css';

function FilterBar({ filters, onFilterChange, availableManagers, availableStatuses, availableProjects }) {
  const [localSearchText, setLocalSearchText] = useState(filters.searchText);
  const [managerInput, setManagerInput] = useState('');
  const [statusInput, setStatusInput] = useState('');
  const [projectInput, setProjectInput] = useState('');
  const [showManagerSuggestions, setShowManagerSuggestions] = useState(false);
  const [showStatusSuggestions, setShowStatusSuggestions] = useState(false);
  const [showProjectSuggestions, setShowProjectSuggestions] = useState(false);
  const managerInputRef = useRef(null);
  const statusInputRef = useRef(null);
  const projectInputRef = useRef(null);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      if (localSearchText !== filters.searchText) {
        onFilterChange({ ...filters, searchText: localSearchText });
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [localSearchText]);

  // Filter suggestions based on input
  const filteredManagerSuggestions = availableManagers.filter(manager =>
    manager.toLowerCase().includes(managerInput.toLowerCase()) &&
    !filters.managers.includes(manager)
  );

  const filteredStatusSuggestions = availableStatuses.filter(status =>
    status.toLowerCase().includes(statusInput.toLowerCase()) &&
    !filters.statuses.includes(status)
  );

  const filteredProjectSuggestions = availableProjects.filter(project =>
    project.toLowerCase().includes(projectInput.toLowerCase()) &&
    !filters.projects.includes(project)
  );

  // Handle clicking outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (managerInputRef.current && !managerInputRef.current.contains(event.target)) {
        setShowManagerSuggestions(false);
      }
      if (statusInputRef.current && !statusInputRef.current.contains(event.target)) {
        setShowStatusSuggestions(false);
      }
      if (projectInputRef.current && !projectInputRef.current.contains(event.target)) {
        setShowProjectSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleManagerSelect = (manager) => {
    if (!filters.managers.includes(manager)) {
      onFilterChange({ ...filters, managers: [...filters.managers, manager] });
    }
    setManagerInput('');
    setShowManagerSuggestions(false);
  };

  const handleStatusSelect = (status) => {
    if (!filters.statuses.includes(status)) {
      onFilterChange({ ...filters, statuses: [...filters.statuses, status] });
    }
    setStatusInput('');
    setShowStatusSuggestions(false);
  };

  const handleManagerRemove = (manager) => {
    onFilterChange({
      ...filters,
      managers: filters.managers.filter(m => m !== manager)
    });
  };

  const handleStatusRemove = (status) => {
    onFilterChange({
      ...filters,
      statuses: filters.statuses.filter(s => s !== status)
    });
  };

  const handleProjectSelect = (project) => {
    if (!filters.projects.includes(project)) {
      onFilterChange({ ...filters, projects: [...filters.projects, project] });
    }
    setProjectInput('');
    setShowProjectSuggestions(false);
  };

  const handleProjectRemove = (project) => {
    onFilterChange({
      ...filters,
      projects: filters.projects.filter(p => p !== project)
    });
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
    setManagerInput('');
    setStatusInput('');
    setProjectInput('');
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

        {/* Manager Autocomplete */}
        <div className="filter-control autocomplete-control" ref={managerInputRef}>
          <label htmlFor="filter-manager">
            Manager
            {filters.managers.length > 0 && (
              <span className="selected-count">({filters.managers.length})</span>
            )}
          </label>
          <input
            id="filter-manager"
            type="text"
            placeholder="Type to search managers..."
            value={managerInput}
            onChange={(e) => {
              setManagerInput(e.target.value);
              setShowManagerSuggestions(true);
            }}
            onFocus={() => setShowManagerSuggestions(true)}
            className="filter-input autocomplete-input"
          />
          {showManagerSuggestions && filteredManagerSuggestions.length > 0 && (
            <div className="suggestions-dropdown">
              {filteredManagerSuggestions.map(manager => (
                <div
                  key={manager}
                  className="suggestion-item"
                  onClick={() => handleManagerSelect(manager)}
                >
                  {manager}
                </div>
              ))}
            </div>
          )}
          {filters.managers.length > 0 && (
            <div className="selected-items">
              {filters.managers.map(manager => (
                <span key={manager} className="selected-tag">
                  {manager}
                  <button
                    onClick={() => handleManagerRemove(manager)}
                    className="remove-tag"
                  >
                    <X size={12} />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Status Autocomplete */}
        <div className="filter-control autocomplete-control" ref={statusInputRef}>
          <label htmlFor="filter-status">
            Status
            {filters.statuses.length > 0 && (
              <span className="selected-count">({filters.statuses.length})</span>
            )}
          </label>
          <input
            id="filter-status"
            type="text"
            placeholder="Type to search statuses..."
            value={statusInput}
            onChange={(e) => {
              setStatusInput(e.target.value);
              setShowStatusSuggestions(true);
            }}
            onFocus={() => setShowStatusSuggestions(true)}
            className="filter-input autocomplete-input"
          />
          {showStatusSuggestions && filteredStatusSuggestions.length > 0 && (
            <div className="suggestions-dropdown">
              {filteredStatusSuggestions.map(status => (
                <div
                  key={status}
                  className="suggestion-item"
                  onClick={() => handleStatusSelect(status)}
                >
                  {status}
                </div>
              ))}
            </div>
          )}
          {filters.statuses.length > 0 && (
            <div className="selected-items">
              {filters.statuses.map(status => (
                <span key={status} className="selected-tag">
                  {status}
                  <button
                    onClick={() => handleStatusRemove(status)}
                    className="remove-tag"
                  >
                    <X size={12} />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Project Autocomplete */}
        <div className="filter-control autocomplete-control" ref={projectInputRef}>
          <label htmlFor="filter-project">
            Project
            {filters.projects.length > 0 && (
              <span className="selected-count">({filters.projects.length})</span>
            )}
          </label>
          <input
            id="filter-project"
            type="text"
            placeholder="Type to search projects..."
            value={projectInput}
            onChange={(e) => {
              setProjectInput(e.target.value);
              setShowProjectSuggestions(true);
            }}
            onFocus={() => setShowProjectSuggestions(true)}
            className="filter-input autocomplete-input"
          />
          {showProjectSuggestions && filteredProjectSuggestions.length > 0 && (
            <div className="suggestions-dropdown">
              {filteredProjectSuggestions.map(project => (
                <div
                  key={project}
                  className="suggestion-item"
                  onClick={() => handleProjectSelect(project)}
                >
                  {project}
                </div>
              ))}
            </div>
          )}
          {filters.projects.length > 0 && (
            <div className="selected-items">
              {filters.projects.map(project => (
                <span key={project} className="selected-tag">
                  {project}
                  <button
                    onClick={() => handleProjectRemove(project)}
                    className="remove-tag"
                  >
                    <X size={12} />
                  </button>
                </span>
              ))}
            </div>
          )}
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
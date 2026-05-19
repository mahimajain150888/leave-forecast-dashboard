import { useState, useMemo } from 'react';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import {
  Users, Calendar, TrendingUp, Clock,
  CheckCircle, XCircle, AlertCircle, UserCheck, X, ChevronDown, ChevronUp, Download
} from 'lucide-react';
import * as XLSX from 'xlsx';
import FilterBar from './FilterBar';
import './Dashboard.css';

const COLORS = ['#667eea', '#764ba2', '#f093fb', '#4facfe', '#43e97b', '#fa709a', '#ff6b6b', '#4ecdc4'];

const STATUS_COLORS = {
  'Approved': '#10b981',
  'Pending': '#f59e0b',
  'Rejected': '#ef4444',
  'Unknown': '#6b7280'
};

function Dashboard({ analytics }) {
  const { stats, items } = analytics;
  const [selectedView, setSelectedView] = useState('overview');
  
  // Expandable stat cards state
  const [expandedCards, setExpandedCards] = useState({
    totalLeaves: false,
    currentVacations: false,
    forecast: false
  });
  
  // Global filter state (for forecast quick search only)
  const [filters, setFilters] = useState({
    searchText: '',
    managers: [],
    statuses: [],
    dateRange: { start: null, end: null }
  });

  // Overview-specific filter state (independent)
  const [overviewFilters, setOverviewFilters] = useState({
    searchText: '',
    managers: [],
    statuses: [],
    projects: [],
    dateRange: { start: null, end: null }
  });

  // Toggle card expansion
  const toggleCard = (cardName) => {
    setExpandedCards(prev => ({
      ...prev,
      [cardName]: !prev[cardName]
    }));
  };

  // Helper function to get column value
  const getColumnValue = (item, columnTitle, columnId, columnType) => {
    if (!item.columns) return null;
    const column = Object.values(item.columns).find(col =>
      col.title === columnTitle || col.id === columnId || (columnType && col.type === columnType)
    );
    return column?.value;
  };

  // Extract unique managers and statuses from stats (already calculated by backend)
  const availableManagers = useMemo(() => {
    const managers = Object.keys(stats.byManager || {})
      .filter(m => m && m !== 'Unassigned' && m !== '')
      .sort();
    return managers;
  }, [stats]);

  const availableStatuses = useMemo(() => {
    const statuses = Object.keys(stats.byStatus || {})
      .filter(s => s && s !== '' && s !== 'Unknown')
      .sort();
    return statuses;
  }, [stats]);

  const availableProjects = useMemo(() => {
    const projects = [...new Set(items.map(item => {
      // Get project from the Project column (dropdown_mm26tzy4)
      const projectColumn = getColumnValue(item, 'Project', 'dropdown_mm26tzy4');
      return projectColumn;
    }).filter(p => p && p !== ''))]
      .sort();
    return projects;
  }, [items]);

  // Forecast quick search filter (only for forecast tab)
  const forecastSearchText = filters.searchText;

  // Apply filters for Overview tab only (independent filtering)
  const overviewFilteredItems = useMemo(() => {
    if (!overviewFilters.searchText && overviewFilters.managers.length === 0 &&
        overviewFilters.statuses.length === 0 && overviewFilters.projects.length === 0 &&
        !overviewFilters.dateRange.start && !overviewFilters.dateRange.end) {
      return []; // No filters applied, return empty array
    }

    return items.filter(item => {
      // Get employee name from columns
      const employeeName = getColumnValue(item, 'Employee name', 'dropdown_mm2641v5') || item.name;
      
      // Get manager from columns
      const manager = getColumnValue(item, 'Manager', 'dropdown_mm1zvc1j');
      
      // Search text filter (employee name or manager)
      if (overviewFilters.searchText) {
        const searchLower = overviewFilters.searchText.toLowerCase();
        const nameMatch = employeeName?.toLowerCase().includes(searchLower);
        const managerMatch = manager?.toLowerCase().includes(searchLower);
        if (!nameMatch && !managerMatch) return false;
      }

      // Manager filter (for dropdown selection)
      if (overviewFilters.managers.length > 0) {
        if (!overviewFilters.managers.includes(manager)) return false;
      }

      // Get status from columns
      const status = getColumnValue(item, null, null, 'status');
      
      // Status filter
      if (overviewFilters.statuses.length > 0) {
        if (!overviewFilters.statuses.includes(status)) return false;
      }

      // Project filter (use Project column instead of group)
      if (overviewFilters.projects.length > 0) {
        const project = getColumnValue(item, 'Project', 'dropdown_mm26tzy4');
        if (!overviewFilters.projects.includes(project)) return false;
      }

      // Get dates from columns
      const startDateColumn = Object.values(item.columns || {}).find(col =>
        col.id === 'date4' || col.title === 'Start Date'
      );
      const endDateColumn = Object.values(item.columns || {}).find(col =>
        col.id === 'date_mm1zqm6a' || col.title === 'End Date'
      );
      
      const startDate = startDateColumn?.value;
      const endDate = endDateColumn?.value;

      // Date range filter
      if (overviewFilters.dateRange.start && startDate) {
        const itemStart = new Date(startDate);
        if (itemStart < overviewFilters.dateRange.start) return false;
      }

      if (overviewFilters.dateRange.end && endDate) {
        const itemEnd = new Date(endDate);
        if (itemEnd > overviewFilters.dateRange.end) return false;
      }

      return true;
    });
  }, [items, overviewFilters]);

  // Recalculate stats based on all items (no global filtering)
  const filteredStats = useMemo(() => {
    const itemsToUse = items;
    const newStats = {
      totalRequests: itemsToUse.length,
      byStatus: {},
      byMonth: {},
      byEmployee: {},
      byManager: {},
      byForecastWindow: {},
      currentVacations: [],
      forecastWindowVacations: []
    };

    const now = new Date();
    const threeMonthsFromNow = new Date(now);
    threeMonthsFromNow.setMonth(threeMonthsFromNow.getMonth() + 3);

    itemsToUse.forEach(item => {
      // Get values from columns
      const status = getColumnValue(item, null, null, 'status');
      const employeeName = getColumnValue(item, 'Employee name', 'dropdown_mm2641v5') || item.name || 'Unknown';
      const manager = getColumnValue(item, 'Manager', 'dropdown_mm1zvc1j');
      const forecastWindow = getColumnValue(item, 'Forecast Window');
      
      const startDateColumn = Object.values(item.columns || {}).find(col =>
        col.id === 'date4' || col.title === 'Start Date'
      );
      const endDateColumn = Object.values(item.columns || {}).find(col =>
        col.id === 'date_mm1zqm6a' || col.title === 'End Date'
      );
      
      const startDateValue = startDateColumn?.value;
      const endDateValue = endDateColumn?.value;

      // Count by status
      if (status) {
        newStats.byStatus[status] = (newStats.byStatus[status] || 0) + 1;
      }

      // Count by employee
      newStats.byEmployee[employeeName] = (newStats.byEmployee[employeeName] || 0) + 1;

      // Calculate duration and count by manager
      if (manager && startDateValue && endDateValue) {
        const startDate = new Date(startDateValue);
        const endDate = new Date(endDateValue);
        const durationDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
        
        if (!newStats.byManager[manager]) {
          newStats.byManager[manager] = { count: 0, totalDays: 0 };
        }
        newStats.byManager[manager].count += 1;
        newStats.byManager[manager].totalDays += durationDays;
      }

      // Count by forecast window
      if (forecastWindow) {
        newStats.byForecastWindow[forecastWindow] = (newStats.byForecastWindow[forecastWindow] || 0) + 1;
      }

      // Count by month
      if (startDateValue) {
        const startDate = new Date(startDateValue);
        const monthKey = `${startDate.getFullYear()}-${String(startDate.getMonth() + 1).padStart(2, '0')}`;
        newStats.byMonth[monthKey] = (newStats.byMonth[monthKey] || 0) + 1;

        // Check if currently on vacation
        const endDate = endDateValue ? new Date(endDateValue) : startDate;
        if (startDate <= now && endDate >= now) {
          newStats.currentVacations.push({
            ...item,
            employeeName,
            manager,
            status,
            startDate: startDateValue,
            endDate: endDateValue
          });
        }

        // Check if in forecast window (next 3 months)
        if (startDate >= now && startDate <= threeMonthsFromNow) {
          const daysUntil = Math.ceil((startDate - now) / (1000 * 60 * 60 * 24));
          newStats.forecastWindowVacations.push({
            ...item,
            employeeName,
            manager,
            status,
            forecastWindow,
            startDate: startDateValue,
            endDate: endDateValue,
            daysUntil
          });
        }
      }
    });

    // Sort forecast window vacations by date
    newStats.forecastWindowVacations.sort((a, b) => a.daysUntil - b.daysUntil);

    return newStats;
  }, [items]);

  // Prepare data for charts using filtered stats
  const statusData = Object.entries(filteredStats.byStatus).map(([status, count]) => ({
    name: status,
    value: count,
    color: STATUS_COLORS[status] || STATUS_COLORS['Unknown']
  }));

  const monthlyData = Object.entries(stats.byMonth)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, count]) => ({
      month: new Date(month + '-01').toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      leaves: count
    }));

  const employeeData = Object.entries(stats.byEmployee)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .map(([employee, count]) => ({
      employee: employee.length > 20 ? employee.substring(0, 20) + '...' : employee,
      leaves: count
    }));

  // Manager-based data - show total duration in days
  const managerData = Object.entries(stats.byManager || {})
    .sort(([, a], [, b]) => (b.totalDays || b) - (a.totalDays || a))
    .map(([manager, data]) => ({
      manager: manager.length > 20 ? manager.substring(0, 20) + '...' : manager,
      days: typeof data === 'object' ? data.totalDays : data,
      requests: typeof data === 'object' ? data.count : 1
    }));

  // Forecast window data
  const forecastWindowData = Object.entries(stats.byForecastWindow || {})
    .map(([window, count]) => ({
      name: window,
      value: count
    }));

  // Filter change handler
  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  // Export to Excel function
  const exportToExcel = () => {
    if (overviewFilteredItems.length === 0) {
      alert('No data to export. Please apply filters first.');
      return;
    }

    // Prepare data for export
    const exportData = overviewFilteredItems.map(item => {
      const employeeName = getColumnValue(item, 'Employee name', 'dropdown_mm2641v5') || item.name;
      const manager = getColumnValue(item, 'Manager', 'dropdown_mm1zvc1j');
      const status = getColumnValue(item, null, null, 'status');
      const project = getColumnValue(item, 'Project', 'dropdown_mm26tzy4');
      
      const startDateColumn = Object.values(item.columns || {}).find(col =>
        col.id === 'date4' || col.title === 'Start Date'
      );
      const endDateColumn = Object.values(item.columns || {}).find(col =>
        col.id === 'date_mm1zqm6a' || col.title === 'End Date'
      );
      
      const startDate = startDateColumn?.value;
      const endDate = endDateColumn?.value;

      return {
        'Employee Name': employeeName,
        'Manager': manager || 'Not assigned',
        'Status': status || 'Unknown',
        'Start Date': startDate ? new Date(startDate).toLocaleDateString() : 'N/A',
        'End Date': endDate ? new Date(endDate).toLocaleDateString() : 'N/A',
        'Project': project || 'Not assigned'
      };
    });

    // Create worksheet
    const ws = XLSX.utils.json_to_sheet(exportData);
    
    // Set column widths
    const colWidths = [
      { wch: 25 }, // Employee Name
      { wch: 20 }, // Manager
      { wch: 12 }, // Status
      { wch: 15 }, // Start Date
      { wch: 15 }, // End Date
      { wch: 20 }  // Project
    ];
    ws['!cols'] = colWidths;

    // Create workbook
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Filtered Leaves');

    // Generate filename with timestamp
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `Leave_Forecast_${timestamp}.xlsx`;

    // Save file
    XLSX.writeFile(wb, filename);
  };

  return (
    <div className="dashboard">
      {/* Stats Cards */}
      <div className="stats-grid">
        {/* Total Leaves Card */}
        <div className={`stat-card expandable ${expandedCards.totalLeaves ? 'expanded' : ''}`}>
          <div className="stat-card-header" onClick={() => toggleCard('totalLeaves')}>
            <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
              <Calendar size={24} />
            </div>
            <div className="stat-content">
              <h3>Total Leaves</h3>
              <p className="stat-value">{stats.totalRequests}</p>
            </div>
            <div className="expand-icon">
              {expandedCards.totalLeaves ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </div>
          </div>
          {expandedCards.totalLeaves && (
            <div className="stat-card-details">
              <div className="detail-item">
                <CheckCircle size={16} className="detail-icon approved" />
                <span>Approved: {stats.byStatus?.Approved || 0}</span>
              </div>
              <div className="detail-item">
                <AlertCircle size={16} className="detail-icon pending" />
                <span>Pending: {stats.byStatus?.Pending || 0}</span>
              </div>
              <div className="detail-item">
                <XCircle size={16} className="detail-icon rejected" />
                <span>Rejected: {stats.byStatus?.Rejected || 0}</span>
              </div>
            </div>
          )}
        </div>

        {/* Current Vacations Card */}
        <div className={`stat-card expandable ${expandedCards.currentVacations ? 'expanded' : ''}`}>
          <div className="stat-card-header" onClick={() => toggleCard('currentVacations')}>
            <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }}>
              <Users size={24} />
            </div>
            <div className="stat-content">
              <h3>Current Vacations</h3>
              <p className="stat-value">{stats.currentVacations.length}</p>
            </div>
            <div className="expand-icon">
              {expandedCards.currentVacations ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </div>
          </div>
          {expandedCards.currentVacations && (
            <div className="stat-card-details">
              {stats.currentVacations.length === 0 ? (
                <div className="detail-item-empty">No one is currently on vacation</div>
              ) : (
                stats.currentVacations.slice(0, 5).map((vacation, idx) => (
                  <div key={idx} className="detail-item">
                    <Users size={16} className="detail-icon" />
                    <span>{vacation.employeeName || vacation.name}</span>
                  </div>
                ))
              )}
              {stats.currentVacations.length > 5 && (
                <div className="detail-item-more">
                  +{stats.currentVacations.length - 5} more
                </div>
              )}
            </div>
          )}
        </div>

        {/* Forecast Card */}
        <div className={`stat-card expandable ${expandedCards.forecast ? 'expanded' : ''}`}>
          <div className="stat-card-header" onClick={() => toggleCard('forecast')}>
            <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' }}>
              <Clock size={24} />
            </div>
            <div className="stat-content">
              <h3>Forecast (Next 3 Months)</h3>
              <p className="stat-value">{stats.forecastWindowVacations?.length || 0}</p>
            </div>
            <div className="expand-icon">
              {expandedCards.forecast ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </div>
          </div>
          {expandedCards.forecast && (
            <div className="stat-card-details">
              {(stats.forecastWindowVacations?.length || 0) === 0 ? (
                <div className="detail-item-empty">No upcoming vacations in next 3 months</div>
              ) : (
                stats.forecastWindowVacations.slice(0, 5).map((vacation, idx) => (
                  <div key={idx} className="detail-item">
                    <Calendar size={16} className="detail-icon" />
                    <span>{vacation.employeeName} - {vacation.daysUntil === 0 ? 'Today' : `In ${vacation.daysUntil} days`}</span>
                  </div>
                ))
              )}
              {(stats.forecastWindowVacations?.length || 0) > 5 && (
                <div className="detail-item-more">
                  +{stats.forecastWindowVacations.length - 5} more
                </div>
              )}
            </div>
          )}
        </div>

      </div>

      {/* View Selector */}
      <div className="view-selector">
        <button
          className={selectedView === 'overview' ? 'active' : ''}
          onClick={() => setSelectedView('overview')}
        >
          Overview
        </button>
        <button
          className={selectedView === 'forecast' ? 'active' : ''}
          onClick={() => setSelectedView('forecast')}
        >
          Forecast Window (3 Months)
        </button>
        <button
          className={selectedView === 'managers' ? 'active' : ''}
          onClick={() => setSelectedView('managers')}
        >
          By Manager
        </button>
        <button
          className={selectedView === 'current' ? 'active' : ''}
          onClick={() => setSelectedView('current')}
        >
          Current Vacations
        </button>
      </div>

      {/* Overview Charts */}
      {selectedView === 'overview' && (
        <div className="charts-grid">
          {/* Status Distribution */}
          <div className="chart-card">
            <h3>Leaves by Status</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Monthly Trend */}
          <div className="chart-card">
            <h3>Leaves by Month</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="leaves"
                  stroke="#667eea"
                  strokeWidth={2}
                  dot={{ fill: '#667eea', r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Top Employees by Name */}
          <div className="chart-card full-width">
            <h3>Top 10 Employees by Leaves</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={employeeData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="employee" angle={-45} textAnchor="end" height={100} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="leaves" fill="#764ba2" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Filter Bar - Bottom of Overview */}
          <div className="chart-card full-width">
            <h3>Search & Filter Vacation Requests</h3>
            <FilterBar
              filters={overviewFilters}
              onFilterChange={setOverviewFilters}
              availableManagers={availableManagers}
              availableStatuses={availableStatuses}
              availableProjects={availableProjects}
            />
          </div>

          {/* Filtered Results - Show only when filters are applied */}
          {overviewFilteredItems.length > 0 && (
            <div className="chart-card full-width">
              <div className="filtered-results-header">
                <h3>Filtered Results ({overviewFilteredItems.length} found)</h3>
                <button onClick={exportToExcel} className="export-button">
                  <Download size={18} />
                  <span>Export to Excel</span>
                </button>
              </div>
              <div className="filtered-results-table">
                <table className="results-table">
                  <thead>
                    <tr>
                      <th>Employee Name</th>
                      <th>Manager</th>
                      <th>Status</th>
                      <th>Start Date</th>
                      <th>End Date</th>
                      <th>Project</th>
                    </tr>
                  </thead>
                  <tbody>
                    {overviewFilteredItems.map((item) => {
                        const employeeName = getColumnValue(item, 'Employee name', 'dropdown_mm2641v5') || item.name;
                        const manager = getColumnValue(item, 'Manager', 'dropdown_mm1zvc1j');
                        const status = getColumnValue(item, null, null, 'status');
                        const project = getColumnValue(item, 'Project', 'dropdown_mm26tzy4');
                        const startDateColumn = Object.values(item.columns || {}).find(col =>
                          col.id === 'date4' || col.title === 'Start Date'
                        );
                        const endDateColumn = Object.values(item.columns || {}).find(col =>
                          col.id === 'date_mm1zqm6a' || col.title === 'End Date'
                        );
                        const startDate = startDateColumn?.value;
                        const endDate = endDateColumn?.value;
  
                        return (
                          <tr key={item.id}>
                            <td>{employeeName}</td>
                            <td>{manager || 'Not assigned'}</td>
                            <td>
                              <span className={`status-badge-table status-${status?.toLowerCase()}`}>
                                {status || 'Unknown'}
                              </span>
                            </td>
                            <td>{startDate ? new Date(startDate).toLocaleDateString() : 'N/A'}</td>
                            <td>{endDate ? new Date(endDate).toLocaleDateString() : 'N/A'}</td>
                            <td>{project || 'Not assigned'}</td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Forecast Window View (Next 3 Months) */}
      {selectedView === 'forecast' && (
        <div className="vacation-list">
          <h3>Forecast Window - Next 3 Months</h3>
          <p className="view-description">
            Showing all planned vacations in the next 3 months based on the Forecast Window column
          </p>
          
          {/* Inline Quick Filter for Forecast View */}
          <div className="inline-filter">
            <input
              type="text"
              placeholder="🔍 Quick search by name or manager..."
              value={filters.searchText}
              onChange={(e) => handleFilterChange({ ...filters, searchText: e.target.value })}
              className="inline-filter-input"
            />
            {filters.searchText && (
              <button
                onClick={() => handleFilterChange({ ...filters, searchText: '' })}
                className="inline-filter-clear"
              >
                <X size={16} />
              </button>
            )}
          </div>

          {(() => {
            const forecastVacations = filteredStats.forecastWindowVacations || [];
            const filteredForecast = filters.searchText
              ? forecastVacations.filter(vacation => {
                  const searchLower = filters.searchText.toLowerCase();
                  const nameMatch = vacation.employeeName?.toLowerCase().includes(searchLower);
                  const managerMatch = vacation.manager?.toLowerCase().includes(searchLower);
                  return nameMatch || managerMatch;
                })
              : forecastVacations;

            return filteredForecast.length === 0 ? (
              <div className="empty-state">
                <Calendar size={48} />
                <p>{filters.searchText ? 'No matching vacations found' : 'No vacations planned in the next 3 months'}</p>
              </div>
            ) : (
              <div className="vacation-cards">
                {filteredForecast.map((vacation) => (
                <div key={vacation.id} className="vacation-card forecast">
                  <div className="vacation-header">
                    <h4>{vacation.employeeName || vacation.name}</h4>
                    <span className="days-badge">
                      {vacation.daysUntil === 0 ? 'Today' : `In ${vacation.daysUntil} days`}
                    </span>
                  </div>
                  <div className="vacation-details">
                    <div className="detail-row">
                      <Calendar size={16} />
                      <span>
                        {new Date(vacation.startDate).toLocaleDateString()} - {new Date(vacation.endDate).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="detail-row">
                      <UserCheck size={16} />
                      <span>Manager: {vacation.manager || 'Not assigned'}</span>
                    </div>
                    <div className="detail-row">
                      <Users size={16} />
                      <span>{vacation.group}</span>
                    </div>
                    {vacation.forecastWindow && (
                      <div className="detail-row">
                        <TrendingUp size={16} />
                        <span>Window: {vacation.forecastWindow}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
            );
          })()}
        </div>
      )}

      {/* Manager View */}
      {selectedView === 'managers' && (
        <div className="charts-grid">
          {/* Leaves by Manager - Total Duration */}
          <div className="chart-card full-width">
            <h3>Total Leave Duration by Manager (Days)</h3>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={managerData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="manager" angle={-45} textAnchor="end" height={100} />
                <YAxis label={{ value: 'Total Days', angle: -90, position: 'insideLeft' }} />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div style={{
                          background: 'white',
                          padding: '10px',
                          border: '1px solid #ccc',
                          borderRadius: '4px'
                        }}>
                          <p style={{ margin: 0, fontWeight: 'bold' }}>{payload[0].payload.manager}</p>
                          <p style={{ margin: '5px 0 0 0', color: '#667eea' }}>
                            Total Days: {payload[0].value}
                          </p>
                          <p style={{ margin: '5px 0 0 0', color: '#6b7280' }}>
                            Requests: {payload[0].payload.requests}
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend />
                <Bar dataKey="days" fill="#667eea" name="Total Days" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Current Vacations List */}
      {selectedView === 'current' && (
        <div className="vacation-list">
          <h3>Currently on Vacation</h3>
          {filteredStats.currentVacations.length === 0 ? (
            <div className="empty-state">
              <Users size={48} />
              <p>No one is currently on vacation</p>
            </div>
          ) : (
            <div className="vacation-cards">
              {filteredStats.currentVacations.map((vacation) => (
                <div key={vacation.id} className="vacation-card current">
                  <div className="vacation-header">
                    <h4>{vacation.employeeName || vacation.name}</h4>
                    <span className="status-badge active">Active</span>
                  </div>
                  <div className="vacation-details">
                    <div className="detail-row">
                      <Calendar size={16} />
                      <span>
                        {new Date(vacation.startDate).toLocaleDateString()} - {new Date(vacation.endDate).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="detail-row">
                      <UserCheck size={16} />
                      <span>Manager: {vacation.manager || 'Not assigned'}</span>
                    </div>
                    <div className="detail-row">
                      <Users size={16} />
                      <span>{vacation.group}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default Dashboard;

// Made with Bob

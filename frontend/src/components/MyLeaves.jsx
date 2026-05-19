import { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Calendar, Mail, Search, Edit2, Trash2, Save, X, 
  Loader, AlertCircle, CheckCircle, Clock, CalendarCheck 
} from 'lucide-react';
import './MyLeaves.css';

const API_BASE_URL = '/api/dashboard';

function MyLeaves({ onUpdate }) {
  const [employeeId, setEmployeeId] = useState(() => localStorage.getItem('userEmployeeId') || '');
  const [leaves, setLeaves] = useState({ past: [], upcoming: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (employeeId) {
      localStorage.setItem('userEmployeeId', employeeId);
    }
  }, [employeeId]);

  const fetchLeaves = async () => {
    if (!employeeId.trim()) {
      setError('Please enter your employee ID');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await axios.get(`${API_BASE_URL}/my-leaves`, {
        params: { employeeId }
      });
      setLeaves(response.data.data);
    } catch (err) {
      console.error('Error fetching leaves:', err);
      setError(err.response?.data?.error || 'Failed to fetch your leaves');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchLeaves();
  };

  const startEdit = (leave) => {
    setEditingId(leave.id);
    
    // Extract dates from separate Start Date and End Date columns
    // Columns are keyed by their ID in the leave.columns object
    const startDateColumn = leave.columns['date4']; // Start Date column
    const endDateColumn = leave.columns['date_mm1zqm6a']; // End Date column
    const textColumn = Object.values(leave.columns).find(
      col => col.type === 'text'
    );

    const startDate = startDateColumn?.value || '';
    const endDate = endDateColumn?.value || '';

    setEditData({
      startDate,
      endDate,
      description: textColumn?.value || ''
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditData({});
  };

  const saveEdit = async (leaveId) => {
    setActionLoading(true);
    setError(null);

    try {
      await axios.put(`${API_BASE_URL}/leave/${leaveId}`, editData);
      
      // Refresh leaves
      await fetchLeaves();
      setEditingId(null);
      setEditData({});
      
      // Notify parent to refresh dashboard
      if (onUpdate) {
        onUpdate();
      }
    } catch (err) {
      console.error('Error updating leave:', err);
      setError(err.response?.data?.error || 'Failed to update leave');
    } finally {
      setActionLoading(false);
    }
  };

  const confirmDelete = (leaveId) => {
    setDeleteConfirm(leaveId);
  };

  const cancelDelete = () => {
    setDeleteConfirm(null);
  };

  const handleDelete = async (leaveId) => {
    setActionLoading(true);
    setError(null);

    try {
      await axios.delete(`${API_BASE_URL}/leave/${leaveId}`);
      
      // Refresh leaves
      await fetchLeaves();
      setDeleteConfirm(null);
      
      // Notify parent to refresh dashboard
      if (onUpdate) {
        onUpdate();
      }
    } catch (err) {
      console.error('Error deleting leave:', err);
      setError(err.response?.data?.error || 'Failed to delete leave');
    } finally {
      setActionLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const calculateDays = (startDate, endDate) => {
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  };

  const getDateInfo = (leave) => {
    // Get start and end dates from separate columns by their IDs
    const startDateColumn = leave.columns['date4']; // Start Date column
    const endDateColumn = leave.columns['date_mm1zqm6a']; // End Date column

    const start = startDateColumn?.value || null;
    const end = endDateColumn?.value || null;

    return {
      start,
      end,
      days: calculateDays(start, end)
    };
  };

  const getStatus = (leave) => {
    const statusColumn = Object.values(leave.columns).find(col => col.type === 'status');
    return statusColumn?.value || 'Unknown';
  };

  const getDescription = (leave) => {
    const textColumn = Object.values(leave.columns).find(col => col.type === 'text');
    return textColumn?.value || 'No description';
  };

  const renderLeaveCard = (leave, isPast = false) => {
    const dateInfo = getDateInfo(leave);
    const status = getStatus(leave);
    const description = getDescription(leave);
    const isEditing = editingId === leave.id;
    const isDeleting = deleteConfirm === leave.id;

    return (
      <div key={leave.id} className={`leave-card ${isPast ? 'past' : 'upcoming'}`}>
        <div className="leave-card-header">
          <div className="leave-title">
            <Calendar size={20} />
            <h3>{leave.name}</h3>
          </div>
          <span className={`status-badge status-${status.toLowerCase()}`}>
            {status}
          </span>
        </div>

        {isEditing ? (
          <div className="edit-form">
            <div className="edit-row">
              <div className="edit-field">
                <label>Start Date</label>
                <input
                  type="date"
                  value={editData.startDate}
                  onChange={(e) => setEditData({ ...editData, startDate: e.target.value })}
                  disabled={actionLoading}
                />
              </div>
              <div className="edit-field">
                <label>End Date</label>
                <input
                  type="date"
                  value={editData.endDate}
                  onChange={(e) => setEditData({ ...editData, endDate: e.target.value })}
                  disabled={actionLoading}
                />
              </div>
            </div>
            <div className="edit-field">
              <label>Description</label>
              <textarea
                value={editData.description}
                onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                rows="3"
                disabled={actionLoading}
              />
            </div>
            <div className="edit-actions">
              <button 
                onClick={() => saveEdit(leave.id)} 
                className="btn-save"
                disabled={actionLoading}
              >
                {actionLoading ? <Loader className="spinner" size={16} /> : <Save size={16} />}
                Save
              </button>
              <button 
                onClick={cancelEdit} 
                className="btn-cancel"
                disabled={actionLoading}
              >
                <X size={16} />
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="leave-dates">
              <div className="date-range">
                <CalendarCheck size={16} />
                <span>
                  {formatDate(dateInfo.start)} → {formatDate(dateInfo.end)}
                </span>
              </div>
              <div className="duration">
                <Clock size={16} />
                <span>{dateInfo.days} day{dateInfo.days !== 1 ? 's' : ''}</span>
              </div>
            </div>

            <div className="leave-description">
              <p>{description}</p>
            </div>

            {!isPast && (
              <div className="leave-actions">
                {isDeleting ? (
                  <div className="delete-confirm">
                    <p>Are you sure you want to delete this leave?</p>
                    <div className="delete-actions">
                      <button 
                        onClick={() => handleDelete(leave.id)} 
                        className="btn-confirm-delete"
                        disabled={actionLoading}
                      >
                        {actionLoading ? <Loader className="spinner" size={16} /> : <Trash2 size={16} />}
                        Yes, Delete
                      </button>
                      <button 
                        onClick={cancelDelete} 
                        className="btn-cancel-delete"
                        disabled={actionLoading}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <button onClick={() => startEdit(leave)} className="btn-edit">
                      <Edit2 size={16} />
                      Edit
                    </button>
                    <button onClick={() => confirmDelete(leave.id)} className="btn-delete">
                      <Trash2 size={16} />
                      Delete
                    </button>
                  </>
                )}
              </div>
            )}
          </>
        )}
      </div>
    );
  };

  return (
    <div className="my-leaves-container">
      <div className="my-leaves-header">
        <Mail size={32} />
        <h2>My Leave Requests</h2>
        <p>View and manage your vacation requests</p>
      </div>

      <form onSubmit={handleSearch} className="search-form">
        <div className="search-input-group">
          <Mail size={20} />
          <input
            type="text"
            value={employeeId}
            onChange={(e) => setEmployeeId(e.target.value)}
            placeholder="Enter your employee ID"
            disabled={loading}
          />
        </div>
        <button type="submit" className="btn-search" disabled={loading}>
          {loading ? (
            <Loader className="spinner" size={20} />
          ) : (
            <>
              <Search size={20} />
              Load My Leaves
            </>
          )}
        </button>
      </form>

      {error && (
        <div className="alert alert-error">
          <AlertCircle size={20} />
          <p>{error}</p>
        </div>
      )}

      {leaves.upcoming.length > 0 || leaves.past.length > 0 ? (
        <div className="leaves-content">
          {leaves.upcoming.length > 0 && (
            <div className="leaves-section">
              <h3 className="section-title">
                <CalendarCheck size={24} />
                Upcoming Leaves ({leaves.upcoming.length})
              </h3>
              <div className="leaves-grid">
                {leaves.upcoming.map(leave => renderLeaveCard(leave, false))}
              </div>
            </div>
          )}

          {leaves.past.length > 0 && (
            <div className="leaves-section">
              <h3 className="section-title">
                <CheckCircle size={24} />
                Past Leaves ({leaves.past.length})
              </h3>
              <div className="leaves-grid">
                {leaves.past.map(leave => renderLeaveCard(leave, true))}
              </div>
            </div>
          )}
        </div>
      ) : (
        !loading && employeeId && (
          <div className="empty-state">
            <Calendar size={64} />
            <h3>No Leave Requests Found</h3>
            <p>You haven't submitted any leave requests yet.</p>
          </div>
        )
      )}
    </div>
  );
}

export default MyLeaves;

// Made with Bob
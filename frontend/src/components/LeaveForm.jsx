import { useState, useEffect } from 'react';
import axios from 'axios';
import { Calendar, Send, CheckCircle, AlertCircle, Loader, User, Search } from 'lucide-react';
import './LeaveForm.css';
import { API_ENDPOINT } from '../config';

function LeaveForm({ onSuccess }) {
  const [formData, setFormData] = useState({
    employeeId: '',
    employeeName: '',
    startDate: '',
    endDate: '',
    manager: '',
    tower: '',
    project: '',
    status: '0' // Default to "Planned" (index 0)
  });
  const [dropdownOptions, setDropdownOptions] = useState({});
  const [statusOptions, setStatusOptions] = useState([]);
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [loading, setLoading] = useState(false);
  const [lookingUp, setLookingUp] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [autoFilled, setAutoFilled] = useState(false);

  // Fetch dropdown options on component mount
  useEffect(() => {
    const fetchDropdownOptions = async () => {
      try {
        const response = await axios.get(`${API_ENDPOINT}/dropdown-options`);
        if (response.data.success) {
          setDropdownOptions(response.data.data);
        }
        
        // Fetch board info to get status column options
        const boardResponse = await axios.get(`${API_ENDPOINT}/board-info`);
        if (boardResponse.data.success) {
          const statusColumn = boardResponse.data.data.columns.find(col => col.id === 'status');
          if (statusColumn && statusColumn.settings_str) {
            const settings = JSON.parse(statusColumn.settings_str);
            if (settings.labels) {
              setStatusOptions(settings.labels.map((label, index) => ({
                index: index,
                label: label.name || label
              })));
            }
          }
        }
      } catch (err) {
        console.error('Error fetching dropdown options:', err);
      } finally {
        setLoadingOptions(false);
      }
    };

    fetchDropdownOptions();
  }, []);

  // Lookup employee details when Employee ID is entered
  const lookupEmployeeDetails = async (employeeId) => {
    if (!employeeId || employeeId.length < 3) return; // Minimum 3 characters
    
    setLookingUp(true);
    setError(null);
    
    try {
      const response = await axios.get(`${API_ENDPOINT}/employee/${employeeId}`);
      if (response.data.success) {
        const details = response.data.data;
        
        // Find matching option IDs from dropdown options
        const findOptionId = (columnId, labelText) => {
          if (!labelText) return '';
          const options = dropdownOptions[columnId]?.options || [];
          const match = options.find(opt => opt.label === labelText);
          return match ? match.id : '';
        };
        
        // Map fields from Employee Directory to form fields with option IDs
        // Only populate fields that have matching dropdown options
        const employeeNameId = findOptionId('dropdown_mm2641v5', details.employeeName);
        const managerId = findOptionId('dropdown_mm3g96wg', details.manager);
        const projectId = findOptionId('dropdown_mm26tzy4', details.project || details.team);
        
        setFormData(prev => ({
          ...prev,
          employeeName: employeeNameId || prev.employeeName,
          manager: managerId || prev.manager, // Keep existing if no match
          tower: prev.tower, // Tower not in Employee Directory
          project: projectId || prev.project
        }));
        
        setAutoFilled(true);
        setTimeout(() => setAutoFilled(false), 3000);
      }
    } catch (err) {
      if (err.response?.status === 404) {
        // Employee not found - this is okay, user can fill manually
        console.log('Employee not found in records');
      } else {
        console.error('Error looking up employee:', err);
      }
    } finally {
      setLookingUp(false);
    }
  };

  // Debounce employee ID lookup
  useEffect(() => {
    const timer = setTimeout(() => {
      if (formData.employeeId && formData.employeeId.length >= 3) {
        lookupEmployeeDetails(formData.employeeId);
      }
    }, 500); // Wait 500ms after user stops typing

    return () => clearTimeout(timer);
  }, [formData.employeeId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (error) setError(null);
  };

  const validateForm = () => {
    if (!formData.employeeId.trim()) {
      setError('Please enter your employee ID');
      return false;
    }
    if (!formData.employeeName) {
      setError('Please select an employee name');
      return false;
    }
    if (!formData.manager) {
      setError('Please select a manager');
      return false;
    }
    if (!formData.tower) {
      setError('Please select a tower');
      return false;
    }
    if (!formData.project) {
      setError('Please select a project');
      return false;
    }
    if (!formData.status && formData.status !== '0') {
      setError('Please select a status');
      return false;
    }
    if (!formData.startDate) {
      setError('Please select a start date');
      return false;
    }
    if (!formData.endDate) {
      setError('Please select an end date');
      return false;
    }
    
    const start = new Date(formData.startDate);
    const end = new Date(formData.endDate);
    if (end < start) {
      setError('End date must be after or equal to start date');
      return false;
    }

    return true;
  };

  const calculateWorkingDays = () => {
    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      let workingDays = 0;
      
      // Iterate through each day in the range
      for (let date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
        const dayOfWeek = date.getDay();
        // 0 = Sunday, 6 = Saturday - exclude these
        if (dayOfWeek !== 0 && dayOfWeek !== 6) {
          workingDays++;
        }
      }
      
      return workingDays;
    }
    return 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      await axios.post(`${API_ENDPOINT}/submit`, formData);
      
      setSuccess(true);
      
      // Save user preferences before clearing dates
      const savedPreferences = {
        employeeId: formData.employeeId,
        employeeName: formData.employeeName,
        manager: formData.manager,
        tower: formData.tower,
        project: formData.project,
        status: formData.status
      };
      
      // Clear only date fields, keep user info for next submission
      setFormData(prev => ({
        ...prev,
        startDate: '',
        endDate: ''
      }));

      // Call onSuccess callback if provided
      if (onSuccess) {
        setTimeout(() => {
          onSuccess();
        }, 2000);
      }
    } catch (err) {
      console.error('Error submitting leave:', err);
      setError(err.response?.data?.error || err.response?.data?.message || 'Failed to submit leave request');
    } finally {
      setLoading(false);
    }
  };

  const workingDays = calculateWorkingDays();

  return (
    <div className="leave-form-container">
      <div className="leave-form-header">
        <Calendar size={32} />
        <h2>Submit Leave Request</h2>
        <p>Fill in the details below to request time off</p>
      </div>

      {autoFilled && (
        <div className="alert alert-info">
          <User size={20} />
          <div>
            <strong>Auto-filled!</strong>
            <p>Your employee details have been automatically filled from your last submission.</p>
          </div>
        </div>
      )}

      {success && (
        <div className="alert alert-success">
          <CheckCircle size={20} />
          <div>
            <strong>Success!</strong>
            <p>Your leave request has been submitted successfully.</p>
          </div>
        </div>
      )}

      {error && (
        <div className="alert alert-error">
          <AlertCircle size={20} />
          <div>
            <strong>Error</strong>
            <p>{error}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="leave-form">
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="employeeId">
              Employee ID <span className="required">*</span>
              {lookingUp && <span className="lookup-indicator"> (Looking up...)</span>}
            </label>
            <div className="input-with-icon">
              <input
                type="text"
                id="employeeId"
                name="employeeId"
                value={formData.employeeId}
                onChange={handleChange}
                placeholder="e.g., EMP12345"
                disabled={loading}
                required
              />
              {lookingUp && <Search className="input-icon spinning" size={16} />}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="employeeName">
              Employee Name <span className="required">*</span>
            </label>
            <select
              id="employeeName"
              name="employeeName"
              value={formData.employeeName}
              onChange={handleChange}
              disabled={loading || loadingOptions}
              required
            >
              <option value="">Select Employee</option>
              {dropdownOptions['dropdown_mm2641v5']?.options?.map(option => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="manager">
              Manager <span className="required">*</span>
            </label>
            <select
              id="manager"
              name="manager"
              value={formData.manager}
              onChange={handleChange}
              disabled={loading || loadingOptions}
              required
            >
              <option value="">Select Manager</option>
              {dropdownOptions['dropdown_mm3g96wg']?.options?.map(option => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="tower">
              Tower <span className="required">*</span>
            </label>
            <select
              id="tower"
              name="tower"
              value={formData.tower}
              onChange={handleChange}
              disabled={loading || loadingOptions}
              required
            >
              <option value="">Select Tower</option>
              {dropdownOptions['dropdown_mm1zge2q']?.options?.map(option => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="project">
              Project <span className="required">*</span>
            </label>
            <select
              id="project"
              name="project"
              value={formData.project}
              onChange={handleChange}
              disabled={loading || loadingOptions}
              required
            >
              <option value="">Select Project</option>
              {dropdownOptions['dropdown_mm26tzy4']?.options?.map(option => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="status">
              Status <span className="required">*</span>
            </label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              disabled={loading || loadingOptions}
              required
            >
              {statusOptions.length > 0 ? (
                statusOptions.map(option => (
                  <option key={option.index} value={option.index}>
                    {option.label}
                  </option>
                ))
              ) : (
                <>
                  <option value="0">Planned</option>
                  <option value="1">Approved</option>
                  <option value="2">Pending</option>
                  <option value="3">Rejected</option>
                </>
              )}
            </select>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="startDate">
              Start Date <span className="required">*</span>
            </label>
            <input
              type="date"
              id="startDate"
              name="startDate"
              value={formData.startDate}
              onChange={handleChange}
              disabled={loading}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="endDate">
              End Date <span className="required">*</span>
            </label>
            <input
              type="date"
              id="endDate"
              name="endDate"
              value={formData.endDate}
              onChange={handleChange}
              disabled={loading}
              required
            />
          </div>
        </div>

        {workingDays > 0 && (
          <div className="duration-info">
            <Calendar size={16} />
            <span>Duration: <strong>{workingDays} working day{workingDays !== 1 ? 's' : ''}</strong> (excluding weekends)</span>
          </div>
        )}

        <div className="form-actions">
          <button
            type="submit"
            className="btn-submit"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader className="spinner" size={16} />
                Submitting...
              </>
            ) : (
              <>
                <Send size={16} />
                Submit Leave Request
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

export default LeaveForm;

// Made with Bob
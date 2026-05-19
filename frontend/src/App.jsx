import { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';
import Dashboard from './components/Dashboard';
import LeaveForm from './components/LeaveForm';
import MyLeaves from './components/MyLeaves';
import { Calendar, RefreshCw, AlertCircle, PlusCircle, User, BarChart3 } from 'lucide-react';
import { API_ENDPOINT } from './config';

function App() {
  const [currentView, setCurrentView] = useState('dashboard');
  const [analytics, setAnalytics] = useState(null);
  const [boardInfo, setBoardInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const [analyticsRes, boardRes] = await Promise.all([
        axios.get(`${API_ENDPOINT}/analytics`),
        axios.get(`${API_ENDPOINT}/board`)
      ]);

      setAnalytics(analyticsRes.data.data);
      setBoardInfo(boardRes.data.data);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err.response?.data?.message || err.message || 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRefresh = () => {
    fetchData();
  };

  const handleClearCache = async () => {
    try {
      await axios.post(`${API_ENDPOINT}/cache/clear`);
      fetchData();
    } catch (err) {
      console.error('Error clearing cache:', err);
      setError('Failed to clear cache');
    }
  };

  if (loading && !analytics) {
    return (
      <div className="app">
        <div className="loading-container">
          <RefreshCw className="loading-spinner" size={48} />
          <p>Loading vacation data from Monday.com...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="app">
        <div className="error-container">
          <AlertCircle size={48} color="#ef4444" />
          <h2>Error Loading Data</h2>
          <p>{error}</p>
          <button onClick={fetchData}>Try Again</button>
        </div>
      </div>
    );
  }

  const handleFormSuccess = () => {
    // Refresh dashboard data after successful form submission
    fetchData();
    // Switch to dashboard view after 2 seconds
    setTimeout(() => {
      setCurrentView('dashboard');
    }, 2000);
  };

  const handleLeavesUpdate = () => {
    // Refresh dashboard data after leave update/delete
    fetchData();
  };

  const renderContent = () => {
    switch (currentView) {
      case 'submit':
        return <LeaveForm onSuccess={handleFormSuccess} />;
      case 'my-leaves':
        return <MyLeaves onUpdate={handleLeavesUpdate} />;
      case 'dashboard':
      default:
        return analytics ? <Dashboard analytics={analytics} /> : null;
    }
  };

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <div className="header-title">
            <Calendar size={32} />
            <h1>Vacation Forecast Dashboard</h1>
          </div>
          {boardInfo && currentView === 'dashboard' && (
            <div className="board-info">
              <span className="board-name">{boardInfo.name}</span>
              {boardInfo.description && (
                <span className="board-description">{boardInfo.description}</span>
              )}
            </div>
          )}
        </div>
        
        <nav className="header-nav">
          <button
            onClick={() => setCurrentView('dashboard')}
            className={`nav-btn ${currentView === 'dashboard' ? 'active' : ''}`}
          >
            <BarChart3 size={20} />
            <span>Team Dashboard</span>
          </button>
          <button
            onClick={() => setCurrentView('submit')}
            className={`nav-btn ${currentView === 'submit' ? 'active' : ''}`}
          >
            <PlusCircle size={20} />
            <span>Submit Leave</span>
          </button>
          <button
            onClick={() => setCurrentView('my-leaves')}
            className={`nav-btn ${currentView === 'my-leaves' ? 'active' : ''}`}
          >
            <User size={20} />
            <span>My Leaves</span>
          </button>
        </nav>

        {currentView === 'dashboard' && (
          <div className="header-actions">
            {lastUpdated && (
              <span className="last-updated">
                Last updated: {lastUpdated.toLocaleTimeString()}
              </span>
            )}
            <button onClick={handleClearCache} className="btn-secondary">
              Clear Cache
            </button>
            <button onClick={handleRefresh} className="btn-primary">
              <RefreshCw size={16} />
              Refresh
            </button>
          </div>
        )}
      </header>

      <main className="app-main">
        {renderContent()}
      </main>

      <footer className="app-footer">
        <p>Powered by Monday.com API • Data refreshes every 5 minutes</p>
      </footer>
    </div>
  );
}

export default App;

// Made with Bob

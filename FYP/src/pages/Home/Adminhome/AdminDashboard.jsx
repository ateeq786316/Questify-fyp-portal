import React, { useState, useEffect, useRef, useCallback } from 'react';
import { PieChart, Pie, Cell, Legend, Tooltip } from 'recharts';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { FaTrash, FaPlus, FaTimes, FaSave, FaBars, FaHome, FaUsers, FaCalendarAlt, FaCog, FaGraduationCap, FaChartPie } from 'react-icons/fa';
import axios from 'axios';
import './AdminDashboard.css';
import Navbar from "../../../components/Navbar";
import { useNavigate, useLocation } from 'react-router-dom';
import { Spinner } from 'react-bootstrap';

const AdminDashboard = () => {
  // Sidebar state
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Data states
  const [stats, setStats] = useState({
    enrolledStudents: 0,
    totalSupervisors: 0,
    activeStudents: 0,
    pendingStudents: 0,
  });

  const [studentGroups, setStudentGroups] = useState([]);
  const [displayedGroups, setDisplayedGroups] = useState([]);
  const [milestones, setMilestones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [milestoneError, setMilestoneError] = useState(null);
  const [milestoneSuccess, setMilestoneSuccess] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Form states
  const [newMilestoneName, setNewMilestoneName] = useState('');
  const [showAddField, setShowAddField] = useState(false);

  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const ITEMS_PER_PAGE = 5;
  const observer = useRef();

  const COLORS = ['#0088FE', '#FF8042'];

  const navigate = useNavigate();
  const location = useLocation();

  // Last element callback for infinite scroll
  const lastGroupElementRef = useCallback(node => {
    if (loading) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        setPage(prevPage => prevPage + 1);
      }
    });
    if (node) observer.current.observe(node);
  }, [loading, hasMore]);

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const token = localStorage.getItem('adminToken');
        if (!token) {
          setError('No authentication token found. Please login again.');
          setLoading(false);
          return;
        }

        const headers = {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        };

        console.log('Fetching dashboard data...');
        
        const [statsResponse, groupsResponse, milestonesResponse] = await Promise.all([
          axios.get('http://localhost:5000/api/admin/stats', { headers }),
          axios.get('http://localhost:5000/api/admin/student-groups', { headers }),
          axios.get('http://localhost:5000/api/admin/milestones', { headers })
        ]);

        console.log('Stats response:', statsResponse.data);
        console.log('Groups response:', groupsResponse.data);
        console.log('Milestones response:', milestonesResponse.data);

        // Ensure we have valid data before setting state
        if (statsResponse.data?.success && statsResponse.data?.stats) {
          setStats(statsResponse.data.stats);
        } else {
          console.error('Invalid stats response:', statsResponse.data);
          setError('Failed to fetch statistics');
        }

        if (groupsResponse.data?.success && groupsResponse.data?.groups) {
          setStudentGroups(groupsResponse.data.groups);
        } else {
          console.error('Invalid groups response:', groupsResponse.data);
          setError('Failed to fetch student groups');
        }

        if (milestonesResponse.data?.success && milestonesResponse.data?.milestones) {
          setMilestones(milestonesResponse.data.milestones);
        } else {
          console.error('Invalid milestones response:', milestonesResponse.data);
          setError('Failed to fetch milestones');
        }

        setLoading(false);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError(err.response?.data?.msg || 'Failed to fetch dashboard data');
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Fetch student groups with pagination
  const fetchStudentGroups = async (pageNum) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');
      const response = await axios.get(`http://localhost:5000/api/admin/student-groups?page=${pageNum}&limit=${ITEMS_PER_PAGE}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const newGroups = response.data.groups;
      if (pageNum === 1) {
        setDisplayedGroups(newGroups);
      } else {
        setDisplayedGroups(prev => [...prev, ...newGroups]);
      }
      
      // Update hasMore based on pagination info from backend
      setHasMore(response.data.pagination.hasMore);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching student groups:', err);
      setError('Failed to fetch student groups');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudentGroups(page);
  }, [page]);

  // Fetch milestones
  const fetchMilestones = async () => {
    try {
      setIsLoading(true);
      setMilestoneError(null);
      
      console.log('Fetching milestones...');
      const token = localStorage.getItem('adminToken');
      const response = await axios.get('http://localhost:5000/api/milestones', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('Milestones response:', response.data);

      if (response.data.success) {
        setMilestones(response.data.milestones);
      } else {
        throw new Error(response.data.msg || 'Failed to fetch milestones');
      }
    } catch (err) {
      console.error('Error fetching milestones:', err.message);
      setMilestoneError(err.response?.data?.msg || 'Failed to fetch milestones');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMilestones();
  }, []);

  const handleDateChange = async (date, milestoneName) => {
    try {
      setIsLoading(true);
      setMilestoneError(null);
      setMilestoneSuccess(null);

      console.log('\n=== Milestone Update Request ===');
      console.log('Milestone:', milestoneName);
      console.log('Date:', date);
      console.log('Formatted Date:', date ? new Date(date).toISOString() : null);

      const token = localStorage.getItem('adminToken');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const url = `http://localhost:5000/api/milestones/${milestoneName}`;
      console.log('Request URL:', url);

      const response = await axios.put(
        url,
        { deadline: date ? new Date(date).toISOString() : null },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('Response:', {
        status: response.status,
        data: response.data
      });

      if (response.data.success) {
        setMilestoneSuccess('Milestone updated successfully');
        // Update local state
        setMilestones(prev => 
          prev.map(m => 
            m.name === milestoneName 
              ? { ...m, deadline: date }
              : m
          )
        );
      } else {
        throw new Error(response.data.msg || 'Failed to update milestone');
      }
    } catch (err) {
      console.error('Error updating milestone:', {
        status: err.response?.status,
        statusText: err.response?.statusText,
        data: err.response?.data,
        message: err.message,
        url: err.config?.url
      });
      
      let errorMessage = 'Failed to update milestone';
      if (err.response?.status === 404) {
        errorMessage = `Milestone "${milestoneName}" not found`;
      } else if (err.response?.status === 401) {
        errorMessage = 'Authentication required';
      } else if (err.response?.data?.msg) {
        errorMessage = err.response.data.msg;
      }
      
      setMilestoneError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const saveMilestones = async () => {
    try {
      setIsLoading(true);
      setMilestoneError(null);
      setMilestoneSuccess(null);

      console.log('\n=== Saving All Milestones ===');
      console.log('Milestones to save:', milestones);

      const token = localStorage.getItem('adminToken');
      if (!token) {
        throw new Error('No authentication token found');
      }

      // Prepare milestones data
      const milestonesToSave = milestones.map(m => ({
        name: m.name,
        deadline: m.deadline ? new Date(m.deadline).toISOString() : null,
        order: m.order
      }));

      console.log('Request payload:', milestonesToSave);

      const response = await axios.put(
        'http://localhost:5000/api/milestones/bulk',
        { milestones: milestonesToSave },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('Response:', {
        status: response.status,
        data: response.data
      });

      if (response.data.success) {
        setMilestoneSuccess('All milestones saved successfully');
        setMilestones(response.data.milestones);
      } else {
        throw new Error(response.data.msg || 'Failed to save milestones');
      }
    } catch (err) {
      console.error('Error saving milestones:', {
        status: err.response?.status,
        statusText: err.response?.statusText,
        data: err.response?.data,
        message: err.message
      });
      
      let errorMessage = 'Failed to save milestones';
      if (err.response?.status === 400) {
        errorMessage = err.response.data.msg || 'Invalid milestone data';
      } else if (err.response?.status === 401) {
        errorMessage = 'Authentication required';
      } else if (err.response?.data?.msg) {
        errorMessage = err.response.data.msg;
      }
      
      setMilestoneError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const addNewMilestone = async () => {
    if (newMilestoneName.trim() === '') {
      setMilestoneError('Milestone name is required');
      return;
    }
    
    try {
      setIsLoading(true);
      setMilestoneError(null);
      setMilestoneSuccess(null);

      console.log('\n=== Adding New Milestone ===');
      console.log('Milestone Name:', newMilestoneName);
      
      const token = localStorage.getItem('adminToken');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const newMilestone = {
        name: newMilestoneName.trim(),
        deadline: null,
        order: milestones.length + 1
      };

      console.log('Request Payload:', newMilestone);

      const response = await axios.post(
        'http://localhost:5000/api/milestones',
        newMilestone,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('Response:', {
        status: response.status,
        data: response.data
      });

      if (response.data.success) {
        setMilestoneSuccess('Milestone added successfully');
        setMilestones(prev => [...prev, response.data.milestone]);
        setNewMilestoneName('');
        setShowAddField(false);
      } else {
        throw new Error(response.data.msg || 'Failed to add milestone');
      }
    } catch (err) {
      console.error('Error adding milestone:', {
        status: err.response?.status,
        statusText: err.response?.statusText,
        data: err.response?.data,
        message: err.message
      });
      
      let errorMessage = 'Failed to add milestone';
      if (err.response?.status === 400) {
        errorMessage = err.response.data.msg || 'Invalid milestone data';
      } else if (err.response?.status === 401) {
        errorMessage = 'Authentication required';
      } else if (err.response?.data?.msg) {
        errorMessage = err.response.data.msg;
      }
      
      setMilestoneError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteMilestone = async (name) => {
    try {
      setIsLoading(true);
      setMilestoneError(null);
      setMilestoneSuccess(null);

      console.log('\n=== Deleting Milestone ===');
      console.log('Milestone Name:', name);

      const token = localStorage.getItem('adminToken');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await axios.delete(
        `http://localhost:5000/api/milestones/${name}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('Response:', {
        status: response.status,
        data: response.data
      });

      if (response.data.success) {
        setMilestoneSuccess('Milestone deleted successfully');
        // Update local state by removing the deleted milestone
        setMilestones(prev => prev.filter(m => m.name !== name));
      } else {
        throw new Error(response.data.msg || 'Failed to delete milestone');
      }
    } catch (err) {
      console.error('Error deleting milestone:', {
        status: err.response?.status,
        statusText: err.response?.statusText,
        data: err.response?.data,
        message: err.message
      });
      
      let errorMessage = 'Failed to delete milestone';
      if (err.response?.status === 404) {
        errorMessage = `Milestone "${name}" not found`;
      } else if (err.response?.status === 401) {
        errorMessage = 'Authentication required';
      } else if (err.response?.data?.msg) {
        errorMessage = err.response.data.msg;
      }
      
      setMilestoneError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (date) => {
    return date ? new Date(date).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    }) : 'Not set';
  };

  // Sidebar toggle functions
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const toggleMobileSidebar = () => {
    setMobileSidebarOpen(!mobileSidebarOpen);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading dashboard data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <p className="error-message">{error}</p>
        <button onClick={() => window.location.reload()}>Retry</button>
      </div>
    );
  }

  // Ensure we have valid stats data before creating chart data
  const chartData = [
    { name: 'Active', value: stats?.activeStudents || 0 },
    { name: 'Pending', value: stats?.pendingStudents || 0 },
  ];

  return (
    <div>
      <Navbar/>
    
    <div className={`admin-dashboard ${sidebarOpen ? 'sidebar-open' : 'sidebar-collapsed'}`}>
      {/* Mobile Sidebar Toggle */}
      <button className="mobile-sidebar-toggle" onClick={toggleMobileSidebar}>
        <FaBars />
      </button>

      {/* Sidebar */}
      <div className={`sidebar ${mobileSidebarOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-header">
          <h3>FYP Dashboard</h3>
          <button className="sidebar-toggle" onClick={toggleSidebar}>
            {sidebarOpen ? '◀' : '▶'}
          </button>
        </div>
        
        <ul className="sidebar-menu">
          <li className={location.pathname === '/admindashboard' ? 'active' : ''} onClick={() => navigate('/admindashboard')} style={{cursor: 'pointer'}}>
            <FaHome className="sidebar-icon" />
            {sidebarOpen && <span>Dashboard</span>}
          </li>
          <li className={location.pathname === '/admin/upload-students' ? 'active' : ''} onClick={() => navigate('/admin/upload-students')} style={{cursor: 'pointer'}}>
            <FaGraduationCap className="sidebar-icon" />
            {sidebarOpen && <span>Students</span>}
          </li>
          <li>
            <FaUsers className="sidebar-icon" />
            {sidebarOpen && <span>Supervisors</span>}
          </li>
          <li>
            <FaCalendarAlt className="sidebar-icon" />
            {sidebarOpen && <span>Milestones</span>}
          </li>
          <li>
            <FaChartPie className="sidebar-icon" />
            {sidebarOpen && <span>Reports</span>}
          </li>
          <li>
            <FaCog className="sidebar-icon" />
            {sidebarOpen && <span>Settings</span>}
          </li>
        </ul>
      </div>

      {/* Main Content */}
      <div className="main-content">
        <div className="dashboard-content">
          <h1>Admin Dashboard</h1>
          
          {error && (
            <div className="error-message">
              <p>{error}</p>
              <button onClick={() => window.location.reload()}>Retry</button>
            </div>
          )}
          
          {/* Stats Cards */}
          <div className="stats-grid">
            <div className="stat-card">
              <h3>Enrolled Students</h3>
              <p className="stat-number">{stats?.enrolledStudents || 0}</p>
            </div>
            <div className="stat-card">
              <h3>Total Supervisors</h3>
              <p className="stat-number">{stats?.totalSupervisors || 0}</p>
            </div>
            <div className="stat-card">
              <h3>Student Status</h3>
              <div className="status-group">
                <p>Active: <span>{stats?.activeStudents || 0}</span></p>
                <p>Pending: <span>{stats?.pendingStudents || 0}</span></p>
              </div>
            </div>
          </div>

          {/* Student List and Pie Chart Section */}
          <div className="data-section">
            <div className="student-list">
              <h2>Student Groups</h2>
              <div className="student-groups-container">
                {displayedGroups.length > 0 ? (
                  <table>
                    <thead>
                      <tr>
                        <th>Group ID</th>
                        <th>Student Name(s)</th>
                        <th>Department</th>
                        <th>Project Title</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {displayedGroups.map((group, index) => (
                        <tr 
                          key={group.groupId}
                          ref={index === displayedGroups.length - 1 ? lastGroupElementRef : null}
                        >
                          <td>{group.groupId}</td>
                          <td>{group.names?.join(', ') || ''}</td>
                          <td>{group.department}</td>
                          <td>{group.projectTitle}</td>
                          <td>{group.status}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p className="no-data">No student groups found</p>
                )}
                
                {loading && (
                  <div className="loading-spinner-container">
                    <Spinner animation="border" role="status" variant="primary">
                      <span className="visually-hidden">Loading...</span>
                    </Spinner>
                  </div>
                )}
                
                {!hasMore && displayedGroups.length > 0 && (
                  <p className="end-of-list">No more groups to load</p>
                )}
              </div>
            </div>

            <div className="chart-container">
              <h2>Student Status Distribution</h2>
              <PieChart width={400} height={300}>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </div>
          </div>

          {/* Milestones Section */}
          <div className="milestones-section">
            <h2>FYP Milestone Deadlines</h2>
            
            {isLoading && (
              <div className="loading-spinner-container">
                <Spinner animation="border" role="status" variant="primary">
                  <span className="visually-hidden">Loading...</span>
                </Spinner>
              </div>
            )}
            
            {milestoneError && (
              <div className="error-message">
                <p>{milestoneError}</p>
                <button onClick={() => setMilestoneError(null)}>Dismiss</button>
              </div>
            )}
            
            {milestoneSuccess && (
              <div className="success-message">
                <p>{milestoneSuccess}</p>
                <button onClick={() => setMilestoneSuccess(null)}>Dismiss</button>
              </div>
            )}

            <div className="milestones-grid">
              {milestones.map((milestone) => (
                <div key={milestone._id} className="milestone-card">
                  <div className="milestone-header">
                    <h3>{milestone.name}</h3>
                    <button 
                      onClick={() => deleteMilestone(milestone.name)} 
                      className="delete-button"
                      title="Delete milestone"
                      disabled={isLoading}
                    >
                      <FaTrash />
                    </button>
                  </div>
                  <DatePicker
                    selected={milestone.deadline ? new Date(milestone.deadline) : null}
                    onChange={(date) => handleDateChange(date, milestone.name)}
                    minDate={new Date()}
                    placeholderText="Select deadline"
                    className="date-picker-input"
                    dateFormat="MMMM d, yyyy"
                    isClearable
                    disabled={isLoading}
                  />
                </div>
              ))}
            </div>

            {/* Add New Milestone Field */}
            {showAddField && (
              <div className="add-milestone-field">
                <input
                  type="text"
                  value={newMilestoneName}
                  onChange={(e) => setNewMilestoneName(e.target.value)}
                  placeholder="Enter milestone name"
                  className="milestone-input"
                />
                <button onClick={addNewMilestone} className="add-button">
                  <FaPlus /> Add
                </button>
                <button 
                  onClick={() => setShowAddField(false)} 
                  className="cancel-button"
                >
                  <FaTimes /> Cancel
                </button>
              </div>
            )}

            <div className="milestone-actions">
              <button onClick={saveMilestones} className="save-button">
                <FaSave /> Save Milestones
              </button>
              {!showAddField && (
                <button 
                  onClick={() => setShowAddField(true)} 
                  className="add-milestone-button"
                >
                  <FaPlus /> Add Milestone
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
};

export default AdminDashboard;
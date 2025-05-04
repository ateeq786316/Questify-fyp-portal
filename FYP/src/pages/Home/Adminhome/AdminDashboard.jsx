import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, Legend, Tooltip } from 'recharts';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { FaTrash, FaPlus, FaTimes, FaSave, FaBars, FaHome, FaUsers, FaCalendarAlt, FaCog, FaGraduationCap, FaChartPie } from 'react-icons/fa';
import axios from 'axios';
import './AdminDashboard.css';
import Navbar from "../../../components/Navbar";

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
  const [milestones, setMilestones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Form states
  const [newMilestoneName, setNewMilestoneName] = useState('');
  const [showAddField, setShowAddField] = useState(false);

  const COLORS = ['#0088FE', '#FF8042'];

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [statsResponse, groupsResponse, milestonesResponse] = await Promise.all([
          axios.get('/api/admin/stats'),
          axios.get('/api/admin/student-groups'),
          axios.get('/api/admin/milestones')
        ]);

        // Ensure we have valid data before setting state
        if (statsResponse.data && statsResponse.data.stats) {
          setStats(statsResponse.data.stats);
        }
        if (groupsResponse.data && groupsResponse.data.groups) {
          setStudentGroups(groupsResponse.data.groups);
        }
        if (milestonesResponse.data && milestonesResponse.data.milestones) {
          setMilestones(milestonesResponse.data.milestones);
        }
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch dashboard data');
        setLoading(false);
        console.error('Error fetching dashboard data:', err);
      }
    };

    fetchDashboardData();
  }, []);

  const handleDateChange = async (date, id) => {
    try {
      const updatedMilestones = milestones.map(milestone => 
        milestone._id === id ? { ...milestone, deadline: date } : milestone
      );
      setMilestones(updatedMilestones);
      
      await axios.post('/api/admin/milestones', { milestones: updatedMilestones });
    } catch (err) {
      console.error('Error updating milestone:', err);
      setError('Failed to update milestone');
    }
  };

  const saveMilestones = async () => {
    try {
      await axios.post('/api/admin/milestones', { milestones });
      alert('Milestones saved successfully!');
    } catch (err) {
      console.error('Error saving milestones:', err);
      setError('Failed to save milestones');
    }
  };

  const addNewMilestone = async () => {
    if (newMilestoneName.trim() === '') return;
    
    const newMilestone = {
      name: newMilestoneName.trim(),
      deadline: null,
      order: milestones.length + 1
    };
    
    try {
      const response = await axios.post('/api/admin/milestones', { milestones: [...milestones, newMilestone] });
      setMilestones(response.data.milestones);
      setNewMilestoneName('');
      setShowAddField(false);
    } catch (err) {
      console.error('Error adding milestone:', err);
      setError('Failed to add milestone');
    }
  };

  const deleteMilestone = async (id) => {
    try {
      const updatedMilestones = milestones.filter(milestone => milestone._id !== id);
      await axios.post('/api/admin/milestones', { milestones: updatedMilestones });
      setMilestones(updatedMilestones);
    } catch (err) {
      console.error('Error deleting milestone:', err);
      setError('Failed to delete milestone');
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
          <li className="active">
            <FaHome className="sidebar-icon" />
            {sidebarOpen && <span>Dashboard</span>}
          </li>
          <li>
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
              <table>
                <thead>
                  <tr>
                    <th>Group ID</th>
                    <th>Student Name(s)</th>
                    <th>Domain</th>
                  </tr>
                </thead>
                <tbody>
                  {studentGroups?.map((group, index) => (
                    <tr key={index}>
                      <td>{group.groupId}</td>
                      <td>{group.names?.join(', ') || ''}</td>
                      <td>{group.domain}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <button className="see-more-btn">See More</button>
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
            <div className="milestones-grid">
              {milestones?.map((milestone) => (
                <div key={milestone._id} className="milestone-card">
                  <div className="milestone-header">
                    <h3>{milestone.name}</h3>
                    <button 
                      onClick={() => deleteMilestone(milestone._id)} 
                      className="delete-button"
                      title="Delete milestone"
                    >
                      <FaTrash />
                    </button>
                  </div>
                  <DatePicker
                    selected={milestone.deadline ? new Date(milestone.deadline) : null}
                    onChange={(date) => handleDateChange(date, milestone._id)}
                    minDate={new Date()}
                    placeholderText="Select deadline"
                    className="date-picker-input"
                    dateFormat="MMMM d, yyyy"
                    isClearable
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
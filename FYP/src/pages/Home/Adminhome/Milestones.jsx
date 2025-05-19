import React, { useState, useEffect } from 'react';
import { FaPlus, FaTrash, FaSave, FaTimes } from 'react-icons/fa';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import axios from 'axios';
import { Spinner } from 'react-bootstrap';
import '../../../styles/shared.css';
import './Milestones.css';
import AdminSidebarLayout from '../../../components/AdminSidebarLayout';

const Milestones = () => {
  // State management
  const [milestones, setMilestones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [newMilestoneName, setNewMilestoneName] = useState('');
  const [showAddField, setShowAddField] = useState(false);

  // Calculate max date (6 months from now)
  const maxDate = new Date();
  maxDate.setMonth(maxDate.getMonth() + 6);

  // Fetch milestones on component mount
  useEffect(() => {
    fetchMilestones();
  }, []);

  // Fetch milestones from API
  const fetchMilestones = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('adminToken');
      const response = await axios.get('http://localhost:5000/api/milestones', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.data.success) {
        setMilestones(response.data.milestones);
      } else {
        throw new Error(response.data.msg || 'Failed to fetch milestones');
      }
    } catch (err) {
      console.error('Error fetching milestones:', err);
      setError(err.response?.data?.msg || 'Failed to fetch milestones');
    } finally {
      setLoading(false);
    }
  };

  // Handle date change for a milestone
  const handleDateChange = async (date, milestoneName) => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      const token = localStorage.getItem('adminToken');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await axios.put(
        `http://localhost:5000/api/milestones/${milestoneName}`,
        { deadline: date ? new Date(date).toISOString() : null },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        setSuccess('Milestone updated successfully');
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
      console.error('Error updating milestone:', err);
      setError(err.response?.data?.msg || 'Failed to update milestone');
    } finally {
      setLoading(false);
    }
  };

  // Save all milestones
  const saveMilestones = async () => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      const token = localStorage.getItem('adminToken');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const milestonesToSave = milestones.map(m => ({
        name: m.name,
        deadline: m.deadline ? new Date(m.deadline).toISOString() : null,
        order: m.order
      }));

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

      if (response.data.success) {
        setSuccess('All milestones saved successfully');
        setMilestones(response.data.milestones);
      } else {
        throw new Error(response.data.msg || 'Failed to save milestones');
      }
    } catch (err) {
      console.error('Error saving milestones:', err);
      setError(err.response?.data?.msg || 'Failed to save milestones');
    } finally {
      setLoading(false);
    }
  };

  // Add new milestone
  const addNewMilestone = async () => {
    if (newMilestoneName.trim() === '') {
      setError('Milestone name is required');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);
      
      const token = localStorage.getItem('adminToken');
      if (!token) {
        throw new Error('No authentication token found');
      }
    
      const newMilestone = {
        name: newMilestoneName.trim(),
        deadline: null,
        order: milestones.length + 1
      };

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

      if (response.data.success) {
        setSuccess('Milestone added successfully');
        setMilestones(prev => [...prev, response.data.milestone]);
        setNewMilestoneName('');
        setShowAddField(false);
      } else {
        throw new Error(response.data.msg || 'Failed to add milestone');
      }
    } catch (err) {
      console.error('Error adding milestone:', err);
      setError(err.response?.data?.msg || 'Failed to add milestone');
    } finally {
      setLoading(false);
    }
  };

  // Delete milestone
  const deleteMilestone = async (name) => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

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

      if (response.data.success) {
        setSuccess('Milestone deleted successfully');
        setMilestones(prev => prev.filter(m => m.name !== name));
      } else {
        throw new Error(response.data.msg || 'Failed to delete milestone');
      }
    } catch (err) {
      console.error('Error deleting milestone:', err);
      setError(err.response?.data?.msg || 'Failed to delete milestone');
    } finally {
      setLoading(false);
    }
  };

  if (loading && milestones.length === 0) {
    return (
      <AdminSidebarLayout>
        <div className="loading-container">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
          <p>Loading milestones...</p>
        </div>
      </AdminSidebarLayout>
    );
  }

  return (
    <AdminSidebarLayout>
      <div className="milestones-container">
        <h1>FYP Milestone Management</h1>
        
        {error && (
          <div className="error-message">
            <p>{error}</p>
            <button onClick={() => setError(null)}>Dismiss</button>
          </div>
        )}
        
        {success && (
          <div className="success-message">
            <p>{success}</p>
            <button onClick={() => setSuccess(null)}>Dismiss</button>
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
                  disabled={loading}
                >
                  <FaTrash />
                </button>
              </div>
              <DatePicker
                selected={milestone.deadline ? new Date(milestone.deadline) : null}
                onChange={(date) => handleDateChange(date, milestone.name)}
                minDate={new Date()}
                maxDate={maxDate}
                placeholderText="Select deadline"
                className="date-picker-input"
                dateFormat="MMMM d, yyyy"
                isClearable
                disabled={loading}
                showMonthDropdown
                showYearDropdown
                dropdownMode="select"
                popperClassName="date-picker-popper"
                popperPlacement="bottom-start"
                popperModifiers={[
                  {
                    name: "preventOverflow",
                    options: {
                      boundary: "viewport"
                    }
                  }
                ]}
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
            <FaSave /> Save All Changes
          </button>
          {!showAddField && (
            <button 
              onClick={() => setShowAddField(true)} 
              className="add-milestone-button"
            >
              <FaPlus /> Add New Milestone
            </button>
          )}
        </div>
      </div>
    </AdminSidebarLayout>
  );
};

export default Milestones; 
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import AdminSidebarLayout from '../../../components/AdminSidebarLayout';
import { Modal, Button, Form, Spinner } from 'react-bootstrap';
import './UserManagement.css'; // Assuming you have a UserManagement.css for styling

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [filteredRole, setFilteredRole] = useState(''); // 'student', 'supervisor', 'internal', 'external' or '' for all
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [currentUser, setCurrentUser] = useState(null); // User being edited or deleted
  const [editFormData, setEditFormData] = useState({});
  const [saving, setSaving] = useState(false); // For save button spinner

  const userRoles = ['All', 'student', 'supervisor', 'internal', 'external'];

  // Fetch users based on the filtered role
  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('adminToken');
        const response = await axios.get(`http://localhost:5000/api/admin/users${filteredRole ? `?role=${filteredRole}` : ''}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (response.data.success) {
          setUsers(response.data.users);
        } else {
          setError(response.data.msg || 'Failed to fetch users');
          setUsers([]);
        }
      } catch (err) {
        console.error('Error fetching users:', err);
        setError(err.response?.data?.msg || 'Failed to fetch users');
        setUsers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [filteredRole]);

  // Handle filter button click
  const handleFilterClick = (role) => {
    setFilteredRole(role === 'All' ? '' : role);
  };

  // Handle Edit button click
  const handleEditClick = (user) => {
    setCurrentUser(user);
    // Prepare form data, excluding password and potentially other sensitive/complex fields
    setEditFormData({
      name: user.name,
      email: user.email,
      department: user.department || '',
      contact: user.contact || '',
      studentId: user.studentId || '', // Include if applicable
      supervisorId: user.supervisorId || '', // Include if applicable
      internalId: user.internalId || '', // Include if applicable
      externalId: user.externalId || '', // Include if applicable
      externalOrganization: user.externalOrganization || '', // Include if applicable
      externalPosition: user.externalPosition || '', // Include if applicable
      supervisorExpertise: Array.isArray(user.supervisorExpertise) ? user.supervisorExpertise.join(', ') : '', // Handle arrays
      internalExpertise: Array.isArray(user.internalExpertise) ? user.internalExpertise.join(', ') : '',
      externalExpertise: Array.isArray(user.externalExpertise) ? user.externalExpertise.join(', ') : '',
      // Add other relevant fields here
    });
    setShowEditModal(true);
  };

  // Handle form data changes in edit modal
  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle Save Changes in edit modal
  const handleSaveChanges = async () => {
    if (!currentUser) return;
    setSaving(true);
    setError(null);
    try {
      const token = localStorage.getItem('adminToken');
      // Prepare data to send - split expertise strings into arrays
      const dataToSend = {
        ...editFormData,
        supervisorExpertise: editFormData.supervisorExpertise ? editFormData.supervisorExpertise.split(',').map(e => e.trim()) : [],
        internalExpertise: editFormData.internalExpertise ? editFormData.internalExpertise.split(',').map(e => e.trim()) : [],
        externalExpertise: editFormData.externalExpertise ? editFormData.externalExpertise.split(',').map(e => e.trim()) : [],
        // Ensure other fields like contact are handled correctly if they could be numbers
        contact: String(editFormData.contact || ''),
      };

      const response = await axios.put(`http://localhost:5000/api/admin/users/${currentUser._id}`, dataToSend, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        toast.success(response.data.msg);
        // Update the users list with the updated user
        setUsers(users.map(user => user._id === currentUser._id ? response.data.user : user));
        setShowEditModal(false);
        setCurrentUser(null);
        setEditFormData({});
      } else {
        setError(response.data.msg || 'Failed to save changes');
        toast.error(response.data.msg || 'Failed to save changes');
      }
    } catch (err) {
      console.error('Error saving changes:', err);
      setError(err.response?.data?.msg || 'Failed to save changes');
      toast.error(err.response?.data?.msg || 'Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  // Handle Delete button click
  const handleDeleteClick = (user) => {
    setCurrentUser(user);
    setShowDeleteModal(true);
  };

  // Handle Confirm Delete
  const handleConfirmDelete = async () => {
    if (!currentUser) return;
    setSaving(true);
    setError(null);
    try {
      const token = localStorage.getItem('adminToken');
      const response = await axios.delete(`http://localhost:5000/api/admin/users/${currentUser._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        toast.success(response.data.msg);
        // Remove the deleted user from the list
        setUsers(users.filter(user => user._id !== currentUser._id));
        setShowDeleteModal(false);
        setCurrentUser(null);
      } else {
        setError(response.data.msg || 'Failed to delete user');
        toast.error(response.data.msg || 'Failed to delete user');
      }
    } catch (err) {
      console.error('Error deleting user:', err);
      setError(err.response?.data?.msg || 'Failed to delete user');
      toast.error(err.response?.data?.msg || 'Failed to delete user');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminSidebarLayout>
      <div className="admin-dashboard-container">
        <h1 className="dashboard-title">User Management</h1>

        <div className="filter-buttons mb-3">
          {userRoles.map(role => (
            <Button
              key={role}
              variant={filteredRole === (role === 'All' ? '' : role) ? 'primary' : 'secondary'}
              onClick={() => handleFilterClick(role)}
              className="me-2"
            >
              {role}
            </Button>
          ))}
        </div>

        {loading ? (
          <Spinner animation="border" />
        ) : error ? (
          <div className="error-message">{error}</div>
        ) : (
          <div className="user-table-container">
            <table className="user-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Department</th>
                  {/* Add more headers based on common/relevant fields */}
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.length > 0 ? (
                  users.map(user => (
                    <tr key={user._id}>
                      <td>{user.name}</td>
                      <td>{user.email}</td>
                      <td>{user.role}</td>
                      <td>{user.department || 'N/A'}</td>
                      {/* Render other relevant user data here */}
                      <td>
                        <Button variant="info" size="sm" className="me-2" onClick={() => handleEditClick(user)}>Edit</Button>
                        <Button variant="danger" size="sm" onClick={() => handleDeleteClick(user)}>Delete</Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="text-center">No users found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Edit User Modal */}
        <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title>Edit User</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {currentUser && (
              <Form>
                <Form.Group className="mb-3">
                  <Form.Label>Name</Form.Label>
                  <Form.Control type="text" name="name" value={editFormData.name || ''} onChange={handleEditFormChange} />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Email</Form.Label>
                  {/* Email should probably not be editable or handle carefully */}
                  <Form.Control type="email" name="email" value={editFormData.email || ''} onChange={handleEditFormChange} disabled />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Department</Form.Label>
                  <Form.Control type="text" name="department" value={editFormData.department || ''} onChange={handleEditFormChange} />
                </Form.Group>
                 <Form.Group className="mb-3">
                  <Form.Label>Contact</Form.Label>
                  <Form.Control type="text" name="contact" value={editFormData.contact || ''} onChange={handleEditFormChange} />
                </Form.Group>
                {/* Add more fields based on the user's role and available data in editFormData */}
                 {currentUser.role === 'student' && (
                   <>
                    <Form.Group className="mb-3">
                      <Form.Label>Student ID</Form.Label>
                      <Form.Control type="text" name="studentId" value={editFormData.studentId || ''} onChange={handleEditFormChange} />
                    </Form.Group>
                    {/* Add other student-specific fields like program, batch, cgpa, groupID, project details if needed */}
                   </>
                 )}
                 {currentUser.role === 'supervisor' && (
                   <>
                    <Form.Group className="mb-3">
                      <Form.Label>Supervisor ID</Form.Label>
                      <Form.Control type="text" name="supervisorId" value={editFormData.supervisorId || ''} onChange={handleEditFormChange} />
                    </Form.Group>
                    <Form.Group className="mb-3">
                      <Form.Label>Expertise (comma separated)</Form.Label>
                      <Form.Control type="text" name="supervisorExpertise" value={editFormData.supervisorExpertise || ''} onChange={handleEditFormChange} />
                    </Form.Group>
                   </>
                 )}
                 {currentUser.role === 'internal' && (
                   <>
                    <Form.Group className="mb-3">
                      <Form.Label>Internal ID</Form.Label>
                      <Form.Control type="text" name="internalId" value={editFormData.internalId || ''} onChange={handleEditFormChange} />
                    </Form.Group>
                     <Form.Group className="mb-3">
                      <Form.Label>Expertise (comma separated)</Form.Label>
                      <Form.Control type="text" name="internalExpertise" value={editFormData.internalExpertise || ''} onChange={handleEditFormChange} />
                    </Form.Group>
                   </>
                 )}
                  {currentUser.role === 'external' && (
                   <>
                     <Form.Group className="mb-3">
                      <Form.Label>External ID</Form.Label>
                      <Form.Control type="text" name="externalId" value={editFormData.externalId || ''} onChange={handleEditFormChange} />
                    </Form.Group>
                     <Form.Group className="mb-3">
                      <Form.Label>Organization</Form.Label>
                      <Form.Control type="text" name="externalOrganization" value={editFormData.externalOrganization || ''} onChange={handleEditFormChange} />
                    </Form.Group>
                      <Form.Group className="mb-3">
                      <Form.Label>Position</Form.Label>
                      <Form.Control type="text" name="externalPosition" value={editFormData.externalPosition || ''} onChange={handleEditFormChange} />
                    </Form.Group>
                      <Form.Group className="mb-3">
                      <Form.Label>Expertise (comma separated)</Form.Label>
                      <Form.Control type="text" name="externalExpertise" value={editFormData.externalExpertise || ''} onChange={handleEditFormChange} />
                    </Form.Group>
                   </>
                 )}
                {/* Password change is excluded */}
              </Form>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowEditModal(false)}>
              Close
            </Button>
            <Button variant="primary" onClick={handleSaveChanges} disabled={saving}>
              {saving ? <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" /> : ''} Save Changes
            </Button>
          </Modal.Footer>
        </Modal>

        {/* Delete Confirmation Modal */}
        <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title>Confirm Delete</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            Are you sure you want to delete user: {currentUser?.name} ({currentUser?.email})?
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleConfirmDelete} disabled={saving}>
              {saving ? <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" /> : ''} Delete
            </Button>
          </Modal.Footer>
        </Modal>

      </div>
    </AdminSidebarLayout>
  );
};

export default UserManagement;
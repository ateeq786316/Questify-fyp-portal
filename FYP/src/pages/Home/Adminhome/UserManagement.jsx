import React, { useState, useEffect } from 'react';
import { 
  FiSearch, 
  FiUser, 
  FiUsers, 
  FiHome, 
  FiGlobe,
  FiToggleLeft, 
  FiToggleRight, 
  FiEdit2, 
  FiTrash2,
  FiArrowLeft
} from 'react-icons/fi';
import { FaBars, FaHome as FaHomeIcon, FaUsers as FaUsersIcon, FaCalendarAlt, FaCog, FaGraduationCap, FaChartPie } from 'react-icons/fa';
import '../../../styles/shared.css';
import './UserManagement.css';
import AdminSidebarLayout from '../../../components/AdminSidebarLayout';

const UserManagement = () => {
  // User Management state
  const [activeTab, setActiveTab] = useState('students');
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [filteredSupervisors, setFilteredSupervisors] = useState([]);
  const [filteredInternal, setFilteredInternal] = useState([]);
  const [filteredExternal, setFilteredExternal] = useState([]);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [formErrors, setFormErrors] = useState({
    student: {},
    supervisor: {},
    internal: {},
    external: {}
  });

  // Form states
  const [newStudent, setNewStudent] = useState({
    groupId: '',
    members: [{ name: '', email: '' }],
    status: 'Pending',
    isActive: true,
    project: ''
  });

  const [newSupervisor, setNewSupervisor] = useState({
    name: '',
    email: '',
    isActive: true,
    department: '',
    maxGroups: 1
  });

  const [newInternal, setNewInternal] = useState({
    name: '',
    email: '',
    domain: '',
    isActive: true
  });

  const [newExternal, setNewExternal] = useState({
    name: '',
    email: '',
    domain: '',
    isActive: true
  });

  // Sample data
  const [students, setStudents] = useState([
    {
      id: 1,
      groupId: 'GRP-2023-001',
      members: [
        { name: 'John Smith', email: 'john@university.edu' },
        { name: 'Sarah Johnson', email: 'sarah@university.edu' },
        { name: 'Michael Brown', email: 'michael@university.edu' }
      ],
      status: 'Pending',
      isActive: true,
      project: 'AI Chatbot Development'
    },
    {
      id: 2,
      groupId: 'GRP-2023-002',
      members: [
        { name: 'Emily Davis', email: 'emily@university.edu' },
        { name: 'Robert Wilson', email: 'robert@university.edu' }
      ],
      status: 'Complete',
      isActive: true,
      project: 'Blockchain Implementation'
    }
  ]);

  const [supervisors, setSupervisors] = useState([
    { 
      id: 1, 
      name: 'Dr. James Miller', 
      email: 'james@university.edu', 
      isActive: true,
      department: 'Computer Science',
      maxGroups: 3
    },
    { 
      id: 2, 
      name: 'Prof. Jennifer Lee', 
      email: 'jennifer@university.edu', 
      isActive: false,
      department: 'Data Science',
      maxGroups: 2
    }
  ]);

  const [internalUsers, setInternalUsers] = useState([
    {
      id: 1,
      name: 'Internal Admin',
      email: 'admin.internal@university.edu',
      domain: 'Administration',
      isActive: true
    },
    {
      id: 2,
      name: 'IT Support',
      email: 'it.support@university.edu',
      domain: 'Information Technology',
      isActive: true
    }
  ]);

  const [externalUsers, setExternalUsers] = useState([
    {
      id: 1,
      name: 'Industry Partner',
      email: 'contact@techcompany.com',
      domain: 'Industry Collaboration',
      isActive: true
    },
    {
      id: 2,
      name: 'Research Collaborator',
      email: 'researcher@otheruni.edu',
      domain: 'Academic Research',
      isActive: false
    }
  ]);

  // Filter users based on search term
  useEffect(() => {
    if (activeTab === 'students') {
      const filtered = students.filter(student => 
        student.groupId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.members.some(member => 
          member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          member.email.toLowerCase().includes(searchTerm.toLowerCase())
        ) ||
        student.project.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredStudents(filtered);
    } 
    else if (activeTab === 'supervisors') {
      const filtered = supervisors.filter(supervisor => 
        supervisor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        supervisor.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        supervisor.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
        supervisor.id.toString().includes(searchTerm)
      );
      setFilteredSupervisors(filtered);
    }
    else if (activeTab === 'internal') {
      const filtered = internalUsers.filter(user => 
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.domain.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.id.toString().includes(searchTerm)
      );
      setFilteredInternal(filtered);
    }
    else if (activeTab === 'external') {
      const filtered = externalUsers.filter(user => 
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.domain.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.id.toString().includes(searchTerm)
      );
      setFilteredExternal(filtered);
    }
  }, [searchTerm, activeTab, students, supervisors, internalUsers, externalUsers]);

  // Toggle functions for each user type
  const toggleStudentStatus = (studentId) => {
    setStudents(students.map(student => 
      student.id === studentId 
        ? { ...student, isActive: !student.isActive } 
        : student
    ));
  };

  const toggleSupervisorStatus = (supervisorId) => {
    setSupervisors(supervisors.map(supervisor => 
      supervisor.id === supervisorId 
        ? { ...supervisor, isActive: !supervisor.isActive } 
        : supervisor
    ));
  };

  const toggleInternalStatus = (userId) => {
    setInternalUsers(internalUsers.map(user => 
      user.id === userId 
        ? { ...user, isActive: !user.isActive } 
        : user
    ));
  };

  const toggleExternalStatus = (userId) => {
    setExternalUsers(externalUsers.map(user => 
      user.id === userId 
        ? { ...user, isActive: !user.isActive } 
        : user
    ));
  };

  // Delete functions for each user type
  const deleteStudent = (studentId) => {
    setStudents(students.filter(student => student.id !== studentId));
  };

  const deleteSupervisor = (supervisorId) => {
    setSupervisors(supervisors.filter(supervisor => supervisor.id !== supervisorId));
  };

  const deleteInternal = (userId) => {
    setInternalUsers(internalUsers.filter(user => user.id !== userId));
  };

  const deleteExternal = (userId) => {
    setExternalUsers(externalUsers.filter(user => user.id !== userId));
  };

  // Get current filtered data based on active tab
  const getCurrentData = () => {
    switch (activeTab) {
      case 'students':
        return filteredStudents;
      case 'supervisors':
        return filteredSupervisors;
      case 'internal':
        return filteredInternal;
      case 'external':
        return filteredExternal;
      default:
        return [];
    }
  };

  // Get all data count based on active tab
  const getAllDataCount = () => {
    switch (activeTab) {
      case 'students':
        return students.length;
      case 'supervisors':
        return supervisors.length;
      case 'internal':
        return internalUsers.length;
      case 'external':
        return externalUsers.length;
      default:
        return 0;
    }
  };

  // Render appropriate table based on active tab
  const renderTable = () => {
    const data = getCurrentData();
    
    if (activeTab === 'students') {
      return (
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Group ID</th>
              <th>Members</th>
              <th>Project</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {data.map((student, index) => (
              <tr key={student.id} className={!student.isActive ? 'inactive' : ''}>
                <td>{index + 1}</td>
                <td className="group-id">{student.groupId}</td>
                <td>
                  <div className="members">
                    {student.members.map((member, i) => (
                      <div key={i} className="member">
                        <div className="member-name">{member.name}</div>
                        <div className="member-email">{member.email}</div>
                      </div>
                    ))}
                  </div>
                </td>
                <td className="project">{student.project}</td>
                <td>
                  <span className={`status-badge ${student.status.toLowerCase()}`}>
                    {student.status}
                  </span>
                </td>
                <td>
                  <div className="actions">
                    <button 
                      className={`toggle-btn ${student.isActive ? 'active' : 'inactive'}`}
                      onClick={() => toggleStudentStatus(student.id)}
                    >
                      {student.isActive ? <FiToggleLeft /> : <FiToggleRight />}
                      {student.isActive ? 'Active' : 'Inactive'}
                    </button>
                    <button className="edit-btn"><FiEdit2 /></button>
                    <button 
                      className="delete-btn"
                      onClick={() => deleteStudent(student.id)}
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      );
    } 
    else if (activeTab === 'supervisors') {
      return (
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>ID</th>
              <th>Name</th>
              <th>Department</th>
              <th>Max Groups</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {data.map((supervisor, index) => (
              <tr key={supervisor.id} className={!supervisor.isActive ? 'inactive' : ''}>
                <td>{index + 1}</td>
                <td className="supervisor-id">SUP-{supervisor.id.toString().padStart(3, '0')}</td>
                <td>
                  <div className="supervisor-name">{supervisor.name}</div>
                  <div className="supervisor-email">{supervisor.email}</div>
                </td>
                <td className="department">{supervisor.department}</td>
                <td className="max-groups">{supervisor.maxGroups}</td>
                <td>
                  <span className={`status-badge ${supervisor.isActive ? 'active' : 'inactive'}`}>
                    {supervisor.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td>
                  <div className="actions">
                    <button 
                      className={`toggle-btn ${supervisor.isActive ? 'active' : 'inactive'}`}
                      onClick={() => toggleSupervisorStatus(supervisor.id)}
                    >
                      {supervisor.isActive ? <FiToggleLeft /> : <FiToggleRight />}
                      {supervisor.isActive ? 'Active' : 'Inactive'}
                    </button>
                    <button className="edit-btn"><FiEdit2 /></button>
                    <button 
                      className="delete-btn"
                      onClick={() => deleteSupervisor(supervisor.id)}
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      );
    }
    else if (activeTab === 'internal') {
      return (
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Domain</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {data.map((user, index) => (
              <tr key={user.id} className={!user.isActive ? 'inactive' : ''}>
                <td>{index + 1}</td>
                <td className="user-id">INT-{user.id.toString().padStart(3, '0')}</td>
                <td className="user-name">{user.name}</td>
                <td className="user-email">{user.email}</td>
                <td className="domain">{user.domain}</td>
                <td>
                  <span className={`status-badge ${user.isActive ? 'active' : 'inactive'}`}>
                    {user.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td>
                  <div className="actions">
                    <button 
                      className={`toggle-btn ${user.isActive ? 'active' : 'inactive'}`}
                      onClick={() => toggleInternalStatus(user.id)}
                    >
                      {user.isActive ? <FiToggleLeft /> : <FiToggleRight />}
                      {user.isActive ? 'Active' : 'Inactive'}
                    </button>
                    <button className="edit-btn"><FiEdit2 /></button>
                    <button 
                      className="delete-btn"
                      onClick={() => deleteInternal(user.id)}
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      );
    }
    else if (activeTab === 'external') {
      return (
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Domain</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {data.map((user, index) => (
              <tr key={user.id} className={!user.isActive ? 'inactive' : ''}>
                <td>{index + 1}</td>
                <td className="user-id">EXT-{user.id.toString().padStart(3, '0')}</td>
                <td className="user-name">{user.name}</td>
                <td className="user-email">{user.email}</td>
                <td className="domain">{user.domain}</td>
                <td>
                  <span className={`status-badge ${user.isActive ? 'active' : 'inactive'}`}>
                    {user.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td>
                  <div className="actions">
                    <button 
                      className={`toggle-btn ${user.isActive ? 'active' : 'inactive'}`}
                      onClick={() => toggleExternalStatus(user.id)}
                    >
                      {user.isActive ? <FiToggleLeft /> : <FiToggleRight />}
                      {user.isActive ? 'Active' : 'Inactive'}
                    </button>
                    <button className="edit-btn"><FiEdit2 /></button>
                    <button 
                      className="delete-btn"
                      onClick={() => deleteExternal(user.id)}
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      );
    }
  };

  // Render add new form based on active tab
  const renderAddForm = () => {
    if (activeTab === 'students') {
      return (
        <div className="add-form-container">
          <button className="back-button" onClick={() => setIsAddingNew(false)}>
            <FiArrowLeft /> Back to {activeTab}
          </button>
          <h3>Add New Student Group</h3>
          
          <div className="form-group">
            <label>Group ID {formErrors.student.groupId && <span className="error-message">{formErrors.student.groupId}</span>}</label>
            <input 
              type="text" 
              value={newStudent.groupId}
              onChange={(e) => setNewStudent({...newStudent, groupId: e.target.value})}
              placeholder="Enter group ID (e.g., GRP-2023-001)"
              className={formErrors.student.groupId ? 'error' : ''}
            />
          </div>
          
          <div className="form-group">
            <label>Project Title {formErrors.student.project && <span className="error-message">{formErrors.student.project}</span>}</label>
            <input 
              type="text" 
              value={newStudent.project}
              onChange={(e) => setNewStudent({...newStudent, project: e.target.value})}
              placeholder="Enter project title"
              className={formErrors.student.project ? 'error' : ''}
            />
          </div>
          
          <div className="form-group">
            <label>Status</label>
            <select
              value={newStudent.status}
              onChange={(e) => setNewStudent({...newStudent, status: e.target.value})}
            >
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Complete">Complete</option>
            </select>
          </div>
          
          <div className="form-group">
            <label>Group Members</label>
            {newStudent.members.map((member, index) => (
              <div key={index} className="member-input-group">
                <div className="input-wrapper">
                  <input
                    type="text"
                    value={member.name}
                    onChange={(e) => handleMemberChange(index, 'name', e.target.value)}
                    placeholder="Member name"
                    className={formErrors.student[`memberName${index}`] ? 'error' : ''}
                  />
                  {formErrors.student[`memberName${index}`] && <span className="error-message">{formErrors.student[`memberName${index}`]}</span>}
                </div>
                <div className="input-wrapper">
                  <input
                    type="email"
                    value={member.email}
                    onChange={(e) => handleMemberChange(index, 'email', e.target.value)}
                    placeholder="Member email"
                    className={formErrors.student[`memberEmail${index}`] ? 'error' : ''}
                  />
                  {formErrors.student[`memberEmail${index}`] && <span className="error-message">{formErrors.student[`memberEmail${index}`]}</span>}
                </div>
                {newStudent.members.length > 1 && (
                  <button 
                    className="remove-member-btn"
                    onClick={() => removeMemberField(index)}
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
            <button 
              className="add-member-btn"
              onClick={addMemberField}
            >
              + Add Another Member
            </button>
          </div>
          
          <div className="form-group checkbox-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={newStudent.isActive}
                onChange={(e) => setNewStudent({...newStudent, isActive: e.target.checked})}
              />
              <span className="checkmark"></span>
              Active
            </label>
          </div>
          
          <button className="submit-button" onClick={addStudent}>
            Add Student Group
          </button>
        </div>
      );
    } 
    else if (activeTab === 'supervisors') {
      return (
        <div className="add-form-container">
          <button className="back-button" onClick={() => setIsAddingNew(false)}>
            <FiArrowLeft /> Back to {activeTab}
          </button>
          <h3>Add New Supervisor</h3>
          
          <div className="form-group">
            <label>Name {formErrors.supervisor.name && <span className="error-message">{formErrors.supervisor.name}</span>}</label>
            <input 
              type="text" 
              value={newSupervisor.name}
              onChange={(e) => setNewSupervisor({...newSupervisor, name: e.target.value})}
              placeholder="Enter supervisor name"
              className={formErrors.supervisor.name ? 'error' : ''}
            />
          </div>
          
          <div className="form-group">
            <label>Email {formErrors.supervisor.email && <span className="error-message">{formErrors.supervisor.email}</span>}</label>
            <input 
              type="email" 
              value={newSupervisor.email}
              onChange={(e) => setNewSupervisor({...newSupervisor, email: e.target.value})}
              placeholder="Enter supervisor email"
              className={formErrors.supervisor.email ? 'error' : ''}
            />
          </div>
          
          <div className="form-group">
            <label>Department {formErrors.supervisor.department && <span className="error-message">{formErrors.supervisor.department}</span>}</label>
            <input 
              type="text" 
              value={newSupervisor.department}
              onChange={(e) => setNewSupervisor({...newSupervisor, department: e.target.value})}
              placeholder="Enter department"
              className={formErrors.supervisor.department ? 'error' : ''}
            />
          </div>
          
          <div className="form-group">
            <label>Maximum Groups {formErrors.supervisor.maxGroups && <span className="error-message">{formErrors.supervisor.maxGroups}</span>}</label>
            <input 
              type="number" 
              min="1"
              value={newSupervisor.maxGroups}
              onChange={(e) => setNewSupervisor({...newSupervisor, maxGroups: parseInt(e.target.value) || 1})}
              placeholder="Enter maximum groups"
              className={formErrors.supervisor.maxGroups ? 'error' : ''}
            />
          </div>
          
          <div className="form-group checkbox-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={newSupervisor.isActive}
                onChange={(e) => setNewSupervisor({...newSupervisor, isActive: e.target.checked})}
              />
              <span className="checkmark"></span>
              Active
            </label>
          </div>
          
          <button className="submit-button" onClick={addSupervisor}>
            Add Supervisor
          </button>
        </div>
      );
    }
    else if (activeTab === 'internal') {
      return (
        <div className="add-form-container">
          <button className="back-button" onClick={() => setIsAddingNew(false)}>
            <FiArrowLeft /> Back to {activeTab}
          </button>
          <h3>Add New Internal User</h3>
          
          <div className="form-group">
            <label>Name {formErrors.internal.name && <span className="error-message">{formErrors.internal.name}</span>}</label>
            <input 
              type="text" 
              value={newInternal.name}
              onChange={(e) => setNewInternal({...newInternal, name: e.target.value})}
              placeholder="Enter user name"
              className={formErrors.internal.name ? 'error' : ''}
            />
          </div>
          
          <div className="form-group">
            <label>Email {formErrors.internal.email && <span className="error-message">{formErrors.internal.email}</span>}</label>
            <input 
              type="email" 
              value={newInternal.email}
              onChange={(e) => setNewInternal({...newInternal, email: e.target.value})}
              placeholder="Enter user email"
              className={formErrors.internal.email ? 'error' : ''}
            />
          </div>
          
          <div className="form-group">
            <label>Domain {formErrors.internal.domain && <span className="error-message">{formErrors.internal.domain}</span>}</label>
            <input 
              type="text" 
              value={newInternal.domain}
              onChange={(e) => setNewInternal({...newInternal, domain: e.target.value})}
              placeholder="Enter domain/role"
              className={formErrors.internal.domain ? 'error' : ''}
            />
          </div>
          
          <div className="form-group checkbox-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={newInternal.isActive}
                onChange={(e) => setNewInternal({...newInternal, isActive: e.target.checked})}
              />
              <span className="checkmark"></span>
              Active
            </label>
          </div>
          
          <button className="submit-button" onClick={addInternal}>
            Add Internal User
          </button>
        </div>
      );
    }
    else if (activeTab === 'external') {
      return (
        <div className="add-form-container">
          <button className="back-button" onClick={() => setIsAddingNew(false)}>
            <FiArrowLeft /> Back to {activeTab}
          </button>
          <h3>Add New External User</h3>
          
          <div className="form-group">
            <label>Name {formErrors.external.name && <span className="error-message">{formErrors.external.name}</span>}</label>
            <input 
              type="text" 
              value={newExternal.name}
              onChange={(e) => setNewExternal({...newExternal, name: e.target.value})}
              placeholder="Enter user name"
              className={formErrors.external.name ? 'error' : ''}
            />
          </div>
          
          <div className="form-group">
            <label>Email {formErrors.external.email && <span className="error-message">{formErrors.external.email}</span>}</label>
            <input 
              type="email" 
              value={newExternal.email}
              onChange={(e) => setNewExternal({...newExternal, email: e.target.value})}
              placeholder="Enter user email"
              className={formErrors.external.email ? 'error' : ''}
            />
          </div>
          
          <div className="form-group">
            <label>Domain {formErrors.external.domain && <span className="error-message">{formErrors.external.domain}</span>}</label>
            <input 
              type="text" 
              value={newExternal.domain}
              onChange={(e) => setNewExternal({...newExternal, domain: e.target.value})}
              placeholder="Enter domain/role"
              className={formErrors.external.domain ? 'error' : ''}
            />
          </div>
          
          <div className="form-group checkbox-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={newExternal.isActive}
                onChange={(e) => setNewExternal({...newExternal, isActive: e.target.checked})}
              />
              <span className="checkmark"></span>
              Active
            </label>
          </div>
          
          <button className="submit-button" onClick={addExternal}>
            Add External User
          </button>
        </div>
      );
    }
  };

  return (
    <AdminSidebarLayout>
        <div className="header">
          <h2><FiUsers className="icon" /> User Management System</h2>
          {!isAddingNew && (
            <div className="search-box">
              <FiSearch className="search-icon" />
              <input
                type="text"
                placeholder={`Search ${activeTab} by name, ID, email, domain...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          )}
        </div>
        
        {!isAddingNew ? (
          <>
            <div className="tabs">
              <button 
                className={`tab ${activeTab === 'students' ? 'active' : ''}`}
                onClick={() => {
                  setActiveTab('students');
                  setSearchTerm('');
                }}
              >
                <FiUsers /> Student Groups
              </button>
              <button 
                className={`tab ${activeTab === 'supervisors' ? 'active' : ''}`}
                onClick={() => {
                  setActiveTab('supervisors');
                  setSearchTerm('');
                }}
              >
                <FiUser /> Supervisors
              </button>
              <button 
                className={`tab ${activeTab === 'internal' ? 'active' : ''}`}
                onClick={() => {
                  setActiveTab('internal');
                  setSearchTerm('');
                }}
              >
                <FiHome /> Internal
              </button>
              <button 
                className={`tab ${activeTab === 'external' ? 'active' : ''}`}
                onClick={() => {
                  setActiveTab('external');
                  setSearchTerm('');
                }}
              >
                <FiGlobe /> External
              </button>
            </div>
            
            <div className="content">
              <div className="action-bar">
                <button 
                  className="add-button"
                  onClick={() => setIsAddingNew(true)}
                >
                  + Add New {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
                </button>
                <div className="results-count">
                  Showing {getCurrentData().length} of {getAllDataCount()} {activeTab}
                </div>
              </div>
              
              <div className="table-container">
                {renderTable()}
              </div>
            </div>
          </>
        ) : (
          <div className="content">
            {renderAddForm()}
          </div>
        )}
    </AdminSidebarLayout>
  );
};

export default UserManagement;
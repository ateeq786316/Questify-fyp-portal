import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css'
import { BrowserRouter as Router, Route, Routes } from "react-router-dom"
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider } from './context/AuthContext';

// testing page
import Test from './pages/Home/Studenthome/Test.jsx'

// imported main pages
import PortalPage from './PortalPage.jsx'
import LandingPage from './LandingPage'
import ContactUs from './ContactUs.jsx'
import AboutUs from './AboutUs.jsx'

// student
import StudentLogin from './pages/Home/Studenthome/Studentlogin.jsx'
import ChatbotPage from './pages/Home/Studenthome/StudentChatbot.jsx'
import ProposalPage from './pages/Home/Studenthome/Proposal.jsx'
import StudentDashboard from './pages/Home/Studenthome/Studentdashboard.jsx'
import StudentTrackProgress from './pages/Home/Studenthome/StudentTrackProgress.jsx'
import StudentRequestSupervisor from './pages/Home/Studenthome/StudentRequestSupervisor.jsx'
import StudentUploadDocument from './pages/Home/Studenthome/StudentUploadDocument.jsx'
import StudentFeedbackComments from './pages/Home/Studenthome/StudentFeedbackComments.jsx'
import StudentCommunication from './pages/Home/Studenthome/StudentCommunication.jsx'

// supervisor
import SupervisorLogin from './pages/Home/Superviserhome/Supervisorlogin.jsx'
import SupervisorDashboard from './pages/Home/Superviserhome/SupervisorDashboard.jsx'
import ReviewDocument from './pages/Home/Superviserhome/ReviewDocument.jsx'
import SupervisorEvaluate from './pages/Home/Superviserhome/SupervisorEvaluate.jsx'

// internal
import InternalLogin from './pages/Home/Internalhome/InternalLogin.jsx';
import InternalDashboard from './pages/Home/Internalhome/InternalDashboard.jsx'

// external
import ExternalLogin from './pages/Home/Externalhome/ExternalLogin.jsx';
import ExternalDashboard from './pages/Home/Externalhome/ExternalDashboard.jsx';
import ExternalEvaluate from './pages/Home/Externalhome/ExternalEvaluate.jsx';

// admin
import AdminLogin from './pages/Home/Adminhome/AdminLogin.jsx'
import AdminDashboard from './pages/Home/Adminhome/AdminDashboard.jsx'
import UserManagement from './pages/Home/Adminhome/UserManagement.jsx'
import StudentUpload from './pages/Home/Adminhome/StudentUpload.jsx'
import UploadSupervisors from './pages/Home/Adminhome/UploadSupervisors'
import Milestones from './pages/Home/Adminhome/Milestones'

// protected route
import ProtectedRoute from './components/ProtectedRoute'

function App() {
  return (
    <Router>
      <AuthProvider>
        <ToastContainer position="top-right" autoClose={3000} />
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/intro" element={<LandingPage />} />
          <Route path="/login" element={<PortalPage />} />
          <Route path="/contactus" element={<ContactUs />} />
          <Route path="/aboutus" element={<AboutUs />} />
          
          <Route path="/studentlogin" element={<StudentLogin />} />
          <Route path='/adminlogin' element={<AdminLogin />} /> 
          <Route path="/supervisorlogin" element={<SupervisorLogin />} />
          <Route path="/internallogin" element={<InternalLogin />} />
          <Route path="/externallogin" element={<ExternalLogin />} />

          {/* Protected Student Routes */}
          <Route path='/studentdashboard' element={
            <ProtectedRoute>
              <StudentDashboard />
            </ProtectedRoute>
          } />
          <Route path='/studentproposal' element={
            <ProtectedRoute>
              <ProposalPage />
            </ProtectedRoute>
          } />
          <Route path='/studentrequestsuperviser' element={
            <ProtectedRoute>
              <StudentRequestSupervisor />
            </ProtectedRoute>
          } />
          <Route path='/studentchatbot' element={
            <ProtectedRoute>
              <ChatbotPage />
            </ProtectedRoute>
          } />
          <Route path='/studenttrackprogress' element={
            <ProtectedRoute>
              <StudentTrackProgress />
            </ProtectedRoute>
          } />
          <Route path='/studentuploaddocument' element={
            <ProtectedRoute>
              <StudentUploadDocument />
            </ProtectedRoute>
          } />
          <Route path='/studentfeedbackcomments' element={
            <ProtectedRoute>
              <StudentFeedbackComments />
            </ProtectedRoute>
          } />
          <Route path='/studentcommunication' element={
            <ProtectedRoute>
              <StudentCommunication />
            </ProtectedRoute>
          } />

          {/* Supervisor Routes */}
          <Route path='/supervisordashboard' element={
            <ProtectedRoute>
              <SupervisorDashboard />
            </ProtectedRoute>
          } />
          <Route path='/supervisor/reviewdocument' element={
            <ProtectedRoute>
              <ReviewDocument />
            </ProtectedRoute>
          } />
          <Route path='/supervisor/evaluate' element={
            <ProtectedRoute>
              <SupervisorEvaluate />
            </ProtectedRoute>
          } />

          {/* Internal Routes */}
          <Route path='/internaldashboard' element={
            <ProtectedRoute>
              <InternalDashboard />
            </ProtectedRoute>
          } />

          {/* Admin Routes */}
          <Route path='/admindashboard' element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          } />
          <Route path='/usermanagement' element={
            <ProtectedRoute>
              <UserManagement />
            </ProtectedRoute>
          } />
          <Route path='/admin/upload-students' element={
            <ProtectedRoute>
              <StudentUpload />
            </ProtectedRoute>
          } />
          <Route path="/admin/upload-supervisors" element={
            <ProtectedRoute>
              <UploadSupervisors />
            </ProtectedRoute>
          } />
          <Route path="/admin/milestones" element={
            <ProtectedRoute>
              <Milestones />
            </ProtectedRoute>
          } />

          {/* External Routes */}
          <Route path='/externaldashboard' element={
            <ProtectedRoute>
              <ExternalDashboard />
            </ProtectedRoute>
          } />
          <Route path='/external/evaluate' element={
            <ProtectedRoute>
              <ExternalEvaluate />
            </ProtectedRoute>
          } />

          {/* Test Route */}
          <Route path='/test' element={<Test />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
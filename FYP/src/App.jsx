import 'bootstrap/dist/css/bootstrap.min.css'
import { BrowserRouter as Router, Route, Routes } from "react-router-dom"

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

// internal
// import InternalLogin from './pages/Home/Internalhome/InternalLogin.jsx'
import InternalDashboard from './pages/Home/Internalhome/InternalDashboard.jsx'

// admin
import AdminLogin from './pages/Home/Adminhome/AdminLogin.jsx'
import AdminDashboard from './pages/Home/Adminhome/AdminDashboard.jsx'
import UserManagement from './pages/Home/Adminhome/UserManagement.jsx'
import StudentUpload from './pages/Home/Adminhome/StudentUpload.jsx'

// protected route
import ProtectedRoute from './components/ProtectedRoute'

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/intro" element={<LandingPage />} />
        <Route path="/login" element={<PortalPage />} />
        <Route path="/contactus" element={<ContactUs />} />
        <Route path="/aboutus" element={<AboutUs />} />
        
        <Route path="/studentlogin" element={<StudentLogin />} />

        {/*========================================== Protected Student Routes ==========================================*/}
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

        {/*========================================== Supervisor Routes ==========================================*/}
        <Route path="/supervisorlogin" element={<SupervisorLogin />} />
        <Route path='/supervisordashboard' element={<SupervisorDashboard />} />
        <Route path='/reviewdocument' element={<ReviewDocument />} />

        {/*========================================== Internal Routes ==========================================*/}
        {/* <Route path="/internallogin" element={<InternalLogin />} /> */}
        <Route path='/internaldashboard' element={<InternalDashboard />} />

        {/*========================================== Admin Routes ==========================================*/}
        <Route path='/adminlogin' element={<AdminLogin />} /> 
        <Route path='/admindashboard' element={<AdminDashboard />} />
        <Route path='/usermanagement' element={<UserManagement />} />
        <Route path='/admin/upload-students' element={<StudentUpload />} />
        {/* Test Route */}
        <Route path='/test' element={<Test />} />
      </Routes>
    </Router>
  )
}

export default App;
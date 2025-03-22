import 'bootstrap/dist/css/bootstrap.min.css'
import { BrowserRouter as Router, Route, Routes } from "react-router-dom"

// imported pages
// main
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

import Test from './pages/Home/Studenthome/Test.jsx'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/intro" element={<LandingPage />} />
        <Route path="/login" element={<PortalPage />} />
        <Route path="/contactus" element={<ContactUs />} />
        <Route path="/aboutus" element={<AboutUs />} />

        <Route path="/studentlogin" element={<StudentLogin />} />

        <Route path='/studentdashboard' element={<StudentDashboard />} />
        <Route path='/studentproposal' element={<ProposalPage />} />
        <Route path='/studentrequestsuperviser' element={<StudentRequestSupervisor />} />
        <Route path='/studentchatbot' element={<ChatbotPage />} />
        <Route path='/studenttrackprogress' element={<StudentTrackProgress />} />
        <Route path='/studentuploaddocument' element={<StudentUploadDocument />} />
        <Route path='/studentfeedbackcomments' element={<StudentFeedbackComments />} />
        <Route path='/studentcommunication' element={<StudentCommunication />} />


        <Route path="/supervisorlogin" element={<SupervisorLogin />} />
        <Route path='/supervisordashboard' element={<SupervisorDashboard />} />

        <Route path='/test' element={<Test />} />
      </Routes>
    </Router>
  )
}
export default App;
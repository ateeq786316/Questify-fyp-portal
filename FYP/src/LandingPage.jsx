import React from 'react';
import { Container, Row, Col, Button } from 'react-bootstrap';
import lgubgimg from './assets/lgubgimg.jpg'; // Background image
import Navbar from './components/Navbar';
import { useNavigate } from 'react-router-dom'; // Import useNavigate


function LandingPage() {
  const navigate = useNavigate(); // Initialize useNavigate

  const handleLoginClick = () => {
    navigate('/login'); // Navigate to the /login route
  };



  return (
    <div
      className="container-fluid vh-100 d-flex align-items-center justify-content-center"
      style={{
        backgroundImage: `url("${lgubgimg}")`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        minHeight: '100vh',
      }}
    >
      <Navbar/>

      {/* Main Content */}
      <div className="container mt-0">
        <div className="row justify-content-center">
          <div className="col-md-6">
            <div
              className="card shadow-lg p-5"
              style={{ backgroundColor: 'rgba(255, 255, 255, 0.75)' }}
            >
              <div className="card-body">
                <Container>
                  <Row className="justify-content-center">
                    <Col md={12}>
                      <h1 className="text-center mb-4">Welcome to Questify FYP Portal</h1>
                      <p className="text-center mb-5">
                        The portal for managing your final year projects.
                      </p>
                      <div className="text-center"> {/* Center the button */}
                      <Button variant="primary" onClick={handleLoginClick}>
                        Login
                      </Button>
                    </div>                      
                    </Col>
                  </Row>
                </Container>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LandingPage;

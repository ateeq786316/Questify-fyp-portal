import React from 'react';
import './styles/AboutUs.css';
import { Container, Row, Col, Card, Image } from 'react-bootstrap';
import Navbar from './components/Navbar';

// Placeholder images (replace with actual images)
import lguCampus from './assets/lgu-campus.jpg';
import projectManagement from './assets/project-management.jpg';
import studentCollaboration from './assets/student-collaboration.jpg';
import facultyMentor from './assets/faculty-mentor.jpg';
import teamMember1 from './assets/team-member1.jpg';
import teamMember2 from './assets/team-member2.jpg';

function AboutUs() {
  return (
    <div>
    <Navbar/>
    <div className="about-us-page">
      <section className="hero">
        <Image src={lguCampus} fluid className="hero-image" />
        <div className="hero-content">
          <h1 className="display-4">About the FYP Management Portal</h1>
          <p className="lead">Empowering students and faculty in their final year project journey.</p>
        </div>
      </section>

      <Container className="my-5">
        <Row>
          <Col md={6}>
            <Card className="feature-card">
              <Card.Img variant="top" src={projectManagement} alt="Project Management" />
              <Card.Body>
                <Card.Title>Streamlined Project Management</Card.Title>
                <Card.Text>
                  Our portal simplifies the project management process, from proposal submission to final evaluation.
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
          <Col md={6}>
            <Card className="feature-card">
              <Card.Img variant="top" src={studentCollaboration} alt="Student Collaboration" />
              <Card.Body>
                <Card.Title>Enhanced Collaboration</Card.Title>
                <Card.Text>
                  Facilitate seamless collaboration between students and faculty through integrated communication tools.
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        <Row className="mt-4">
          <Col md={6}>
            <Card className="feature-card">
              <Card.Img variant="top" src={facultyMentor} alt="Faculty Mentorship" />
              <Card.Body>
                <Card.Title>Dedicated Faculty Mentorship</Card.Title>
                <Card.Text>
                  Connect with experienced faculty mentors who provide guidance and support throughout your project.
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
          <Col md={6}>
          <Card className="feature-card">
            <div className="mission-vision">
              <h2>Our Mission</h2>
              <p>
                To provide a robust and user-friendly platform that fosters innovation and excellence in final year projects.
              </p>
              <h2>Our Vision</h2>
              <p>
                To become the leading digital hub for final year project management in Lahore Garrison University.
              </p>
            </div>
            </Card>
          </Col>
        </Row>
      </Container>

      <section className="team">
        <Container>
          <h2>Meet the Team</h2>
          <Row className="justify-content-center">
            <Col md={4} className="text-center">
              <div className="team-member">
                <Image src={teamMember1} roundedCircle className="team-image" />
                <h3>ATEEQ UR REHMAN</h3>
                <p>HEAD 1</p>
              </div>
            </Col>
            <Col md={4} className="text-center">
              <div className="team-member">
                <Image src={teamMember2} roundedCircle className="team-image" />
                <h3>MUHAMMAD TALHA</h3>
                <p>HEAD 2</p>
              </div>
            </Col>
            {/* Add more team members as needed */}
          </Row>
        </Container>
      </section>
    </div>
    </div>
  );
}

export default AboutUs;
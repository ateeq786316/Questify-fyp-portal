import React from "react";
import "./Footer.css";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        {/* LGU Contact Info */}
        <div className="footer-section">
          <h4>Lahore Garrison University</h4>
          <ul>
            <li>
              <i className="fas fa-phone"></i> <a href="tel:042-37181821-23">042-37181821-23</a>
            </li>
            <li>
              <i className="fas fa-phone"></i> <a href="tel:04237181827">042 37181827 (Admission Office)</a>
            </li>
            <li>
              <i className="fas fa-phone"></i> <a href="tel:04237181828">042 37181828 (Exam Office)</a>
            </li>
            <li>
              <i className="fas fa-envelope"></i> <a href="mailto:info@lgu.edu.pk">info@lgu.edu.pk</a>
            </li>
            <li>
              <i className="fas fa-clock"></i> Monday - Thursday: 08:00 AM - 04:00 PM
            </li>
            <li>
              <i className="fas fa-clock"></i> Friday: 08:00 AM - 04:00 PM
            </li>
          </ul>
        </div>

        {/* Admissions */}
        <div className="footer-section">
          <h4>Admissions</h4>
          <ul>
            <li><a href="https://lgu.edu.pk/admissions/">How to Apply</a></li>
            <li><a href="https://admissions.lgu.edu.pk/">Apply</a></li>
          </ul>
        </div>

        {/* Useful Links */}
        <div className="footer-section">
          <h4>Useful Links</h4>
          <ul>
            <li><a href="https://lgu.edu.pk/lguweb/about-us/">Who We Are</a></li>
            <li><a href="https://forms.gle/AFxJFd1oQYpQDu5LA">Student Feedback Form</a></li>
          </ul>
        </div>

        {/* Faculties */}
        <div className="footer-section">
          <h4>Faculties</h4>
          <ul>
            <li><a href="https://lgu.edu.pk/department-of-computer-science/">Computer Sciences</a></li>
            <li><a href="https://lgu.edu.pk/department-of-language/">Languages</a></li>
            <li><a href="https://lgu.edu.pk/department-of-social-science/">Social Sciences</a></li>
            <li><a href="https://lgu.edu.pk/department-of-basic-sciences/">Basic Sciences</a></li>
          </ul>
        </div>

        {/* Map Section */}
        <div className="footer-section">
          <h4>Find Us</h4>
          <iframe
            title="LGU Map"
            src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d13612.753178458779!2d74.4426299!3d31.4640061!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0xa6cc469044e1fbc1!2sLahore%20Garrison%20University.!5e0!3m2!1sen!2s!4v1614869774555!5m2!1sen!2s"
            width="100%"
            height="200"
            style={{ border: 0 }}
            allowFullScreen=""
            loading="lazy"
          ></iframe>
        </div>
      </div>

      {/* Footer Bottom */}
      <div className="footer-bottom">
        <p>
          &copy; 2012 - 2024 | <a href="https://lgu.edu.pk/">Lahore Garrison University</a> by LGU | All Rights Reserved |
          Powered by <a href="https://lgu.edu.pk/">ERP Office LGU</a>
        </p>
        <div className="footer-social">
          <a href="https://www.facebook.com/LGUOFFICIALCAMPUS" target="_blank" rel="noopener noreferrer">
            <i className="fab fa-facebook"></i>
          </a>
          <a href="https://www.instagram.com/lguofficialcampus/" target="_blank" rel="noopener noreferrer">
            <i className="fab fa-instagram"></i>
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

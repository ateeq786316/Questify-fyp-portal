
📘 Questify FYP Portal

A MERN-based Final Year Project Management Platform

🚀 Overview

Questify FYP Portal is a web-based platform designed to streamline and digitize Final Year Project (FYP) management for students, supervisors, and administrators.

It centralizes proposal submission, milestone tracking, supervisor feedback, grading, and communication into a single, user-friendly portal. With features like real-time dashboards, notification system, and automated evaluation support, Questify reduces paperwork, speeds up approvals, and ensures grading consistency.

Built on the MERN Stack (MongoDB, Express, React, Node.js), Questify ensures scalability, flexibility, and modern user experience for academic institutions.

✨ Key Features
🎯 Project Management

Project proposal submission with document uploads
Automated supervisor assignment and approval workflow
Progress and milestone tracking with deadlines
Admin panel for proposal approval and final grading

👨‍🏫 Supervisor Dashboard
Real-time student progress monitoring
Feedback and evaluation system
Document access and review in one place

📊 Student Dashboard
Upload proposals, reports, and deliverables
Track project progress and supervisor feedback
Receive real-time notifications on approvals or comments

🛠️ Admin Panel
Manage users (students, supervisors, examiners)
Approve/reject proposals and reports
Assign supervisors and committees
Monitor overall FYP process at a glance

🔔 Communication & Notifications
Real-time notification system for updates and approvals
Supervisor-student feedback loop for better communication

📑 Additional Features
Role-based authentication (Student, Supervisor, Admin)
Error-handling with user-friendly error messages
Secure document upload and storage
Consistent grading and evaluation process

🧑‍💻 Tech Stack
Layer	Technology
Frontend	React.js, HTML5, CSS3, Tailwind/Bootstrap
Backend	Node.js, Express.js
Database	MongoDB (Compass for management)
Authentication	JWT (JSON Web Tokens), bcrypt for password security
Deployment	(Heroku / Render / Railway / Local Deployment Options)
Tools	Git, GitHub, Postman, VS Code
🖼️ Screenshots

### Portal Interface Screenshots

| Portal Page | Login Screen | Student Dashboard |
|-------------|--------------|-------------------|
| ![portal-page](https://github.com/user-attachments/assets/ad0a2a2a-62fc-4ed7-ba28-d6200b460fe2) | ![login](https://github.com/user-attachments/assets/ff620425-c929-4b0a-95c9-c5424c2cc704) | ![student-dashboard](https://github.com/user-attachments/assets/2281bfc7-ac8f-4d62-9967-68c538c330b4) |

| Student Features | Student Dashboard 2 | Student Dashboard 3 |
|------------------|---------------------|---------------------|
| ![Screenshot 2025-05-13 124021](https://github.com/user-attachments/assets/5a5b9004-7b6d-4d6c-b380-627438178f14) | ![Screenshot 2025-05-13 124140](https://github.com/user-attachments/assets/3e66f7b-bc89-477e-883f-2fae69a5d2f3) | ![Screenshot 2025-05-13 124400](https://github.com/user-attachments/assets/67381117-b9cf-49c4-9f9b-41fe826181c9) |

| Student Dashboard 4 | Supervisor Dashboard | Supervisor Documents |
|---------------------|---------------------|---------------------|
| ![Screenshot 2025-03-20 212826](https://github.com/user-attachments/assets/c04e8c9a9-ea0-4df2-a8aa-dab863c47c9f) | ![supervisor-dashboard](https://github.com/user-attachments/assets/1c2748cd-d264-4bed-8138-ffb67e93f9fa) | ![supervisor-dashboard documents checking](https://github.com/user-attachments/assets/226aa440-2848-41dc-97ef-195773ce229a) |

| Supervisor Evaluation | Admin Dashboard | Internal Dashboard |
|----------------------|-----------------|-------------------|
| ![Screenshot 2025-05-21 033535](https://github.com/user-attachments/assets/02613fcd-e9e4-4d28-9b42-823eb71d7b65) | ![admin-dashboard](https://github.com/user-attachments/assets/09d0891c-5b2a-4d16-b602-d542ca5d9ab2) | ![internal-dashboard](https://github.com/user-attachments/assets/8c74c7f3-97ef-405e-adce-d7a7822e3d5b) |

| External Dashboard |
|-------------------|
| ![external-dashboard](https://github.com/user-attachments/assets/e972181-d253-4750-bd29-bcba2c5df047) |

**Login Page, Student, Supervisor, Admin, Internal, External**

⚙️ Setup Instructions
📋 Prerequisites

Node.js (Latest LTS version)
MongoDB (Local or Atlas Cloud)
Git & GitHub
VS Code

🧑‍💻 Clone the Repository
git clone https://github.com/ateeq786316/Questify-fyp-portal.git
cd Questify-FYP-Portal

📦 Install Dependencies
Backend:
cd server
npm install

Frontend:
cd fyp
npm install

🔐 Configure Environment Variables
Create a .env file in the server with:

MONGO_URI=mongodb://127.0.0.1:27017/FYP_LGU
JWT_SECRET=
PORT = 5000
NODE_ENV=development

# gemini key 
GEMINI_API_KEY=
REACT_APP_API_URL=http://localhost:5000/api

#for mail create an app password from email
EMAIL_USER=
EMAIL_PASS=

▶️ Run the App

Start Backend:

cd server
npm start

Start Frontend:

cd fyp
npm run dev


The app will be available at:
http://localhost:3000 (frontend)
http://localhost:5000 (backend API)

📦 Deployment
For deployment:
Frontend can be deployed on Vercel / Netlify
Backend can be deployed on Render / Railway / Heroku
MongoDB hosted on MongoDB Atlas

👥 Team Contributions
Ateeq ur Rehman
Lead Full-Stack Developer
Designed database schema & API architecture
Developed React-based student dashboard
Integrated authentication & user roles
Backend Developer
Worked on proposal submission, approvals, and grading system
Built supervisor/admin dashboard features
Implemented secure file uploads and error handling
Supervisor: Miss Rabia Khan
Guided system requirements & evaluation design
Provided academic oversight

🧠 Challenges Solved
Designing scalable database relationships for students, supervisors, and projects
Fixing non-user-friendly error messages by creating descriptive alerts for better UX
Managing real-time updates and notifications with minimal delays
Ensuring data consistency in grading and approvals across multiple roles

📜 License
MIT License

🙏 Acknowledgements
MERN Stack Open Source Community
Faculty Support & Guidance
Testing feedback from fellow students
=========================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================

Empowering universities with a smart, centralized platform to streamline FYP proposal submissions, milestone tracking, evaluations, and real-time supervisor-student collaboration.

📱 Overview

Questify is a MERN-based web portal designed for universities to manage Final Year Projects efficiently. It reduces paperwork, standardizes evaluations, and enhances communication between students, supervisors, and administrators.

With features like project proposal submission, milestone tracking, real-time supervisor dashboards, automated notifications, and grading consistency, Questify transforms how universities handle FYPs.

👨‍💻 Developed By

Ateeq ur Rehman
Muhammad Talha 

Supervisor: Miss Rabia Khan
📧 Email: Rabia_khan@lgu.edu.pk

🚀 Features

📑 Project Proposal Submission
Upload and manage proposals with structured approval workflow.
✅ Milestone & Progress Tracking
Students log updates, supervisors approve/reject milestones.
📂 Document Upload & Storage
Centralized space for uploading reports, presentations, and code.
🧑‍🏫 Supervisor Dashboard
Real-time tracking of student progress and evaluations.
🛠️ Admin Panel
Manage users, proposals, approvals, and grading policies.
🔔 Notifications & Alerts
Automated reminders for deadlines, feedback, and approvals.
📊 Evaluation & Grading
Streamlined rubric-based grading for fairness and transparency.

🧑‍💻 Tech Stack
Layer	Technology
Frontend	React (Vite) + Tailwind CSS
Backend	Node.js + Express.js
Database	MongoDB (Compass)
Auth & Security	JWT Authentication + bcrypt
File Storage	Cloud / Local Storage (Multer)
Communication	CORS + REST API

🖼️ Screenshots

Login Page, Student,  Supervisor , Admin,Internal, External


🔧 Setup Instructions
📋 Prerequisites

Node.js (Latest LTS)

MongoDB Compass / Atlas account

Git & VS Code

🧑‍💻 Clone the Repository
git clone https://github.com/ateeq786316/Questify-fyp-portal.git
cd Questify-FYP-Portal

📦 Install Dependencies
#new termainal 
cd fyp
npm install

#new termainal 
cd server
npm install

⚙️ Configure Environment

Create a .env file in the server with:

MONGO_URI=mongodb://127.0.0.1:27017/FYP_LGU
JWT_SECRET=
PORT = 5000
NODE_ENV=development

# gemini key 
GEMINI_API_KEY=
REACT_APP_API_URL=http://localhost:5000/api

#for mail create an app password from email
EMAIL_USER=
EMAIL_PASS=



▶️ Run the App

Backend:
npm start

Frontend:
npm run dev

📦 Deployment

Frontend: Vercel / Netlify

Backend: Render 

Database: MongoDB Atlas

👥 Team Contributions

Ateeq ur Rehman
🔹 Role: Full-Stack Developer
🔹 Work: Backend APIs, Auth system, Database integration

Muhammad Talha
🔹 Role: Frontend Developer
🔹 Work: UI Design, React Components, Supervisor Dashboard

Supervisor: Miss Rabia Khan
🔹 Guidance, review, and evaluation framework

🤝 Contributing
Contributions are welcome!
Fork the repo
Create your feature branch:
git checkout -b feature/your-feature
Commit your changes:
git commit -m 'Add new feature'
Push to the branch:
git push origin feature/your-feature


Open a Pull Request

🙏 Acknowledgements
MERN Stack Community
MongoDB Atlas
OpenAI / AI-assisted feedback
University peers and testers
⚡ Questify – Streamlining Final Year Project Management


#commands to push to git hub
git status =================
git add .  =================
git commit -m "aj ki date jo kam kia ha" ===============
git pull origin master ==============
git push =============


testing for talha 
editing for achivement

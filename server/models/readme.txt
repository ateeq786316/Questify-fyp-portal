******************** bigdata ********************
{
  "name": "ATEEQ UR REHMAN",
  "email": "ateeq786316@gmail.com",
  "password": "12345",
  "role": "student",
  "department": "Computer Science",
  "program": "BSCS",
  "contact": "+923125053926",
  "groupID": "173",
  "projectTitle": "Questify FYP Portal",
  "studentId": "Fa-2021/BSCS/197",
  "batch": "2021",
  "cgpa": 3.36,
  "skills": [
    "React",
    "Node.js",
    "MongoDB"
  ],
  "interests": [
    "Web Development",
    "Database Systems"
  ],
  "projectDescription": "A web application for managing final year projects.",
  "startDate": {
    "$date": "2024-01-15T00:00:00.000Z"
  },
  "endDate": {
    "$date": "2025-05-15T00:00:00.000Z"
  },
  "projectStatus": "In Progress",
  "proposalTitle": "Questify FYP Portal Proposal",
  "proposalDescription": "Proposal for a web-based FYP management system.",
  "proposalSubmissionDate": {
    "$date": "2024-01-10T00:00:00.000Z"
  },
  "proposalStatus": "Approved",
  "submissionTitle": "Initial Project Submission",
  "submissionDescription": "Initial submission of project deliverables.",
  "submissionDate": {
    "$date": "2024-02-15T00:00:00.000Z"
  },
  "submissionFileUrl": "https://example.com/submissions/173/initial.zip",
  "progressDate": {
    "$date": "2024-03-01T00:00:00.000Z"
  },
  "progressDescription": "Completed user authentication module.",
  "progressPercentage": 40,
  "feedbackSenderId": {
    "$oid": "67bdb696e58d50358dd591ec"
  },
  "feedbackMessage": "Good progress, but focus on UI/UX.",
  "feedbackDate": {
    "$date": "2024-03-02T00:00:00.000Z"
  },
  "meetingDate": {
    "$date": "2024-03-05T10:00:00.000Z"
  },
  "meetingLocation": "Online Meeting",
  "meetingAgenda": "Project progress review",
  "evaluationEvaluatorId": {
    "$oid": "67bdb696e58d50358dd591ed"
  },
  "evaluationCriteria": "Functionality, Design, Documentation",
  "evaluationMarks": 85,
  "evaluationComments": "Excellent work overall.",
  "notificationMessage": "Your project proposal has been approved.",
  "notificationDate": {
    "$date": "2024-01-12T00:00:00.000Z"
  },
  "notificationRead": false,
  "supervisorId": "LGU-SUP-2020-001",
  "supervisorExpertise": [
    "Web Development",
    "Database Systems"
  ],
  "internalId": "LGU-INT-2021-001",
  "internalExpertise": [
    "Software Engineering",
    "Project Management"
  ],
  "externalId": "EXT-2022-001",
  "externalOrganization": "Tech Solutions Inc.",
  "externalExpertise": [
    "Mobile App Development",
    "UI/UX Design"
  ],
  "documentTitle": "Project Documentation",
  "documentDescription": "Comprehensive project documentation.",
  "documentFileUrl": "https://example.com/documents/173/project-docs.pdf",
  "documentUploadDate": {
    "$date": "2024-03-10T00:00:00.000Z"
  }
}



******************** document ********************
{
  "projectId": {
    "$oid": "67bdb696e58d50358dd591f2"
  },
  "groupId": "173",
  "title": "Project"
}



******************** evaluation ********************

{
  "_id": {
    "$oid": "67bdb696e58d50358dd591f8"
  },
  "evaluationId": {
    "$oid": "67bdb696e58d50358dd591f9"
  },
  "projectId": {
    "$oid": "67bdb696e58d50358dd591f2"
  },
  "groupId": "173",
  "evaluatorId": {
    "$oid": "67bdb696e58d50358dd591ed"
  },
  "criteria": "Functionality, Design, Documentation",
  "marks": 85,
  "comments": "Excellent work overall."
}

******************** external ********************

{
  "userId": {
    "$oid": "67bdb696e58d50358dd591ef"
  },
  "externalId": "EXT-2025-001",
  "organization": "NETSOL",
  "expertise": [
    "Mobile App Development",
    "UI/UX Design"
  ]
}
******************** feedback ********************

{
  "projectId": {
    "$oid": "67bdb696e58d50358dd591f2"
  },
  "groupId": "173",
  "senderId": {
    "$oid": "67bdb696e58d50358dd591ec"
  },
  "message": "Good progress, but focus on UI/UX.",
  "date": {
    "$date": "2024-03-02T00:00:00.000Z"
  }
}
******************** internal ********************

{
  "userId": {
    "$oid": "67bdb696e58d50358dd591ed"
  },
  "internalId": "LGU-INT-2021-001",
  "department": "Computer Science",
  "expertise": [
    "Web Development",
    "Database Systems"
  ]
}
******************** meeting ********************

{
  "projectId": {
    "$oid": "67bdb696e58d50358dd591f2"
  },
  "groupId": "173",
  "date": {
    "$date": "2024-03-05T10:00:00.000Z"
  },
  "location": "Online Meeting",
  "agenda": "Project progress review"
}
******************** notification ********************

{
  "userId": {
    "$oid": "67bdb696e58d50358dd591eb"
  },
  "message": "Your project proposal has been approved.",
  "date": {
    "$date": "2024-01-12T00:00:00.000Z"
  },
  "read": false
}
******************** progress ********************

{
  "projectId": {
    "$oid": "67bdb696e58d50358dd591f2"
  },
  "groupId": "173",
  "date": {
    "$date": "2024-03-01T00:00:00.000Z"
  },
  "description": "Completed user authentication module.",
  "percentage": 40
}
******************** project ********************

{
  "title": "Questify FYP Portal",
  "description": "A web application for managing final year projects.",
  "department": "Computer Science",
  "program": "BSCS",
  "groupId": "173",
  "startDate": {
    "$date": "2024-01-15T00:00:00.000Z"
  },
  "endDate": {
    "$date": "2024-05-15T00:00:00.000Z"
  },
  "status": "In Progress"
}
******************** proposal ********************

{
  "projectId": {
    "$oid": "67bdb696e58d50358dd591f2"
  },
  "groupId": "173",
  "title": "Questify FYP Portal Proposal",
  "description": "Proposal for a web-based FYP management system.",
  "submissionDate": {
    "$date": "2024-01-10T00:00:00.000Z"
  },
  "status": "Approved"
}
******************** student ********************

{
  "studentId": "Fa-2021/BSCS/197",
  "batch": "2021",
  "cgpa": 3.36,
  "skills": [
    "React",
    "Node.js",
    "MongoDB",
    "MERN"
  ],
  "interests": [
    "Full stack Web Development",
    "Database Systems"
  ]
}
******************** submission ********************

{
  "projectId": {
    "$oid": "67bdb696e58d50358dd591f2"
  },
  "groupId": "173",
  "title": "Proposal Project Submission",
  "description": "Overview of system submission of project, that what will it have.",
  "submissionDate": {
    "$date": "2024-02-15T00:00:00.000Z"
  },
  "fileUrl": "https://example.com/submissions/173/initial.zip"
}
******************** supervisor ********************

{
  "userId": {
    "$oid": "67bdb696e58d50358dd591ec"
  },
  "supervisorId": "rabiakhan",
  "department": "BSCS",
  "expertise": [
    "IOT",
    "Development"
  ]
}
******************** user ********************

{
  "name": " ATEEQ UR REHMAN",
  "email": "ateeq786316@gmail.com",
  "password": "12345",
  "role": "student",
  "department": "Computer Science",
  "program": "BSCS",
  "contact": "+923125053926",
  "groupID": "173",
  "projectTitle": "Questify FYP Portal",
  "supervisor": "Rabia Khan"
}







======================
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  //Common Fields:name, email, password, contact, role, Common fields for to all users.
  
  
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  department: { type: String },
  contact: { type: String },
  role: { type: String, enum: ["student", "supervisor", "admin", "internal", "external"], required: true },
  
  
  
  //Student Fields: name, email, password, contact, role, studentId, program, teamMembers, groupID, projectTitle, projectDescription, projectStatus, proposalStatus, startDate, endDate, 
  
  studentId: { type: String },
  program: { type: String },
  cgpa: { type: Number },
  teamMembers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  groupID: { type: String, required: true },
  projectTitle: { type: String, required: true },
  projectDescription: { type: String },
  projectStatus: { type: String, enum: ["Proposed", "In Progress", "Completed", "Rejected", "Pending"], default: "Pending" },
  proposalStatus: { type: String, enum: ["Submitted", "Approved", "Rejected", "Pending"], default: "Pending" },
  

  //Supervisor Fields:name, email, password, contact, role, supervisorId, supervisorExpertise, currentStudents.
  supervisorId: { type: String },
  supervisorExpertise: { type: String },
  currentGroupId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  
  
  //Internal Fields:name, email, password, contact, role, internalId, internalExpertise
  internalId: { type: String },
  internalExpertise: [{ type: String }],

  //External Fields: name, email, password, contact, role, externalId, externalOrganization, externalExpertise, 
  externalId: { type: String },
  externalOrganization: { type: String },
  externalPosition: { type: String },
  externalExpertise: [{ type: String }],

  //Feedback Fields: feedbackSenderId, feedbackMessage, feedbackDate, Feedback fields applicable to all users.
  feedbackSenderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Reference to sender
  feedbackMessage: { type: String },
  feedbackDate: { type: Date, default: Date.now },


  //EndedAt: endedAt, EndedAt for project completion.
  startDate: { type: Date },
  endDate: { type: Date },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },

  //document upload
  //submission
  // endedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("User", userSchema);

========================================================
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["student", "supervisor", "admin", "internal", "external"], required: true },
  department: { type: String },
  program: { type: String },
  contact: { type: String },
  groupID: { type: String, required: true },
  projectTitle: { type: String, required: true },
  supervisor: { type: String }
});

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

module.exports = mongoose.model("User", userSchema);
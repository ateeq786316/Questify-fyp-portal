// # Admin logic (add/remove users, deadlines)

const User = require("../models/User");
const Milestone = require("../models/Milestone");
const path = require("path");
const fs = require("fs");
const xlsx = require("xlsx");
const bcrypt = require("bcryptjs");

// Get dashboard statistics
exports.getDashboardStats = async (req, res) => {
  try {
    console.log("Fetching dashboard stats...");
    // Count total students
    const totalStudents = await User.countDocuments({ role: "student" });
    console.log("Total students:", totalStudents);
    // Count total supervisors
    const totalSupervisors = await User.countDocuments({ role: "supervisor" });
    console.log("Total supervisors:", totalSupervisors);

    // Count active students (students with projectStatus 'In Progress')
    const activeStudents = await User.countDocuments({
      role: "student",
      projectStatus: "In Progress",
    });
    console.log("Active students:", activeStudents);

    // Count pending students (students with projectStatus 'Pending')
    const pendingStudents = await User.countDocuments({
      role: "student",
      projectStatus: "Pending",
    });
    console.log("Pending students:", pendingStudents);

    res.status(200).json({
      success: true,
      stats: {
        enrolledStudents: totalStudents,
        totalSupervisors: totalSupervisors,
        activeStudents: activeStudents,
        pendingStudents: pendingStudents,
      },
    });
  } catch (err) {
    console.error("Error fetching dashboard stats:", err);
    res.status(500).json({
      success: false,
      msg: "Error fetching dashboard statistics",
    });
  }
};

// Get student groups
exports.getStudentGroups = async (req, res) => {
  try {
    console.log("Fetching student groups...");

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const skip = (page - 1) * limit;

    // Get total count of unique groups first
    const totalGroups = await User.distinct("groupID", { role: "student" });
    const totalPages = Math.ceil(totalGroups.length / limit);

    // Find all students and populate their team members with pagination
    const students = await User.find({ role: "student" })
      .select(
        "name studentId email department groupID projectTitle projectStatus"
      )
      .populate("teamMembers", "name studentId email department")
      .sort({ groupID: 1 })
      .skip(skip)
      .limit(limit);

    console.log("Found students:", students.length);

    // Group students by their groupID
    const groups = students.reduce((acc, student) => {
      const groupId = student.groupID;
      if (!groupId) {
        console.log("Student without groupID:", student.name);
        return acc;
      }

      if (!acc[groupId]) {
        acc[groupId] = {
          groupId,
          names: [],
          department: student.department,
          projectTitle: student.projectTitle,
          status: student.projectStatus,
        };
      }

      // Add student name to the group
      if (!acc[groupId].names.includes(student.name)) {
        acc[groupId].names.push(student.name);
      }

      // Add team members if they exist
      if (student.teamMembers && student.teamMembers.length > 0) {
        student.teamMembers.forEach((member) => {
          if (!acc[groupId].names.includes(member.name)) {
            acc[groupId].names.push(member.name);
          }
        });
      }

      return acc;
    }, {});

    const groupList = Object.values(groups);
    console.log("Grouped students into", groupList.length, "groups");

    res.status(200).json({
      success: true,
      groups: groupList,
      pagination: {
        currentPage: page,
        totalPages,
        totalGroups: totalGroups.length,
        hasMore: page < totalPages,
      },
    });
  } catch (err) {
    console.error("Error fetching student groups:", err);
    res.status(500).json({
      success: false,
      msg: "Error fetching student groups",
    });
  }
};

// Get milestones
exports.getMilestones = async (req, res) => {
  try {
    let milestones = await Milestone.find().sort({ order: 1 });

    // If no milestones exist, create default ones
    if (milestones.length === 0) {
      const defaultMilestones = [
        { name: "Proposal", order: 1 },
        { name: "SRS", order: 2 },
        { name: "System Diagram", order: 3 },
        { name: "Mid Development", order: 4 },
        { name: "Final Development", order: 5 },
        { name: "Internal", order: 6 },
        { name: "External", order: 7 },
      ];

      milestones = await Milestone.insertMany(defaultMilestones);
    }

    res.status(200).json({
      success: true,
      milestones,
    });
  } catch (err) {
    console.error("Error fetching milestones:", err);
    res.status(500).json({
      success: false,
      msg: "Error fetching milestones",
    });
  }
};

// Save milestones
exports.saveMilestones = async (req, res) => {
  try {
    const { milestones } = req.body;

    // Update each milestone
    const updatePromises = milestones.map((milestone) =>
      Milestone.findByIdAndUpdate(
        milestone._id,
        {
          name: milestone.name,
          deadline: milestone.deadline,
          order: milestone.order,
        },
        { new: true }
      )
    );

    const updatedMilestones = await Promise.all(updatePromises);

    res.status(200).json({
      success: true,
      milestones: updatedMilestones,
    });
  } catch (err) {
    console.error("Error saving milestones:", err);
    res.status(500).json({
      success: false,
      msg: "Error saving milestones",
    });
  }
};

// Upload students from Excel
exports.uploadStudents = async (req, res) => {
  try {
    // 1. Check for file
    if (!req.file) {
      console.log("No file uploaded.");
      return res.status(400).json({ success: false, msg: "No file uploaded." });
    }

    // 2. Parse Excel file
    const workbook = xlsx.readFile(req.file.path);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const students = xlsx.utils.sheet_to_json(sheet);
    console.log("Parsed students from Excel:", students);

    // 3. Remove the uploaded file after parsing
    fs.unlinkSync(req.file.path);

    if (!Array.isArray(students) || students.length === 0) {
      console.log("No students data found in file.");
      return res
        .status(400)
        .json({ success: false, msg: "No students data found in file." });
    }

    // Detect duplicate emails within the uploaded Excel file
    const seenEmails = new Set();
    const fileDuplicates = [];
    students.forEach((s) => {
      const email = s.Email || s.email;
      if (seenEmails.has(email)) {
        fileDuplicates.push(email);
      } else {
        seenEmails.add(email);
      }
    });

    // Remove duplicates from studentsToInsert
    const uniqueStudents = students.filter(
      (s, idx, arr) =>
        arr.findIndex(
          (stu) => (stu.Email || stu.email) === (s.Email || s.email)
        ) === idx
    );

    const studentsToInsert = uniqueStudents.map((s) => ({
      name: s.Name || s.name,
      email: s.Email || s.email,
      password: s.Password || Math.random().toString(36).slice(-8),
      department: s.Department || s.department,
      contact: s.Contact || s.contact || "",
      role: s.Role || s.role || "student",
      studentId: s["Roll Number"] ? String(s["Roll Number"]) : undefined,
      batch: s.Batch || s.batch || "",
    }));
    console.log("fileDuplicates:", fileDuplicates);

    // Validate required fields
    for (const stu of studentsToInsert) {
      if (!stu.name || !stu.email || !stu.password || !stu.department) {
        console.log("Missing required fields in:", stu);
        return res.status(400).json({
          success: false,
          msg: "Missing required fields (name, email, password, department) in one or more students.",
        });
      }
    }

    // Check for existing emails
    const existingEmails = await User.find({
      email: { $in: studentsToInsert.map((s) => s.email) },
    }).select("email");
    console.log("existingEmails:", existingEmails);

    const existingEmailSet = new Set(existingEmails.map((e) => e.email));
    const newStudents = studentsToInsert.filter(
      (s) => !existingEmailSet.has(s.email)
    );
    const duplicateStudents = studentsToInsert.filter((s) =>
      existingEmailSet.has(s.email)
    );
    console.log("newStudents:", newStudents);
    console.log("duplicateStudents:", duplicateStudents);

    // Hash passwords for all new students before insert
    for (const stu of newStudents) {
      stu.password = await bcrypt.hash(stu.password, 10);
    }

    let result = { insertedCount: 0, insertedStudents: [] };
    let errors = [];

    if (newStudents.length > 0) {
      try {
        const insertResult = await User.insertMany(newStudents, {
          ordered: false,
        });
        result.insertedCount = insertResult.length;
        result.insertedStudents = insertResult.map((s) => ({
          name: s.name,
          email: s.email,
          studentId: s.studentId,
        }));
        console.log("insertResult:", insertResult);
      } catch (err) {
        console.log("insertMany error:", err);
        if (err.errors) {
          console.log("Validation errors:", err.errors);
        }
        if (err.writeErrors) {
          errors.push(
            ...err.writeErrors.map((e) => ({
              email: newStudents[e.index].email,
              error: e.errmsg,
            }))
          );
        } else {
          // Log the full error for debugging
          errors.push({ error: err.message, full: err });
          console.log("Full insertMany error:", err);
        }
      }
    } else {
      console.log("No new students to insert.");
    }

    const response = {
      success: true,
      msg: "Student upload completed",
      fileDuplicates,
      stats: {
        total: studentsToInsert.length,
        inserted: result.insertedCount,
        duplicates: duplicateStudents.length,
        errors: errors.length,
      },
      details: {
        inserted: result.insertedStudents,
        duplicates: duplicateStudents.map((s) => ({
          name: s.name,
          email: s.email,
        })),
        errors: errors,
      },
    };

    if (duplicateStudents.length > 0 || errors.length > 0) {
      response.warning =
        "Some students were not inserted due to duplicates or errors";
    }

    console.log("Final response:", response);
    res.status(200).json(response);
  } catch (err) {
    console.error("Error uploading students:", err);
    res.status(500).json({
      success: false,
      msg: "Server error uploading students.",
      error: err.message,
    });
  }
};

// Upload supervisors from Excel
exports.uploadSupervisors = async (req, res) => {
  try {
    // 1. Check for file
    if (!req.file) {
      return res.status(400).json({ success: false, msg: "No file uploaded." });
    }
    // 2. Parse Excel file
    let workbook;
    try {
      workbook = xlsx.readFile(req.file.path);
    } catch (err) {
      console.error("Error parsing Excel file:", err);
      return res
        .status(400)
        .json({ success: false, msg: "Invalid Excel file format." });
    }
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const supervisors = xlsx.utils.sheet_to_json(sheet);
    fs.unlinkSync(req.file.path);
    if (!Array.isArray(supervisors) || supervisors.length === 0) {
      return res
        .status(400)
        .json({ success: false, msg: "No supervisors data found in file." });
    }
    // Detect duplicate emails within the uploaded Excel file
    const seenEmails = new Set();
    const fileDuplicates = [];
    supervisors.forEach((s) => {
      const email = s.Email || s.email;
      if (seenEmails.has(email)) {
        fileDuplicates.push(email);
      } else {
        seenEmails.add(email);
      }
    });
    // Remove duplicates from supervisorsToInsert
    const uniqueSupervisors = supervisors.filter(
      (s, idx, arr) =>
        arr.findIndex(
          (sup) => (sup.Email || sup.email) === (s.Email || s.email)
        ) === idx
    );
    const supervisorsToInsert = uniqueSupervisors.map((s) => ({
      name: s.Name || s.name,
      email: s.Email || s.email,
      password: String(
        s.Password || s.password || Math.random().toString(36).slice(-8)
      ),
      department: s.Department || s.department,
      contact: s.Contact || s.contact || "",
      role: s.Role || s.role || "supervisor",
      supervisorId: s.SupervisorID || s.supervisorId || "",
      supervisorExpertise: s.SupervisorExpertise
        ? String(s.SupervisorExpertise)
            .split(",")
            .map((e) => e.trim())
        : [],
    }));
    // Validate required fields
    for (const sup of supervisorsToInsert) {
      if (
        !sup.name ||
        !sup.email ||
        !sup.password ||
        !sup.department ||
        !sup.role
      ) {
        return res.status(400).json({
          success: false,
          msg: "Missing required fields (name, email, password, department, role) in one or more supervisors.",
        });
      }
    }
    // Check for existing emails
    const existingEmails = await User.find({
      email: { $in: supervisorsToInsert.map((s) => s.email) },
    }).select("email");
    const existingEmailSet = new Set(existingEmails.map((e) => e.email));
    const newSupervisors = supervisorsToInsert.filter(
      (s) => !existingEmailSet.has(s.email)
    );
    const duplicateSupervisors = supervisorsToInsert.filter((s) =>
      existingEmailSet.has(s.email)
    );
    // Hash passwords for all new supervisors before insert
    const bcrypt = require("bcryptjs");
    for (const sup of newSupervisors) {
      sup.password = await bcrypt.hash(sup.password, 10);
    }
    let result = { insertedCount: 0, insertedSupervisors: [] };
    let errors = [];
    if (newSupervisors.length > 0) {
      try {
        const insertResult = await User.insertMany(newSupervisors, {
          ordered: false,
        });
        result.insertedCount = insertResult.length;
        result.insertedSupervisors = insertResult.map((s) => ({
          name: s.name,
          email: s.email,
          supervisorId: s.supervisorId,
        }));
      } catch (err) {
        if (err.writeErrors) {
          errors.push(
            ...err.writeErrors.map((e) => ({
              email: newSupervisors[e.index].email,
              error: e.errmsg,
            }))
          );
        } else {
          errors.push({ error: err.message, full: err });
        }
      }
    }
    const response = {
      success: true,
      msg: "Supervisor upload completed",
      fileDuplicates,
      stats: {
        total: supervisorsToInsert.length,
        inserted: result.insertedCount,
        duplicates: duplicateSupervisors.length,
        errors: errors.length,
      },
      details: {
        inserted: result.insertedSupervisors,
        duplicates: duplicateSupervisors.map((s) => ({
          name: s.name,
          email: s.email,
        })),
        errors: errors,
      },
    };
    if (duplicateSupervisors.length > 0 || errors.length > 0) {
      response.warning =
        "Some supervisors were not inserted due to duplicates or errors";
    }
    res.status(200).json(response);
  } catch (err) {
    console.error("Server error uploading supervisors:", err);
    res.status(500).json({
      success: false,
      msg: "Server error uploading supervisors.",
      error: err.message,
    });
  }
};

// Download student template
exports.downloadStudentTemplate = async (req, res) => {
  try {
    // Create a new workbook
    const workbook = xlsx.utils.book_new();

    // Define the template data (minimal required fields)
    const templateData = [
      {
        "Roll Number": "197",
        Name: "ATEEQ",
        Email: "fa-21-BSCS-197@lgu.edu.pk",
        Department: "Computer Science",
        Batch: "2021",
        Contact: "03001234567",
        Password: "12345678",
        Role: "student",
      },
      {
        "Roll Number": "167",
        Name: "TALHA",
        Email: "fa-21-BSCS-167@lgu.edu.pk",
        Department: "Computer Science",
        Batch: "2021",
        Contact: "03007654321",
        Password: "12345678",
        Role: "student",
      },
    ];

    // Create worksheet
    const worksheet = xlsx.utils.json_to_sheet(templateData);

    // Add column widths
    const columnWidths = [
      { wch: 15 }, // Roll Number
      { wch: 20 }, // Name
      { wch: 30 }, // Email
      { wch: 20 }, // Department
      { wch: 10 }, // Batch
      { wch: 15 }, // Contact
      { wch: 15 }, // Password
      { wch: 10 }, // Role
    ];
    worksheet["!cols"] = columnWidths;

    // Add the worksheet to the workbook
    xlsx.utils.book_append_sheet(workbook, worksheet, "Student Template");

    // Create a buffer from the workbook
    const buffer = xlsx.write(workbook, { type: "buffer", bookType: "xlsx" });

    // Set response headers
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=student_template.xlsx"
    );

    // Send the buffer
    res.send(buffer);
  } catch (err) {
    console.error("Error generating template:", err);
    res.status(500).json({
      success: false,
      msg: "Error generating student template",
    });
  }
};

// Add a single student
exports.addSingleStudent = async (req, res) => {
  try {
    const { name, email, password, department, batch, contact, role } =
      req.body;
    if (!name || !email || !password || !department || !role) {
      return res.status(400).json({
        success: false,
        msg: "Missing required fields (name, email, password, department, role).",
      });
    }
    if (role !== "student") {
      return res.status(400).json({
        success: false,
        msg: "Role must be 'student' for this operation.",
      });
    }
    // Check for duplicate email
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({
        success: false,
        msg: `A user with email ${email} already exists.`,
      });
    }
    // Hash password
    const bcrypt = require("bcryptjs");
    const hashedPassword = await bcrypt.hash(password, 10);
    // Create student
    const student = new User({
      name,
      email,
      password: hashedPassword,
      department,
      batch,
      contact,
      role,
    });
    await student.save();
    res.status(200).json({ success: true, msg: "Student added successfully." });
  } catch (err) {
    console.error("Error adding single student:", err);
    res.status(500).json({
      success: false,
      msg: "Server error adding student.",
      error: err.message,
    });
  }
};

// Download supervisor template
exports.downloadSupervisorTemplate = async (req, res) => {
  try {
    const workbook = xlsx.utils.book_new();
    // Only include the Supervisor Template sheet for direct data entry
    const templateData = [
      {
        Name: "Dr. John Smith",
        Email: "john.smith@example.com",
        Password: "supervisor123",
        Department: "Computer Science",
        Contact: "03001234567",
        SupervisorID: "SUP001",
        SupervisorExpertise: "AI,ML,Web Development",
        Role: "supervisor",
      },
      {
        Name: "Dr. Jane Doe",
        Email: "jane.doe@example.com",
        Password: "supervisor456",
        Department: "Software Engineering",
        Contact: "03007654321",
        SupervisorID: "SUP002",
        SupervisorExpertise: "Data Science,Cloud Computing",
        Role: "supervisor",
      },
    ];
    const worksheet = xlsx.utils.json_to_sheet(templateData, {
      header: [
        "Name",
        "Email",
        "Password",
        "Department",
        "Contact",
        "SupervisorID",
        "SupervisorExpertise",
        "Role",
      ],
    });
    worksheet["!cols"] = [
      { wch: 25 }, // Name
      { wch: 35 }, // Email
      { wch: 20 }, // Password
      { wch: 25 }, // Department
      { wch: 15 }, // Contact
      { wch: 15 }, // SupervisorID
      { wch: 40 }, // SupervisorExpertise
      { wch: 15 }, // Role
    ];
    xlsx.utils.book_append_sheet(workbook, worksheet, "Supervisor Template");
    const buffer = xlsx.write(workbook, { type: "buffer", bookType: "xlsx" });
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=supervisor_template.xlsx"
    );
    res.send(buffer);
  } catch (err) {
    console.error("Error generating supervisor template:", err);
    res.status(500).json({
      success: false,
      msg: "Error generating supervisor template",
      error: err.message,
    });
  }
};

// Add a single supervisor
exports.addSingleSupervisor = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      department,
      contact,
      supervisorId,
      supervisorExpertise,
      role,
    } = req.body;
    if (!name || !email || !password || !department || !role) {
      return res.status(400).json({
        success: false,
        msg: "Missing required fields (name, email, password, department, role).",
      });
    }
    if (role !== "supervisor") {
      return res.status(400).json({
        success: false,
        msg: "Role must be 'supervisor' for this operation.",
      });
    }
    // Check for duplicate email
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({
        success: false,
        msg: `A user with email ${email} already exists.`,
      });
    }
    // Hash password
    const bcrypt = require("bcryptjs");
    const hashedPassword = await bcrypt.hash(password, 10);
    // Create supervisor
    const supervisor = new User({
      name,
      email,
      password: hashedPassword,
      department,
      contact,
      role,
      supervisorId,
      supervisorExpertise: supervisorExpertise
        ? supervisorExpertise.split(",").map((s) => s.trim())
        : [],
    });
    await supervisor.save();
    res
      .status(200)
      .json({ success: true, msg: "Supervisor added successfully." });
  } catch (err) {
    console.error("Error adding single supervisor:", err);
    res.status(500).json({
      success: false,
      msg: "Server error adding supervisor.",
      error: err.message,
    });
  }
};

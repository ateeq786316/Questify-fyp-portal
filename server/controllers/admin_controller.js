// # Admin logic (add/remove users, deadlines)

const User = require("../models/User");
const Milestone = require("../models/Milestone");

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

// Upload students from CSV
exports.uploadStudents = async (req, res) => {
  try {
    const { students } = req.body;
    console.log("Received students for upload:", students);

    if (!Array.isArray(students) || students.length === 0) {
      return res
        .status(400)
        .json({ success: false, msg: "No students data provided." });
    }

    // Find the highest existing groupID
    const highestGroup = await User.findOne({ role: "student" })
      .sort({ groupID: -1 })
      .select("groupID");

    let nextGroupID = 1; // Default if no groups exist
    if (highestGroup && highestGroup.groupID) {
      // Extract number from groupID and increment
      const currentMax = parseInt(highestGroup.groupID) || 0;
      nextGroupID = currentMax + 1;
    }

    // Add role: 'student' to each entry and assign groupID
    const studentsToInsert = students.map((s) => ({
      name: s.name,
      email: s.email,
      password: s.password,
      department: s.department,
      contact: s.contact,
      role: "student",
      groupID: String(nextGroupID++), // Convert to string and increment
      projectTitle: s.projectTitle || "", // Optional
    }));

    // Validate required fields
    for (const stu of studentsToInsert) {
      if (!stu.name || !stu.email || !stu.password) {
        return res.status(400).json({
          success: false,
          msg: "Missing required fields in one or more students.",
        });
      }
    }

    // First, find existing emails
    const existingEmails = await User.find({
      email: { $in: studentsToInsert.map((s) => s.email) },
    }).select("email");

    const existingEmailSet = new Set(existingEmails.map((e) => e.email));

    // Separate new and existing students
    const newStudents = studentsToInsert.filter(
      (s) => !existingEmailSet.has(s.email)
    );
    const duplicateStudents = studentsToInsert.filter((s) =>
      existingEmailSet.has(s.email)
    );

    let result = { insertedCount: 0, insertedStudents: [] };
    let errors = [];

    // Insert new students
    if (newStudents.length > 0) {
      try {
        const insertResult = await User.insertMany(newStudents, {
          ordered: false,
        });
        result.insertedCount = insertResult.length;
        result.insertedStudents = insertResult.map((s) => ({
          name: s.name,
          email: s.email,
          groupID: s.groupID,
        }));
      } catch (err) {
        if (err.writeErrors) {
          // Handle any other bulk write errors
          errors.push(
            ...err.writeErrors.map((e) => ({
              email: newStudents[e.index].email,
              error: e.errmsg,
            }))
          );
        } else {
          throw err; // Re-throw if it's not a bulk write error
        }
      }
    }

    // Prepare response
    const response = {
      success: true,
      msg: "Student upload completed",
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

    // If there were any duplicates or errors, add a warning
    if (duplicateStudents.length > 0 || errors.length > 0) {
      response.warning =
        "Some students were not inserted due to duplicates or errors";
    }

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

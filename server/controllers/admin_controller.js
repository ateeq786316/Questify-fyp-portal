// # Admin logic (add/remove users, deadlines)

const User = require('../models/User');
const Milestone = require('../models/Milestone');

// Get dashboard statistics
exports.getDashboardStats = async (req, res) => {
  try {
    // Count total students
    const totalStudents = await User.countDocuments({ role: 'student' });
    // Count total supervisors
    const totalSupervisors = await User.countDocuments({ role: 'supervisor' });
    
    // Count active students (students with projectStatus 'Active')
    const activeStudents = await User.countDocuments({ 
      role: 'student',
      projectStatus: 'Active'
    });
    
    // Count pending students (students with projectStatus 'Pending')
    const pendingStudents = await User.countDocuments({ 
      role: 'student',
      projectStatus: 'Pending'
    });

    res.status(200).json({
      success: true,
      stats: {
        enrolledStudents: totalStudents,
        totalSupervisors: totalSupervisors,
        activeStudents: activeStudents,
        pendingStudents: pendingStudents
      }
    });
  } catch (err) {
    console.error('Error fetching dashboard stats:', err);
    res.status(500).json({
      success: false,
      msg: 'Error fetching dashboard statistics'
    });
  }
};

// Get student groups
exports.getStudentGroups = async (req, res) => {
  try {
    const students = await User.find({ role: 'student' })
      .select('name studentId email program groupID projectTitle projectStatus')
      .populate('teamMembers', 'name studentId email program');

    // Group students by their groupID
    const groups = students.reduce((acc, student) => {
      const groupId = student.groupID;
      if (!acc[groupId]) {
        acc[groupId] = {
          groupId,
          names: [],
          domain: student.program,
          projectTitle: student.projectTitle,
          status: student.projectStatus
        };
      }
      acc[groupId].names.push(student.name);
      return acc;
    }, {});

    res.status(200).json({
      success: true,
      groups: Object.values(groups)
    });
  } catch (err) {
    console.error('Error fetching student groups:', err);
    res.status(500).json({
      success: false,
      msg: 'Error fetching student groups'
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
        { name: 'Proposal', order: 1 },
        { name: 'SRS', order: 2 },
        { name: 'System Diagram', order: 3 },
        { name: 'Mid Development', order: 4 },
        { name: 'Final Development', order: 5 },
        { name: 'Internal', order: 6 },
        { name: 'External', order: 7 }
      ];

      milestones = await Milestone.insertMany(defaultMilestones);
    }

    res.status(200).json({
      success: true,
      milestones
    });
  } catch (err) {
    console.error('Error fetching milestones:', err);
    res.status(500).json({
      success: false,
      msg: 'Error fetching milestones'
    });
  }
};

// Save milestones
exports.saveMilestones = async (req, res) => {
  try {
    const { milestones } = req.body;

    // Update each milestone
    const updatePromises = milestones.map(milestone => 
      Milestone.findByIdAndUpdate(
        milestone._id,
        { 
          name: milestone.name,
          deadline: milestone.deadline,
          order: milestone.order
        },
        { new: true }
      )
    );

    const updatedMilestones = await Promise.all(updatePromises);

    res.status(200).json({
      success: true,
      milestones: updatedMilestones
    });
  } catch (err) {
    console.error('Error saving milestones:', err);
    res.status(500).json({
      success: false,
      msg: 'Error saving milestones'
    });
  }
};
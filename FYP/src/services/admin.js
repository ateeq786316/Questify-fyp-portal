import API from "./api";

// Get All Students
export const getAllStudents = async () => {
  try {
    const response = await API.get("/admin/students");
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Assign Supervisor to Student
export const assignSupervisor = async (studentId, supervisorId) => {
  try {
    const response = await API.post("/admin/assign-supervisor", {
      studentId,
      supervisorId,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

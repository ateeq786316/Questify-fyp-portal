export const logout = () => {
  // Clear all authentication data
  localStorage.removeItem("studentToken");
  localStorage.removeItem("student");
  
  // Redirect to login page
  window.location.href = "/login";
}; 
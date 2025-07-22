import { Navigate, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';

const ProtectedRoute = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const location = useLocation();

  useEffect(() => {
    const checkAuth = () => {
      const path = location.pathname;
      let token = null;
      
      // Check for admin routes
      if (path.startsWith('/admin') || path === '/usermanagement' || path === '/admindashboard') {
        token = localStorage.getItem('adminToken');
      } else if (path.startsWith('/supervisor')) {
        token = localStorage.getItem('supervisorToken');
      } else if (path.startsWith('/internal')) {
        token = localStorage.getItem('internalToken');
      } else if (path.startsWith('/external')) {
        token = localStorage.getItem('externalToken');
      } else {
        token = localStorage.getItem('studentToken');
      }
      setIsAuthenticated(!!token);
    };
    checkAuth();
  }, [location.pathname]);

  // Show loading state while checking authentication
  if (isAuthenticated === null) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Render children if authenticated
  return children;
};

export default ProtectedRoute; 
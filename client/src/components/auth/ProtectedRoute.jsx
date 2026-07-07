import { Navigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";

const ProtectedRoute = ({ children, requireProfile = true }) => {
  const { isAuthenticated, isProfileComplete, token } = useSelector(
    (s) => s.auth,
  );
  const location = useLocation();

  // Not logged in at all
  if (!isAuthenticated && !token) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // Logged in but profile incomplete — redirect to onboarding
  if (requireProfile && token && isAuthenticated && !isProfileComplete) {
    return <Navigate to="/onboarding" replace />;
  }

  return children;
};

export default ProtectedRoute;

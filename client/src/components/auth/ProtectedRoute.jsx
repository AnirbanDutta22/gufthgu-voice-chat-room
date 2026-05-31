import { Navigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";

const ProtectedRoute = ({ children, requireProfile = true }) => {
  const { isAuthenticated, isProfileComplete, token } = useSelector(
    (s) => s.auth,
  );

  console.log(isAuthenticated, isProfileComplete, token);
  const location = useLocation();

  if (!isAuthenticated && !token) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  if (requireProfile && !isProfileComplete) {
    return <Navigate to="/onboarding" replace />;
  }

  return children;
};

export default ProtectedRoute;

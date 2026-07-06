import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

// Redirects logged-in users away from auth pages
const GuestRoute = ({ children }) => {
  const { isAuthenticated, isProfileComplete } = useSelector((s) => s.auth);

  if (isAuthenticated) {
    return (
      <Navigate to={isProfileComplete ? "/explore" : "/onboarding"} replace />
    );
  }

  return children;
};

export default GuestRoute;

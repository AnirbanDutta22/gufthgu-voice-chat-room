import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";

const GuestRoute = () => {
  const { token, isProfileComplete } = useSelector((s) => s.auth);

  if (token && isProfileComplete) {
    return <Navigate to="/explore" replace />;
  }

  if (token && !isProfileComplete) {
    return <Navigate to="/onboarding" replace />;
  }

  return <Outlet />;
};

export default GuestRoute;

import { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Toaster } from "react-hot-toast";
import { fetchMe } from "./store/slices/authSlice";
import { initSocket } from "./services/socket";

import LandingPage from "./components/landing/LandingPage";
import AuthPage from "./components/auth/AuthPage";
import OnboardingPage from "./components/auth/OnboardingPage";
import AppLayout from "./components/layout/AppLayout";
import ExplorePage from "./pages/ExplorePage";
import HomePage from "./pages/HomePage";
import RoomPage from "./pages/RoomPage";
import ProfilePage from "./pages/ProfilePage";
import SettingsPage from "./pages/SettingsPage";
import SavedPage from "./pages/SavedPage";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import GuestRoute from "./components/routing/GuestRoute";
import AnalyticsModal from "./components/analytics/AnalyticsModal";
import { setAnalyticsModal } from "./store/slices/uiSlice";
import { useDispatch as useAppDispatch } from "react-redux";

function App() {
  const dispatch = useDispatch();
  const { token } = useSelector((s) => s.auth);
  const { analyticsModalOpen } = useSelector((s) => s.ui);

  useEffect(() => {
    if (token) {
      dispatch(fetchMe());
      initSocket(token);
    }
  }, [token, dispatch]);

  return (
    <>
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: "#ffffff",
            color: "#141414",
            border: "1px solid #141414",
            borderRadius: "0.75rem",
            fontSize: "0.875rem",
            fontFamily: "Manrope, sans-serif",
            fontWeight: "600",
            boxShadow: "3px 3px 0px rgba(0,0,0,1)",
          },
          success: {
            iconTheme: { primary: "#f59e0b", secondary: "#ffffff" },
          },
          error: {
            iconTheme: { primary: "#ef4444", secondary: "#ffffff" },
          },
        }}
      />

      <Routes>
        {/* Public */}
        <Route path="/" element={<LandingPage />} />
        <Route
          path="/auth"
          element={
            <GuestRoute>
              <AuthPage />
            </GuestRoute>
          }
        />
        <Route
          path="/onboarding"
          element={
            <ProtectedRoute requireProfile={false}>
              <OnboardingPage />
            </ProtectedRoute>
          }
        />

        {/* Authenticated layout */}
        <Route
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/explore" element={<ExplorePage />} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/profile/:userId" element={<ProfilePage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/saved" element={<SavedPage />} />
          <Route path="*" element={<Navigate to="/explore" replace />} />
        </Route>

        {/* Room — full screen, outside AppLayout */}
        <Route
          path="/room/:roomId"
          element={
            <ProtectedRoute>
              <RoomPage />
            </ProtectedRoute>
          }
        />
      </Routes>

      {analyticsModalOpen && (
        <AnalyticsModal onClose={() => dispatch(setAnalyticsModal(false))} />
      )}
    </>
  );
}

export default App;

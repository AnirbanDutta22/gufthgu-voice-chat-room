import { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Toaster } from "react-hot-toast";
import { fetchMe } from "./store/slices/authSlice";

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
import AnalyticsModal from "./components/analytics/AnalyticsModal";
import { setAnalyticsModal } from "./store/slices/uiSlice";

function App() {
  const dispatch = useDispatch();
  const { token } = useSelector((s) => s.auth);
  const { analyticsModalOpen } = useSelector((s) => s.ui);

  useEffect(() => {
    if (token) {
      dispatch(fetchMe());
    }
  }, [token, dispatch]);

  return (
    <>
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: "#1a1a30",
            color: "#f0f0f8",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: "0.75rem",
            fontSize: "0.875rem",
            fontFamily: "DM Sans, sans-serif",
          },
          success: { iconTheme: { primary: "#6bcb9e", secondary: "#1a1a30" } },
          error: { iconTheme: { primary: "#ff6b6b", secondary: "#1a1a30" } },
        }}
      />

      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route
          path="/onboarding"
          element={
            <ProtectedRoute requireProfile={false}>
              <OnboardingPage />
            </ProtectedRoute>
          }
        />

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

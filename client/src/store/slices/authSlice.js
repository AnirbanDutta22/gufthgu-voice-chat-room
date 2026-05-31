import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api";

export const sendOtp = createAsyncThunk(
  "auth/sendOtp",
  async ({ contact, type }, { rejectWithValue }) => {
    try {
      const res = await api.post("/auth/send-otp", { contact, type });
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to send OTP",
      );
    }
  },
);

export const verifyOtp = createAsyncThunk(
  "auth/verifyOtp",
  async ({ contact, otp, type }, { rejectWithValue }) => {
    try {
      const res = await api.post("/auth/verify-otp", { contact, otp, type });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Invalid OTP");
    }
  },
);

export const fetchMe = createAsyncThunk(
  "auth/fetchMe",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/auth/me");
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Session expired");
    }
  },
);

export const logoutUser = createAsyncThunk(
  "auth/logout",
  async (_, { rejectWithValue }) => {
    try {
      await api.post("/auth/logout");
      return true;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message);
    }
  },
);

const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: null,
    token: localStorage.getItem("token") || null,
    isAuthenticated: false,
    isProfileComplete: false,
    loading: false,
    otpSent: false,
    otpContact: null,
    otpType: null,
    error: null,
    onboardingStep: 0,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    resetOtp: (state) => {
      state.otpSent = false;
      state.otpContact = null;
    },
    setToken: (state, action) => {
      state.token = action.payload;
      localStorage.setItem("token", action.payload);
    },
    setOnboardingStep: (state, action) => {
      state.onboardingStep = action.payload;
    },
    updateUserProfile: (state, action) => {
      if (state.user) {
        state.isProfileComplete = action.payload.isProfileComplete;
        state.user = { ...state.user, ...action.payload };
      }
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.isProfileComplete = false;
      localStorage.removeItem("token");
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(sendOtp.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(sendOtp.fulfilled, (state, action) => {
        state.loading = false;
        state.otpSent = true;
        state.otpContact = action.meta.arg.contact;
        state.otpType = action.meta.arg.type;
      })
      .addCase(sendOtp.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(verifyOtp.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verifyOtp.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload.token;
        state.user = action.payload.user;
        state.isAuthenticated = true;
        state.isProfileComplete =
          action.payload.user?.isProfileComplete || false;
        if (action.payload.token)
          localStorage.setItem("token", action.payload.token);
      })
      .addCase(verifyOtp.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchMe.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.isAuthenticated = true;
        state.isProfileComplete =
          action.payload.user?.isProfileComplete || false;
      })
      .addCase(fetchMe.rejected, (state) => {
        state.user = null;
        state.isAuthenticated = false;
        state.token = null;
        localStorage.removeItem("token");
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.isProfileComplete = false;
        localStorage.removeItem("token");
      });
  },
});

export const {
  clearError,
  resetOtp,
  setToken,
  setOnboardingStep,
  updateUserProfile,
  logout,
} = authSlice.actions;
export default authSlice.reducer;

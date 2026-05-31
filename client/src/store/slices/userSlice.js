import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api";

export const fetchUserProfile = createAsyncThunk(
  "user/fetchProfile",
  async (userId, { rejectWithValue }) => {
    try {
      const res = await api.get(`/users/${userId}`);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message);
    }
  },
);

export const followUser = createAsyncThunk(
  "user/follow",
  async (userId, { rejectWithValue }) => {
    try {
      const res = await api.post(`/users/${userId}/follow`);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message);
    }
  },
);

export const unfollowUser = createAsyncThunk(
  "user/unfollow",
  async (userId, { rejectWithValue }) => {
    try {
      const res = await api.post(`/users/${userId}/unfollow`);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message);
    }
  },
);

export const updateProfile = createAsyncThunk(
  "user/updateProfile",
  async (profileData, { rejectWithValue }) => {
    try {
      const res = await api.put("/users/profile", profileData, {
        headers:
          profileData instanceof FormData
            ? { "Content-Type": "multipart/form-data" }
            : {},
      });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message);
    }
  },
);

export const fetchSuggestedUsers = createAsyncThunk(
  "user/fetchSuggested",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/users/suggested");
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message);
    }
  },
);

export const searchUsers = createAsyncThunk(
  "user/search",
  async (query, { rejectWithValue }) => {
    try {
      const res = await api.get("/users/search", { params: { q: query } });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message);
    }
  },
);

export const subscribeTopics = createAsyncThunk(
  "user/subscribeTopics",
  async (topics, { rejectWithValue }) => {
    try {
      const res = await api.put("/users/topics", { topics });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message);
    }
  },
);

const userSlice = createSlice({
  name: "user",
  initialState: {
    viewedProfile: null,
    suggestedUsers: [],
    searchResults: [],
    following: [],
    followers: [],
    loading: false,
    searchLoading: false,
    error: null,
  },
  reducers: {
    clearSearchResults: (state) => {
      state.searchResults = [];
    },
    clearViewedProfile: (state) => {
      state.viewedProfile = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserProfile.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.viewedProfile = action.payload.user;
        state.following = action.payload.following || [];
        state.followers = action.payload.followers || [];
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchSuggestedUsers.fulfilled, (state, action) => {
        state.suggestedUsers = action.payload.users;
      })
      .addCase(searchUsers.pending, (state) => {
        state.searchLoading = true;
      })
      .addCase(searchUsers.fulfilled, (state, action) => {
        state.searchLoading = false;
        state.searchResults = action.payload.users;
      })
      .addCase(searchUsers.rejected, (state) => {
        state.searchLoading = false;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        if (state.viewedProfile?._id === action.payload.user._id)
          state.viewedProfile = action.payload.user;
      });
  },
});

export const { clearSearchResults, clearViewedProfile } = userSlice.actions;
export default userSlice.reducer;

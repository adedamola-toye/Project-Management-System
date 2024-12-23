import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// Define API URL
const API_URL = import.meta.env.VITE_BACKEND_BASE_URL || "http://localhost:5000";


// Create user async action
export const createUser = createAsyncThunk(
  "user/createUser",
  async (userData, { rejectWithValue }) => {
    try {
      console.log("Creating user with data:", userData);
      const response = await axios.post(`${API_URL}/api/users`, userData);
      console.log("User created successfully:", response.data);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error("Axios error:", error.response?.data || error.message);
        return rejectWithValue(error.response?.data || "Something went wrong");
      } else {
        console.error("Unknown error:", error);
        return rejectWithValue("An unexpected error occurred.");
      }
    }
  }
);

// Get all users async action
export const getAllUsers = createAsyncThunk(
  "user/getAllUsers",
  async () => {
    const response = await axios.get(`${API_URL}/api/users`);
    return response.data;
  }
);

// Get user by ID async action
export const getUserById = createAsyncThunk(
  "user/getUserById",
  async (userId) => {
    const response = await axios.get(`${API_URL}/api/users/${userId}`);
    return response.data;
  }
);

// Update user async action
export const updateUser = createAsyncThunk(
  "user/updateUser",
  async ({ userId, userData }) => {
    const response = await axios.put(`${API_URL}/api/users/${userId}`, userData);
    return response.data;
  }
);

// Delete user async action
export const deleteUser = createAsyncThunk(
  "user/deleteUser",
  async (userId) => {
    await axios.delete(`${API_URL}/api/users/${userId}`);
    return userId; // Return the userId to update the state
  }
);

// User slice definition
const userSlice = createSlice({
  name: "user",
  initialState: {
    users: [],
    loading: false,
    error: null,
    username: null,
    email: null,
    token: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Create User
      .addCase(createUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(createUser.fulfilled, (state, action) => {
        state.loading = false;
        state.users.push(action.payload);
      })
      .addCase(createUser.rejected, (state, action) => {
        state.loading = false;
        if (typeof action.payload === 'string') {
          state.error = action.payload;
        } else if (action.payload && typeof action.payload === 'object') {
          state.error = action.payload.error || 'An error occurred';
        } else {
          state.error = 'An error occurred';
        }
      })

      // Get All Users
      .addCase(getAllUsers.pending, (state) => {
        state.loading = true;
      })
      .addCase(getAllUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload;
        console.log(action.payload)
      })
      .addCase(getAllUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch users.";
      })

      // Get User by ID
      .addCase(getUserById.pending, (state) => {
        state.loading = true;
      })
      .addCase(getUserById.fulfilled, (state, action) => {
        state.loading = false;
        const existingUserIndex = state.users.findIndex(
          (user) => user.id === action.payload.id
        );
        if (existingUserIndex >= 0) {
          state.users[existingUserIndex] = action.payload;
        } else {
          state.users.push(action.payload);
        }
      })
      .addCase(getUserById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch user.";
      })

      // Update User
      .addCase(updateUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        state.loading = false;
        const existingUserIndex = state.users.findIndex(
          (user) => user.id === action.payload.id
        );
        if (existingUserIndex >= 0) {
          state.users[existingUserIndex] = action.payload;
        }
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to update user.";
      })

      // Delete User
      .addCase(deleteUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.loading = false;
        state.users = state.users.filter((user) => user.id !== action.payload);
      })
      .addCase(deleteUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to delete user.";
      });
  },
});

export const getUsers = (state) => state.user.users;

export default userSlice.reducer;

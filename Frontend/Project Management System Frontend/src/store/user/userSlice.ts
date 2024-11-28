/* import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// Define API URL
const API_URL = "http://localhost:5000/api/users"; // Update with your API URL

// Create user async action
export const createUser = createAsyncThunk(
  "user/createUser",
  async (userData) => {
    const response = await axios.post(`${API_URL}`, userData);
    return response.data;
  }
);

// Get all users async action
export const getAllUsers = createAsyncThunk("user/getAllUsers", async () => {
  const response = await axios.get(`${API_URL}`);
  return response.data;
});

// Get user by ID async action
export const getUserById = createAsyncThunk("user/getUserById", async (userId) => {
  const response = await axios.get(`${API_URL}/${userId}`);
  return response.data;
});

// Update user async action
export const updateUser = createAsyncThunk(
  "user/updateUser",
  async ({ userId, userData }) => {
    const response = await axios.put(`${API_URL}/${userId}`, userData);
    return response.data;
  }
);

// Delete user async action
export const deleteUser = createAsyncThunk("user/deleteUser", async (userId) => {
  const response = await axios.delete(`${API_URL}/${userId}`);
  return response.data;
});

// User slice definition
const userSlice = createSlice({
  name: "user",
  initialState: {
    users: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    // Handle create user
    builder
      .addCase(createUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(createUser.fulfilled, (state, action) => {
        state.loading = false;
        state.users.push(action.payload);
      })
      .addCase(createUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })

      // Handle get all users
      .addCase(getAllUsers.pending, (state) => {
        state.loading = true;
      })
      .addCase(getAllUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload;
      })
      .addCase(getAllUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })

      // Handle get user by ID
      .addCase(getUserById.pending, (state) => {
        state.loading = true;
      })
      .addCase(getUserById.fulfilled, (state, action) => {
        state.loading = false;
        const userIndex = state.users.findIndex((user) => user.id === action.payload.id);
        if (userIndex >= 0) {
          state.users[userIndex] = action.payload;
        } else {
          state.users.push(action.payload);
        }
      })
      .addCase(getUserById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })

      // Handle update user
      .addCase(updateUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        state.loading = false;
        const userIndex = state.users.findIndex((user) => user.id === action.payload.id);
        if (userIndex >= 0) {
          state.users[userIndex] = action.payload;
        }
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })

      // Handle delete user
      .addCase(deleteUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.loading = false;
        state.users = state.users.filter((user) => user.id !== action.payload.id);
      })
      .addCase(deleteUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});

export default userSlice.reducer;
 */
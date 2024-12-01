import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// User Interface
interface User {
  id: string;
  username: string;
  email: string;
  password: string;
  role?: string;
}

// UserState Interface
interface UserState {
  users: User[];
  loading: boolean;
  error: string | null;
}

// Initial State
const initialState: UserState = {
  users: [],
  loading: false,
  error: null,
};

// Define API URL
const API_URL = import.meta.env.VITE_BACKEND_BASE_URL || "http://localhost:5000/users";




// Create user async action
export const createUser = createAsyncThunk<User, Omit<User, "id">>(
  "user/createUser",
  async (userData) => {
    const response = await axios.post<User>(`${API_URL}/api/users`, userData);
    return response.data;
  }
);

// Get all users async action
export const getAllUsers = createAsyncThunk<User[]>(
  "user/getAllUsers",
  async () => {
    const response = await axios.get<User[]>(`${API_URL}/api/users`);
    return response.data;
  }
);

// Get user by ID async action
export const getUserById = createAsyncThunk<User, string>(
  "user/getUserById",
  async (userId) => {
    const response = await axios.get<User>(`${API_URL}/api/users/${userId}`);
    return response.data;
  }
);

// Update user async action
export const updateUser = createAsyncThunk<
  User,
  { userId: string; userData: Partial<User> }
>(
  "user/updateUser",
  async ({ userId, userData }) => {
    const response = await axios.put<User>(`${API_URL}/api/users/${userId}`, userData);
    return response.data;
  }
);

// Delete user async action
export const deleteUser = createAsyncThunk<string, string>(
  "user/deleteUser",
  async (userId) => {
    await axios.delete(`${API_URL}/api/users/${userId}`);
    return userId; // Return the userId to update the state
  }
);

// User slice definition
const userSlice = createSlice({
  name: "user",
  initialState,
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
        state.error = action.error.message || "Failed to create user.";
      })

      // Get All Users
      .addCase(getAllUsers.pending, (state) => {
        state.loading = true;
      })
      .addCase(getAllUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload;
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

export default userSlice.reducer;

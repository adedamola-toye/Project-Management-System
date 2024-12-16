import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Define API URL using Vite's import.meta.env
const API_URL = import.meta.env.VITE_BACKEND_BASE_URL || "http://localhost:3000";

// Initial State
const initialState = {
  user: null,
  accessToken: null,
  refreshToken: null,
  loading: {
    login: false,
    signup: false,
    refresh: false
  },
  error: {
    login: null,
    signup: null,
    refresh: null
  }
};


export const validateStoredTokens = async () => {
  const accessToken = localStorage.getItem('accessToken');
  const refreshToken = localStorage.getItem('refreshToken');
  const user = localStorage.getItem('user');

  if (!accessToken || !refreshToken || !user) {
    localStorage.clear();
    return null; // Tokens or user data are incomplete
  }

  try {
    // Make a lightweight request to validate the token
    const response = await axios.get(`${API_URL}/api/auth/validate-token`, {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });
    return JSON.parse(user); // Return user if token is valid
  } catch {
    localStorage.clear();
    return null; // Invalid token, clear localStorage
  }
};


// Signup async thunk
export const signupUser = createAsyncThunk(
  'auth/signup',
  async ({ username, email, password }, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/api/auth/signup`, {
        username,
        email,
        password
      });

      const { user, accessToken, refreshToken } = response.data;
      
      // Store tokens in localStorage
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);

      return { user, accessToken, refreshToken };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        return rejectWithValue(error.response?.data?.error || 'Signup failed');
      }
      return rejectWithValue('Signup failed');
    }
  }
);

// Login async thunk
export const loginUser = createAsyncThunk(
  'auth/login',
  async ({ email, password }, { rejectWithValue, dispatch}) => {
    try {
      console.log("Attempting to login...");
      const response = await axios.post(`${API_URL}/api/auth/login`, {
        email,
        password
      });
      console.log("Login successful:", response.data);

      const { accessToken, refreshToken } = response.data;
      
      // Store tokens in localStorage
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);

      // Get user profile with the new token
      const userResponse = await axios.get(`${API_URL}/api/auth/profile`, {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      });

      console.log('User logged in:', userResponse.data.user);

      return {
        user: userResponse.data.user,
        accessToken,
        refreshToken
      };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        return rejectWithValue(error.response?.data?.error || 'Login failed');
      }
      return rejectWithValue('Login failed');
    }
  }
);

// Refresh token async thunk
export const refreshUserToken = createAsyncThunk(
  'auth/refreshToken',
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState();
      const refreshToken = state.auth.refreshToken;

      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await axios.post(`${API_URL}/api/auth/refresh-token`, {
        refreshToken
      });

      const { accessToken } = response.data;
      localStorage.setItem('accessToken', accessToken);

      return { accessToken };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        return rejectWithValue(error.response?.data?.error || 'Token refresh failed');
      }
      return rejectWithValue('Token refresh failed');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.accessToken = null;
      state.refreshToken = null;
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    },
    clearErrors: (state) => {
      state.error = {
        login: null,
        signup: null,
        refresh: null
      };
    }
  },
  extraReducers: (builder) => {
    builder
      // Signup cases
      .addCase(signupUser.pending, (state) => {
        state.loading.signup = true;
        state.error.signup = null;
      })
      .addCase(signupUser.fulfilled, (state, action) => {
        state.loading.signup = false;
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
        state.refreshToken = action.payload.refreshToken;
        state.error.signup = null;
      })
      .addCase(signupUser.rejected, (state, action) => {
        state.loading.signup = false;
        state.error.signup = action.payload;
      })
      // Login cases
      .addCase(loginUser.pending, (state) => {
        state.loading.login = true;
        state.error.login = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading.login = false;
        state.user = action.payload.user;
        console.log("User from payload:", action.payload.user);
        state.accessToken = action.payload.accessToken;
        state.refreshToken = action.payload.refreshToken;
        state.error.login = null;

      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading.login = false;
        state.error.login = action.payload;
      })
      // Refresh token cases
      .addCase(refreshUserToken.pending, (state) => {
        state.loading.refresh = true;
        state.error.refresh = null;
      })
      .addCase(refreshUserToken.fulfilled, (state, action) => {
        state.loading.refresh = false;
        state.accessToken = action.payload.accessToken;
        state.error.refresh = null;
      })
      .addCase(refreshUserToken.rejected, (state, action) => {
        state.loading.refresh = false;
        state.error.refresh = action.payload;
      });
  }
});

export const { logout, clearErrors } = authSlice.actions;

export default authSlice.reducer;

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Define API URL
const API_URL = import.meta.env.VITE_BACKEND_BASE_URL || "http://localhost:3000";

interface User {
  id: string;
  username: string;
  email: string;
  password: string;
  role?: string;
}

interface AuthState {
  user: User | null; 
  accessToken: string | null;
  refreshToken: string | null;
  loading: {
    login: boolean;
    signup: boolean;
    refresh: boolean;
  };
  error: {
    login: string | null;
    signup: string | null;
    refresh: string | null;
  };
}


const initialState: AuthState = {
  user: null,
  accessToken: localStorage.getItem('accessToken'),
  refreshToken: localStorage.getItem('refreshToken'),
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

// Signup async thunk
export const signupUser = createAsyncThunk(
  'auth/signup',
  async ({ username, email, password }: { 
    username: string; 
    email: string; 
    password: string 
  }, { rejectWithValue }) => {
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
  async ({ email, password }: { 
    email: string; 
    password: string 
  }, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/api/auth/login`, {
        email,
        password
      });

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
      const state = getState() as { auth: AuthState };
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
        state.error.signup = action.payload as string;
      })
      // Login cases
      .addCase(loginUser.pending, (state) => {
        state.loading.login = true;
        state.error.login = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading.login = false;
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
        state.refreshToken = action.payload.refreshToken;
        state.error.login = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading.login = false;
        state.error.login = action.payload as string;
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
        state.error.refresh = action.payload as string;
      });
  }
});

export const { logout, clearErrors } = authSlice.actions;

export default authSlice.reducer;
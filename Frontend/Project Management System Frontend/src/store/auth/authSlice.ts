// src/store/authSlice.ts
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';


// Define API URL
const API_URL = import.meta.env.VITE_BACKEND_BASE_URL || "http://localhost:5000";

console.log(API_URL)


export const signupUser = createAsyncThunk(
  'auth/signup',
  async ({ username, email, password }: { username: string; email: string; password: string }, { dispatch }) => {
    dispatch(signupStart());
    try {
      const response = await axios.post(`${API_URL}/api/auth/signup`, { username, email, password });
      const { user } = response.data;
      dispatch(signupSuccess({ user }));
      return user;
    } catch (error) {
      const errorMessage =
        axios.isAxiosError(error) && error.response?.data?.error
          ? error.response.data.error
          : 'Signup failed';
      dispatch(signupFailure(errorMessage));  
      throw error;
    }
  }
);


// Login async thunk
export const loginUser = createAsyncThunk(
  'auth/login',
  async ({ username, password }: { username: string; password: string }, { dispatch }) => {
    dispatch(loginStart());
    try {
      const response = await axios.post(`${API_URL}/api/auth/login`, { username, password });
      const { user } = response.data;
      dispatch(loginSuccess({ user }));
      return user;
    } catch (error) {
      const errorMessage =
        axios.isAxiosError(error) && error.response?.data?.error
          ? error.response.data.error
          : 'Login failed';
      dispatch(loginFailure(errorMessage));
      throw error;
    }
  }
);



const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    loading: { login: false, signup: false },  // separate loading states
    error: { login: null, signup: null },      // separate error states
  },
  reducers: {
    loginStart: (state) => {
      state.loading.login = true;
    },
    loginSuccess: (state, action) => {
      state.loading.login = false;
      state.user = action.payload.user;
      state.error.login = null;
    },
    loginFailure: (state, action) => {
      state.loading.login = false;
      state.error.login = action.payload;
    },
    signupStart: (state) => {
      state.loading.signup = true;
    },
    signupSuccess: (state, action) => {
      state.loading.signup = false;
      state.user = action.payload.user;
      state.error.signup = null;
    },
    signupFailure: (state, action) => {
      state.loading.signup = false;
      state.error.signup = action.payload;
    },
  },
});

export const {
  loginStart,
  loginSuccess,
  loginFailure,
  signupStart,
  signupSuccess,
  signupFailure,
} = authSlice.actions;

export default authSlice.reducer;

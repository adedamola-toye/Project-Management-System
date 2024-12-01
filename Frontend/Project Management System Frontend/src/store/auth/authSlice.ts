// src/store/authSlice.ts
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

export const signupUser = createAsyncThunk(
  'auth/signup',
  async (
    { username, email, password }: { username: string; email: string; password: string },
    { dispatch }
  ) => {
    dispatch(signupStart());
    try {
      const response = await axios.post('/api/auth/signup', { username, email, password });
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

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    loading: false,
    error: null,
  },
  reducers: {
    signupStart: (state) => {
      state.loading = true;
    },
    signupSuccess: (state, action) => {
      state.loading = false;
      state.user = action.payload.user;
      state.error = null;
    },
    signupFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
  },
});

export const { signupStart, signupSuccess, signupFailure } = authSlice.actions;
export default authSlice.reducer;

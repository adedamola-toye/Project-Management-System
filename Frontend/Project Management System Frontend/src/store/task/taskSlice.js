import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// Create task async action
export const createTask = createAsyncThunk(
  "task/createTask",
  async (taskData) => {
    const response = await axios.post(`${process.env.VITE_BACKEND_BASE_URL || "http://localhost:5000/users"}`, taskData);
    return response.data;
  }
);

// Get all tasks async action
export const getAllTasks = createAsyncThunk(
  "task/getAllTasks",
  async () => {
    const response = await axios.get(`${process.env.VITE_BACKEND_BASE_URL || "http://localhost:5000/users"}`);
    return response.data;
  }
);

// Get task by ID async action
export const getTaskById = createAsyncThunk(
  "task/getTaskById",
  async (taskId) => {
    const response = await axios.get(`${process.env.VITE_BACKEND_BASE_URL || "http://localhost:5000/users"}/${taskId}`);
    return response.data;
  }
);

// Update task async action
export const updateTask = createAsyncThunk(
  "task/updateTask",
  async ({ taskId, taskData }) => {
    const response = await axios.put(`${process.env.VITE_BACKEND_BASE_URL || "http://localhost:5000/users"}/${taskId}`, taskData);
    return response.data;
  }
);

// Delete task async action
export const deleteTask = createAsyncThunk(
  "task/deleteTask",
  async (taskId) => {
    await axios.delete(`${process.env.VITE_BACKEND_BASE_URL || "http://localhost:5000/users"}/${taskId}`);
    return taskId; // Return the taskId to update the state
  }
);

// Task slice definition
const taskSlice = createSlice({
  name: "task",
  initialState: {
    tasks: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Create Task
      .addCase(createTask.pending, (state) => {
        state.loading = true;
      })
      .addCase(createTask.fulfilled, (state, action) => {
        state.loading = false;
        state.tasks.push(action.payload);
      })
      .addCase(createTask.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to create task.";
      })

      // Get All Tasks
      .addCase(getAllTasks.pending, (state) => {
        state.loading = true;
      })
      .addCase(getAllTasks.fulfilled, (state, action) => {
        state.loading = false;
        state.tasks = action.payload;
      })
      .addCase(getAllTasks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch tasks.";
      })

      // Get Task by ID
      .addCase(getTaskById.pending, (state) => {
        state.loading = true;
      })
      .addCase(getTaskById.fulfilled, (state, action) => {
        state.loading = false;
        const existingTaskIndex = state.tasks.findIndex(
          (task) => task.id === action.payload.id
        );
        if (existingTaskIndex >= 0) {
          state.tasks[existingTaskIndex] = action.payload;
        } else {
          state.tasks.push(action.payload);
        }
      })
      .addCase(getTaskById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch task.";
      })

      // Update Task
      .addCase(updateTask.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateTask.fulfilled, (state, action) => {
        state.loading = false;
        const existingTaskIndex = state.tasks.findIndex(
          (task) => task.id === action.payload.id
        );
        if (existingTaskIndex >= 0) {
          state.tasks[existingTaskIndex] = action.payload;
        }
      })
      .addCase(updateTask.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to update task.";
      })

      // Delete Task
      .addCase(deleteTask.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteTask.fulfilled, (state, action) => {
        state.loading = false;
        state.tasks = state.tasks.filter((task) => task.id !== action.payload);
      })
      .addCase(deleteTask.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to delete task.";
      });
  },
});

export default taskSlice.reducer;

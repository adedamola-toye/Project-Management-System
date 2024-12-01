import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// Task Interface
interface Task {
  id: string;
  title: string;
  description: string;
  assignee?: string;
  project_id: string;
  due_date?: string;
  priority: "Low" | "Medium" | "High";
  status: "To Do" | "In Progress" | "Completed";
  created_by: string;
  updated_by?: string;
}

// TaskState Interface
interface TaskState {
  tasks: Task[];
  loading: boolean;
  error: string | null;
}

// Initial State
const initialState: TaskState = {
  tasks: [],
  loading: false,
  error: null,
};

// Define API URL
const API_URL = import.meta.env.VITE_BACKEND_BASE_URL || "http://localhost:5000/users";


// Create task async action
export const createTask = createAsyncThunk<Task, Omit<Task, "id">>(
  "task/createTask",
  async (taskData) => {
    const response = await axios.post<Task>(API_URL, taskData);
    return response.data;
  }
);

// Get all tasks async action
export const getAllTasks = createAsyncThunk<Task[]>(
  "task/getAllTasks",
  async () => {
    const response = await axios.get<Task[]>(API_URL);
    return response.data;
  }
);

// Get task by ID async action
export const getTaskById = createAsyncThunk<Task, string>(
  "task/getTaskById",
  async (taskId) => {
    const response = await axios.get<Task>(`${API_URL}/${taskId}`);
    return response.data;
  }
);

// Update task async action
export const updateTask = createAsyncThunk<
  Task,
  { taskId: string; taskData: Partial<Task> }
>(
  "task/updateTask",
  async ({ taskId, taskData }) => {
    const response = await axios.put<Task>(`${API_URL}/${taskId}`, taskData);
    return response.data;
  }
);

// Delete task async action
export const deleteTask = createAsyncThunk<string, string>(
  "task/deleteTask",
  async (taskId) => {
    await axios.delete(`${API_URL}/${taskId}`);
    return taskId; // Return the taskId to update the state
  }
);

// Task slice definition
const taskSlice = createSlice({
  name: "task",
  initialState,
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

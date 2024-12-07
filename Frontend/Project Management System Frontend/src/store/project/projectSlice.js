import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// Project Interface (using JSDoc comments to simulate the type)
const API_URL = import.meta.env.VITE_BACKEND_BASE_URL || "http://localhost:5000";

// Function to get the access token from the state
const getAccessToken = (state) => state.auth.accessToken;

// Async actions

// Create project async action
export const createProject = createAsyncThunk(
  "project/createProject",
  async (project, { rejectWithValue, getState }) => {
    const state = getState();
    const accessToken = getAccessToken(state);

    try {
      const response = await axios.post(
        `${API_URL}/api/projects`,
        project,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        return rejectWithValue(error.response?.data || "Project creation failed");
      }
      return rejectWithValue("Project creation failed");
    }
  }
);

// Get all projects async action
export const getAllProjects = createAsyncThunk(
  "project/getAllProjects",
  async (_, { rejectWithValue, getState }) => {
    const state = getState();
    const accessToken = getAccessToken(state);

    try {
      const response = await axios.get(`${API_URL}/api/projects`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        return rejectWithValue(error.response?.data || "Failed to fetch projects");
      }
      return rejectWithValue("Failed to fetch projects");
    }
  }
);

// Update project async action
export const updateProject = createAsyncThunk(
  "project/updateProject",
  async ({ projectId, projectData }, { rejectWithValue, getState }) => {
    const state = getState();
    const accessToken = getAccessToken(state);

    try {
      const response = await axios.put(
        `${API_URL}/api/projects/${projectId}`,
        projectData,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        return rejectWithValue(error.response?.data || "Failed to update project");
      }
      return rejectWithValue("Failed to update project");
    }
  }
);

// Delete project async action
export const deleteProject = createAsyncThunk(
  "project/deleteProject",
  async (projectId, { rejectWithValue, getState }) => {
    const state = getState();
    const accessToken = getAccessToken(state);

    try {
      await axios.delete(`${API_URL}/api/projects/${projectId}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      return projectId;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        return rejectWithValue(error.response?.data || "Failed to delete project");
      }
      return rejectWithValue("Failed to delete project");
    }
  }
);

export const getProjectById = createAsyncThunk(
  "project/getProjectById",
  async (projectId, { rejectWithValue, getState }) => {
    const state = getState();
    const accessToken = getAccessToken(state);

    try {
      const response = await axios.get(`${API_URL}/api/projects/${projectId}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        return rejectWithValue(error.response?.data || "Failed to fetch project");
      }
      return rejectWithValue("Failed to fetch project");
    }
  }
);

// Create the projectSlice
const projectSlice = createSlice({
  name: "project",
  initialState: {
    projects: [],
    currentProject:null,
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(createProject.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createProject.fulfilled, (state, action) => {
        state.loading = false;
        state.projects.push(action.payload);
      })
      .addCase(createProject.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(getAllProjects.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllProjects.fulfilled, (state, action) => {
        state.loading = false;
        state.projects = action.payload;
      })
      .addCase(getAllProjects.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateProject.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProject.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.projects.findIndex((p) => p.id === action.payload.id);
        if (index !== -1) {
          state.projects[index] = action.payload;
        }
      })
      .addCase(updateProject.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(deleteProject.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteProject.fulfilled, (state, action) => {
        state.loading = false;
        state.projects = state.projects.filter((p) => p.id !== action.payload);
      })
      .addCase(deleteProject.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(getProjectById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getProjectById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentProject = action.payload; // store only the current project
      })
      .addCase(getProjectById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

// Export the reducer
export default projectSlice.reducer;

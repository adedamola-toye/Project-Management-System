import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// Project Interface
interface Project {
  id: string;
  title: string;
  description: string;
  created_by: string;
  created_at?:string;
  updated_by?: string;
  updated_at?: string;
}

// ProjectState Interface
interface ProjectState {
  projects: Project[];
  loading: boolean;
  error: string | null;
}

// Initial State
const initialState: ProjectState = {
  projects: [],
  loading: false,
  error: null,
};

// Define API URL for projects
const API_URL = import.meta.env.VITE_BACKEND_BASE_URL || "http://localhost:5000/users";


// Create project async action
export const createProject = createAsyncThunk(
  'project/createProject',
  async (project: Omit<Project, 'id'>, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/projects`, project);
      return response.data; // Assuming API returns created project with an id
    } catch (error) {
      if (axios.isAxiosError(error)) {
        return rejectWithValue(error.response?.data || 'Project creation failed');
      }
      return rejectWithValue('Project creation failed');
    }
  }
);

// Get all projects async action
export const getAllProjects = createAsyncThunk<Project[]>(
  "project/getAllProjects",
  async () => {
    const response = await axios.get<Project[]>(API_URL);
    return response.data;
  }
);

// Get project by ID async action
export const getProjectById = createAsyncThunk<Project, string>(
  "project/getProjectById",
  async (projectId) => {
    const response = await axios.get<Project>(`${API_URL}/${projectId}`);
    return response.data;
  }
);

// Update project async action
export const updateProject = createAsyncThunk<
  Project,
  { projectId: string; projectData: Partial<Project> }
>(
  "project/updateProject",
  async ({ projectId, projectData }) => {
    const response = await axios.put<Project>(
      `${API_URL}/${projectId}`,
      projectData
    );
    return response.data;
  }
);

// Delete project async action
export const deleteProject = createAsyncThunk<string, string>(
  "project/deleteProject",
  async (projectId) => {
    await axios.delete(`${API_URL}/${projectId}`);
    return projectId;
  }
);

// Project slice definition
const projectSlice = createSlice({
  name: "project",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Create Project
      .addCase(createProject.pending, (state) => {
        state.loading = true;
      })
      .addCase(createProject.fulfilled, (state, action) => {
        state.loading = false;
        state.projects.push(action.payload);
      })
      .addCase(createProject.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to create project.";
      })

      // Get All Projects
      .addCase(getAllProjects.pending, (state) => {
        state.loading = true;
      })
      .addCase(getAllProjects.fulfilled, (state, action) => {
        state.loading = false;
        state.projects = action.payload;
      })
      .addCase(getAllProjects.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch projects.";
      })

      // Get Project by ID
      .addCase(getProjectById.pending, (state) => {
        state.loading = true;
      })
      .addCase(getProjectById.fulfilled, (state, action) => {
        state.loading = false;
        const existingProjectIndex = state.projects.findIndex(
          (project) => project.id === action.payload.id
        );
        if (existingProjectIndex >= 0) {
          state.projects[existingProjectIndex] = action.payload;
        } else {
          state.projects.push(action.payload);
        }
      })
      .addCase(getProjectById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch project.";
      })

      // Update Project
      .addCase(updateProject.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateProject.fulfilled, (state, action) => {
        state.loading = false;
        const existingProjectIndex = state.projects.findIndex(
          (project) => project.id === action.payload.id
        );
        if (existingProjectIndex >= 0) {
          state.projects[existingProjectIndex] = action.payload;
        }
      })
      .addCase(updateProject.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to update project.";
      })

      // Delete Project
      .addCase(deleteProject.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteProject.fulfilled, (state, action) => {
        state.loading = false;
        state.projects = state.projects.filter(
          (project) => project.id !== action.payload
        );
      })
      .addCase(deleteProject.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to delete project.";
      });
  },
});

export default projectSlice.reducer;

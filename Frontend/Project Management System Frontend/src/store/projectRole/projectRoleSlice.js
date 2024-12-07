import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// Initial State
const initialState = {
  roles: [],
  tasks: [],
  isLoading: false,
  error: null,
};

// Define API URL using Vite's import.meta.env
const API_URL = import.meta.env.VITE_BACKEND_BASE_URL || "http://localhost:3000";
const getAccessToken = (state) => state.auth.accessToken;

// Utility function to handle Axios errors
const handleAxiosError = (error) =>
  axios.isAxiosError(error)
    ? (error.response?.data) || "An Axios error occurred"
    : "An unexpected error occurred";

// Async Thunks
export const assignRole = createAsyncThunk(
  "projectRole/assignRole",
  async ({ projectId, userId, role }, { rejectWithValue, getState }) => {
    const state = getState();
    const accessToken = getAccessToken(state);

    // Ensure the role matches the expected format ('Viewer', 'Editor', etc.)
    const formattedRole = role.charAt(0).toUpperCase() + role.slice(1).toLowerCase();

    console.log("Assigning role:", { projectId, userId, role: formattedRole });
    console.log("Access token:", accessToken);

    try {
      // Remove userId from the URL, pass it in the body instead
      const response = await axios.put(
        `${API_URL}/api/project-roles/projects/${projectId}/role`,
        { userId, role: formattedRole }, // Send userId in the body
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      console.log("Response from backend:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error assigning role:", error?.response?.data || error.message);
      return rejectWithValue(error.response?.data?.message || "Failed to assign role");
    }
  }
);




export const getRolesForProject = createAsyncThunk(
  "projectRole/getRolesForProject",
  async (projectId, { rejectWithValue, getState }) => {
    const state = getState();
    const accessToken = getAccessToken(state);

    try {
      const response = await axios.get(`${API_URL}/api/project-roles/projects/${projectId}/roles`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(handleAxiosError(error));
    }
  }
);

export const getUserRoles = createAsyncThunk(
  "projectRole/getUserRoles",
  async (userId, { rejectWithValue, getState }) => {
    const state = getState();
    const accessToken = getAccessToken(state);

    try {
      console.log("Fetching roles for userId:", userId);
      const response = await axios.get(`${API_URL}/api/project-roles/users/${userId}/roles`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(handleAxiosError(error));
    }
  }
);

export const updateRole = createAsyncThunk(
  "projectRole/updateRole",
  async ({ projectId, userId, role }, { rejectWithValue, getState }) => {
    const state = getState();
    const accessToken = getAccessToken(state);

    try {
      const response = await axios.put(
        `${API_URL}/api/project-roles/projects/${projectId}/users/${userId}/role`,
        { role },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(handleAxiosError(error));
    }
  }
);

export const removeRole = createAsyncThunk(
  "projectRole/removeRole",
  async ({ projectId, userId }, { rejectWithValue, getState }) => {
    const state = getState();
    const accessToken = getAccessToken(state);

    try {
      await axios.delete(`${API_URL}/api/project-roles/projects/${projectId}/users/${userId}/role`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      return userId;
    } catch (error) {
      return rejectWithValue(handleAxiosError(error));
    }
  }
);

export const getTasksForProject = createAsyncThunk(
  "projectRole/getTasksForProject",
  async (projectId, { rejectWithValue, getState }) => {
    const state = getState();
    const accessToken = getAccessToken(state);

    try {
      const response = await axios.get(`${API_URL}/api/project-roles/projects/${projectId}/tasks`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(handleAxiosError(error));
    }
  }
);

export const createTask = createAsyncThunk(
  "projectRole/createTask",
  async ({ projectId, task }, { rejectWithValue, getState }) => {
    const state = getState();
    const accessToken = getAccessToken(state);

    try {
      const response = await axios.post(
        `${API_URL}/api/project-roles/projects/${projectId}/tasks`,
        task,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(handleAxiosError(error));
    }
  }
);

export const updateTask = createAsyncThunk(
  "projectRole/updateTask",
  async ({ projectId, taskId, task }, { rejectWithValue, getState }) => {
    const state = getState();
    const accessToken = getAccessToken(state);

    try {
      const response = await axios.put(
        `${API_URL}/api/project-roles/projects/${projectId}/tasks/${taskId}`,
        task,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(handleAxiosError(error));
    }
  }
);

export const deleteTask = createAsyncThunk(
  "projectRole/deleteTask",
  async ({ projectId, taskId }, { rejectWithValue, getState }) => {
    const state = getState();
    const accessToken = getAccessToken(state);

    try {
      await axios.delete(`${API_URL}/api/project-roles/projects/${projectId}/tasks/${taskId}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      return taskId;
    } catch (error) {
      return rejectWithValue(handleAxiosError(error));
    }
  }
);

// Slice
const projectRoleSlice = createSlice({
  name: "projectRole",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
    .addCase(assignRole.fulfilled, (state, action) => {
      const roleAssignments = action.payload?.roleAssignment;
    
      if (Array.isArray(roleAssignments)) {
        // Ensure the roleAssignments is an array
        roleAssignments.forEach(({ user_id, project_id, role }) => {
          // Add the role to the state
          state.roles.push({
            userId: user_id,
            projectId: project_id,
            role,
          });
        });
        console.log("Updated roles in state:", state.roles);
      } else {
        // Handle error if roleAssignment is not an array
        console.error("Expected roleAssignment to be an array, but got:", roleAssignments);
        // Optionally, handle this error in the UI by updating state.error
        state.error = "Invalid role assignment format";
      }
    })
    
    
    .addCase(assignRole.rejected, (state, action) => {
      state.error = action.payload; // Handle the error here
    })
      // Get roles
      .addCase(getRolesForProject.fulfilled, (state, action) => {
        state.roles = action.payload;
        state.isLoading = false;
      })
      .addCase(getRolesForProject.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getRolesForProject.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Get user roles
      .addCase(getUserRoles.fulfilled, (state, action) => {
        const userRoles = action.payload;
        const uniqueProjects = [...new Set(userRoles.map(role => role.project))];
        state.projectsCount = uniqueProjects.length;
        state.uniqueProjects=uniqueProjects;
      })

      // Update role
      .addCase(updateRole.fulfilled, (state, action) => {
        const updatedRole = action.payload;
        const index = state.roles.findIndex((role) => role.userId === updatedRole.userId);
        if (index >= 0) {
          state.roles[index] = updatedRole;
        }
      })

      // Remove role
      .addCase(removeRole.fulfilled, (state, action) => {
        state.roles = state.roles.filter((role) => role.userId !== action.payload);
      })

      // Get tasks
      .addCase(getTasksForProject.fulfilled, (state, action) => {
        state.tasks = action.payload;
        state.isLoading = false;
      })

      // Create task
      .addCase(createTask.fulfilled, (state, action) => {
        state.tasks.push(action.payload);
      })

      // Update task
      .addCase(updateTask.fulfilled, (state, action) => {
        const updatedTask = action.payload;
        const index = state.tasks.findIndex((task) => task.id === updatedTask.id);
        if (index >= 0) {
          state.tasks[index] = updatedTask;
        }
      })

      // Delete task
      .addCase(deleteTask.fulfilled, (state, action) => {
        state.tasks = state.tasks.filter((task) => task.id !== action.payload);
      });
  },
});

export default projectRoleSlice.reducer;

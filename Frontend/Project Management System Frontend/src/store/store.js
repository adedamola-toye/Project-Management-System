import { configureStore } from "@reduxjs/toolkit";
import authReducer from './auth/authSlice';
import userReducer from './user/userSlice';
import taskReducer from './task/taskSlice';
import projectReducer from './project/projectSlice';
import modalReducer from './modal/modalSlice';
import projectRoleReducer from './projectRole/projectRoleSlice';

// Create the Redux store
const store = configureStore({
  reducer: {
    auth: authReducer,
    user: userReducer,
    task: taskReducer,
    project: projectReducer,
    modal: modalReducer,
    projectRole: projectRoleReducer
  },
});

export default store;

import { configureStore } from "@reduxjs/toolkit";
import authReducer from './auth/authSlice'
import userReducer from './user/userSlice';
import taskReducer from './task/taskSlice'
import projectReducer from './project/projectSlice'

const store = configureStore({
    reducer:{
        auth:authReducer,
        user:userReducer,
        task: taskReducer,
        project:projectReducer,
    }
})

export default store;
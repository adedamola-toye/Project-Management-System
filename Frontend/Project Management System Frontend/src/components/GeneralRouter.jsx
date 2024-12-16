import React, { useEffect } from 'react';
import { BrowserRouter, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import Dashboard from '../pages/Dashboard';
import ProjectView from '../pages/ProjectView';
import LandingPage from '../pages/LandingPage';
import UpdateProjectPage from '../pages/UpdateProjectForm';
import CreateTask from '../pages/CreateTaskForm';
import EditTask from '../pages/EditTaskForm';
import {validateStoredTokens} from '../store/auth/authSlice'
import { useDispatch } from 'react-redux';
import { closeModal } from '../store/modal/modalSlice';

const GeneralRouter = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const dispatch = useDispatch();

  useEffect(() => {
    const initializeAuth = async () => {
      const user = await validateStoredTokens();
      if (user) {
        dispatch({ type: 'auth/initialize', payload: user });
      } else {
        dispatch(closeModal()); // Close modals if user validation fails
      }
    };

    initializeAuth();
  }, [dispatch]); 
  useEffect(() => {
    localStorage.setItem("lastVisitedPath", location.pathname);
  }, [location]);


  useEffect(() => {
    const savedPath = localStorage.getItem("lastVisitedPath");
    const isAuthenticated = !!localStorage.getItem("accessToken");
  
    if (isAuthenticated && savedPath && savedPath !== "/") {
      navigate(savedPath);
    } else {
      localStorage.removeItem("lastVisitedPath");
    }
  }, [navigate]);
  

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/projects/:projectId" element={<ProjectView />} />
      <Route path="/projects/:projectId/update" element={<UpdateProjectPage />} />
      <Route path="/projects/:projectId/create-task" element={<CreateTask />} />
      <Route path="/projects/:projectId/tasks/:taskId/edit-task" element={<EditTask />} />
      {/* Catch-all route for 404 */}
      <Route path="*" element={<h1>404 Not Found</h1>} />
    </Routes>
  );
};


export default GeneralRouter;

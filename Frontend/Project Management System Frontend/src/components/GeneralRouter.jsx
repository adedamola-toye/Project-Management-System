import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Dashboard from '../pages/Dashboard';

import ProjectView from '../pages/ProjectView';
import LandingPage from '../pages/LandingPage';
import UpdateProjectPage from '../pages/UpdateProjectForm';
import CreateTask from '../pages/CreateTaskForm'
import EditTask from '../pages/EditTaskForm'
const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/projects/:projectId" element={<ProjectView />} />
        <Route path="/dashboard" element={<Dashboard/>}/>
        <Route path="/projects/:projectId/update" element={<UpdateProjectPage/>}/>
        <Route path="/projects/:projectId/create-task" element={<CreateTask/>}/>
        <Route path="/projects/:projectId/tasks/:taskId/edit-task" element={<EditTask/>}/>
        {/* Catch-all route for 404 */}
        <Route path="*" element={<h1>404 Not Found</h1>} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;

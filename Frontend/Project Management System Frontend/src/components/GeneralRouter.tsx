import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom'; // Import Routes here
import Dashboard from '../pages/Dashboard';
import Login from '../pages/Login';
import Signup from '../pages/SignUp';
import ProjectView from '../pages/ProjectView';
import LandingPage from '../pages/LandingPage';

const AppRouter: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/project/:projectId" element={<ProjectView />} />
        <Route path="/dashboard" element={<Dashboard/>}/>
        {/* Catch-all route for 404 */}
        <Route path="*" element={<h1>404 Not Found</h1>} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;

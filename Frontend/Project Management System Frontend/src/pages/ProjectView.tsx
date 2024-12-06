import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const API_URL = import.meta.env.VITE_BACKEND_BASE_URL || "http://localhost:5000/users";

// Define the Project and Role types
interface Project {
  id: number;
  title: string;
  description: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  updated_by: string;
}

interface Role {
  id: number;
  user_id: number;
  project_id: number;
  role: string;
}

const ProjectView: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const [project, setProject] = useState<Project | null>(null); // Properly typed state for project
  const [roles, setRoles] = useState<Role[]>([]); // Specify the type for roles

  useEffect(() => {
    const fetchProjectDetails = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/projects/${projectId}`);
        setProject(response.data);
      } catch (error) {
        console.error('Error fetching project details:', error);
      }
    };

    const fetchRoles = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/projects/${projectId}/roles`);
        // Ensure the response data is an array before setting state
        console.log('Roles:', response.data);
        if (Array.isArray(response.data)) {
          setRoles(response.data);
        } else {
          console.error('Invalid roles data:', response.data);
          setRoles([]); // Set an empty array if the data is invalid
        }
      } catch (error) {
        console.error('Error fetching roles:', error);
        setRoles([]); // Set an empty array in case of an error
      }
    };

    fetchProjectDetails();
    fetchRoles();
  }, [projectId]);

  const handleRoleChange = async (userId: number, role: string) => {
    try {
      await axios.put(`${API_URL}/api/projects/${projectId}/roles/${userId}`, { role });
      setRoles((prevRoles) =>
        prevRoles.map((r) =>
          r.user_id === userId ? { ...r, role } : r
        )
      );
    } catch (error) {
      console.error('Error updating role:', error);
    }
  };

  return (
    <div>
      <h2>{project?.title}</h2> 
      <p>{project?.description}</p>
      
      <h3>Roles</h3>
      <ul>
        {roles.map((role) => (
          <li key={role.id}>
            {role.user_id} - {role.role}
            <button onClick={() => handleRoleChange(role.user_id, 'Admin')}>Make Admin</button>
            <button onClick={() => handleRoleChange(role.user_id, 'Member')}>Make Member</button>
            <button onClick={() => handleRoleChange(role.user_id, 'Viewer')}>Make Viewer</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ProjectView;

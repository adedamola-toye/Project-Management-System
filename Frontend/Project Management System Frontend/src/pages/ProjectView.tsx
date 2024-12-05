import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getAllProjects } from '../store/project/projectSlice';
import ProjectFormModal from './Modals/ProjectFormModal';

const ProjectDashboard: React.FC = () => {
  const dispatch = useDispatch();
  const projects = useSelector((state: any) => state.project.projects);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    dispatch(getAllProjects());
  }, [dispatch]);

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  return (
    <div>
      <h1>Project Dashboard</h1>
      <button onClick={handleOpenModal}>Create New Project</button>
      
      {isModalOpen && <ProjectFormModal closeModal={handleCloseModal} />}

      <div>
        {projects.map((project: any) => (
          <div key={project.id}>
            <h2>{project.title}</h2>
            <p>{project.description}</p>
            <p>Created by: {project.created_by}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProjectDashboard;

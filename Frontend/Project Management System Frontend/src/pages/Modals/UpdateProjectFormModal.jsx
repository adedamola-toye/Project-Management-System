import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { closeModal } from './modalSlice';
import { updateProject } from './projectSlice';
import "../Page Styles/Modals.css";

const UpdateProjectModal = () => {
  const dispatch = useDispatch();
  const modalType = useSelector(state => state.modal.modalType);
  const project = useSelector(state =>
    state.modal.modalType === 'editProject' ? state.project.currentProject : null
  );
  const [updatedProject, setUpdatedProject] = useState({
    name: '',
    description: '',
  });

  useEffect(() => {
    if (project) {
      setUpdatedProject({
        name: project.name,
        description: project.description,
      });
    }
  }, [project]);

  const handleClose = () => {
    dispatch(closeModal());
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUpdatedProject(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (project) {
      dispatch(updateProject({ projectId: project.id, projectData: updatedProject }));
      dispatch(closeModal());
    }
  };

  if (modalType !== 'editProject') return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="close-btn" onClick={handleClose}>×</button>
        <h3>Edit Project</h3>
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label htmlFor="name">Project Name:</label>
            <input
              type="text"
              id="name"
              name="name"
              value={updatedProject.name}
              onChange={handleChange}
            />
          </div>
          <div className="input-group">
            <label htmlFor="description">Description:</label>
            <textarea
              id="description"
              name="description"
              value={updatedProject.description}
              onChange={handleChange}
            />
          </div>
          <button type="submit" className="submit-btn">Update Project</button>
        </form>
      </div>
    </div>
  );
};

export default UpdateProjectModal;

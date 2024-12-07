import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createProject } from "../../store/project/projectSlice";
import { closeModal } from "../../store/modal/modalSlice";
import { useNavigate } from 'react-router-dom';
import '../Page Styles/Modals.css';

const ProjectFormModal = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Get current username from the auth state
  const currentUsername = useSelector((state) => state.auth.user?.username || '');

  // Check modal state from Redux
  const { isOpen, modalType } = useSelector((state) => state.modal);

  // Only render if the modal is open and the modalType is 'project-form'
  if (!isOpen || modalType !== "project-form") return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newProject = { title, description, created_by: currentUsername };
    const response = await dispatch(createProject(newProject));
    console.log("Project successfully created");
    if (response?.payload?.id) { 
      navigate(`/projects/${response.payload.id}`); 
    }
    dispatch(closeModal());
  };

  // Close the modal
  const handleCloseModal = () => {
    dispatch(closeModal());
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button onClick={handleCloseModal} className="close-btn">
          <span>&times;</span>
        </button>
        <h3>Create a New Project</h3>
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label htmlFor="title">Project Title</label>
            <input
              type="text"
              id="title"
              name="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          
          <div className="input-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              rows={15}
              cols={30}
            />
          </div>

          <button type="submit" className="submit-btn">
            Create Project
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProjectFormModal;

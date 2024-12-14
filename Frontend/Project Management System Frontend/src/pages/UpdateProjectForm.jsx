import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getProjectById, updateProject } from "../store/project/projectSlice";
import "./Page Styles/UpdateProjectPage.css";

const UpdateProjectPage = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const project = useSelector((state) => state.project.currentProject);
  const [updatedProject, setUpdatedProject] = useState({
    title: "", 
    description: "",
  });

  useEffect(() => {
    dispatch(getProjectById(projectId));
  }, [dispatch, projectId]);

  useEffect(() => {
    if (project) {
      setUpdatedProject({
        title: project.title, 
        description: project.description,
      });
    }
  }, [project]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUpdatedProject((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await dispatch(updateProject({ projectId, projectData: updatedProject })).unwrap();
      navigate(`/projects/${projectId}`);
    } catch (error) {
      console.error("Error updating project:", error);
    }
  };

  return (
    <div className="update-project-container">
      <h3>Update Project</h3>
      <form onSubmit={handleSubmit}>
        <div className="input-group">
          <label htmlFor="title">Project Title:</label> 
          <input
            type="text"
            id="title"
            name="title" // Updated name
            value={updatedProject.title} 
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
        <button type="submit" className="submit-btn">
          Update Project
        </button>
        <button
          type="button"
          className="cancel-btn"
          onClick={() => navigate(`/projects/${projectId}`)}
        >
          Back to Project View
        </button>
      </form>
    </div>
  );
};

export default UpdateProjectPage;

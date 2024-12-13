import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getProjectById } from "../store/project/projectSlice";
import { getRolesForProject } from "../store/projectRole/projectRoleSlice";
import { getUserById } from "../store/user/userSlice";
import { getTasksForProject } from "../store/task/taskSlice";  // Assuming this action exists
import Navbar from "../components/Navbar";
import AssignRole from "../components/AssignRole";
import { openModal } from "../store/modal/modalSlice"; // Import openModal action
import "./Page Styles/ProjectView.css";
import { deleteProject } from "../store/project/projectSlice";

const ProjectView = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Authentication and User Info
  const { user: currentUser, accessToken } = useSelector((state) => state.auth);
  const isAuthenticated = !!accessToken && !!currentUser;

  // Redux roles data
  const roles = useSelector((state) => state.projectRole.roles);
  const project = useSelector((state) => state.project.currentProject);
  const tasks = useSelector((state) => state.task.tasks);  // Tasks from Redux
  const [projectDetails, setProjectDetails] = useState(null);
  const [creatorUsername, setCreatorUsername] = useState(null);
  const [updatedByUsername, setUpdatedByUsername] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjectData = async () => {
      if (!isAuthenticated) {
        console.error("User is not authenticated");
        navigate("/", { replace: true });
        return;
      }

      setLoading(true);
      try {
        // Fetch project details
        const project = await dispatch(getProjectById(projectId)).unwrap();
        setProjectDetails(project);

        // Fetch roles for the project
        dispatch(getRolesForProject(projectId));

        // Fetch tasks for the project
        dispatch(getTasksForProject(projectId));  // Dispatch to fetch tasks

        // Fetch creator username
        if (project.created_by) {
          const creator = await dispatch(
            getUserById(project.created_by)
          ).unwrap();
          setCreatorUsername(creator?.username || "Unknown");
        }

        // Fetch updated_by username
        if (project.updated_by) {
          const updater = await dispatch(
            getUserById(project.updated_by)
          ).unwrap();
          setUpdatedByUsername(updater?.username || "Unknown");
        }
      } catch (error) {
        console.error("Error fetching project or related data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProjectData();
  }, [dispatch, projectId, isAuthenticated, navigate]);

  if (loading) {
    return <p>Loading project details...</p>;
  }

  if (!isAuthenticated) {
    return <p>Redirecting to login...</p>;
  }

  // Group roles for display
  const groupedRoles = roles.reduce(
    (acc, role) => {
      if (role.role === "Admin") acc.admins.push(role);
      else if (role.role === "Member") acc.members.push(role);
      else if (role.role === "Viewer") acc.viewers.push(role);
      return acc;
    },
    { admins: [], members: [], viewers: [] }
  );

  const isAdmin =
    currentUser?.role === "admin" ||
    projectDetails?.created_by === currentUser?.id;

  const navigateToUpdatePage = () => {
    navigate(`/projects/${projectId}/update`);
  };

  const handleDeleteClick = () => {
    const isConfirmed = window.confirm("Are you sure you want to delete this project? This action cannot be undone.");
  
    if (isConfirmed) {
      dispatch(deleteProject(project.id))
      .then(() => {
        navigate("/dashboard");
      })
      .catch((error) => {
        console.error("Error deleting project:", error);
      });
    }
  };

  const handleAddTaskClick = () => {
    navigate(`/projects/${projectId}/create-task`);
  };

  return (
    <div>
      <Navbar />
      <div className="project-view-container">
        <h1>{projectDetails?.title}</h1>
        <p>{projectDetails?.description}</p>

        {/* Creator Details */}
        {creatorUsername && (
          <p>
            <strong>Created by:</strong> {creatorUsername}
          </p>
        )}
        {projectDetails?.created_at && (
          <p>
            <strong>Created at:</strong>{" "}
            {new Date(projectDetails.created_at).toLocaleString()}
          </p>
        )}

        {/* Updater Details */}
        {updatedByUsername && (
          <p>
            <strong>Updated by:</strong> {updatedByUsername}
          </p>
        )}
        {projectDetails?.updated_at && (
          <p>
            <strong>Updated at:</strong>{" "}
            {new Date(projectDetails.updated_at).toLocaleString()}
          </p>
        )}

        {/* Roles Section */}
        <section className="roles-section">
          <h3>Roles</h3>
          <div className="roles-grid">
            <div>
              <h4>Admins</h4>
              <ul>
                {groupedRoles.admins.map((role) => (
                  <li key={role.user_id || `${role.username}-${role.role}`}>
                    {role.username}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4>Members</h4>
              <ul>
                {groupedRoles.members.map((role) => (
                  <li key={role.user_id || `${role.username}-${role.role}`}>
                    {role.username}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4>Viewers</h4>
              <ul>
                {groupedRoles.viewers.map((role) => (
                  <li key={role.user_id || `${role.username}-${role.role}`}>
                    {role.username}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* Task List Section */}
        <section className="task-list-section">
          <h3>Tasks</h3>
          {tasks && tasks.length > 0 ? (
            <ul className="task-list">
              {tasks.map((task) => (
                <li key={task.id} className="task-item">
                  <h4>{task.title}</h4>
                  <p>{task.description}</p>
                  <p><strong>Status:</strong> {task.status}</p>
                  <p><strong>Due Date:</strong> {new Date(task.due_date).toLocaleDateString()}</p>
                  <p><strong>Assignee:</strong> {task.assignee?.username || "Not Assigned"}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p>No tasks found for this project.</p>
          )}
        </section>

        {/* Assign Role */}
        {isAdmin && <AssignRole projectId={projectId} />}

        <button
          onClick={() => navigate("/dashboard")}
          className="back-to-dashboard-btn"
        >
          Back to Dashboard
        </button>

        {isAdmin && (
          <button onClick={navigateToUpdatePage} className="update-project-btn">
            Update Project
          </button>
        )}

        {isAdmin && (
          <button onClick={handleDeleteClick} className="delete-btn">
            Delete
          </button>
        )}
        {isAdmin && (
          <button onClick={handleAddTaskClick} className="add-task-btn">
            Add task
          </button>
        )}
      </div>
    </div>
  );
};

export default ProjectView;

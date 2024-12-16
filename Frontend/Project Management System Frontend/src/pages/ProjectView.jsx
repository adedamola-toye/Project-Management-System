import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getProjectById } from "../store/project/projectSlice";
import { getRolesForProject } from "../store/projectRole/projectRoleSlice";
import { getUserById } from "../store/user/userSlice";
import {
  getTasksForProject,
  deleteTask,
} from "../store/projectRole/projectRoleSlice";
import Navbar from "../components/Navbar";
import AssignRole from "../components/AssignRole";
import { openModal } from "../store/modal/modalSlice";
import "./Page Styles/ProjectView.css";
import { deleteProject } from "../store/project/projectSlice";

const ProjectView = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { user: currentUser, accessToken } = useSelector((state) => state.auth);
  const isAuthenticated = !!accessToken && !!currentUser;

  const roles = useSelector((state) => state.projectRole.roles);
  const project = useSelector((state) => state.project.currentProject);
  const tasks = useSelector((state) => state.projectRole.tasks);
  const [tasksWithAssignees, setTasksWithAssignees] = useState([]);
  const [projectDetails, setProjectDetails] = useState(null);
  const [creatorUsername, setCreatorUsername] = useState(null);
  const [updatedByUsername, setUpdatedByUsername] = useState(null);
  const [loading, setLoading] = useState(true);

 

  useEffect(() => {
    const fetchAssignee = async (assigneeIdOrUsername) => {
      if (!assigneeIdOrUsername) return "Not Assigned";
      if (typeof assigneeIdOrUsername === "string") return assigneeIdOrUsername;
      try {
        const user = await dispatch(getUserById(assigneeIdOrUsername)).unwrap();
        return user?.username || "Not Assigned";
      } catch (error) {
        console.error("Error fetching user by ID:", error);
        return "Not Assigned";
      }
    };

    const fetchTasksWithAssignees = async () => {
      if(!tasks) return;
      const tasksWithAssignees = await Promise.all(
        tasks.map(async (task) => {
          const assigneeUsername = await fetchAssignee(task.assignee);
          return { ...task, assignee: assigneeUsername };
        })
      );
      setTasksWithAssignees(tasksWithAssignees);
      console.log(tasksWithAssignees)
    };

    fetchTasksWithAssignees();
  }, [tasks, dispatch]);

  useEffect(() => {
    const fetchProjectData = async () => {
      if (!isAuthenticated) {
        console.error("User is not authenticated");
        navigate("/", { replace: true });
        return;
      }

      setLoading(true);
      try {
        const project = await dispatch(getProjectById(projectId)).unwrap();
        setProjectDetails(project);
        dispatch(getRolesForProject(projectId));
        dispatch(getTasksForProject(projectId));

        if (project.created_by) {
          const creator = await dispatch(
            getUserById(project.created_by)
          ).unwrap();
          setCreatorUsername(creator?.username || "Unknown");
        }

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

  if (loading) return <p>Loading project details...</p>;
  if (!isAuthenticated) return <p>Redirecting to login...</p>;

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

  const navigateToUpdatePage = () => navigate(`/projects/${projectId}/update`);

  const handleDeleteClick = () => {
    const isConfirmed = window.confirm(
      "Are you sure you want to delete this project?"
    );
    if (isConfirmed) {
      dispatch(deleteProject(project.id)).then(() => navigate("/dashboard"));
    }
  };

  const handleAddTaskClick = () =>
    navigate(`/projects/${projectId}/create-task`);

  const handleDeleteTask = (taskId) => {
    const isConfirmed = window.confirm(
      "Are you sure you want to delete this task?"
    );
    if (isConfirmed) {

      dispatch(deleteTask({ projectId, taskId }))
        .then(() => {

          dispatch(getTasksForProject(projectId));
        })
        .catch((error) => console.error("Error deleting task:", error));
    }
  };
  

  const handleEditTask = (taskId) => {
    navigate(`/projects/${projectId}/tasks/${taskId}/edit-task`);
  };
  

  const taskColumns = ["To Do", "In Progress", "Completed"]; // Define task columns

  const tasksByStatus = taskColumns.reduce((acc, status) => {
    acc[status] = tasksWithAssignees.filter((task) => task.status === status);
    return acc;
  }, {});
  console.log(tasksByStatus)

  return (
    <div>
      <Navbar />
      <div className="project-view-container">
        <h1>{projectDetails?.title}</h1>
        <p>{projectDetails?.description}</p>

        {/* Creator and Updater Details */}
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


        {isAdmin && <AssignRole projectId={projectId} />}

        {/* Kanban Board */}
        <div className="task-section">
          <h1>Tasks</h1>
          {isAdmin && (
            <div className="add-task-btn-container">
              <button onClick={handleAddTaskClick} className="add-task-btn">
            Add Task
          </button>
            </div>
          
        )}
          <section className="kanban-board">
            {taskColumns.map((status) => (
              <div className="kanban-column" key={status}>
                <h3>{status}</h3>
                <ul>
                  {tasksByStatus[status]?.map((task) => (
                    <li key={task.id} className="kanban-task">
                      <h4>{task.title}</h4>
                      <p>{task.description}</p>
                      <p>
                        <strong>Assigned to:</strong>{" "}
                        {task.assignee || "Not Assigned"}
                      </p>
                      <div className="task-actions">
                        <button className="edit-task-btn" onClick={() => handleEditTask(task.id)}>
                          Edit
                        </button>
                        <button className="task-delete-btn" onClick={() => handleDeleteTask(task.id)}>
                          Delete
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </section>
        

        </div>

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
            Delete Project
          </button>
        )}
        
      </div>
    </div>
  );
};

export default ProjectView;

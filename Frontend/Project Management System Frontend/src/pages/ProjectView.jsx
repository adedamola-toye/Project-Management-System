import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getProjectById } from "../store/project/projectSlice";
import { getRolesForProject } from "../store/projectRole/projectRoleSlice";
import { getUserById } from "../store/user/userSlice"; 
import Navbar from "../components/Navbar";
import AssignRole from "../components/AssignRole"; 
import './Page Styles/ProjectView.css';

const ProjectView = () => {
  const { projectId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { currentProject, loading, error } = useSelector((state) => state.project);
  const { roles, isLoading: rolesLoading, error: rolesError } = useSelector(
    (state) => state.projectRole
  );
  const { currentUser } = useSelector((state) => state.auth);
  const [creatorUsername, setCreatorUsername] = useState(null);
  const [updatedByUsername, setUpdatedByUsername] = useState(null);

  useEffect(() => {
    if (projectId) {
      dispatch(getProjectById(projectId));
      dispatch(getRolesForProject(projectId));
    }
  }, [projectId, dispatch]);


  useEffect(() => {
    if (currentProject && currentProject.created_by) {
      dispatch(getUserById(currentProject.created_by)).then((result) => {
        if (result.payload && result.payload.username) {
          setCreatorUsername(result.payload.username);  
        } else {
          console.error("Error fetching username", result.payload);
        }
      });
    }
    
    if (currentProject && currentProject.updated_by) {
      dispatch(getUserById(currentProject.updated_by)).then((result) => {
        if (result.payload && result.payload.username) {
          setUpdatedByUsername(result.payload.username);  
        } else {
          console.error("Error fetching updated_by username", result.payload);
        }
      });
    }
  }, [currentProject, dispatch]);

  if(!currentUser){
    console.log("No current user");
    return;
  }

  const isAdmin =
    currentUser?.role === "admin" ||
    currentProject?.created_by === currentUser?.id;
  
    console.log(isAdmin)
    console.log(currentUser)
    console.log("Project created by:", currentProject?.created_by);
    console.log("Current user ID:", currentUser?.id);


  const groupedRoles = roles.reduce(
    (acc, role) => {
      if (role.role === "Admin") {
        acc.admins.push(role);
      } else if (role.role === "Member") {
        acc.members.push(role);
      } else if (role.role === "Viewer") {
        acc.viewers.push(role);
      }
      return acc;
    },
    { admins: [], members: [], viewers: [] }
  );

  return (
    <>
      <Navbar />
      <div className="project-view">

        {loading && <div>Loading project details...</div>}
        {error && <div>Error: {error.message}</div>}

        {currentProject ? (
          <div>
            <h1>{currentProject.title}</h1>
            <p>{currentProject.description}</p>

            {/* Display Created By */}
            {creatorUsername && (
              <p><strong>Created by:</strong> {creatorUsername}</p>
            )}

            {/* Display Created At */}
            {currentProject.created_at && (
              <p><strong>Created at:</strong> {new Date(currentProject.created_at).toLocaleString()}</p>
            )}

            {/* Display Updated At */}
            {currentProject.updated_at && (
              <p><strong>Updated at:</strong> {new Date(currentProject.updated_at).toLocaleString()}</p>
            )}

            {/* Display Updated By */}
            {updatedByUsername && (
              <p><strong>Updated by:</strong> {updatedByUsername}</p>
            )}

            {/* Display Roles */}
            <h3>Roles</h3>
            {rolesLoading ? (
              <p>Loading roles...</p>
            ) : rolesError ? (
              <p>Error: {rolesError}</p>
            ) : (
              <>
                {groupedRoles.admins.length > 0 && (
                  <div>
                    <h4>Admins</h4>
                    <ul>
                      {groupedRoles.admins.map((role) => (
                        <li key={role.user_id ? role.user_id : `${role.username}-${role.role}`}>
                          {role.username}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {groupedRoles.members.length > 0 && (
                  <div>
                    <h4>Members</h4>
                    <ul>
                      {groupedRoles.members.map((role) => (
                        <li key={role.user_id ? role.user_id : `${role.username}-${role.role}`}>
                          {role.username}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {groupedRoles.viewers.length > 0 && (
                  <div>
                    <h4>Viewers</h4>
                    <ul>
                      {groupedRoles.viewers.map((role) => (
                        <li key={role.user_id ? role.user_id : `${role.username}-${role.role}`}>
                          {role.username}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </>
            )}

            {isAdmin && <AssignRole projectId={projectId} />}
          </div>
        ) : (
          <p>Project not found.</p>
        )}
        <button onClick={() => navigate("/projects")}>Back to Projects</button>
      </div>
    </>
  );
};

export default ProjectView;

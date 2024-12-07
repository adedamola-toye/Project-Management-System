import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getProjectById } from "../store/project/projectSlice";
import {
  getRolesForProject,
  assignRole,
} from "../store/projectRole/projectRoleSlice";
import { getAllUsers } from "../store/user/userSlice";
import Navbar from "../components/Navbar";

const ProjectView = () => {
  const { projectId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { currentProject, loading, error } = useSelector(
    (state) => state.project
  );
  const {
    roles,
    isLoading: rolesLoading,
    error: rolesError,
  } = useSelector((state) => state.projectRole);
  const { currentUser, users } = useSelector((state) => state.user);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedRole, setSelectedRole] = useState("member");

  useEffect(() => {
    if (projectId) {
      dispatch(getProjectById(projectId));
      dispatch(getRolesForProject(projectId));
      dispatch(getAllUsers());
    }
  }, [projectId, dispatch]);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleAssignRole = () => {
    if (selectedUser) {
      dispatch(
        assignRole({
          userId: selectedUser.id,
          role: selectedRole,
          projectId,
        })
      );
      setSelectedUser(null);
    }
  };

  if (loading) {
    return <div>Loading project details...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  // Check if the user is the creator or an admin
  const isAdmin =
    currentUser?.role === "admin" ||
    currentProject?.creatorId === currentUser?.id;

  return (
    <>
      <Navbar />
      <div className="project-view">
        {currentProject ? (
          <div>
            <h1>{currentProject.title}</h1>
            <p>{currentProject.description}</p>

            {/* Display Roles */}
            <h3>Roles</h3>
            {rolesLoading ? (
              <p>Loading roles...</p>
            ) : rolesError ? (
              <p>Error: {rolesError}</p>
            ) : (
              <ul>
                {roles.map((role) => (
                  <li key={role.id || `${role.username}-${role.role}`}>
                    {role.username} - {role.role}
                  </li>
                ))}
              </ul>
            )}

            {/* Admin Role Assignment Section */}
            {isAdmin && (
              <div className="assign-role">
                <h3>Assign Role</h3>
                <input
                  type="text"
                  placeholder="Search for a user"
                  value={searchQuery}
                  onChange={handleSearchChange}
                />
                <ul>
                  {users
                    ?.filter((user) =>
                      user.username
                        .toLowerCase()
                        .includes(searchQuery.toLowerCase())
                    )
                    .map((user) => (
                      <li
                        key={user.id}
                        onClick={() => setSelectedUser(user)}
                        style={{ cursor: "pointer" }}
                      >
                        {user.username}
                      </li>
                    ))}
                </ul>
                {selectedUser && (
                  <div>
                    <select
                      value={selectedRole}
                      onChange={(e) => setSelectedRole(e.target.value)}
                    >
                      <option value="admin">Admin</option>
                      <option value="member">Member</option>
                      <option value="viewer">Viewer</option>
                    </select>
                    <button onClick={handleAssignRole}>Assign Role</button>
                  </div>
                )}
              </div>
            )}
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

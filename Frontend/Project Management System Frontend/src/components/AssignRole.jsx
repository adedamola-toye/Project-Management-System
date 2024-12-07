

import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { assignRole, getRolesForProject } from "../store/projectRole/projectRoleSlice";
import { getAllUsers } from "../store/user/userSlice";
import '../pages/Page Styles/ProjectView.css'

const AssignRole = ({ projectId }) => {
  const dispatch = useDispatch();
  const { users } = useSelector((state) => state.user);
  const { rolesLoading, rolesError } = useSelector((state) => state.projectRole);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedRole, setSelectedRole] = useState("member");
  const [filteredUsers, setFilteredUsers] = useState([]);

  useEffect(() => {
    // Filter users based on search query
    if (searchQuery.length > 0) {
      setFilteredUsers(
        users.filter((user) =>
          user.username.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    } else {
      setFilteredUsers([]);
    }
  }, [searchQuery, users]);

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
      ).then(() => {
        // After the role assignment, fetch the updated roles
        dispatch(getRolesForProject(projectId));
      });

      setSelectedUser(null);
      setSearchQuery(""); // Clear search query after assignment
    }
  };

  return (
    <div className="assign-role">
      <h3>Assign Role</h3>
      <input
        type="text"
        placeholder="Search for a user"
        value={searchQuery}
        onChange={handleSearchChange}
      />
      {filteredUsers.length > 0 && (
        <ul className="user-suggestions">
          {filteredUsers.map((user) => (
            <li
              key={user.id}
              onClick={() => setSelectedUser(user)}
              style={{ cursor: "pointer" }}
            >
              {user.username}
            </li>
          ))}
        </ul>
      )}
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
  );
};

export default AssignRole;

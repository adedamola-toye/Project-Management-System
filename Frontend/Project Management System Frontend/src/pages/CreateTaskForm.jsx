import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createTask } from "../store/projectRole/projectRoleSlice";
import { getAllUsers } from "../store/user/userSlice";
import { useNavigate } from "react-router-dom";
import "./Page Styles/CreateTaskForm.css";
import { useParams } from "react-router-dom";

const CreateTaskForm = () => {
  const { projectId } = useParams();
  console.log("Project ID:", projectId);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { users } = useSelector((state) => state.user); 
 const project = useSelector((state) => state.project.currentProject);
 const tasks = useSelector((state) => state.projectRole.tasks);

  const [taskData, setTaskData] = useState({
    title: "",
    description: "",
    assignee: "",
    due_date: "",
    priority: "Medium",
    status: "To Do",
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    dispatch(getAllUsers()); // Fetch users when the component is mounted
  }, [dispatch]);

  useEffect(() => {
    if (searchQuery.trim().length > 0) {
      setFilteredUsers(
        users.filter((user) =>
          user.username.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    } else {
      setFilteredUsers([]);
    }
  }, [searchQuery, users]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setTaskData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleSelectUser = (user) => {
    setSelectedUser(user);
    setTaskData((prevData) => ({ ...prevData, assignee: user.id }));
    setSearchQuery(""); // Clear search query after selection
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!projectId) {
      console.error("Project ID is missing");
      return;
    }

    const taskPayload = {
      ...taskData,
      projectId, 
    };
    console.log("Task Payload:", taskPayload); 
    // Dispatch createTask action
    try{
      dispatch(createTask({projectId, task: taskPayload })).unwrap()
      navigate(`/projects/${projectId}`);
    }
    
      
      catch(error){
        console.error("Failed to create task:", error);
      };
  };

  return (
    <div>
      <h3>Create Task</h3>
      <form onSubmit={handleSubmit} className="task-form">
        <label className="task-form-label">
          Title:
          <input
            type="text"
            name="title"
            value={taskData.title}
            onChange={handleChange}
            required
            className="task-form-input"
          />
        </label>
        <label className="task-form-label">
          Description:
          <textarea
            name="description"
            value={taskData.description}
            onChange={handleChange}
            className="task-form-textarea"
          />
        </label>
        <label className="task-form-label">
          Assignee:
          <input
            type="text"
            placeholder="Search for a user"
            value={selectedUser ? selectedUser.username : searchQuery}
            onChange={handleSearchChange}
            className="task-form-input"
          />
          {filteredUsers.length > 0 && (
            <ul className="user-suggestions">
              {filteredUsers.map((user) => (
                <li
                  key={user.id}
                  onClick={() => handleSelectUser(user)}
                  className="user-suggestion"
                >
                  {user.username}
                </li>
              ))}
            </ul>
          )}
        </label>
        <label className="task-form-label">
          Due Date:
          <input
            type="date"
            name="due_date"
            value={taskData.due_date}
            onChange={handleChange}
            className="task-form-input"
          />
        </label>
        <label className="task-form-label">
          Priority:
          <select
            name="priority"
            value={taskData.priority}
            onChange={handleChange}
            className="task-form-input"
          >
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
          </select>
        </label>
        <label className="task-form-label">
          Status:
          <select
            name="status"
            value={taskData.status}
            onChange={handleChange}
            className="task-form-input"
          >
            <option value="To Do">To Do</option>
            <option value="In Progress">In Progress</option>
            <option value="Done">Done</option>
          </select>
        </label>
        <button type="submit" className="task-form-submit">
          Create Task
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

export default CreateTaskForm;

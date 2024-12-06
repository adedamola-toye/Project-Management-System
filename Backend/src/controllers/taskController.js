const pool = require("../config/db");

exports.createTask = async (req, res) => {
  console.log("Authneticated user:", req.user);
  // Extract the projectId from the URL parameters
  const { projectId } = req.params;
  console.log(projectId);

  // Extract other fields from the request body
  const {
    title,
    description,
    assignee,
    due_date,
    priority = "Medium", // Default to 'Medium' if priority is not provided
    status = "To Do", // Default to 'To Do' if status is not provided
  } = req.body;

  console.log("Due Date:", due_date);
  console.log("Task ID:", taskId);

  const created_by = req.user ? req.user.id : null;
  console.log(created_by);

  // Validate required fields
  if (!title || !projectId) {
    return res.status(400).json({ error: "Title and project_id are required" });
  }

  // Validate priority
  const validPriorities = ["Low", "Medium", "High"];
  if (!validPriorities.includes(priority)) {
    return res
      .status(400)
      .json({ error: "Invalid priority. Valid values are Low, Medium, High." });
  }

  // Validate status
  const validStatuses = ["To Do", "In Progress", "Done"];
  if (!validStatuses.includes(status)) {
    return res
      .status(400)
      .json({
        error:
          "Invalid status. Valid values are 'To Do', 'In Progress', 'Done'.",
      });
  }

  try {
    // Validate assignee
    if (assignee) {
      const userExists = await pool.query("SELECT * FROM users WHERE id = $1", [
        assignee,
      ]);
      if (userExists.rows.length === 0) {
        return res.status(400).json({ error: "Assignee does not exist" });
      }
    }

    // Validate project
    const projectExists = await pool.query(
      "SELECT * FROM projects WHERE id = $1",
      [projectId]
    );
    if (projectExists.rows.length === 0) {
      return res.status(400).json({ error: "Project does not exist" });
    }

    // Create new task
    const newTask = await pool.query(
      `INSERT INTO tasks (title, description, assignee, project_id, due_date, priority, status, created_by, updated_by, updated_at) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
      [
        title,
        description,
        assignee,
        projectId,
        due_date,
        priority,
        status,
        created_by,
        null,
        null,
      ]
    );
    res.json(newTask.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateTask = async (req, res) => {
  console.log("Hello from update Task in task Controller");
  const { taskId } = req.params;
  const { projectId } = req.params;
  console.log("Task id to update:", taskId);
  const { title, description, assignee, due_date, priority, status } = req.body;

  console.log("Due Date (Before Query):", due_date);
  console.log(new Date());

  // Get the user ID from the authenticated user
  const updated_by = req.user ? req.user.id : null;

  console.log({
    title,
    description,
    assignee,
    projectId,
    due_date,
    priority,
    status,
    updated_by,
    updated_at: new Date().toISOString(),
    taskId,
  });
  

  // Validate priority
  const validPriorities = ["Low", "Medium", "High"];
  if (priority && !validPriorities.includes(priority)) {
    return res
      .status(400)
      .json({ error: "Invalid priority. Valid values are Low, Medium, High." });
  }

  // Validate status
  const validStatuses = ["To Do", "In Progress", "Done"];
  if (status && !validStatuses.includes(status)) {
    return res
      .status(400)
      .json({
        error:
          "Invalid status. Valid values are 'To Do', 'In Progress', 'Done'.",
      });
  }

  // Check if due_date is a valid timestamp, if provided
  if (due_date && isNaN(Date.parse(due_date))) {
    return res
      .status(400)
      .json({ error: "Invalid due_date. Please provide a valid date format." });
  }

  try {
    // Validate assignee
    if (assignee) {
      const userExists = await pool.query("SELECT * FROM users WHERE id = $1", [
        assignee,
      ]);
      if (userExists.rows.length === 0) {
        return res.status(400).json({ error: "Assignee does not exist" });
      }
    }

    // Validate project
    if (projectId) {
      const projectExists = await pool.query(
        "SELECT * FROM projects WHERE id = $1",
        [projectId]
      );
      if (projectExists.rows.length === 0) {
        return res.status(400).json({ error: "Project does not exist" });
      }
    }

    // Update task
    const updatedTask = await pool.query(
      `UPDATE tasks
       SET title=$1, description=$2, assignee=$3, project_id=$4, due_date=$5, priority=$6, status=$7, updated_by=$8, updated_at=$9
       WHERE id=$10 RETURNING *`,
      [
        title,                              // $1
        description,                        // $2
        assignee,                           // $3
        projectId,                          // $4
        due_date ? new Date(due_date) : null, // $5
        priority,                           // $6
        status,                             // $7
        updated_by,                         // $8
        new Date().toISOString(),           // $9
        taskId                              // $10
      ]
    );
    

    if (updatedTask.rows.length === 0) {
      return res.status(404).json({ error: "Task not found" });
    }

    res.json(updatedTask.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

exports.deleteTask = async (req, res) => {
  console.log("hello from delete Task");
  const { taskId, projectId } = req.params; // Get taskId and projectId from params

  console.log("Task from deleteTask:", taskId);  // Log taskId to check if it is correct
  console.log("Project from delete Task:", projectId);  // Log projectId for verification

  try {
    // Use the correct taskId in the query
    const result = await pool.query(
      "DELETE FROM tasks WHERE id = $1 RETURNING *",
      [taskId]  // Use taskId instead of id
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Task not found" });
    }

    res.json({ message: "Task deleted", task: result.rows[0] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


exports.getTasksForProject = async (req, res) => {
  console.log("Hello from getTasksFromProject");
  const { projectId } = req.params;
  console.log("Project id from taskController", projectId);
  try {
    const tasks = await pool.query(
      "SELECT * FROM tasks WHERE project_id = $1",
      [projectId]
    );
    console.log("All tasks", tasks.rows);
    res.json(tasks.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

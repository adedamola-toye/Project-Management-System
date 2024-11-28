/* //CRUD endpoints for tasks
//CRUD endpoints for users

const pool = require("../config/db");

exports.createTask = async (req, res) => {
  const {
    title,
    description,
    assignee,
    project_id,
    due_date,
    priority,
    status,
  } = req.body;
  try {
    const newTask = await pool.query(
      `INSERT INTO tasks (title, description, assignee, project_id, due_date, priority, status) 
      VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
    [title, description, assignee, project_id, due_date, priority || 'Medium', status||'To Do']
    );
    res.json(newTask.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAllTasks = async (req, res) => {
  try {
    const allTasks = await pool.query("SELECT * FROM tasks");
    res.json(allTasks.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateTask = async (req, res) => {
  const { id } = req.params;
  const {title, description, assignee, project_id, due_date, priority, status} = req.body;
  try {
    const updatedTask = await pool.query(
      `UPDATE tasks
      SET title=$1, description=$2, assignee=$3, project_id=$4, due_date=$5, priority=$6, status=$7 WHERE id=$8 RETURNING *`
      [title, description, assignee, project_id, due_date, priority, status, id]
    );
    if(updatedTask.rows.length === 0){
        return res.status(404).json({error:'Task not found'})
    }
    res.json(updatedTask.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteTask = async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query("DELETE FROM tasks WHERE id=$1", [id]);
    res.json({ message: "Task deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
 */

const pool = require("../config/db");

exports.createTask = async (req, res) => {
  const {
    title,
    description,
    assignee,
    project_id,
    due_date,
    priority = 'Medium', // Default to 'Medium' if priority is not provided
    status = 'To Do', created_by,// Default to 'To Do' if status is not provided
  } = req.body;

  // Validate priority
  const validPriorities = ['Low', 'Medium', 'High'];
  if (!validPriorities.includes(priority)) {
    return res.status(400).json({ error: "Invalid priority. Valid values are Low, Medium, High." });
  }

  // Validate required fields
  if (!title || !project_id) {
    return res.status(400).json({ error: "Title and project_id are required" });
  }

  try {
    // Validate assignee
    if (assignee) {
      const userExists = await pool.query("SELECT * FROM users WHERE id = $1", [assignee]);
      if (userExists.rows.length === 0) {
        return res.status(400).json({ error: "Assignee does not exist" });
      }
    }

    // Validate project
    const projectExists = await pool.query("SELECT * FROM projects WHERE id = $1", [project_id]);
    if (projectExists.rows.length === 0) {
      return res.status(400).json({ error: "Project does not exist" });
    }

    // Create new task
    const newTask = await pool.query(
      `INSERT INTO tasks (title, description, assignee, project_id, due_date, priority, status, created_by, updated_by, updated_at ) 
      VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [title, description, assignee, project_id, due_date, priority, status, created_by, null]
    );
    res.json(newTask.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAllTasks = async (req, res) => {
  const { project_id, assignee, priority, status } = req.query;

  let query = "SELECT * FROM tasks WHERE deleted_at IS NULL";
  const values = [];
  let counter = 1;

  if (project_id) {
    query += ` AND project_id = $${counter++}`;
    values.push(project_id);
  }
  if (assignee) {
    query += ` AND assignee = $${counter++}`;
    values.push(assignee);
  }
  if (priority) {
    query += ` AND priority = $${counter++}`;
    values.push(priority);
  }
  if (status) {
    query += ` AND status = $${counter++}`;
    values.push(status);
  }

  try {
    const tasks = await pool.query(query, values);
    res.json(tasks.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateTask = async (req, res) => {
  const { id } = req.params;
  const { title, description, assignee, project_id, due_date, priority, status, updated_by} = req.body;

  // Validate priority
  const validPriorities = ['Low', 'Medium', 'High'];
  if (priority && !validPriorities.includes(priority)) {
    return res.status(400).json({ error: "Invalid priority. Valid values are Low, Medium, High." });
  }

  try {
    // Validate assignee
    if (assignee) {
      const userExists = await pool.query("SELECT * FROM users WHERE id = $1", [assignee]);
      if (userExists.rows.length === 0) {
        return res.status(400).json({ error: "Assignee does not exist" });
      }
    }

    // Validate project
    if (project_id) {
      const projectExists = await pool.query("SELECT * FROM projects WHERE id = $1", [project_id]);
      if (projectExists.rows.length === 0) {
        return res.status(400).json({ error: "Project does not exist" });
      }
    }

    // Update task
    const updatedTask = await pool.query(
      `UPDATE tasks
      SET title=$1, description=$2, assignee=$3, project_id=$4, due_date=$5, priority=$6, status=$7, updated_by=$8, updated_at=CURRENT_TIMESTAMP
      WHERE id=$8 AND deleted_at IS NULL RETURNING *`,
      [title, description, assignee, project_id, due_date, priority, status, updated_by,id]
    );

    if (updatedTask.rows.length === 0) {
      return res.status(404).json({ error: "Task not found" });
    }

    res.json(updatedTask.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteTask = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      "UPDATE tasks SET deleted_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Task not found" });
    }

    res.json({ message: "Task marked as deleted", task: result.rows[0] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getTasksForProject = async (req, res) => {
  const { project_id } = req.params;
  try {
    const tasks = await pool.query(
      "SELECT * FROM tasks WHERE project_id = $1 AND deleted_at IS NULL",
      [project_id]
    );
    res.json(tasks.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

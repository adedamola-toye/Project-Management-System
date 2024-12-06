const pool = require('../config/db');

exports.createProject = async (req, res) => {
    const { title, description } = req.body;
    const userId = req.user?.id;

    if (!userId) {
        return res.status(400).json({ error: "User not found or not authenticated" });
    }

    if (!title || !description) {
        return res.status(400).json({ error: "Title and description are required" });
    }

    try {
        const newProject = await pool.query(
            "INSERT INTO projects (title, description, created_by, created_at, updated_at) VALUES ($1, $2, $3, $4, $5) RETURNING *",
            [title, description, userId, new Date(), new Date()]
        );
        const projectId = newProject.rows[0].id;

        await pool.query(
            "INSERT INTO project_roles (user_id, project_id, role) VALUES ($1, $2, 'Admin')",
            [userId, projectId]
        );

        res.status(201).json(newProject.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getAllProjects = async (req, res) => {
    try {
        const allProjects = await pool.query("SELECT * FROM projects");
        res.json(allProjects.rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getProjectById = async (req, res) => {
    const { id } = req.params;
    try {
        const project = await pool.query("SELECT * FROM projects WHERE id = $1", [id]);
        if (project.rows.length === 0) {
            return res.status(404).json({ message: "Project not found" });
        }
        res.json(project.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.updateProject = async (req, res) => {
    console.log("Request received:", req.method, req.url, req.body, req.params);
    const { id } = req.params;
    const { title, description } = req.body;
    const userId = req.user?.id;

    if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
    }

    if (!title || !description) {
        return res.status(400).json({ error: "Title and description are required" });
    }
    console.log({
        title,
        description,
        userId,
        id
    });
    

    try {
        const updatedProject = await pool.query(
            "UPDATE projects SET title=$1, description=$2, updated_by=$3, updated_at=$4 WHERE id=$5 RETURNING *",
            [title, description, userId, new Date(), id]
        );
        if (updatedProject.rows.length === 0) {
            return res.status(404).json({ message: "Project not found" });
        }
        res.json(updatedProject.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.deleteProject = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query("DELETE FROM projects WHERE id = $1 RETURNING *", [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Project not found" });
        }
        res.json({ message: "Project deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

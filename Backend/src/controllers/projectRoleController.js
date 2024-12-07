
const pool = require('../config/db');

exports.assignRole = async (req, res) => {
    const { projectId } = req.params;
    const { userId, role } = req.body;

    if (!userId || !role) {
        return res.status(400).json({ error: "userId and role are required" });
    }

    const validRoles = ['Admin', 'Member', 'Viewer'];
    if (!validRoles.includes(role)) {
        return res.status(400).json({ error: "Invalid role" });
    }

    try {
        // Step 1: Insert or update the role in the project_roles table
        await pool.query(
            `INSERT INTO project_roles (user_id, project_id, role)
            VALUES ($1, $2, $3)
            ON CONFLICT (user_id, project_id) 
            DO UPDATE SET role = EXCLUDED.role`,
            [userId, projectId, role]
        );

        // Step 2: Fetch the username and project title after role assignment
        const roleAssignment = await pool.query(
            `SELECT u.username, pr.user_id, pr.project_id, pr.role, p.title AS project_title
            FROM project_roles pr
            JOIN users u ON pr.user_id = u.id
            JOIN projects p ON pr.project_id = p.id
            WHERE pr.user_id = $1 AND pr.project_id = $2`,
            [userId, projectId]
        );

        console.log(roleAssignment.rows);

        res.status(201).json({
            message: "Role assigned successfully",
            roleAssignment: roleAssignment.rows,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal server error" });
    }
};




exports.getRolesForProject = async (req, res) => {
    const {projectId} = req.params;
    try{
        const roles =  await pool.query(
            `SELECT users.username, project_roles.role
            FROM project_roles
            JOIN users ON project_roles.user_id=users.id
            WHERE project_roles.project_id = $1`,
            [projectId]
        );
        res.status(200).json(roles.rows);
    }
    catch(error){
        console.error(error);
        res.status(500).json({error:"Internal server error"})
    }
}

exports.getUserRoles=async(req,res) => {
    const {userId}=req.params;
    console.log(`User ID: ${userId}`);
    try{
        const roles = await pool.query(
            `SELECT projects.title AS project, project_roles.role
            FROM project_roles
            JOIN projects ON project_roles.project_id=projects.id
            WHERE project_roles.user_id = $1`,
            [userId]
        );
        console.log("Roles for User:", roles.rows);

        res.status(200).json(roles.rows);
    }
    catch(error){
        console.error(error);
        res.status(500).json({error:"Internal server error"})
    }
}

exports.updateRole = async(req, res) => {
    const {projectId, userId} = req.params;
    const {role} = req.body;

    try{
        const validRoles = ['Admin', 'Member', 'Viewer'];
        if(!validRoles.includes(role)){
            return res.status(400).json({error:"Invalid role"})
        }
        await pool.query(
            `UPDATE project_roles
            SET role=$1
            WHERE project_id=$2 AND user_id=$3`,
            [role, projectId, userId]
        );
        res.status(200).json({message:'Role updated successfully'})
    }
    catch(error){
        console.error(error);
        res.status(500).json({error:"Internal server error"})
    }
    
}

exports.removeRole = async(req, res) => {
    const {projectId, userId} = req.params;
    try{
        await pool.query(
            `DELETE FROM project_roles
            WHERE project_id=$1 AND user_id=$2`,
            [projectId, userId]
        );
        res.status(200).json({message:"Role removed successfully"})
    }
    catch(error){
        console.error(error)
        res.status(500).json({error:"Internal server error"})
    }
}
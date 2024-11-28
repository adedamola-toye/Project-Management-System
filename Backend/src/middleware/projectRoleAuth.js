const pool = require('../config/db')

const projectRoleAuth = (requiredRoles) => {
    return async (req, res, next) => {
        try{
            const userId = req.user.id;
            const {projectId} = req.params;

            const result = await pool.query(
                `SELECT role FROM project_roles WHERE user_id = $1 AND project_id=$2`,
                [userId, projectId]
            );
            if (result.rows.length === 0){
                return res.status(403).json({error:"You are not part of this project"});
            }

            const userRole = result.rows[0].role;

            if(!requiredRoles.includes(userRole)){
                return res.status(403).json({error: "You do not have permission for this action"})
            }
            next();
        }
        catch(error){
            console.error(error);
            res.status(500).json({error:error.message})
        }
    }
}

module.exports = projectRoleAuth
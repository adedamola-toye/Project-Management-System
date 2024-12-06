const pool = require("../config/db");

const projectRoleAuth = (requiredRoles) => {
    return async (req, res, next) => {
        try {
            const userId = req.user.id;  // Get the user ID from the JWT token
            const { projectId } = req.params;  // Get the projectId from the route params

            // Log userId and projectId for debugging
            //console.log("User ID:", userId);
           // console.log("Project ID:", projectId);

            // If there is a projectId (specific to a project), check if the user has a role for that project
            let result;
            if (projectId) {
                // Query roles for the user in the specific project
                result = await pool.query(
                    `SELECT role FROM project_roles WHERE user_id = $1 AND project_id = $2`,
                    [userId, projectId]
                );
            } else {
                // If no projectId, get all roles for the user across all projects
                result = await pool.query(
                    `SELECT role FROM project_roles WHERE user_id = $1`,
                    [userId]
                );
            }

            // If the user has no role in the project or across any project
            if (result.rows.length === 0) {
                return res.status(403).json({ error: "You are not part of this project" });
            }

            // Get the user's role(s)
            const userRoles = result.rows.map(row => row.role); // All roles for the user (or for the specific project)

            // Log the retrieved roles for debugging purposes
            console.log("User's Roles:", userRoles);

            // Check if the user has any of the required roles
            const hasValidRole = userRoles.some(role => requiredRoles.includes(role));

            if (!hasValidRole) {
                return res.status(403).json({ error: "You do not have permission for this action" });
            }

            // If the user has the required role, proceed to the next middleware
            next();
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: error.message });
        }
    };
};

module.exports = projectRoleAuth;
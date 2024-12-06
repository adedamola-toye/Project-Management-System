console.log("Hello HELP")
const express = require("express");
const projectRoleController = require("../controllers/projectRoleController");
const taskController = require("../controllers/taskController")
const projectRoleAuth = require("../middleware/projectRoleAuth");
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();




// Project auth routes
router.put(
  "/projects/:projectId/role",
  authMiddleware.protect,
  projectRoleAuth(["Admin"]), 
  projectRoleController.assignRole
);

// Get all roles for a project
router.get(
  "/projects/:projectId/roles",
  authMiddleware.protect,
  projectRoleAuth(["Admin", "Member", "Viewer"]),
  projectRoleController.getRolesForProject
);

// Get all user's roles across projects
router.get(
  "/users/:userId/roles",
  authMiddleware.protect,
  projectRoleAuth(["Admin", "Member", "Viewer"]),
  projectRoleController.getUserRoles
);

// Update user's role - only admin can do this
router.put(
  "/projects/:projectId/users/:userId/role",
  authMiddleware.protect,
  projectRoleAuth(["Admin"]),
  projectRoleController.updateRole
);

// Remove user's role - only admin can do this
router.delete(
  "/projects/:projectId/users/:userId/role",
  authMiddleware.protect,
  projectRoleAuth(["Admin"]),
  projectRoleController.removeRole
);

// Get all tasks for a project (Viewer and Member can view, Admin has full access)
router.get(
  "/projects/:projectId/tasks",
  authMiddleware.protect,
  projectRoleAuth(["Admin", "Member", "Viewer"]),
  taskController.getTasksForProject
);

// Create a task (Only Admin and Member can create tasks)
router.post(
  "/projects/:projectId/tasks",
  authMiddleware.protect,
  projectRoleAuth(["Admin", "Member"]),
  taskController.createTask
);

// Update a task (Only Admin and Member can update tasks)
router.put(
  "/projects/:projectId/tasks/:taskId",
  authMiddleware.protect,
  projectRoleAuth(["Admin", "Member"]),
  taskController.updateTask
);

// Delete a task (Only Admin and Member can delete tasks)
router.delete(
  "/projects/:projectId/tasks/:taskId",
  authMiddleware.protect,
  projectRoleAuth(["Admin", "Member"]),
  taskController.deleteTask
);

module.exports = router;

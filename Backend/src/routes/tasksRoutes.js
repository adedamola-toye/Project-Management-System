const express = require("express");
const {
  createTask,
  getAllTasks,
  getTasksForProject,
  updateTask,
  deleteTask,
} = require("../controllers/taskController");

const router = express.Router();

// CRUD routes
router.post('/', createTask);
router.get('/', getAllTasks);             
router.get('/project/:project_id', getTasksForProject); 
router.put('/:id', updateTask);           
router.delete('/:id', deleteTask);       

module.exports = router;

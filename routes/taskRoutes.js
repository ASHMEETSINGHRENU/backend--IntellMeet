const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");

const {
  createTask,
  getTasks,
  getTask,
  updateTask,
  deleteTask,
  updateTaskStatus
} = require("../controllers/taskController");

// Protect all task routes
router.use(authMiddleware);

// Specific routes first
router.put("/:id/status", updateTaskStatus);

// Collection routes
router.route("/")
  .get(getTasks)
  .post(createTask);

// Individual task routes
router.route("/:id")
  .get(getTask)
  .put(updateTask)
  .delete(deleteTask);

module.exports = router;
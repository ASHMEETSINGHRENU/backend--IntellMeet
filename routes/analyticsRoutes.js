const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");

const {
  getDashboardStats,
  getMeetingAnalytics,
  getTaskAnalytics,
  getTeamAnalytics
} = require("../controllers/analyticsController");

// Protect all analytics routes
router.use(authMiddleware);

router.get("/dashboard", getDashboardStats);
router.get("/meetings", getMeetingAnalytics);
router.get("/tasks", getTaskAnalytics);
router.get("/teams", getTeamAnalytics);

module.exports = router;
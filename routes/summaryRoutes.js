const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");

const {
  generateSummary,
  getSummary,
  getMeetingSummary,
  updateActionItem
} = require("../controllers/summaryController");

// Protect all summary routes
router.use(authMiddleware);

// Specific routes first
router.post("/generate", generateSummary);
router.get("/meeting/:meetingId", getMeetingSummary);
router.put("/:id/action-items/:itemIndex", updateActionItem);

// Individual summary routes
router.get("/:id", getSummary);

module.exports = router;
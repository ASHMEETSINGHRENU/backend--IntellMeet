const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");

const {
  createMeeting,
  getMeetings,
  getMeeting,
  updateMeeting,
  joinMeeting,
  endMeeting,
  deleteMeeting
} = require("../controllers/meetingController");

// Protect all meeting routes
router.use(authMiddleware);

// IMPORTANT: Place specific routes BEFORE the generic :id route
// Join meeting
router.post("/:id/join", joinMeeting);

// End meeting
router.post("/:id/end", endMeeting);

// GET all meetings
// POST create meeting
router.route("/")
  .get(getMeetings)
  .post(createMeeting);

// GET single meeting
// UPDATE meeting
// DELETE meeting
// This should come AFTER specific routes
router.route("/:id")
  .get(getMeeting)
  .put(updateMeeting)
  .delete(deleteMeeting);

module.exports = router;
const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");

// Import controllers - make sure these files exist
const {
  createTeam,
  getTeams,
  getTeam,
  inviteToTeam,
  removeMember,
  deleteTeam
} = require("../controllers/teamController");

// Protect all team routes
router.use(authMiddleware);

// Specific routes first
router.post("/:id/invite", inviteToTeam);
router.delete("/:id/members/:userId", removeMember);

// Collection routes
router.route("/")
  .get(getTeams)
  .post(createTeam);

// Individual team routes
router.route("/:id")
  .get(getTeam)
  .delete(deleteTeam);

module.exports = router;
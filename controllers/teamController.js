const Team = require('../models/Team');
const User = require('../models/User');

// Create team
exports.createTeam = async (req, res) => {
  try {
    const { name, description, workspace } = req.body;

    const team = new Team({
      name,
      description,
      workspace,
      owner: req.user.id,
      members: [{
        user: req.user.id,
        role: 'admin'
      }]
    });

    await team.save();
    await team.populate('members.user', 'name email');

    // Update user's teams
    await User.findByIdAndUpdate(req.user.id, {
      $push: { teams: team._id }
    });

    res.status(201).json({
      success: true,
      message: 'Team created successfully',
      team
    });
  } catch (error) {
    console.error('Create team error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get user's teams
exports.getTeams = async (req, res) => {
  try {
    const teams = await Team.find({
      $or: [
        { owner: req.user.id },
        { 'members.user': req.user.id }
      ]
    })
    .populate('members.user', 'name email')
    .populate('owner', 'name email');

    res.json({
      success: true,
      teams
    });
  } catch (error) {
    console.error('Get teams error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get single team
exports.getTeam = async (req, res) => {
  try {
    const team = await Team.findById(req.params.id)
      .populate('members.user', 'name email')
      .populate('owner', 'name email');

    if (!team) {
      return res.status(404).json({
        success: false,
        message: 'Team not found'
      });
    }

    res.json({
      success: true,
      team
    });
  } catch (error) {
    console.error('Get team error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Invite to team
exports.inviteToTeam = async (req, res) => {
  try {
    const { email, role } = req.body;
    const team = await Team.findById(req.params.id);

    if (!team) {
      return res.status(404).json({
        success: false,
        message: 'Team not found'
      });
    }

    // Check if user is admin
    const isAdmin = team.members.some(
      m => m.user && m.user.toString() === req.user.id && m.role === 'admin'
    );

    if (!isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Only team admins can invite members'
      });
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found with this email'
      });
    }

    // Check if already in team
    const existingMember = team.members.some(
      m => m.user && m.user.toString() === user._id.toString()
    );

    if (existingMember) {
      return res.status(400).json({
        success: false,
        message: 'User already in team'
      });
    }

    team.members.push({
      user: user._id,
      role: role || 'member',
      joinedAt: new Date()
    });

    await team.save();

    // Update user's teams
    await User.findByIdAndUpdate(user._id, {
      $push: { teams: team._id }
    });

    res.json({
      success: true,
      message: 'User invited successfully',
      team
    });
  } catch (error) {
    console.error('Invite error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Remove member
exports.removeMember = async (req, res) => {
  try {
    const { userId } = req.params;
    const team = await Team.findById(req.params.id);

    if (!team) {
      return res.status(404).json({
        success: false,
        message: 'Team not found'
      });
    }

    // Check if user is admin
    const isAdmin = team.members.some(
      m => m.user && m.user.toString() === req.user.id && m.role === 'admin'
    );

    if (!isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Only team admins can remove members'
      });
    }

    // Remove member
    team.members = team.members.filter(
      m => m.user && m.user.toString() !== userId
    );

    await team.save();

    // Remove team from user's teams
    await User.findByIdAndUpdate(userId, {
      $pull: { teams: team._id }
    });

    res.json({
      success: true,
      message: 'Member removed successfully'
    });
  } catch (error) {
    console.error('Remove member error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Delete team
exports.deleteTeam = async (req, res) => {
  try {
    const team = await Team.findById(req.params.id);

    if (!team) {
      return res.status(404).json({
        success: false,
        message: 'Team not found'
      });
    }

    // Check if user is owner
    if (team.owner.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Only team owner can delete the team'
      });
    }

    // Remove team from all members
    await User.updateMany(
      { teams: team._id },
      { $pull: { teams: team._id } }
    );

    await team.deleteOne();

    res.json({
      success: true,
      message: 'Team deleted successfully'
    });
  } catch (error) {
    console.error('Delete team error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
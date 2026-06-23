const Meeting = require('../models/Meeting');
const Task = require('../models/Task');
const Team = require('../models/Team');
const User = require('../models/User');

// Get dashboard stats
exports.getDashboardStats = async (req, res) => {
  try {
    const userId = req.user.id;

    // Meeting stats
    const totalMeetings = await Meeting.countDocuments({
      $or: [
        { creator: userId },
        { 'participants.user': userId }
      ]
    });

    const upcomingMeetings = await Meeting.countDocuments({
      $or: [
        { creator: userId },
        { 'participants.user': userId }
      ],
      status: 'scheduled',
      startTime: { $gt: new Date() }
    });

    const completedMeetings = await Meeting.countDocuments({
      $or: [
        { creator: userId },
        { 'participants.user': userId }
      ],
      status: 'completed'
    });

    // Task stats
    const totalTasks = await Task.countDocuments({ 
      $or: [
        { assignedTo: userId },
        { assignedBy: userId }
      ]
    });

    const pendingTasks = await Task.countDocuments({
      assignedTo: userId,
      status: { $in: ['todo', 'in_progress'] }
    });

    const completedTasks = await Task.countDocuments({
      assignedTo: userId,
      status: 'completed'
    });

    // Team stats
    const teams = await Team.find({
      $or: [
        { owner: userId },
        { 'members.user': userId }
      ]
    });

    res.json({
      success: true,
      stats: {
        meetings: {
          total: totalMeetings,
          upcoming: upcomingMeetings,
          completed: completedMeetings
        },
        tasks: {
          total: totalTasks,
          pending: pendingTasks,
          completed: completedTasks
        },
        teams: {
          total: teams.length,
          members: teams.reduce((acc, team) => acc + team.members.length, 0)
        }
      }
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get meeting analytics
exports.getMeetingAnalytics = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get meetings over time (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const meetings = await Meeting.find({
      $or: [
        { creator: userId },
        { 'participants.user': userId }
      ],
      createdAt: { $gte: thirtyDaysAgo }
    });

    // Group meetings by day
    const meetingsByDay = {};
    meetings.forEach(meeting => {
      const day = meeting.createdAt.toISOString().split('T')[0];
      meetingsByDay[day] = (meetingsByDay[day] || 0) + 1;
    });

    // Get average meeting duration
    const completedMeetings = meetings.filter(m => m.status === 'completed');
    const avgDuration = completedMeetings.length > 0
      ? completedMeetings.reduce((sum, m) => sum + (m.duration || 0), 0) / completedMeetings.length
      : 0;

    res.json({
      success: true,
      analytics: {
        totalMeetings: meetings.length,
        averageDuration: Math.round(avgDuration),
        meetingsByDay,
        statusBreakdown: {
          scheduled: meetings.filter(m => m.status === 'scheduled').length,
          ongoing: meetings.filter(m => m.status === 'ongoing').length,
          completed: meetings.filter(m => m.status === 'completed').length,
          cancelled: meetings.filter(m => m.status === 'cancelled').length
        }
      }
    });
  } catch (error) {
    console.error('Meeting analytics error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get task analytics
exports.getTaskAnalytics = async (req, res) => {
  try {
    const userId = req.user.id;

    const tasks = await Task.find({
      $or: [
        { assignedTo: userId },
        { assignedBy: userId }
      ]
    });

    res.json({
      success: true,
      analytics: {
        totalTasks: tasks.length,
        statusBreakdown: {
          todo: tasks.filter(t => t.status === 'todo').length,
          in_progress: tasks.filter(t => t.status === 'in_progress').length,
          review: tasks.filter(t => t.status === 'review').length,
          completed: tasks.filter(t => t.status === 'completed').length
        },
        priorityBreakdown: {
          high: tasks.filter(t => t.priority === 'high').length,
          medium: tasks.filter(t => t.priority === 'medium').length,
          low: tasks.filter(t => t.priority === 'low').length
        }
      }
    });
  } catch (error) {
    console.error('Task analytics error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get team analytics
exports.getTeamAnalytics = async (req, res) => {
  try {
    const userId = req.user.id;

    const teams = await Team.find({
      $or: [
        { owner: userId },
        { 'members.user': userId }
      ]
    }).populate('members.user', 'name email');

    res.json({
      success: true,
      analytics: {
        totalTeams: teams.length,
        teams: teams.map(team => ({
          id: team._id,
          name: team.name,
          members: team.members.length,
          owner: team.owner,
          createdAt: team.createdAt
        }))
      }
    });
  } catch (error) {
    console.error('Team analytics error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
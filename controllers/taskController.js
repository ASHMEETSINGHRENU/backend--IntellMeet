const Task = require('../models/Task');
const User = require('../models/User');

// Create task
exports.createTask = async (req, res) => {
  try {
    const { title, description, assignedTo, priority, dueDate, meeting, team } = req.body;

    const task = new Task({
      title,
      description,
      assignedTo,
      assignedToName: assignedTo ? (await User.findById(assignedTo)).name : null,
      assignedBy: req.user.id,
      meeting,
      team,
      priority: priority || 'medium',
      dueDate: dueDate || null
    });

    await task.save();
    await task.populate('assignedTo', 'name email');
    await task.populate('assignedBy', 'name email');

    res.status(201).json({
      success: true,
      message: 'Task created successfully',
      task
    });
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get tasks
exports.getTasks = async (req, res) => {
  try {
    const { team, meeting, assignedTo, status } = req.query;
    
    const query = {};
    if (team) query.team = team;
    if (meeting) query.meeting = meeting;
    if (assignedTo) query.assignedTo = assignedTo;
    if (status) query.status = status;

    const tasks = await Task.find(query)
      .populate('assignedTo', 'name email')
      .populate('assignedBy', 'name email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      tasks
    });
  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get single task
exports.getTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('assignedTo', 'name email')
      .populate('assignedBy', 'name email');

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    res.json({
      success: true,
      task
    });
  } catch (error) {
    console.error('Get task error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Update task
exports.updateTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    // If assignedTo is being updated, update the name
    if (req.body.assignedTo) {
      const user = await User.findById(req.body.assignedTo);
      req.body.assignedToName = user ? user.name : null;
    }

    const updatedTask = await Task.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('assignedTo', 'name email')
     .populate('assignedBy', 'name email');

    res.json({
      success: true,
      message: 'Task updated successfully',
      task: updatedTask
    });
  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Update task status
exports.updateTaskStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    task.status = status;
    if (status === 'completed') {
      task.completedAt = new Date();
    }

    await task.save();
    await task.populate('assignedTo', 'name email');
    await task.populate('assignedBy', 'name email');

    res.json({
      success: true,
      message: 'Task status updated',
      task
    });
  } catch (error) {
    console.error('Update task status error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Delete task
exports.deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    await task.deleteOne();

    res.json({
      success: true,
      message: 'Task deleted successfully'
    });
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
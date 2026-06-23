const AISummary = require('../models/AISummary');
const Meeting = require('../models/Meeting');

// Generate summary (simulated AI)
exports.generateSummary = async (req, res) => {
  try {
    const { meetingId, transcript } = req.body;

    const meeting = await Meeting.findById(meetingId);
    if (!meeting) {
      return res.status(404).json({
        success: false,
        message: 'Meeting not found'
      });
    }

    // Simulated AI summary generation
    const summary = new AISummary({
      meeting: meetingId,
      transcript: transcript || 'Meeting transcript...',
      summary: 'This meeting covered key project updates and action items. The team discussed progress on the current sprint and identified next steps.',
      keyPoints: [
        'Project is on track for Q4 delivery',
        'Need to address performance issues',
        'Client feedback received on UI design'
      ],
      actionItems: [
        {
          task: 'Complete performance optimization',
          priority: 'high',
          status: 'pending'
        },
        {
          task: 'Review client feedback on UI',
          priority: 'medium',
          status: 'pending'
        },
        {
          task: 'Update project timeline',
          priority: 'low',
          status: 'pending'
        }
      ],
      decisions: [
        'Proceed with new design system',
        'Schedule follow-up meeting next week'
      ],
      participants: [
        { name: 'John Doe', speakingTime: 15, engagement: 85 },
        { name: 'Jane Smith', speakingTime: 12, engagement: 90 }
      ],
      meetingDuration: meeting.duration || 45
    });

    await summary.save();

    // Update meeting with summary
    meeting.hasSummary = true;
    meeting.aiSummary = summary._id;
    await meeting.save();

    res.status(201).json({
      success: true,
      message: 'AI Summary generated successfully',
      summary
    });
  } catch (error) {
    console.error('Generate summary error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get summary
exports.getSummary = async (req, res) => {
  try {
    const summary = await AISummary.findById(req.params.id)
      .populate('meeting', 'title startTime endTime creator');

    if (!summary) {
      return res.status(404).json({
        success: false,
        message: 'Summary not found'
      });
    }

    res.json({
      success: true,
      summary
    });
  } catch (error) {
    console.error('Get summary error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get meeting summary
exports.getMeetingSummary = async (req, res) => {
  try {
    const { meetingId } = req.params;
    
    const summary = await AISummary.findOne({ meeting: meetingId })
      .populate('meeting', 'title startTime endTime creator');

    if (!summary) {
      return res.status(404).json({
        success: false,
        message: 'No summary found for this meeting'
      });
    }

    res.json({
      success: true,
      summary
    });
  } catch (error) {
    console.error('Get meeting summary error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Update action item
exports.updateActionItem = async (req, res) => {
  try {
    const { id, itemIndex } = req.params;
    const { status, assignedTo, dueDate } = req.body;

    const summary = await AISummary.findById(id);
    if (!summary) {
      return res.status(404).json({
        success: false,
        message: 'Summary not found'
      });
    }

    const index = parseInt(itemIndex);
    if (index < 0 || index >= summary.actionItems.length) {
      return res.status(400).json({
        success: false,
        message: 'Invalid action item index'
      });
    }

    // Update action item
    summary.actionItems[index] = {
      ...summary.actionItems[index].toObject(),
      ...(status && { status }),
      ...(assignedTo && { assignedTo }),
      ...(dueDate && { dueDate })
    };

    await summary.save();

    res.json({
      success: true,
      message: 'Action item updated successfully',
      summary
    });
  } catch (error) {
    console.error('Update action item error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
const Meeting = require("../models/Meeting");
const User = require("../models/User");

exports.createMeeting = async (req, res) => {
  try {
    const { title, description, participants, startTime, endTime, team } = req.body;
    
    const meeting = new Meeting({
      title,
      description,
      creator: req.user.id,
      participants: participants || [],
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      team
    });

    await meeting.save();
    await meeting.populate("creator", "name email");

    res.status(201).json({
      success: true,
      message: "Meeting created successfully",
      meeting
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.getMeetings = async (req, res) => {
  try {
    const meetings = await Meeting.find({
      $or: [
        { creator: req.user.id },
        { "participants.user": req.user.id }
      ]
    })
    .populate("creator", "name email")
    .populate("participants.user", "name email")
    .sort({ startTime: -1 });

    res.json({
      success: true,
      meetings
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.getMeeting = async (req, res) => {
  try {
    const meeting = await Meeting.findById(req.params.id)
      .populate("creator", "name email")
      .populate("participants.user", "name email");

    if (!meeting) {
      return res.status(404).json({
        success: false,
        message: "Meeting not found"
      });
    }

    res.json({
      success: true,
      meeting
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.updateMeeting = async (req, res) => {
  try {
    const meeting = await Meeting.findById(req.params.id);

    if (!meeting) {
      return res.status(404).json({
        success: false,
        message: "Meeting not found"
      });
    }

    if (meeting.creator.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this meeting"
      });
    }

    const updatedMeeting = await Meeting.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: "Meeting updated successfully",
      meeting: updatedMeeting
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.joinMeeting = async (req, res) => {
  try {
    const meeting = await Meeting.findById(req.params.id);

    if (!meeting) {
      return res.status(404).json({
        success: false,
        message: "Meeting not found"
      });
    }

    const participantExists = meeting.participants.some(
      p => p.user && p.user.toString() === req.user.id
    );

    if (!participantExists) {
      const user = await User.findById(req.user.id);
      meeting.participants.push({
        user: req.user.id,
        email: user.email,
        name: user.name,
        status: "joined",
        joinedAt: new Date()
      });
    } else {
      const participant = meeting.participants.find(
        p => p.user && p.user.toString() === req.user.id
      );
      if (participant) {
        participant.status = "joined";
        participant.joinedAt = new Date();
      }
    }

    if (meeting.status === "scheduled") {
      meeting.status = "ongoing";
    }

    await meeting.save();

    res.json({
      success: true,
      message: "Joined meeting successfully",
      meeting
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.endMeeting = async (req, res) => {
  try {
    const meeting = await Meeting.findById(req.params.id);

    if (!meeting) {
      return res.status(404).json({
        success: false,
        message: "Meeting not found"
      });
    }

    meeting.status = "completed";
    meeting.endTime = new Date();
    await meeting.save();

    res.json({
      success: true,
      message: "Meeting ended successfully"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.deleteMeeting = async (req, res) => {
  try {
    const meeting = await Meeting.findById(req.params.id);

    if (!meeting) {
      return res.status(404).json({
        success: false,
        message: "Meeting not found"
      });
    }

    if (meeting.creator.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this meeting"
      });
    }

    await meeting.deleteOne();

    res.json({
      success: true,
      message: "Meeting deleted successfully"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
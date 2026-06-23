const mongoose = require('mongoose');

const aiSummarySchema = new mongoose.Schema({
  meeting: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Meeting',
    required: true
  },
  transcript: {
    type: String,
    default: ''
  },
  summary: {
    type: String,
    required: true
  },
  keyPoints: [{
    type: String
  }],
  actionItems: [{
    task: {
      type: String,
      required: true
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    assignedToName: String,
    priority: {
      type: String,
      enum: ['high', 'medium', 'low'],
      default: 'medium'
    },
    status: {
      type: String,
      enum: ['pending', 'in_progress', 'completed'],
      default: 'pending'
    },
    dueDate: Date,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  decisions: [{
    type: String
  }],
  participants: [{
    name: String,
    email: String,
    speakingTime: Number,
    engagement: Number
  }],
  meetingDuration: Number,
  generatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('AISummary', aiSummarySchema);
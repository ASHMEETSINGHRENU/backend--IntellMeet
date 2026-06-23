const mongoose = require("mongoose");

const meetingSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      trim: true
    },
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    participants: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
      },
      email: String,
      name: String,
      status: {
        type: String,
        enum: ["pending", "accepted", "declined", "joined"],
        default: "pending"
      },
      joinedAt: Date,
      leftAt: Date
    }],
    team: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Team"
    },
    startTime: {
      type: Date,
      required: true,
      default: Date.now
    },
    endTime: {
      type: Date,
      required: true
    },
    duration: {
      type: Number,
      default: 0
    },
    status: {
      type: String,
      enum: ["scheduled", "ongoing", "completed", "cancelled"],
      default: "scheduled"
    },
    meetingLink: {
      type: String,
      unique: true
    },
    meetingCode: {
      type: String,
      unique: true
    },
    hasSummary: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

meetingSchema.pre("save", function(next) {
  if (!this.meetingLink) {
    this.meetingLink = `meet-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
  }
  if (!this.meetingCode) {
    this.meetingCode = Math.random().toString(36).substring(2, 8).toUpperCase();
  }
  next();
});

meetingSchema.pre("save", function(next) {
  if (this.startTime && this.endTime) {
    const diffTime = Math.abs(this.endTime - this.startTime);
    this.duration = Math.ceil(diffTime / (1000 * 60));
  }
  next();
});

module.exports = mongoose.model("Meeting", meetingSchema);
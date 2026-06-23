const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const app = express();


// =====================
// Middleware
// =====================

const allowedOrigins = [
  "http://localhost:3000",
  "https://frontend-intell-meet.vercel.app"
];

app.use(
  cors({
    origin: function (origin, callback) {

      // Allow Postman/mobile/server requests
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true
  })
);


app.use(express.json());


// =====================
// Routes Import
// =====================

const authRoutes = require("./routes/authRoutes");
const meetingRoutes = require("./routes/meetingRoutes");
const teamRoutes = require("./routes/teamRoutes");
const taskRoutes = require("./routes/taskRoutes");
const summaryRoutes = require("./routes/summaryRoutes");
const analyticsRoutes = require("./routes/analyticsRoutes");


// =====================
// Test Routes
// =====================

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "IntellMeet Backend API is running 🚀"
  });
});


app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    database:
      mongoose.connection.readyState === 1
        ? "connected"
        : "disconnected"
  });
});


// =====================
// API Routes
// =====================

app.use("/api/auth", authRoutes);

app.use("/api/meetings", meetingRoutes);

app.use("/api/teams", teamRoutes);

app.use("/api/tasks", taskRoutes);

app.use("/api/summaries", summaryRoutes);

app.use("/api/analytics", analyticsRoutes);


// =====================
// Error Handler
// =====================

app.use((err, req, res, next) => {

  console.error(err);

  res.status(500).json({
    success:false,
    message:
      err.message || "Internal Server Error"
  });

});



// =====================
// MongoDB + Server Start
// =====================

const PORT = process.env.PORT || 5000;


const startServer = async () => {

  try {

    await mongoose.connect(process.env.MONGO_URI);

    console.log("MongoDB connected successfully");


    app.listen(PORT, () => {

      console.log(
        `Server running on port ${PORT}`
      );

    });


  } catch(error){

    console.error(
      "MongoDB connection failed:",
      error.message
    );

    process.exit(1);

  }

};


startServer();
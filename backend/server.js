// server.js
require('dotenv').config(); // <-- must be first line

const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");

const authRoutes = require("./routes/auth");
const feedbackRoutes = require("./routes/feedback");
const leaveRoutes = require("./routes/leave");
const allocationRoutes = require("./routes/allocation");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/feedback", feedbackRoutes);
app.use("/api/leave", leaveRoutes);
app.use("/api/allocation", allocationRoutes);
// Test route
app.get("/", (req, res) => res.send("Backend is running!"));

// Start server
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));

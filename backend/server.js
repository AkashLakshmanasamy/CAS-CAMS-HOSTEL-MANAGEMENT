require('dotenv').config();

const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();
const PORT = process.env.PORT || 5000;

// 1. Middleware
app.use(cors());
app.use(bodyParser.json());

// 2. Import Routes
const studentRoutes = require('./routes/student');
const authRoutes = require("./routes/auth");
const feedbackRoutes = require("./routes/feedback");
const leaveRoutes = require("./routes/leave");
const allocationRoutes = require("./routes/allocation");

// 3. Mount Routes - PUT STUDENT FIRST
app.use('/api/student', studentRoutes); 
app.use("/api/auth", authRoutes);
app.use("/api/feedback", feedbackRoutes);
app.use("/api/leave", leaveRoutes);
app.use("/api/allocation", allocationRoutes);

app.get("/", (req, res) => res.send("Backend is running!"));

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
require('dotenv').config();
const express = require("express");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 5000;

// 1. Middleware - UPDATED WITH PUT AND OPTIONS
app.use(cors({
    origin: "http://localhost:5173", 
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"], 
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json());

// 2. Route Imports
const studentRoutes = require('./routes/student');
const authRoutes = require("./routes/auth");
const feedbackRoutes = require("./routes/feedback");
const leaveRoutes = require("./routes/leave");
const roomRoutes = require("./routes/room");
const allocationRoutes = require('./routes/allocation');
const rulesRoutes = require('./routes/rules');

// 3. Mounting
app.use('/api/student', studentRoutes); 
app.use("/api/auth", authRoutes);
app.use("/api/feedback", feedbackRoutes);
app.use("/api/leave", leaveRoutes);
app.use("/api/room", roomRoutes);
app.use("/api/allocation", allocationRoutes);
app.use('/api/rules', rulesRoutes);

app.get("/", (req, res) => res.send("Backend Running"));

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
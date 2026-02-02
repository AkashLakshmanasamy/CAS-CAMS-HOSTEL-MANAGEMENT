require('dotenv').config();
const express = require("express");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 5000;

// 1. Middleware
app.use(cors({
    origin: "http://localhost:5173", // Your React/Vite URL
    methods: ["GET", "POST", "PATCH", "DELETE"],
    credentials: true
}));
app.use(express.json());

// 2. Route Imports
const studentRoutes = require('./routes/student');
const authRoutes = require("./routes/auth");
const feedbackRoutes = require("./routes/feedback");
const leaveRoutes = require("./routes/leave");
const roomRoutes = require("./routes/rooms");
const allocationRoutes = require('./routes/allocation');
// 3. Mounting
app.use('/api/student', studentRoutes); 
app.use("/api/auth", authRoutes);
app.use("/api/feedback", feedbackRoutes);
app.use("/api/leave", leaveRoutes);
app.use("/api/rooms", roomRoutes);
app.use("/api/allocation", allocationRoutes);

app.get("/", (req, res) => res.send("Backend Running"));

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
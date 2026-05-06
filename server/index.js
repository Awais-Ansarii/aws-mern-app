
import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import { connectDB } from "./config/db.js";
import imageRoutes from "./routes/imageRoutes.js";


const app = express();

app.use(cors());
app.use(express.json());

// DB connect
connectDB();

// routes
app.use("/api", imageRoutes);

app.listen(5000, () => console.log("Server running 🚀"));
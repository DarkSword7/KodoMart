// Packages
import path from "path";
import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";

// Utils
import connectDB from "./config/db.js";

// Routes
import userRoutes from "./routes/userRoutes.js";

dotenv.config();
const PORT = process.env.PORT || 5000;
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use("/api/users", userRoutes);

connectDB().then(
  console.log("Successfully connected to MongoDB ✅"),
  app.listen(PORT, () => {
    console.log(`Server is running on: http://localhost:${PORT}`);
  })
);

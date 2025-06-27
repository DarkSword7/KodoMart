// Node Modules
import bcrypt from "bcryptjs";
// Models
import User from "../models/userModel.js";

// Async Handler
import asyncHandler from "../middlewares/asyncHandler.js";

const createUser = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    throw new Error("Please fill all the inputs.");
  }

  // Check if user already exists in the database
  const userExists = await User.findOne({ email });

  if (userExists) {
    res.status(400).json({
      error: "AuthenticationError",
      message: "User already exists.",
    });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  // Create a new user
  const newUser = new User({ username, email, password: hashedPassword });

  try {
    await newUser.save();
    res.status(200).json({
      _id: newUser._id,
      username: newUser.username,
      email: newUser.email,
      isAdmin: newUser.isAdmin,
    });
  } catch (error) {
    res.sendStatus(400);
    throw new Error("Invalid user credentials");
  }
});

export { createUser };

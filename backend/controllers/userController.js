// Node Modules
import bcrypt from "bcryptjs";
// Models
import User from "../models/userModel.js";

// Async Handler
import asyncHandler from "../middlewares/asyncHandler.js";
import createToken from "../utils/createToken.js";

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
    createToken(res, newUser._id);
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

const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new Error("Both email and password are required.");
  }

  const existingUser = await User.findOne({ email });

  if (existingUser) {
    const isPasswordValid = await bcrypt.compare(
      password,
      existingUser.password
    );

    if (isPasswordValid) {
      createToken(res, existingUser._id);

      res.status(200).json({
        _id: existingUser._id,
        username: existingUser.username,
        email: existingUser.email,
        isAdmin: existingUser.isAdmin,
      });

      return;
    } else {
      res.status(404);
      throw new Error("Incorrect Password.");
    }
  } else {
    res.status(404);
    throw new Error("User not found.");
  }
});

const logoutController = asyncHandler(async (req, res) => {
  res
    .status(200)
    .clearCookie("token")
    .json({ message: "Logged out successfully." });
});

const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find({});
  res.status(200).json(users);
});

const getCurrentUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    res.json({
      _id: user._id,
      username: user.username,
      email: user.email,
    });
  } else {
    res.status(404);
    throw new Error("User not found.");
  }
});

const updateCurrentUserProfile = asyncHandler(async (req, res) => {
  const { email, username, password } = req.body;

  const user = await User.findById(req.user._id);

  if (user) {
    user.username = username || user.username;
    user.email = email || user.email;

    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      user.password = hashedPassword;
    }

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      username: updatedUser.username,
      email: updatedUser.email,
      isAdmin: Boolean(updatedUser.isAdmin),
    });
  } else {
    res.status(404);
    throw new Error("User not found.");
  }
});

const deleteUserById = asyncHandler(async (req, res) => {
  const id = req.params.id;

  const user = await User.findById(id);

  if (user) {
    if (user.isAdmin) {
      res.status(404);
      throw new Error("Cannon delete admin user");
    }
    await User.deleteOne({ _id: user._id });

    res.json({
      message: "User removed from the database.",
    });
  } else {
    res.status(404);
    throw new Error("User not found.");
  }
});

const getUserById = asyncHandler(async (req, res) => {
  const id = req.params.id;

  const user = await User.findById(id).select("-password");

  if (user) {
    res.json(user);
  } else {
    res.status(404);
    throw new Error("User not found.");
  }
});

const updateUserById = asyncHandler(async (req, res) => {
  const id = req.params.id;
  const { email, username, password } = req.body;

  const user = await User.findById(id);

  if (user) {
    user.username = username || user.username;
    user.email = email || user.email;

    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      user.password = hashedPassword;
    }

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      username: updatedUser.username,
      email: updatedUser.email,
      isAdmin: Boolean(updatedUser.isAdmin),
    });
  } else {
    res.status(404);
    throw new Error("User not found.");
  }
});

export {
  createUser,
  loginUser,
  logoutController,
  getAllUsers,
  getCurrentUserProfile,
  updateCurrentUserProfile,
  deleteUserById,
  getUserById,
  updateUserById,
};

const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Register new user
exports.register = async (req, res) => {
  try {
    const { nickname, password, gender, age, isFirstTime } = req.body;

    // Validate nickname
    if (!nickname || nickname.length < 3 || nickname.length > 20) {
      return res.status(400).json({ message: 'Nickname must be between 3 and 20 characters' });
    }

    // Validate password
    if (!password || password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }

    // Check if nickname already exists
    const existingUser = await User.findOne({ nickname: nickname.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ message: 'Nickname already taken. Please choose another one.' });
    }

    // Create new user
    const user = new User({
      nickname: nickname.toLowerCase(),
      password,
      gender,
      age,
      isFirstTime: isFirstTime !== undefined ? isFirstTime : true,
    });

    await user.save();

    // Generate token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: '30d',
    });

    res.status(201).json({
      message: 'User created successfully',
      token,
      user: {
        _id: user._id,
        nickname: user.nickname,
        gender: user.gender,
        age: user.age,
        isFirstTime: user.isFirstTime,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Registration failed', error: error.message });
  }
};

// Login user
exports.login = async (req, res) => {
  try {
    const { nickname, password } = req.body;

    // Validate input
    if (!nickname || !password) {
      return res.status(400).json({ message: 'Please provide nickname and password' });
    }

    // Find user
    const user = await User.findOne({ nickname: nickname.toLowerCase() });
    if (!user) {
      return res.status(401).json({ message: 'Invalid nickname or password' });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid nickname or password' });
    }

    // Generate token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: '30d',
    });

    res.json({
      message: 'Login successful',
      token,
      user: {
        _id: user._id,
        nickname: user.nickname,
        gender: user.gender,
        age: user.age,
        demographics: user.demographics,
        occupational: user.occupational,
        isFirstTime: user.isFirstTime,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Login failed', error: error.message });
  }
};

// Update user profile
exports.updateProfile = async (req, res) => {
  try {
    const { demographics, occupational, isFirstTime } = req.body;

    const updateData = {};
    if (demographics) updateData.demographics = demographics;
    if (occupational) updateData.occupational = occupational;
    if (isFirstTime !== undefined) updateData.isFirstTime = isFirstTime;

    const user = await User.findByIdAndUpdate(
      req.userId,
      { $set: updateData },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      message: 'Profile updated successfully',
      user: {
        _id: user._id,
        nickname: user.nickname,
        gender: user.gender,
        age: user.age,
        demographics: user.demographics,
        occupational: user.occupational,
        isFirstTime: user.isFirstTime,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Profile update failed', error: error.message });
  }
};

// Get current user
exports.getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json({
      user: {
        _id: user._id,
        nickname: user.nickname,
        gender: user.gender,
        age: user.age,
        demographics: user.demographics,
        occupational: user.occupational,
        isFirstTime: user.isFirstTime,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch user', error: error.message });
  }
};
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const { validationResult } = require('express-validator');
const UserModel = require('../models/user.model');
const generateToken = require('../utils/generateToken');
const { sendEmail } = require('../services/email.service');
const env = require('../config/env');

const SALT_ROUNDS = 10;

exports.signup = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { name, email, phone, password } = req.body;

    const existingUser = await UserModel.findByEmail(email);
    if (existingUser) {
      return res.status(409).json({ success: false, message: 'Email already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    const userId = await UserModel.create({ name, email, phone, hashedPassword });

    const token = generateToken({ id: userId, role: 'user' });

    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      token,
      user: { id: userId, name, email, phone, role: 'user' },
    });
  } catch (err) {
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { email, password } = req.body;

    const user = await UserModel.findByEmail(email);
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const token = generateToken({ id: user.id, role: user.role });

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.forgotPassword = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { email } = req.body;
    const user = await UserModel.findByEmail(email);

    // Always respond success to avoid leaking which emails are registered
    if (!user) {
      return res.json({
        success: true,
        message: 'If that email exists, a reset link has been sent',
      });
    }

    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + env.RESET_TOKEN_EXPIRES_MIN * 60 * 1000);

    await UserModel.setResetToken(email, token, expiresAt);

    const resetLink = `${env.CLIENT_URL}/reset-password?token=${token}`;

    await sendEmail({
      to: email,
      subject: 'Reset your password',
      html: `
        <p>Hi ${user.name},</p>
        <p>Click the link below to reset your password. This link expires in ${env.RESET_TOKEN_EXPIRES_MIN} minutes.</p>
        <p><a href="${resetLink}">${resetLink}</a></p>
        <p>If you didn't request this, ignore this email.</p>
      `,
    });

    res.json({ success: true, message: 'If that email exists, a reset link has been sent' });
  } catch (err) {
    next(err);
  }
};

exports.resetPassword = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { token, password } = req.body;

    const user = await UserModel.findByResetToken(token);
    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid or expired reset token' });
    }

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    await UserModel.updatePassword(user.id, hashedPassword);

    res.json({ success: true, message: 'Password reset successfully' });
  } catch (err) {
    next(err);
  }
};

exports.getMe = async (req, res, next) => {
  try {
    const user = await UserModel.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.json({ success: true, user });
  } catch (err) {
    next(err);
  }
};
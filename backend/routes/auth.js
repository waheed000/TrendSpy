import express from 'express';
import { connectDB } from '../server/db.js';
import { User } from '../models/index.js';
import { generateToken, buildTokenCookie, buildClearCookie, authMiddleware } from '../middleware/auth.js';
import { isValidEmail } from '../lib/validators.js';
import { sendVerificationOTP, verifyOTP } from '../services/otpService.js';
import { sendPasswordResetOTP, resetPassword } from '../services/passwordResetService.js';

const router = express.Router();

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const GOOGLE_REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3001/api/auth/google/callback';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5000';

// POST /register
router.post('/register', async (req, res) => {
  try {
    await connectDB();
    const { name, email, password } = req.body;

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return res.status(400).json({ success: false, error: 'Name is required' });
    }
    if (!email || !isValidEmail(email)) {
      return res.status(400).json({ success: false, error: 'A valid email is required' });
    }
    if (!password || password.length < 6) {
      return res.status(400).json({ success: false, error: 'Password must be at least 6 characters' });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      if (!existing.emailVerified && process.env.EMAIL_USER && process.env.EMAIL_PASS) {
        sendVerificationOTP(email.toLowerCase()).catch((err) => console.error('[OTP Error]', err));
        return res.json({
          success: true,
          requiresVerification: true,
          email: email.toLowerCase(),
          message: 'Account exists but email is unverified. A new code has been sent.',
        });
      }
      return res.status(409).json({ success: false, error: 'An account with this email already exists' });
    }

    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase(),
      password,
      emailVerified: false,
    });

    const emailConfigured = !!(process.env.EMAIL_USER && process.env.EMAIL_PASS);
    if (emailConfigured) {
      sendVerificationOTP(user.email).catch((err) => console.error('[OTP Error]', err));
      return res.status(201).json({
        success: true,
        requiresVerification: true,
        email: user.email,
        message: 'Verification code sent to your email',
      });
    }

    const token = generateToken(user._id, user.email);
    res.setHeader('Set-Cookie', buildTokenCookie(token));
    return res.status(201).json({
      success: true,
      data: {
        user: { id: user._id, name: user.name, email: user.email, role: user.role },
        token,
      },
    });
  } catch (error) {
    console.error('Register error:', error);
    return res.status(500).json({ success: false, error: 'Registration failed' });
  }
});

// POST /login
router.post('/login', async (req, res) => {
  try {
    await connectDB();
    const { email, password } = req.body;

    if (!email || !isValidEmail(email)) {
      return res.status(400).json({ success: false, error: 'A valid email is required' });
    }
    if (!password) {
      return res.status(400).json({ success: false, error: 'Password is required' });
    }

    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    await User.findByIdAndUpdate(user._id, { lastLogin: new Date() });

    const token = generateToken(user._id, user.email);
    res.setHeader('Set-Cookie', buildTokenCookie(token));
    return res.json({
      success: true,
      data: {
        user: { id: user._id, name: user.name, email: user.email, role: user.role },
        token,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ success: false, error: 'Login failed' });
  }
});

// POST /logout
router.post('/logout', (req, res) => {
  res.setHeader('Set-Cookie', buildClearCookie());
  return res.json({ success: true, data: { message: 'Logged out successfully' } });
});

// GET /me
router.get('/me', authMiddleware, async (req, res) => {
  return res.json({
    success: true,
    data: {
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
        telegramChatId: req.user.telegramChatId,
        emailNotifications: req.user.emailNotifications,
        telegramNotifications: req.user.telegramNotifications,
        dailyDigest: req.user.dailyDigest,
        digestTime: req.user.digestTime,
        lastLogin: req.user.lastLogin,
        createdAt: req.user.createdAt,
      },
    },
  });
});

// POST /verify-email
router.post('/verify-email', async (req, res) => {
  try {
    await connectDB();
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ success: false, error: 'Email and OTP are required' });
    }

    await verifyOTP(email, otp, 'verification');

    const user = await User.findOneAndUpdate(
      { email: email.toLowerCase() },
      { emailVerified: true },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    const token = generateToken(user._id, user.email);
    res.setHeader('Set-Cookie', buildTokenCookie(token));
    return res.json({
      success: true,
      message: 'Email verified successfully',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          emailVerified: user.emailVerified,
        },
        token,
      },
    });
  } catch (error) {
    console.error('[POST /api/auth/verify-email]', error);
    return res.status(400).json({ success: false, error: error.message });
  }
});

// POST /resend-otp
router.post('/resend-otp', async (req, res) => {
  try {
    await connectDB();
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, error: 'Email is required' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({ success: false, error: 'No account found with this email' });
    }

    if (user.emailVerified) {
      return res.status(400).json({ success: false, error: 'Email is already verified' });
    }

    await sendVerificationOTP(email);
    return res.json({ success: true, message: 'Verification code resent to your email' });
  } catch (error) {
    console.error('[POST /api/auth/resend-otp]', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

// POST /forgot-password
router.post('/forgot-password', async (req, res) => {
  try {
    await connectDB();
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, error: 'Email is required' });
    }

    await sendPasswordResetOTP(email);
    return res.json({
      success: true,
      message: 'If an account exists with this email, you will receive a password reset code shortly',
    });
  } catch (error) {
    console.error('[POST /api/auth/forgot-password]', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

// POST /reset-password
router.post('/reset-password', async (req, res) => {
  try {
    await connectDB();
    const { email, otp, newPassword } = req.body;
    if (!email || !otp || !newPassword) {
      return res.status(400).json({ success: false, error: 'Email, OTP, and new password are required' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, error: 'Password must be at least 6 characters' });
    }

    await resetPassword(email, otp, newPassword);
    return res.json({
      success: true,
      message: 'Password reset successful. You can now log in with your new password.',
    });
  } catch (error) {
    console.error('[POST /api/auth/reset-password]', error);
    return res.status(400).json({ success: false, error: error.message });
  }
});

// GET /google/start
router.get('/google/start', (req, res) => {
  if (!GOOGLE_CLIENT_ID) {
    return res.status(503).json({ success: false, error: 'Google OAuth is not configured on this server.' });
  }

  const params = new URLSearchParams({
    client_id: GOOGLE_CLIENT_ID,
    redirect_uri: GOOGLE_REDIRECT_URI,
    response_type: 'code',
    scope: 'openid email profile',
    access_type: 'offline',
    prompt: 'select_account',
  });

  const url = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  return res.redirect(url);
});

// GET /google/callback
router.get('/google/callback', async (req, res) => {
  const code = req.query.code;
  const error = req.query.error;

  if (error || !code) {
    return res.redirect(`${FRONTEND_URL}/login?error=google_cancelled`);
  }

  try {
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        redirect_uri: GOOGLE_REDIRECT_URI,
        grant_type: 'authorization_code',
      }),
    });

    const tokenData = await tokenRes.json();
    if (!tokenRes.ok || !tokenData.access_token) {
      console.error('[Google OAuth] Token exchange failed:', tokenData);
      return res.redirect(`${FRONTEND_URL}/login?error=google_token`);
    }

    const profileRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });
    const profile = await profileRes.json();

    if (!profile.email) {
      return res.redirect(`${FRONTEND_URL}/login?error=google_no_email`);
    }

    await connectDB();

    let user = await User.findOne({ googleId: profile.sub }) || await User.findOne({ email: profile.email });

    if (user) {
      if (!user.googleId) {
        user.googleId = profile.sub;
        user.googleEmail = profile.email;
        user.authProvider = 'google';
        if (!user.emailVerified) user.emailVerified = true;
        await user.save();
      }
    } else {
      user = await User.create({
        name: profile.name || profile.email.split('@')[0],
        email: profile.email,
        googleId: profile.sub,
        googleEmail: profile.email,
        authProvider: 'google',
        emailVerified: true,
        profilePicture: profile.picture || null,
      });
    }

    await User.findByIdAndUpdate(user._id, { lastLogin: new Date() });

    const token = generateToken(user._id, user.email);
    const name = encodeURIComponent(user.name || '');

    return res.redirect(`${FRONTEND_URL}/login?google=success&token=${token}&name=${name}`);
  } catch (err) {
    console.error('[Google OAuth callback]', err);
    return res.redirect(`${FRONTEND_URL}/login?error=google_server`);
  }
});

export default router;

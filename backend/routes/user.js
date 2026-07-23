import express from 'express';
import { connectDB } from '../server/db.js';
import { User, Alert } from '../models/index.js';
import AlertLog from '../models/AlertLog.js';
import InAppNotification from '../models/InAppNotification.js';
import { authMiddleware } from '../middleware/auth.js';
import { validatePakistanPhoneNumber } from '../utils/phoneValidator.js';
import { generateApiKey } from '../utils/generateApiKey.js';

const router = express.Router();

const VALID_CATEGORIES = ['Fashion', 'Electronics', 'Beauty', 'Home', 'Grocery', 'Toys', 'Sports', 'Books'];
const VALID_PLATFORMS  = ['Facebook Ads', 'Daraz', 'TikTok Shop', 'Instagram', 'OLX'];
const VALID_CITIES     = ['Lahore', 'Karachi', 'Islamabad', 'Faisalabad', 'Rawalpindi', 'Multan', 'Peshawar', 'Quetta', 'Sialkot', 'Gujranwala'];

const PROFILE_SELECT = 'name email phoneNumber selectedCity selectedCategories selectedPlatforms emailNotifications whatsappNotifications dailyDigest digestTime subscriptionPlan apiKey profilePicture role createdAt lastLogin';

// GET /profile
router.get('/profile', authMiddleware, async (req, res) => {
  try {
    await connectDB();

    const profile = await User.findById(req.user._id).select(PROFILE_SELECT).lean();
    if (!profile) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    return res.json({
      success: true,
      data: {
        user: {
          id:                   profile._id,
          name:                 profile.name,
          email:                profile.email,
          phoneNumber:          profile.phoneNumber  || null,
          city:                 profile.selectedCity || null,
          selectedCategories:   profile.selectedCategories  || [],
          selectedPlatforms:    profile.selectedPlatforms   || [],
          emailNotifications:   profile.emailNotifications,
          whatsappNotifications: profile.whatsappNotifications,
          dailyDigest:          profile.dailyDigest,
          digestTime:           profile.digestTime,
          subscriptionPlan:     profile.subscriptionPlan || 'free',
          apiKey:               profile.apiKey || null,
          profilePicture:       profile.profilePicture || null,
          createdAt:            profile.createdAt,
        },
      },
    });
  } catch (err) {
    console.error('[GET /api/user/profile]', err);
    return res.status(500).json({ success: false, error: 'Failed to fetch profile' });
  }
});

// PUT /profile
router.put('/profile', authMiddleware, async (req, res) => {
  try {
    await connectDB();

    const {
      name,
      phoneNumber,
      city,
      selectedCategories,
      selectedPlatforms,
      emailNotifications,
      whatsappNotifications,
      dailyDigest,
      digestTime,
    } = req.body;

    const updates = {};

    if (name !== undefined) {
      if (typeof name !== 'string' || name.trim().length === 0) {
        return res.status(400).json({ success: false, error: 'Name cannot be empty' });
      }
      updates.name = name.trim();
    }

    if (phoneNumber !== undefined) {
      if (phoneNumber !== null && phoneNumber !== '') {
        if (!validatePakistanPhoneNumber(phoneNumber)) {
          return res.status(400).json({ success: false, error: 'Invalid phone number. Use Pakistani format: +923XXXXXXXXX' });
        }
        updates.phoneNumber = phoneNumber;
      } else {
        updates.phoneNumber = null;
      }
    }

    if (city !== undefined) {
      if (city !== null && city !== '' && !VALID_CITIES.includes(city)) {
        return res.status(400).json({ success: false, error: `Invalid city. Choose from: ${VALID_CITIES.join(', ')}` });
      }
      updates.selectedCity = city || null;
    }

    if (selectedCategories !== undefined) {
      if (!Array.isArray(selectedCategories)) {
        return res.status(400).json({ success: false, error: 'selectedCategories must be an array' });
      }
      const invalid = selectedCategories.filter((c) => !VALID_CATEGORIES.includes(c));
      if (invalid.length) {
        return res.status(400).json({ success: false, error: `Invalid categories: ${invalid.join(', ')}` });
      }
      updates.selectedCategories = selectedCategories;
    }

    if (selectedPlatforms !== undefined) {
      if (!Array.isArray(selectedPlatforms)) {
        return res.status(400).json({ success: false, error: 'selectedPlatforms must be an array' });
      }
      const invalid = selectedPlatforms.filter((p) => !VALID_PLATFORMS.includes(p));
      if (invalid.length) {
        return res.status(400).json({ success: false, error: `Invalid platforms: ${invalid.join(', ')}` });
      }
      updates.selectedPlatforms = selectedPlatforms;
    }

    if (emailNotifications    !== undefined) updates.emailNotifications    = Boolean(emailNotifications);
    if (whatsappNotifications !== undefined) updates.whatsappNotifications = Boolean(whatsappNotifications);
    if (dailyDigest           !== undefined) updates.dailyDigest           = Boolean(dailyDigest);
    if (digestTime            !== undefined) updates.digestTime            = digestTime;

    const updated = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updates },
      { new: true, runValidators: true }
    ).select(PROFILE_SELECT).lean();

    return res.json({
      success: true,
      data: {
        user: {
          id:                   updated._id,
          name:                 updated.name,
          email:                updated.email,
          phoneNumber:          updated.phoneNumber  || null,
          city:                 updated.selectedCity || null,
          selectedCategories:   updated.selectedCategories  || [],
          selectedPlatforms:    updated.selectedPlatforms   || [],
          emailNotifications:   updated.emailNotifications,
          whatsappNotifications: updated.whatsappNotifications,
          dailyDigest:          updated.dailyDigest,
          digestTime:           updated.digestTime,
          subscriptionPlan:     updated.subscriptionPlan || 'free',
          apiKey:               updated.apiKey || null,
          profilePicture:       updated.profilePicture || null,
          createdAt:            updated.createdAt,
        },
      },
    });
  } catch (err) {
    console.error('[PUT /api/user/profile]', err);
    return res.status(500).json({ success: false, error: 'Failed to update profile' });
  }
});

// PUT /password
router.put('/password', authMiddleware, async (req, res) => {
  try {
    await connectDB();

    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, error: 'Both current and new password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, error: 'New password must be at least 6 characters' });
    }

    const dbUser = await User.findById(req.user._id).select('+password');
    if (!dbUser) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    const isMatch = await dbUser.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ success: false, error: 'Current password is incorrect' });
    }

    dbUser.password = newPassword;
    await dbUser.save();

    return res.json({ success: true, message: 'Password updated successfully' });
  } catch (err) {
    console.error('[PUT /api/user/password]', err);
    return res.status(500).json({ success: false, error: 'Failed to update password' });
  }
});

// DELETE /account
router.delete('/account', authMiddleware, async (req, res) => {
  try {
    await connectDB();

    await Promise.all([
      Alert.deleteMany({ userId: req.user._id }),
      AlertLog.deleteMany({ userId: req.user._id }),
      InAppNotification.deleteMany({ userId: req.user._id }),
    ]);

    await User.findByIdAndDelete(req.user._id);

    return res.json({
      success: true,
      message: 'Account and all associated data permanently deleted.',
    });
  } catch (err) {
    console.error('[DELETE /api/user/account]', err);
    return res.status(500).json({ success: false, error: 'Failed to delete account' });
  }
});

// POST /apikey
router.post('/apikey', authMiddleware, async (req, res) => {
  try {
    await connectDB();

    const dbUser = await User.findById(req.user._id).select('subscriptionPlan');
    if (!dbUser) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    if (dbUser.subscriptionPlan === 'free') {
      return res.status(403).json({ success: false, error: 'API key access requires a Pro or Business plan' });
    }

    const apiKey = generateApiKey();

    await User.findByIdAndUpdate(req.user._id, {
      $set: { apiKey, apiKeyGeneratedAt: new Date() },
    });

    return res.json({ success: true, data: { apiKey } });
  } catch (err) {
    console.error('[POST /api/user/apikey]', err);
    return res.status(500).json({ success: false, error: 'Failed to generate API key' });
  }
});

// POST /onboarding
router.post('/onboarding', authMiddleware, async (req, res) => {
  try {
    await connectDB();

    const { categories, city, platforms } = req.body;

    if (!categories?.length || !city || !platforms?.length) {
      return res.status(400).json({ success: false, error: 'categories, city, and platforms are all required' });
    }

    const invalidCats = categories.filter((c) => !VALID_CATEGORIES.includes(c));
    if (invalidCats.length) {
      return res.status(400).json({ success: false, error: `Invalid categories: ${invalidCats.join(', ')}` });
    }

    if (!VALID_CITIES.includes(city)) {
      return res.status(400).json({ success: false, error: `Invalid city: ${city}` });
    }

    const invalidPlats = platforms.filter((p) => !VALID_PLATFORMS.includes(p));
    if (invalidPlats.length) {
      return res.status(400).json({ success: false, error: `Invalid platforms: ${invalidPlats.join(', ')}` });
    }

    await User.findByIdAndUpdate(req.user._id, {
      $set: {
        selectedCategories: categories,
        selectedCity:       city,
        selectedPlatforms:  platforms,
        onboardingCompleted: true,
      },
    });

    return res.json({ success: true, message: 'Onboarding complete' });
  } catch (err) {
    console.error('[POST /api/user/onboarding]', err);
    return res.status(500).json({ success: false, error: 'Failed to save onboarding data' });
  }
});

// GET /onboarding/status
router.get('/onboarding/status', authMiddleware, async (req, res) => {
  try {
    await connectDB();

    const dbUser = await User.findById(req.user._id)
      .select('onboardingCompleted selectedCategories selectedCity selectedPlatforms')
      .lean();

    if (!dbUser) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    return res.json({
      success: true,
      data: {
        needsOnboarding: !dbUser.onboardingCompleted,
        userPreferences: {
          categories: dbUser.selectedCategories || [],
          city:        dbUser.selectedCity      || null,
          platforms:   dbUser.selectedPlatforms || [],
        },
      },
    });
  } catch (err) {
    console.error('[GET /api/user/onboarding/status]', err);
    return res.status(500).json({ success: false, error: 'Failed to check onboarding status' });
  }
});

// GET /alerts/history
router.get('/alerts/history', authMiddleware, async (req, res) => {
  try {
    await connectDB();

    const page  = Math.max(1, parseInt(req.query.page  || '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit || '20', 10)));
    const skip  = (page - 1) * limit;

    const [alerts, total] = await Promise.all([
      AlertLog.find({ userId: req.user._id })
        .sort({ sentAt: -1 })
        .skip(skip)
        .limit(limit)
        .select('productName winScore channel sentAt delivered errorMessage -_id')
        .lean(),
      AlertLog.countDocuments({ userId: req.user._id }),
    ]);

    return res.json({
      success: true,
      data: {
        alerts,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (err) {
    console.error('[GET /api/user/alerts/history]', err);
    return res.status(500).json({ success: false, error: 'Failed to fetch alert history' });
  }
});

export default router;

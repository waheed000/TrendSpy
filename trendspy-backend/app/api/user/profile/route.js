import { connectDB } from '@/lib/db';
import { User } from '@/models/index';
import { withAuth } from '@/middleware/auth';

const PK_PHONE_REGEX = /^\+923\d{9}$/;

export const GET = withAuth(async (request, context, user) => {
  try {
    await connectDB();

    const profile = await User.findById(user._id).select(
      'name email phoneNumber emailNotifications whatsappNotifications dailyDigest digestTime role createdAt lastLogin'
    );

    return Response.json({ success: true, data: { user: profile } });
  } catch (err) {
    console.error('[GET /api/user/profile]', err);
    return Response.json({ success: false, error: 'Failed to fetch profile' }, { status: 500 });
  }
});

export const PUT = withAuth(async (request, context, user) => {
  try {
    await connectDB();

    const body = await request.json();
    const { phoneNumber, emailNotifications, whatsappNotifications, dailyDigest, digestTime } = body;

    if (phoneNumber !== undefined) {
      if (phoneNumber !== null && phoneNumber !== '' && !PK_PHONE_REGEX.test(phoneNumber)) {
        return Response.json(
          { success: false, error: 'Invalid phone number. Use Pakistani format: +923XXXXXXXXX' },
          { status: 400 }
        );
      }
    }

    const updates = {};
    if (phoneNumber !== undefined) updates.phoneNumber = phoneNumber || null;
    if (emailNotifications !== undefined) updates.emailNotifications = Boolean(emailNotifications);
    if (whatsappNotifications !== undefined) updates.whatsappNotifications = Boolean(whatsappNotifications);
    if (dailyDigest !== undefined) updates.dailyDigest = Boolean(dailyDigest);
    if (digestTime !== undefined) updates.digestTime = digestTime;

    const updated = await User.findByIdAndUpdate(
      user._id,
      { $set: updates },
      { new: true, runValidators: true }
    ).select('name email phoneNumber emailNotifications whatsappNotifications dailyDigest digestTime');

    return Response.json({ success: true, data: { user: updated } });
  } catch (err) {
    console.error('[PUT /api/user/profile]', err);
    return Response.json({ success: false, error: 'Failed to update profile' }, { status: 500 });
  }
});

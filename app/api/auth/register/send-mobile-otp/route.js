import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { sendMobileOtpSchema } from '@/schemas/authSchemas';
import { createAndSaveOtp } from '@/lib/otpService';
import { sendMobileVerificationOtp } from '@/lib/smsService';

export const dynamic = 'force-dynamic';

export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();

    const parseResult = sendMobileOtpSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        { message: parseResult.error.errors.map((e) => e.message).join(', ') },
        { status: 400 }
      );
    }

    const { email, mobile } = parseResult.data;

    // Generate and save hashed OTP for mobile
    const otpRes = await createAndSaveOtp({
      identifier: mobile,
      type: 'MOBILE_VERIFICATION',
      metadata: { email, mobile },
    });

    if (!otpRes.success) {
      return NextResponse.json({ message: otpRes.message }, { status: 429 });
    }

    // Send SMS via provider
    const smsRes = await sendMobileVerificationOtp({
      mobile,
      otp: otpRes.rawOtp,
    });

    return NextResponse.json({
      success: true,
      delivered: smsRes.delivered,
      configured: smsRes.configured ?? true,
      notice: smsRes.notice,
      resendAvailableAt: otpRes.resendAvailableAt,
      message: smsRes.delivered
        ? 'A 6-digit SMS verification code has been sent to your mobile.'
        : smsRes.notice || 'SMS code generated.',
    });
  } catch (error) {
    console.error('Send mobile OTP error:', error);
    return NextResponse.json(
      { message: 'Failed to send mobile verification code.', error: error.message },
      { status: 500 }
    );
  }
}

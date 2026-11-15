/**
 * Alka Refrigeration — Genuine SMS Gateway Provider Integration
 * Supports Twilio REST API and Fast2SMS for Indian phone numbers (+91)
 */

export async function sendMobileVerificationOtp({ mobile, otp }) {
  const cleanMobile = mobile.replace(/\D/g, ''); // strip non-numeric

  // 1. Check Twilio Configuration
  const twilioSid = process.env.TWILIO_ACCOUNT_SID;
  const twilioToken = process.env.TWILIO_AUTH_TOKEN;
  const twilioFrom = process.env.TWILIO_PHONE_NUMBER;

  // 2. Check Fast2SMS Configuration (India)
  const fast2SmsKey = process.env.FAST2SMS_API_KEY;

  const smsText = `Your Alka Refrigeration mobile verification code is: ${otp}. Valid for 5 minutes. Do not share this OTP with anyone.`;

  // --- TWILIO INTEGRATION ---
  if (twilioSid && twilioToken && twilioFrom) {
    try {
      const auth = Buffer.from(`${twilioSid}:${twilioToken}`).toString('base64');
      const formattedTo = cleanMobile.startsWith('91') ? `+${cleanMobile}` : `+91${cleanMobile}`;

      const params = new URLSearchParams();
      params.append('To', formattedTo);
      params.append('From', twilioFrom);
      params.append('Body', smsText);

      const res = await fetch(
        `https://api.twilio.com/2010-04-01/Accounts/${twilioSid}/Messages.json`,
        {
          method: 'POST',
          headers: {
            Authorization: `Basic ${auth}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: params.toString(),
        }
      );

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Twilio SMS dispatch failed');
      }

      return {
        success: true,
        delivered: true,
        provider: 'Twilio',
        sid: data.sid,
      };
    } catch (err) {
      console.error('Twilio SMS Error:', err.message);
      return { success: false, delivered: false, error: err.message };
    }
  }

  // --- FAST2SMS INTEGRATION (Indian SMS Gateway) ---
  if (fast2SmsKey) {
    try {
      const targetPhone = cleanMobile.length === 12 && cleanMobile.startsWith('91')
        ? cleanMobile.substring(2)
        : cleanMobile;

      const res = await fetch('https://www.fast2sms.com/dev/bulkV2', {
        method: 'POST',
        headers: {
          authorization: fast2SmsKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          route: 'otp',
          variables_values: otp,
          numbers: targetPhone,
        }),
      });

      const data = await res.json();
      if (data.return) {
        return { success: true, delivered: true, provider: 'Fast2SMS' };
      } else {
        throw new Error(data.message || 'Fast2SMS error');
      }
    } catch (err) {
      console.error('Fast2SMS Error:', err.message);
      return { success: false, delivered: false, error: err.message };
    }
  }

  // --- UNCONFIGURED FALLBACK ---
  console.warn('\n============================================================');
  console.warn('⚠️ SMS GATEWAY NOTICE: Provider Credentials Not Configured');
  console.warn('------------------------------------------------------------');
  console.warn(`Target Mobile: +91 ${cleanMobile}`);
  console.warn(`>>> DEMO / TEST MOBILE OTP: ${otp} <<<`);
  console.warn('------------------------------------------------------------');
  console.warn('To enable live SMS delivery, configure either Twilio or Fast2SMS in .env.local:');
  console.warn('  Option 1 (Twilio):');
  console.warn('    TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxx');
  console.warn('    TWILIO_AUTH_TOKEN=your_auth_token');
  console.warn('    TWILIO_PHONE_NUMBER=+1xxxxxxxxxx');
  console.warn('  Option 2 (Fast2SMS):');
  console.warn('    FAST2SMS_API_KEY=your_fast2sms_api_key');
  console.warn('============================================================\n');

  return {
    success: true,
    delivered: false,
    configured: false,
    missingConfig: ['TWILIO_ACCOUNT_SID / FAST2SMS_API_KEY'],
    notice: 'SMS gateway unconfigured in .env.local; code logged to server console.',
  };
}

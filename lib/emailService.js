import nodemailer from 'nodemailer';

/**
 * Creates and returns a Nodemailer transporter based on environment configuration
 */
function getTransporter() {
  const host = process.env.EMAIL_SERVER_HOST;
  const port = parseInt(process.env.EMAIL_SERVER_PORT || '587', 10);
  const user = process.env.EMAIL_SERVER_USER;
  const pass = process.env.EMAIL_SERVER_PASSWORD;

  if (!host || !user || !pass) {
    return null;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: {
      user,
      pass,
    },
  });
}

/**
 * Sends an email verification OTP to a newly registering customer
 */
export async function sendEmailVerificationOtp({ email, name, otp }) {
  const transporter = getTransporter();
  const fromAddress =
    process.env.EMAIL_FROM || '"Alka Refrigeration" <noreply@alkarefrigeration.com>';

  const subject = `Your Alka Refrigeration Verification Code: ${otp}`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px; color: #1e293b; }
        .card { max-width: 540px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
        .header { background: #0c87eb; background: linear-gradient(135deg, #0284c7 0%, #0a3c70 100%); padding: 32px 24px; text-align: center; color: #ffffff; }
        .header h1 { margin: 0; font-size: 22px; font-weight: 800; letter-spacing: 0.5px; }
        .header p { margin: 6px 0 0; font-size: 13px; opacity: 0.9; }
        .content { padding: 32px 28px; }
        .greeting { font-size: 16px; font-weight: 600; margin-bottom: 12px; }
        .message { font-size: 14px; line-height: 1.6; color: #475569; margin-bottom: 24px; }
        .otp-container { text-align: center; margin: 28px 0; }
        .otp-code { display: inline-block; font-family: 'Courier New', monospace; font-size: 36px; font-weight: 800; letter-spacing: 8px; color: #0284c7; background: #f0f7ff; padding: 14px 28px; border-radius: 12px; border: 2px dashed #7cc4fd; }
        .expiry-note { font-size: 12px; color: #64748b; text-align: center; margin-top: 12px; }
        .security-note { background: #f8fafc; border-left: 4px solid #0284c7; padding: 12px 16px; border-radius: 4px; font-size: 12px; color: #475569; margin-top: 24px; }
        .footer { padding: 20px; text-align: center; font-size: 11px; color: #94a3b8; border-top: 1px solid #f1f5f9; background: #fafafa; }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="header">
          <h1>ALKA REFRIGERATION</h1>
          <p>Expert Appliance & Cooling Solutions • Babatpur, Varanasi</p>
        </div>
        <div class="content">
          <div class="greeting">Hello ${name ? name : 'there'},</div>
          <div class="message">
            Thank you for registering with Alka Refrigeration. To complete your account verification, please enter the single-use 6-digit code below:
          </div>
          <div class="otp-container">
            <div class="otp-code">${otp}</div>
            <div class="expiry-note">⏱ This code is valid for <strong>5 minutes</strong>.</div>
          </div>
          <div class="security-note">
            <strong>Security Reminder:</strong> Never share this code with anyone. Alka Refrigeration technicians and support staff will never ask for your verification code.
          </div>
        </div>
        <div class="footer">
          &copy; ${new Date().getFullYear()} Alka Refrigeration. Babatpur, Varanasi, UP, India.<br>
          Customer Helpline: +91 8090546021 | alkarefrigeration@gmail.com
        </div>
      </div>
    </body>
    </html>
  `;

  if (!transporter) {
    console.warn('\n============================================================');
    console.warn('⚠️ EMAIL SERVICE NOTICE: SMTP Credentials Not Configured');
    console.warn('------------------------------------------------------------');
    console.warn(`Recipient: ${email}`);
    console.warn(`Subject:   ${subject}`);
    console.warn(`>>> DEMO / TEST OTP CODE: ${otp} <<<`);
    console.warn('------------------------------------------------------------');
    console.warn('To enable live email delivery via Gmail/SMTP, set in .env.local:');
    console.warn('  EMAIL_SERVER_HOST=smtp.gmail.com');
    console.warn('  EMAIL_SERVER_PORT=587');
    console.warn('  EMAIL_SERVER_USER=your_email@gmail.com');
    console.warn('  EMAIL_SERVER_PASSWORD=your_gmail_app_password');
    console.warn('  EMAIL_FROM="Alka Refrigeration" <your_email@gmail.com>');
    console.warn('============================================================\n');

    return {
      success: true,
      delivered: false,
      notice: 'SMTP server unconfigured; OTP logged to server terminal for testing.',
    };
  }

  try {
    const info = await transporter.sendMail({
      from: fromAddress,
      to: email,
      subject,
      html,
    });
    return { success: true, delivered: true, messageId: info.messageId };
  } catch (error) {
    console.error('SMTP Mail Delivery Error:', error);
    return { success: false, delivered: false, error: error.message };
  }
}

/**
 * Sends a password reset OTP
 */
export async function sendPasswordResetOtp({ email, name, otp }) {
  const transporter = getTransporter();
  const fromAddress =
    process.env.EMAIL_FROM || '"Alka Refrigeration" <noreply@alkarefrigeration.com>';

  const subject = `Alka Refrigeration Password Reset Code: ${otp}`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px; color: #1e293b; }
        .card { max-width: 540px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
        .header { background: linear-gradient(135deg, #e11d48 0%, #881337 100%); padding: 32px 24px; text-align: center; color: #ffffff; }
        .header h1 { margin: 0; font-size: 22px; font-weight: 800; letter-spacing: 0.5px; }
        .content { padding: 32px 28px; }
        .otp-container { text-align: center; margin: 28px 0; }
        .otp-code { display: inline-block; font-family: 'Courier New', monospace; font-size: 36px; font-weight: 800; letter-spacing: 8px; color: #e11d48; background: #fff1f2; padding: 14px 28px; border-radius: 12px; border: 2px dashed #fda4af; }
        .expiry-note { font-size: 12px; color: #64748b; text-align: center; margin-top: 12px; }
        .security-note { background: #fffbeb; border-left: 4px solid #f59e0b; padding: 12px 16px; border-radius: 4px; font-size: 12px; color: #92400e; margin-top: 24px; }
        .footer { padding: 20px; text-align: center; font-size: 11px; color: #94a3b8; border-top: 1px solid #f1f5f9; }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="header">
          <h1>PASSWORD RESET REQUEST</h1>
        </div>
        <div class="content">
          <p>Hello ${name ? name : 'Customer'},</p>
          <p>We received a request to reset the password for your Alka Refrigeration account. Use the code below to proceed:</p>
          <div class="otp-container">
            <div class="otp-code">${otp}</div>
            <div class="expiry-note">⏱ Code expires in <strong>5 minutes</strong>.</div>
          </div>
          <div class="security-note">
            If you did not request a password reset, you can safely ignore this email. Your password will remain unchanged.
          </div>
        </div>
        <div class="footer">
          &copy; ${new Date().getFullYear()} Alka Refrigeration • Babatpur, Varanasi
        </div>
      </div>
    </body>
    </html>
  `;

  if (!transporter) {
    console.warn('\n============================================================');
    console.warn('⚠️ PASSWORD RESET NOTICE: SMTP Credentials Not Configured');
    console.warn(`Recipient: ${email}`);
    console.warn(`>>> DEMO / TEST RESET OTP: ${otp} <<<`);
    console.warn('============================================================\n');

    return {
      success: true,
      delivered: false,
      notice: 'SMTP server unconfigured; Reset OTP logged to terminal for testing.',
    };
  }

  try {
    const info = await transporter.sendMail({
      from: fromAddress,
      to: email,
      subject,
      html,
    });
    return { success: true, delivered: true, messageId: info.messageId };
  } catch (error) {
    console.error('Password reset mail error:', error);
    return { success: false, delivered: false, error: error.message };
  }
}

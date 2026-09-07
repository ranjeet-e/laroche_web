const nodemailer = require('nodemailer');

let transporter = null;

const getTransporter = () => {
  if (!transporter) {
    const user = process.env.EMAIL_USER;
    const pass = process.env.EMAIL_PASS || process.env.EMAIL_APP_PASSWORD;

    if (!user || !pass) {
      console.warn('⚠️ [EmailService] EMAIL_USER or EMAIL_PASS not configured in .env. Emails will not be sent.');
      return null;
    }

    transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: user.trim(),
        pass: pass.trim().replace(/\s+/g, ''), // Strip any spaces from the 16-char app password
      },
    });
  }
  return transporter;
};

/**
 * Send an OTP Verification / Password Reset Email
 */
const sendOtpEmail = async ({ to, otp, type = 'verification' }) => {
  const mailer = getTransporter();
  if (!mailer) return false;

  const isReset = type === 'reset';
  const subject = isReset
    ? '🔑 La Roche Cafe — Password Reset Code'
    : '✨ La Roche Cafe — Your Verification Code';

  const heading = isReset ? 'Reset Your Password' : 'Verify Your Email';
  const subtext = isReset
    ? 'Use the 6-digit code below to reset your La Roche Cafe password. This code will expire in 10 minutes.'
    : 'Welcome to La Roche Cafe! Use the 6-digit code below to verify your account and order fresh brews & bites.';

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${subject}</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #F5EBE6; color: #231F20;">
        <table width="100%" cellpadding="0" cellspacing="0" style="padding: 40px 15px;">
          <tr>
            <td align="center">
              <table width="100%" max-width="560px" style="max-width: 560px; background-color: #FFFFFF; border-radius: 20px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.06); border: 1px solid #E5D7D0;">
                
                <!-- Header Banner -->
                <tr>
                  <td style="background-color: #231F20; padding: 32px 24px; text-align: center;">
                    <h1 style="margin: 0; color: #FAF7F2; font-size: 26px; font-weight: 800; letter-spacing: 0.5px;">
                      LA ROCHE CAFE
                    </h1>
                    <p style="margin: 6px 0 0; color: #9F7A60; font-size: 13px; font-weight: 500; letter-spacing: 1px; text-transform: uppercase;">
                      Preorder & Counter Pickup
                    </p>
                  </td>
                </tr>

                <!-- Content Body -->
                <tr>
                  <td style="padding: 36px 32px 28px; text-align: center;">
                    <h2 style="margin: 0 0 12px; color: #231F20; font-size: 22px; font-weight: 700;">
                      ${heading}
                    </h2>
                    <p style="margin: 0 0 28px; color: #6B5B52; font-size: 15px; line-height: 1.6;">
                      ${subtext}
                    </p>

                    <!-- OTP Code Box -->
                    <div style="background-color: #F5EBE6; border: 2px dashed #9F7A60; border-radius: 14px; padding: 20px 16px; margin: 0 auto 28px; max-width: 320px;">
                      <span style="font-size: 34px; font-weight: 800; letter-spacing: 8px; color: #231F20; font-family: monospace; display: block; margin-left: 8px;">
                        ${otp}
                      </span>
                    </div>

                    <p style="margin: 0 0 10px; color: #8F7E75; font-size: 13px;">
                      ⏱️ Valid for <strong>10 minutes</strong>. Do not share this code with anyone.
                    </p>
                    <p style="margin: 0; color: #B0A198; font-size: 12px;">
                      If you didn't request this code, you can safely ignore this email.
                    </p>
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="background-color: #FAF5F2; padding: 20px; text-align: center; border-top: 1px solid #E5D7D0;">
                    <p style="margin: 0; color: #8F7E75; font-size: 12px;">
                      Crafted for the Hustle. Brewed for the Break. ☕<br>
                      &copy; ${new Date().getFullYear()} La Roche Cafe. All rights reserved.
                    </p>
                  </td>
                </tr>

              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;

  try {
    const info = await mailer.sendMail({
      from: `"La Roche Cafe" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });
    console.log(`✉️ [EmailService] OTP email sent to ${to}: messageId=${info.messageId}`);
    return true;
  } catch (error) {
    console.error(`❌ [EmailService] Failed to send email to ${to}:`, error.message);
    return false;
  }
};

/**
 * Send Order Confirmation Receipt
 */
const sendOrderConfirmationEmail = async ({ to, order }) => {
  const mailer = getTransporter();
  if (!mailer || !to) return false;

  const subject = `🎉 Order #${order.orderNumber || ''} Confirmed — La Roche Cafe`;
  const itemsHtml = (order.items || [])
    .map(
      (item) => `
        <tr>
          <td style="padding: 10px 0; border-bottom: 1px solid #E5D7D0; color: #231F20; font-weight: 600;">
            ${item.quantity}x ${item.name}
          </td>
          <td align="right" style="padding: 10px 0; border-bottom: 1px solid #E5D7D0; color: #231F20; font-weight: 700;">
            ₹${item.price * item.quantity}
          </td>
        </tr>
      `
    )
    .join('');

  const html = `
    <!DOCTYPE html>
    <html>
      <head><meta charset="utf-8"></head>
      <body style="margin: 0; padding: 0; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #F5EBE6; color: #231F20;">
        <table width="100%" cellpadding="0" cellspacing="0" style="padding: 40px 15px;">
          <tr>
            <td align="center">
              <table width="100%" max-width="560px" style="max-width: 560px; background-color: #FFFFFF; border-radius: 20px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.06); border: 1px solid #E5D7D0;">
                <tr>
                  <td style="background-color: #231F20; padding: 28px 24px; text-align: center;">
                    <h1 style="margin: 0; color: #FAF7F2; font-size: 24px; font-weight: 800;">LA ROCHE CAFE</h1>
                    <p style="margin: 4px 0 0; color: #9F7A60; font-size: 13px;">Order Confirmation</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 30px;">
                    <h2 style="margin: 0 0 8px; color: #231F20; font-size: 20px;">We're preparing your order!</h2>
                    <p style="margin: 0 0 20px; color: #6B5B52; font-size: 14px;">
                      Order ID: <strong>#${order.orderNumber || order._id}</strong>
                    </p>
                    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 20px;">
                      ${itemsHtml}
                      <tr>
                        <td style="padding: 14px 0 0; color: #231F20; font-weight: 800; font-size: 16px;">Total Paid</td>
                        <td align="right" style="padding: 14px 0 0; color: #9F7A60; font-weight: 800; font-size: 18px;">₹${order.totalAmount}</td>
                      </tr>
                    </table>
                    <div style="background-color: #FAF5F2; border-radius: 12px; padding: 14px; text-align: center; margin-top: 15px;">
                      <p style="margin: 0; color: #6B5B52; font-size: 13px;">
                        Show your <strong>Order Pass / QR code</strong> at the counter when called!
                      </p>
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;

  try {
    await mailer.sendMail({
      from: `"La Roche Cafe" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });
    return true;
  } catch (err) {
    console.error('❌ [EmailService] Failed to send order receipt email:', err.message);
    return false;
  }
};

module.exports = {
  getTransporter,
  sendOtpEmail,
  sendOrderConfirmationEmail,
};

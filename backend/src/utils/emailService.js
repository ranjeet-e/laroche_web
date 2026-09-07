const nodemailer = require('nodemailer');
const dns = require('dns');

if (dns.setDefaultResultOrder) {
  dns.setDefaultResultOrder('ipv4first');
}

let transporter = null;

const getTransporter = () => {
  if (!transporter) {
    const user = process.env.EMAIL_USER;
    const pass = process.env.EMAIL_PASS || process.env.EMAIL_APP_PASSWORD;

    if (!user || !pass) {
      return null;
    }

    transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      family: 4,
      auth: {
        user: user.trim(),
        pass: pass.trim().replace(/\s+/g, ''),
      },
      tls: {
        rejectUnauthorized: false,
      },
      connectionTimeout: 8000,
    });
  }
  return transporter;
};

/**
 * Send email via Resend HTTP REST API (port 443 — works everywhere without SMTP port blocks)
 */
const sendViaResend = async ({ to, subject, html }) => {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return null;
  try {
    const fromAddr = process.env.RESEND_FROM || 'La Roche Cafe <onboarding@resend.dev>';
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey.trim()}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: fromAddr,
        to: Array.isArray(to) ? to : [to],
        subject,
        html,
      }),
    });
    const data = await response.json();
    if (response.ok) {
      console.log(`✉️ [Resend] Email delivered to ${to}: id=${data.id}`);
      return { success: true, id: data.id, provider: 'resend' };
    }
    console.error(`❌ [Resend] API Error:`, data);
    return null;
  } catch (err) {
    console.error(`❌ [Resend] Request failed:`, err.message);
    return null;
  }
};

/**
 * Send email via Google Apps Script (100% Free HTTPS webhook using your own Gmail — no card, no port blocks)
 */
const sendViaGoogleScript = async ({ to, subject, html }) => {
  const scriptUrl =
    process.env.GOOGLE_SCRIPT_EMAIL_URL ||
    'https://script.google.com/macros/s/AKfycbzpeOIw2WotTDWKolUNMlBBPRWEzNvsaA11NwzXPXWx4aKadiFtBgWtW2TIwTurQcA/exec';
  if (!scriptUrl) return null;
  try {
    const response = await fetch(scriptUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ to, subject, html }),
      redirect: 'follow',
    });
    const text = await response.text();
    console.log(`✉️ [Google Apps Script Gmail] Dispatched to ${to}: ${text}`);
    return { success: true, provider: 'google_script' };
  } catch (err) {
    console.error(`❌ [Google Apps Script Gmail] Request failed:`, err.message);
    return null;
  }
};

/**
 * Send email via Brevo HTTP REST API (port 443 — 300 free emails/day)
 */
const sendViaBrevo = async ({ to, subject, html }) => {
  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey) return null;
  try {
    const senderEmail = process.env.EMAIL_USER || 'larochecafe26@gmail.com';
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'api-key': apiKey.trim(),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sender: { name: 'La Roche Cafe', email: senderEmail },
        to: [{ email: to }],
        subject,
        htmlContent: html,
      }),
    });
    const data = await response.json();
    if (response.ok) {
      console.log(`✉️ [Brevo] Email delivered to ${to}: id=${data.messageId}`);
      return { success: true, id: data.messageId, provider: 'brevo' };
    }
    console.error(`❌ [Brevo] API Error:`, data);
    return null;
  } catch (err) {
    console.error(`❌ [Brevo] Request failed:`, err.message);
    return null;
  }
};

/**
 * Send an OTP Verification / Password Reset Email
 */
const sendOtpEmail = async ({ to, otp, type = 'verification' }) => {
  const isReset = type === 'reset';
  const subject = isReset
    ? 'La Roche Cafe — Password Reset Code'
    : 'La Roche Cafe — Your Verification Code';

  const heading = isReset ? 'Reset Your Password' : 'Verify Your Email';
  const subtext = isReset
    ? 'Use the 6-digit code below to reset your La Roche Cafe account password. This code will expire in 10 minutes.'
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
                      Do not share this code with anyone.
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

  // 1. Try Google Apps Script (100% Free HTTPS webhook using your own Gmail — No Port Blocks)
  const gscriptResult = await sendViaGoogleScript({ to, subject, html });
  if (gscriptResult?.success) return true;

  // 2. Try Resend HTTP API
  const resendResult = await sendViaResend({ to, subject, html });
  if (resendResult?.success) return true;

  // 3. Try Brevo HTTP API
  const brevoResult = await sendViaBrevo({ to, subject, html });
  if (brevoResult?.success) return true;

  // 4. Fallback to Nodemailer SMTP
  const mailer = getTransporter();
  if (!mailer) return false;

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
  if (!to) return false;

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

  // 1. Try Google Apps Script
  const gscriptResult = await sendViaGoogleScript({ to, subject, html });
  if (gscriptResult?.success) return true;

  // 2. Try Resend HTTP
  const resendResult = await sendViaResend({ to, subject, html });
  if (resendResult?.success) return true;

  // 3. Try Brevo HTTP
  const brevoResult = await sendViaBrevo({ to, subject, html });
  if (brevoResult?.success) return true;

  // 4. Fallback to Nodemailer
  const mailer = getTransporter();
  if (!mailer) return false;

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

/**
 * Diagnostic method to test SMTP configuration and send test emails
 */
const testEmailConnection = async (testRecipient = null) => {
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS || process.env.EMAIL_APP_PASSWORD;
  const resendKey = process.env.RESEND_API_KEY;
  const brevoKey = process.env.BREVO_API_KEY;

  if (testRecipient) {
    const gs = await sendViaGoogleScript({
      to: testRecipient,
      subject: '🧪 La Roche Cafe — Direct Gmail Live Test',
      html: '<p>Test email delivered directly via Google Apps Script (100% Free HTTPS Gmail Webhook).</p>',
    });
    if (gs?.success) {
      return { success: true, provider: 'google_script', message: `Email delivered to ${testRecipient}` };
    }
  }

  if (resendKey && testRecipient) {
    const res = await sendViaResend({
      to: testRecipient,
      subject: '🧪 La Roche Cafe — Resend HTTP Test',
      html: '<p>Test email delivered via Resend HTTP API (Port 443).</p>',
    });
    if (res?.success) {
      return { success: true, provider: 'resend', messageId: res.id };
    }
  }

  if (brevoKey && testRecipient) {
    const res = await sendViaBrevo({
      to: testRecipient,
      subject: '🧪 La Roche Cafe — Brevo HTTP Test',
      html: '<p>Test email delivered via Brevo HTTP API (Port 443).</p>',
    });
    if (res?.success) {
      return { success: true, provider: 'brevo', messageId: res.id };
    }
  }

  if (!user || !pass) {
    return {
      success: false,
      error: 'No email service configured (EMAIL_USER/EMAIL_PASS or GOOGLE_SCRIPT_EMAIL_URL)',
    };
  }

  const mailer = getTransporter();
  try {
    await mailer.verify();
    if (testRecipient) {
      const info = await mailer.sendMail({
        from: `"La Roche Cafe" <${user}>`,
        to: testRecipient,
        subject: '🧪 La Roche Cafe — SMTP Live Diagnostic Test',
        text: 'This is a test email confirming that your server SMTP email delivery is functioning.',
      });
      return {
        success: true,
        provider: 'smtp',
        message: `Email sent successfully to ${testRecipient}`,
        messageId: info.messageId,
      };
    }
    return { success: true, message: 'SMTP server authentication verified successfully' };
  } catch (err) {
    return {
      success: false,
      error: err.message,
      code: err.code,
      response: err.response,
    };
  }
};

module.exports = {
  getTransporter,
  sendOtpEmail,
  sendOrderConfirmationEmail,
  testEmailConnection,
};

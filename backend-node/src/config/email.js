/**
 * Email service using Brevo HTTP API (not SMTP).
 * SMTP on port 587/465 is blocked on Render free tier.
 * HTTP API works on any port and is more reliable.
 *
 * Required env var: BREVO_API_KEY
 * Get it from: Brevo → SMTP & API → API Keys → Create a new API key
 */

const sendEmail = async ({ to, subject, html, text }) => {
  const apiKey = process.env.BREVO_API_KEY;
  const from   = process.env.SMTP_FROM || process.env.SMTP_USER || 'noreply@financetrack.app';

  if (!apiKey) {
    console.error('[EMAIL] BREVO_API_KEY not set in environment variables');
    return { success: false, reason: 'BREVO_API_KEY not configured' };
  }

  // Parse from address — support "Name <email>" format
  let fromName  = 'FinanceTrack';
  let fromEmail = from;
  const match = from.match(/^(.+)<(.+)>$/);
  if (match) {
    fromName  = match[1].trim();
    fromEmail = match[2].trim();
  }

  console.log('[EMAIL] Sending via Brevo API to:', to, '| Subject:', subject);

  try {
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'accept':       'application/json',
        'api-key':      apiKey,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        sender:   { name: fromName, email: fromEmail },
        to:       [{ email: to }],
        subject:  subject,
        htmlContent: html,
        textContent: text,
      }),
    });

    const data = await response.json();

    if (response.ok) {
      console.log('[EMAIL] Sent successfully via Brevo API. MessageId:', data.messageId);
      return { success: true, messageId: data.messageId };
    } else {
      console.error('[EMAIL] Brevo API error:', JSON.stringify(data));
      return { success: false, reason: data.message || JSON.stringify(data) };
    }
  } catch (err) {
    console.error('[EMAIL] Network error calling Brevo API:', err.message);
    return { success: false, reason: err.message };
  }
};

module.exports = { sendEmail };

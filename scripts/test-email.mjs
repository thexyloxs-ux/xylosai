// One-off email test — delete after use
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

// Parse .env manually (no dotenv needed)
const env = {};
const lines = readFileSync(resolve(process.cwd(), '.env'), 'utf-8').split('\n');
for (const line of lines) {
	const [key, ...rest] = line.split('=');
	if (key && rest.length) env[key.trim()] = rest.join('=').trim().replace(/^["']|["']$/g, '');
}

const RESEND_API_KEY = env.RESEND_API_KEY;
const APP_URL = env.PUBLIC_APP_URL || 'https://xyloss.tech';

if (!RESEND_API_KEY) {
	console.error('RESEND_API_KEY not found in .env');
	process.exit(1);
}

const { Resend } = await import('resend');
const resend = new Resend(RESEND_API_KEY);

const to = 'oniludedavido@gmail.com';
const name = 'David';
const firstName = name.split(' ')[0];

const chatUrl = `${APP_URL}/chat`;
const unsubUrl = `${APP_URL}/unsubscribe?email=${encodeURIComponent(to)}`;
const greeting = `You're in, ${firstName}.`;
const previewStr = 'Your first session is one click away — ask XYLO anything.';

const pad = '&#847;&nbsp;'.repeat(60);
const previewHtml = `<div style="display:none;max-height:0;overflow:hidden;mso-hide:all;font-size:1px;color:#0f1117;">${previewStr}${pad}</div>`;

const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>XYLO</title>
</head>
<body style="margin:0;padding:0;background:#0f1117;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  ${previewHtml}
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:#0f1117;">
    <tr>
      <td align="center" style="padding:40px 20px;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="560" style="max-width:560px;width:100%;">
          <tr><td style="padding-bottom:28px;">
            <span style="font-size:22px;font-weight:900;color:#f59e0b;letter-spacing:-0.04em;">XYLO</span>
          </td></tr>
          <tr><td style="padding-bottom:12px;">
            <h1 style="margin:0;font-size:28px;font-weight:800;color:#f1f5f9;line-height:1.2;letter-spacing:-0.02em;">${greeting}</h1>
          </td></tr>
          <tr><td style="padding-bottom:16px;">
            <p style="margin:0;font-size:16px;color:#94a3b8;line-height:1.6;">
              XYLO is your AI study companion built for African students — ask it anything about
              WAEC, JAMB, KCSE, Cambridge, or whatever you're studying right now.
            </p>
          </td></tr>
          <tr><td style="padding-bottom:32px;">
            <table cellpadding="0" cellspacing="0" border="0" role="presentation">
              <tr>
                <td align="center" bgcolor="#f59e0b" style="border-radius:8px;">
                  <a href="${chatUrl}" target="_blank"
                     style="display:inline-block;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;
                            font-size:15px;font-weight:700;color:#0f1117;text-decoration:none;
                            padding:14px 28px;border-radius:8px;">
                    Start your first session →
                  </a>
                </td>
              </tr>
            </table>
          </td></tr>
          <tr><td style="padding-bottom:16px;">
            <p style="margin:0;font-size:13px;color:#374151;">
              <a href="${unsubUrl}" style="color:#4b5563;text-decoration:underline;">Unsubscribe</a>
              &nbsp;·&nbsp; You received this because you created a XYLO account.
            </p>
          </td></tr>
          <tr><td style="padding-top:32px;border-top:1px solid #1e2336;">
            <p style="margin:0;font-size:12px;color:#4b5563;line-height:1.6;">
              © 2026 XYLO · Smarter Learning. Stronger Students. Better Outcomes.
            </p>
          </td></tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

const text = `Welcome to XYLO, ${firstName}!

XYLO is your AI study companion for WAEC, JAMB, KCSE, Cambridge and more.

Start your first session: ${chatUrl}

Unsubscribe: ${unsubUrl}
© 2026 XYLO`;

const { data, error } = await resend.emails.send({
	from: 'XYLO <hello@contact.xyloss.tech>',
	to,
	subject: `You're in, ${firstName} — your study companion is ready`,
	html,
	text,
});

if (error) {
	console.error('Send failed:', error);
	process.exit(1);
}

console.log('Sent! Message ID:', data.id);

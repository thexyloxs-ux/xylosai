import { Resend } from 'resend';
import { RESEND_API_KEY } from '$env/static/private';
import { PUBLIC_APP_URL } from '$env/static/public';

const resend = new Resend(RESEND_API_KEY);
const FROM = 'XYLO <hello@xyloxs.com>';

// ── Shared primitives ─────────────────────────────────────────────────────────

function previewText(text: string) {
	// Pad with invisible characters so email clients don't pull in body copy
	const pad = '&#847;&nbsp;'.repeat(60);
	return `<div style="display:none;max-height:0;overflow:hidden;mso-hide:all;font-size:1px;color:#0f1117;">${text}${pad}</div>`;
}

function shell(preview: string, body: string) {
	return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <meta name="color-scheme" content="dark" />
  <meta name="supported-color-schemes" content="dark" />
  <title>XYLO</title>
</head>
<body style="margin:0;padding:0;background:#0f1117;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;-webkit-font-smoothing:antialiased;">
  ${previewText(preview)}
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:#0f1117;">
    <tr>
      <td align="center" style="padding:40px 20px;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="560" style="max-width:560px;width:100%;">
          ${body}
          <!-- Footer -->
          <tr>
            <td style="padding-top:32px;border-top:1px solid #1e2336;">
              <p style="margin:0;font-size:12px;color:#4b5563;line-height:1.6;">
                © 2026 Xyloxs Ltd · Smarter Learning. Stronger Students. Better Outcomes.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function ctaButton(href: string, label: string) {
	// Bulletproof button — works in Outlook via VML, everywhere else via CSS
	return `
  <table cellpadding="0" cellspacing="0" border="0" role="presentation">
    <tr>
      <td align="center" bgcolor="#f59e0b" style="border-radius:8px;">
        <a href="${href}" target="_blank"
           style="display:inline-block;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;
                  font-size:15px;font-weight:700;color:#0f1117;text-decoration:none;
                  padding:14px 28px;border-radius:8px;letter-spacing:0.01em;">
          ${label}
        </a>
      </td>
    </tr>
  </table>`;
}

function logoRow() {
	return `<tr>
    <td style="padding-bottom:28px;">
      <span style="font-size:22px;font-weight:900;color:#f59e0b;letter-spacing:-0.04em;">XYLO</span>
    </td>
  </tr>`;
}

// ── Welcome email ─────────────────────────────────────────────────────────────

export async function sendWelcomeEmail(to: string, name: string): Promise<void> {
	const firstName = name?.split(' ')[0] || '';
	const chatUrl = `${PUBLIC_APP_URL}/chat`;
	const unsubUrl = `${PUBLIC_APP_URL}/unsubscribe?email=${encodeURIComponent(to)}`;

	const greeting = firstName ? `You're in, ${firstName}.` : "You're in.";
	const previewStr = `Your first session is one click away — ask XYLO anything.`;

	const html = shell(previewStr, `
  ${logoRow()}
  <tr>
    <td style="padding-bottom:12px;">
      <h1 style="margin:0;font-size:28px;font-weight:800;color:#f1f5f9;line-height:1.2;letter-spacing:-0.02em;">
        ${greeting}
      </h1>
    </td>
  </tr>
  <tr>
    <td style="padding-bottom:16px;">
      <p style="margin:0;font-size:16px;color:#94a3b8;line-height:1.6;">
        XYLO is your AI study companion built for African students — ask it anything about
        WAEC, JAMB, KCSE, Cambridge, or whatever you're studying right now.
      </p>
    </td>
  </tr>
  <tr>
    <td style="padding-bottom:32px;">
      <p style="margin:0;font-size:16px;color:#94a3b8;line-height:1.6;">
        Start by asking a question, uploading a past paper, or saying
        <em>"build me a study plan for my maths exam in 3 weeks."</em>
      </p>
    </td>
  </tr>
  <tr>
    <td style="padding-bottom:32px;">
      ${ctaButton(chatUrl, 'Start your first session →')}
    </td>
  </tr>
  <tr>
    <td style="padding-bottom:32px;">
      <table cellpadding="0" cellspacing="0" border="0" role="presentation" width="100%">
        <tr>
          <td style="padding:20px;background:#161b2e;border-radius:10px;border:1px solid #1e2336;">
            <p style="margin:0 0 8px;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:#4b5563;">What you can do</p>
            <p style="margin:0;font-size:14px;color:#94a3b8;line-height:1.7;">
              💡 <strong style="color:#f1f5f9;">Understand</strong> — explain any topic simply<br/>
              📝 <strong style="color:#f1f5f9;">Quiz me</strong> — practice questions with instant feedback<br/>
              📅 <strong style="color:#f1f5f9;">Study plan</strong> — personalised schedule to your exam<br/>
              🎯 <strong style="color:#f1f5f9;">Exam prep</strong> — past questions, predicted topics, tactics
            </p>
          </td>
        </tr>
      </table>
    </td>
  </tr>
  <tr>
    <td style="padding-bottom:32px;">
      <p style="margin:0;font-size:13px;color:#4b5563;line-height:1.6;">
        You have 20 free messages every day — no credit card, no trial.
        <a href="${PUBLIC_APP_URL}/pricing" style="color:#f59e0b;text-decoration:none;">Upgrade to Pro</a>
        any time for unlimited access.
      </p>
    </td>
  </tr>
  <tr>
    <td style="padding-bottom:16px;">
      <p style="margin:0;font-size:13px;color:#374151;">
        <a href="${unsubUrl}" style="color:#4b5563;text-decoration:underline;">Unsubscribe</a>
        &nbsp;·&nbsp; You received this because you created a XYLO account.
      </p>
    </td>
  </tr>
  `);

	const text = `Welcome to XYLO${firstName ? `, ${firstName}` : ''}!

XYLO is your AI study companion for WAEC, JAMB, KCSE, Cambridge and more.

Start your first session: ${chatUrl}

What you can do:
- Understand: explain any topic simply
- Quiz me: practice questions with instant feedback
- Study plan: personalised schedule to your exam
- Exam prep: past questions, predicted topics, tactics

You have 20 free messages every day. Upgrade to Pro: ${PUBLIC_APP_URL}/pricing

Unsubscribe: ${unsubUrl}
© 2026 Xyloxs Ltd`;

	await resend.emails.send({
		from: FROM,
		to,
		subject: firstName
			? `You're in, ${firstName} — your study companion is ready`
			: "You're in — your XYLO study companion is ready",
		html,
		text,
	});
}

// ── School invite email ───────────────────────────────────────────────────────

export async function sendInviteEmail(
	to: string,
	schoolName: string,
	inviteCode: string
): Promise<void> {
	const inviteUrl = `${PUBLIC_APP_URL}/join/${inviteCode}`;
	const previewStr = `Full AI study companion — no cost to you, paid for by ${schoolName}.`;

	const html = shell(previewStr, `
  ${logoRow()}
  <tr>
    <td style="padding-bottom:12px;">
      <h1 style="margin:0;font-size:28px;font-weight:800;color:#f1f5f9;line-height:1.2;letter-spacing:-0.02em;">
        ${schoolName} gave you free access to XYLO.
      </h1>
    </td>
  </tr>
  <tr>
    <td style="padding-bottom:16px;">
      <p style="margin:0;font-size:16px;color:#94a3b8;line-height:1.6;">
        XYLO is an AI-powered academic companion built for African students —
        it helps you understand tough topics, quiz yourself, build study plans,
        and prep for exams.
      </p>
    </td>
  </tr>
  <tr>
    <td style="padding-bottom:32px;">
      <p style="margin:0;font-size:16px;color:#94a3b8;line-height:1.6;">
        ${schoolName} has a school subscription, so you get <strong style="color:#f1f5f9;">unlimited access at zero cost.</strong>
        Click below to activate your account.
      </p>
    </td>
  </tr>
  <tr>
    <td style="padding-bottom:24px;">
      ${ctaButton(inviteUrl, `Join ${schoolName} on XYLO →`)}
    </td>
  </tr>
  <tr>
    <td style="padding-bottom:32px;">
      <p style="margin:0;font-size:13px;color:#4b5563;">
        Or copy this link into your browser:<br/>
        <span style="color:#94a3b8;word-break:break-all;">${inviteUrl}</span>
      </p>
    </td>
  </tr>
  `);

	const text = `${schoolName} gave you free access to XYLO.

XYLO is an AI-powered academic companion for African students — understand tough topics, quiz yourself, build study plans, and prep for exams.

${schoolName} pays for your subscription, so you get unlimited access at no cost.

Activate your account: ${inviteUrl}

© 2026 Xyloxs Ltd`;

	await resend.emails.send({
		from: FROM,
		to,
		subject: `${schoolName} gave you free access to XYLO`,
		html,
		text,
	});
}

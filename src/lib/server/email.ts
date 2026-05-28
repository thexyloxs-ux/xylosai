import { Resend } from 'resend';
import { RESEND_API_KEY } from '$env/static/private';
import { PUBLIC_APP_URL } from '$env/static/public';
import { getCanonicalAppOrigin } from '$lib/app-origin';

const resend = new Resend(RESEND_API_KEY);
const FROM = 'XYLO <hello@contact.xyloss.tech>';
const APP_URL = getCanonicalAppOrigin() || PUBLIC_APP_URL;

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
                © 2026 XYLO · Smarter Learning. Stronger People. Better Outcomes.
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
	const chatUrl = `${APP_URL}/chat`;
	const unsubUrl = `${APP_URL}/unsubscribe?email=${encodeURIComponent(to)}`;

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
        XYLO is your AI companion for individuals across Africa — ask it anything you're trying to understand, practice, plan, or work through right now.
      </p>
    </td>
  </tr>
  <tr>
    <td style="padding-bottom:32px;">
      <p style="margin:0;font-size:16px;color:#94a3b8;line-height:1.6;">
        Start by asking a question or saying
        <em>"build me a 2-week action plan for this goal."</em>
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
              📅 <strong style="color:#f1f5f9;">Plan</strong> — a personalised schedule around your goal<br/>
              🎯 <strong style="color:#f1f5f9;">Deep practice</strong> — tighter drills, feedback, and momentum
            </p>
          </td>
        </tr>
      </table>
    </td>
  </tr>
  <tr>
    <td style="padding-bottom:32px;">
      <p style="margin:0;font-size:13px;color:#4b5563;line-height:1.6;">
        You have 5 free messages every day — no credit card, no trial.
        <a href="${APP_URL}/pricing" style="color:#f59e0b;text-decoration:none;">Upgrade to Pro</a>
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

XYLO is your AI companion for focused work, guided practice, and better follow-through.

Start your first session: ${chatUrl}

What you can do:
- Understand: explain any topic simply
- Quiz me: practice questions with instant feedback
- Plan: personalised schedule around your goal
- Deep practice: tighter drills, feedback, and momentum

You have 5 free messages every day. Upgrade to Pro: ${APP_URL}/pricing

Unsubscribe: ${unsubUrl}
© 2026 XYLO`;

	await resend.emails.send({
		from: FROM,
		to,
		subject: firstName
			? `You're in, ${firstName} — your companion is ready`
			: "You're in — your XYLO companion is ready",
		html,
		text,
	});
}

// ── Organization invite email ───────────────────────────────────────────────────────

export async function sendInviteEmail(
	to: string,
	orgName: string,
	inviteCode: string
): Promise<void> {
	const inviteUrl = `${APP_URL}/join/${inviteCode}`;
	const previewStr = `Full AI companion access — no cost to you, paid for by ${orgName}.`;

	const html = shell(previewStr, `
  ${logoRow()}
  <tr>
    <td style="padding-bottom:12px;">
      <h1 style="margin:0;font-size:28px;font-weight:800;color:#f1f5f9;line-height:1.2;letter-spacing:-0.02em;">
        ${orgName} gave you free access to XYLO.
      </h1>
    </td>
  </tr>
  <tr>
    <td style="padding-bottom:16px;">
      <p style="margin:0;font-size:16px;color:#94a3b8;line-height:1.6;">
        XYLO is an AI-powered companion for individuals across Africa —
        it helps people understand hard things, practice deliberately, build action plans,
        and stay consistent.
      </p>
    </td>
  </tr>
  <tr>
    <td style="padding-bottom:32px;">
      <p style="margin:0;font-size:16px;color:#94a3b8;line-height:1.6;">
        ${orgName} has an organization subscription, so you get <strong style="color:#f1f5f9;">unlimited access at zero cost.</strong>
        Click below to activate your account.
      </p>
    </td>
  </tr>
  <tr>
    <td style="padding-bottom:24px;">
      ${ctaButton(inviteUrl, `Join ${orgName} on XYLO →`)}
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

	const text = `${orgName} gave you free access to XYLO.

XYLO is an AI-powered companion for individuals across Africa — understand hard topics, practice deliberately, build action plans, and stay consistent.

${orgName} pays for your subscription, so you get unlimited access at no cost.

Activate your account: ${inviteUrl}

© 2026 XYLO`;

	await resend.emails.send({
		from: FROM,
		to,
		subject: `${orgName} gave you free access to XYLO`,
		html,
		text,
	});
}

function planLabel(planType: string) {
	if (planType === 'org') return 'XYLO Organization';
	if (planType === 'pro') return 'XYLO Pro';
	if (planType === 'plus') return 'XYLO Plus';
	return 'XYLO';
}

export async function sendPlanActivatedEmail(
	to: string,
	name: string | null,
	planType: string
): Promise<void> {
	const firstName = name?.split(' ')[0] || '';
	const label = planLabel(planType);
	const settingsUrl = `${APP_URL}/settings`;
	const greeting = firstName ? `${firstName}, your ${label} access is active.` : `Your ${label} access is active.`;

	const html = shell(`${label} is active on your account.`, `
  ${logoRow()}
  <tr>
    <td style="padding-bottom:12px;">
      <h1 style="margin:0;font-size:28px;font-weight:800;color:#f1f5f9;line-height:1.2;letter-spacing:-0.02em;">
        ${greeting}
      </h1>
    </td>
  </tr>
  <tr>
    <td style="padding-bottom:28px;">
      <p style="margin:0;font-size:16px;color:#94a3b8;line-height:1.6;">
        Your payment has been confirmed and your plan is now active. You can manage your membership from Settings.
      </p>
    </td>
  </tr>
  <tr>
    <td style="padding-bottom:32px;">
      ${ctaButton(settingsUrl, 'Open Settings')}
    </td>
  </tr>
  `);

	const text = `${greeting}

Your payment has been confirmed and your plan is now active.

Manage your membership: ${settingsUrl}

© 2026 XYLO`;

	await resend.emails.send({
		from: FROM,
		to,
		subject: `${label} is active`,
		html,
		text
	});
}

export async function sendSubscriptionCancelledEmail(
	to: string,
	name: string | null,
	planType: string
): Promise<void> {
	const firstName = name?.split(' ')[0] || '';
	const label = planLabel(planType);
	const settingsUrl = `${APP_URL}/settings`;
	const greeting = firstName ? `${firstName}, your ${label} cancellation is recorded.` : `Your ${label} cancellation is recorded.`;

	const html = shell(`${label} cancellation is recorded.`, `
  ${logoRow()}
  <tr>
    <td style="padding-bottom:12px;">
      <h1 style="margin:0;font-size:28px;font-weight:800;color:#f1f5f9;line-height:1.2;letter-spacing:-0.02em;">
        ${greeting}
      </h1>
    </td>
  </tr>
  <tr>
    <td style="padding-bottom:28px;">
      <p style="margin:0;font-size:16px;color:#94a3b8;line-height:1.6;">
        Paystack has confirmed the cancellation request. Your account status has been updated in XYLO.
      </p>
    </td>
  </tr>
  <tr>
    <td style="padding-bottom:32px;">
      ${ctaButton(settingsUrl, 'Review membership')}
    </td>
  </tr>
  `);

	const text = `${greeting}

Paystack has confirmed the cancellation request. Your account status has been updated in XYLO.

Review membership: ${settingsUrl}

© 2026 XYLO`;

	await resend.emails.send({
		from: FROM,
		to,
		subject: `${label} cancellation recorded`,
		html,
		text
	});
}

export async function sendConfirmationEmail(
	to: string,
	name: string | null,
	actionUrl: string
): Promise<void> {
	const firstName = name?.split(' ')[0] || '';
	const heading = firstName ? `${firstName}, confirm your XYLO account.` : 'Confirm your XYLO account.';

	const html = shell('Confirm your XYLO account and sign in.', `
  ${logoRow()}
  <tr>
    <td style="padding-bottom:12px;">
      <h1 style="margin:0;font-size:28px;font-weight:800;color:#f1f5f9;line-height:1.2;letter-spacing:-0.02em;">
        ${heading}
      </h1>
    </td>
  </tr>
  <tr>
    <td style="padding-bottom:20px;">
      <p style="margin:0;font-size:16px;color:#94a3b8;line-height:1.6;">
        Finish setting up your account by confirming this email address. Once that is done, we’ll take you straight back to sign in.
      </p>
    </td>
  </tr>
  <tr>
    <td style="padding-bottom:28px;">
      ${ctaButton(actionUrl, 'Confirm email')}
    </td>
  </tr>
  <tr>
    <td style="padding-bottom:18px;">
      <p style="margin:0;font-size:13px;color:#4b5563;line-height:1.7;">
        If the button does not open, copy this link into your browser:
        <br />
        <span style="color:#94a3b8;word-break:break-all;">${actionUrl}</span>
      </p>
    </td>
  </tr>
  `);

	const text = `${heading}

Finish setting up your account by confirming this email address:
${actionUrl}

Once that is done, we’ll take you straight back to sign in.

© 2026 XYLO`;

	await resend.emails.send({
		from: FROM,
		to,
		subject: 'Confirm your XYLO account',
		html,
		text
	});
}

export async function sendPasswordResetEmail(
	to: string,
	actionUrl: string
): Promise<void> {
	const html = shell('Reset your XYLO password.', `
  ${logoRow()}
  <tr>
    <td style="padding-bottom:12px;">
      <h1 style="margin:0;font-size:28px;font-weight:800;color:#f1f5f9;line-height:1.2;letter-spacing:-0.02em;">
        Reset your password.
      </h1>
    </td>
  </tr>
  <tr>
    <td style="padding-bottom:20px;">
      <p style="margin:0;font-size:16px;color:#94a3b8;line-height:1.6;">
        A request was made to reset your XYLO password. Use the button below to choose a new one.
      </p>
    </td>
  </tr>
  <tr>
    <td style="padding-bottom:28px;">
      ${ctaButton(actionUrl, 'Set new password')}
    </td>
  </tr>
  <tr>
    <td style="padding-bottom:18px;">
      <p style="margin:0;font-size:13px;color:#4b5563;line-height:1.7;">
        If you did not request this, you can safely ignore this email.
        <br />
        Or copy this link into your browser:
        <br />
        <span style="color:#94a3b8;word-break:break-all;">${actionUrl}</span>
      </p>
    </td>
  </tr>
  `);

	const text = `Reset your XYLO password.

Use this link to choose a new password:
${actionUrl}

If you did not request this, you can safely ignore this email.

© 2026 XYLO`;

	await resend.emails.send({
		from: FROM,
		to,
		subject: 'Reset your XYLO password',
		html,
		text
	});
}

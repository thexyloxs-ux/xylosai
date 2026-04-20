import { Resend } from 'resend';
import { RESEND_API_KEY } from '$env/static/private';
import { PUBLIC_APP_URL } from '$env/static/public';

const resend = new Resend(RESEND_API_KEY);
const FROM = 'XYLO <hello@xyloxs.com>';

export async function sendInviteEmail(
	to: string,
	schoolName: string,
	inviteCode: string
): Promise<void> {
	const inviteUrl = `${PUBLIC_APP_URL}/join/${inviteCode}`;

	await resend.emails.send({
		from: FROM,
		to,
		subject: `${schoolName} has invited you to XYLO`,
		html: `
			<!DOCTYPE html>
			<html>
			<body style="font-family: Inter, system-ui, sans-serif; background: #0f1117; color: #f1f5f9; margin: 0; padding: 40px 20px;">
				<div style="max-width: 560px; margin: 0 auto;">
					<div style="margin-bottom: 32px;">
						<span style="font-size: 24px; font-weight: 800; color: #f59e0b;">XYLO</span>
					</div>
					<h1 style="font-size: 28px; font-weight: 700; margin-bottom: 16px;">
						You've been invited to join ${schoolName} on XYLO 🌍
					</h1>
					<p style="font-size: 16px; color: #94a3b8; line-height: 1.6; margin-bottom: 24px;">
						XYLO is an AI-powered academic companion built specifically for African students.
						It helps you study smarter, stay consistent, and take control of your academic journey.
					</p>
					<p style="font-size: 16px; color: #94a3b8; line-height: 1.6; margin-bottom: 32px;">
						${schoolName} has a school subscription — so you get full access at no cost.
					</p>
					<a href="${inviteUrl}"
						style="display: inline-block; background: #f59e0b; color: #000; font-weight: 700;
						font-size: 16px; padding: 14px 28px; border-radius: 8px; text-decoration: none;">
						Join ${schoolName} on XYLO →
					</a>
					<p style="font-size: 14px; color: #6b7280; margin-top: 32px;">
						Or copy this link: ${inviteUrl}
					</p>
					<hr style="border: none; border-top: 1px solid #2e3347; margin: 32px 0;" />
					<p style="font-size: 12px; color: #6b7280;">
						© 2025 Xyloxs. Smarter Learning. Stronger Students. Better Outcomes.
					</p>
				</div>
			</body>
			</html>
		`
	});
}

export async function sendWelcomeEmail(to: string, name: string): Promise<void> {
	const chatUrl = `${PUBLIC_APP_URL}/chat`;

	await resend.emails.send({
		from: FROM,
		to,
		subject: 'Welcome to XYLO 🌍',
		html: `
			<!DOCTYPE html>
			<html>
			<body style="font-family: Inter, system-ui, sans-serif; background: #0f1117; color: #f1f5f9; margin: 0; padding: 40px 20px;">
				<div style="max-width: 560px; margin: 0 auto;">
					<div style="margin-bottom: 32px;">
						<span style="font-size: 24px; font-weight: 800; color: #f59e0b;">XYLO</span>
					</div>
					<h1 style="font-size: 28px; font-weight: 700; margin-bottom: 16px;">
						You're in${name ? ', ' + name.split(' ')[0] : ''}! 🎉
					</h1>
					<p style="font-size: 16px; color: #94a3b8; line-height: 1.6; margin-bottom: 16px;">
						Welcome to XYLO — your AI study companion built for African students.
					</p>
					<p style="font-size: 16px; color: #94a3b8; line-height: 1.6; margin-bottom: 32px;">
						I'm here to help you understand tough topics, quiz yourself, build study plans,
						and prep for exams. Let's get started!
					</p>
					<a href="${chatUrl}"
						style="display: inline-block; background: #f59e0b; color: #000; font-weight: 700;
						font-size: 16px; padding: 14px 28px; border-radius: 8px; text-decoration: none;">
						Start your first study session →
					</a>
					<hr style="border: none; border-top: 1px solid #2e3347; margin: 32px 0;" />
					<p style="font-size: 12px; color: #6b7280;">
						© 2025 Xyloxs. AI that understands your world.
					</p>
				</div>
			</body>
			</html>
		`
	});
}

import { error } from '@sveltejs/kit';
import { groq, buildSystemPrompt, GROQ_MODEL } from '$lib/server/groq';
import { createSupabaseAdminClient } from '$lib/server/supabase';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request, locals }) => {
	const { session, user } = await locals.safeGetSession();

	if (!session || !user) {
		throw error(401, 'Unauthorized');
	}

	const { messages, sessionType, subject, conversationId: incomingConvId } = await request.json();

	if (!messages || !Array.isArray(messages)) {
		throw error(400, 'Invalid messages');
	}

	const admin = createSupabaseAdminClient();

	// 1. Fetch user profile for system prompt personalisation
	const { data: profile } = await locals.supabase
		.from('profiles')
		.select('*')
		.eq('id', user.id)
		.single();

	// 1.1 Message Limit Enforcement (20/day for free tier)
	if (profile?.plan === 'free' && !profile.org_id) {
		const todayStr = new Date().toDateString();
		const resetStr = new Date(profile.messages_today_reset_at).toDateString();
		
		if (resetStr === todayStr && (profile.messages_today ?? 0) >= 20) {
			throw error(403, 'Daily free limit reached (20 messages). Join a school or upgrade to Xylo Pro for unlimited access.');
		}
	}

	let org = null;
	if (profile?.org_id) {
		const { data } = await locals.supabase
			.from('organizations')
			.select('*')
			.eq('id', profile.org_id)
			.single();
		org = data;
	}

	// 2. Get or create conversation
	let conversationId: string = incomingConvId;
	if (!conversationId) {
		const title = subject
			? `${subject} — ${new Date().toLocaleDateString()}`
			: `Chat — ${new Date().toLocaleDateString()}`;
		const { data: conv } = await admin
			.from('conversations')
			.insert({ user_id: user.id, title, subject: subject || null, session_type: sessionType || null })
			.select('id')
			.single();
		conversationId = conv?.id ?? '';
	}

	// 3. Save the user message (last message in the array)
	const lastUserMsg = [...messages].reverse().find((m: { role: string }) => m.role === 'user');
	if (conversationId && lastUserMsg) {
		await admin.from('messages').insert({
			conversation_id: conversationId,
			role: 'user',
			content: lastUserMsg.content
		});
		await admin
			.from('conversations')
			.update({ last_message_at: new Date().toISOString() })
			.eq('id', conversationId);
	}

	// 4. Build personalised system prompt
	const systemPrompt = buildSystemPrompt(profile, org, sessionType, subject);

	// 5. Stream from Groq, accumulate the full response
	try {
		const response = await groq.chat.completions.create({
			model: GROQ_MODEL,
			messages: [
				{ role: 'system', content: systemPrompt },
				...messages.map((m: { role: string; content: string }) => ({
					role: m.role as 'user' | 'assistant' | 'system',
					content: m.content
				}))
			],
			stream: true,
			temperature: 0.7,
			max_tokens: 1024
		});

		const stream = new ReadableStream({
			async start(controller) {
				const encoder = new TextEncoder();
				let assistantText = '';
				try {
					for await (const chunk of response) {
						const token = chunk.choices[0]?.delta?.content || '';
						if (token) {
							assistantText += token;
							controller.enqueue(encoder.encode(token));
						}
					}
				} catch (err) {
					controller.error(err);
					return;
				} finally {
					controller.close();
				}

				// 6. Persist assistant reply + update counters (fire-and-forget)
				if (conversationId && assistantText) {
					admin.from('messages').insert({
						conversation_id: conversationId,
						role: 'assistant',
						content: assistantText
					});
				}

				// 7. Increment messages_today (reset if stale day)
				if (profile) {
					const todayStr = new Date().toDateString();
					const resetStr = new Date(profile.messages_today_reset_at).toDateString();
					if (resetStr !== todayStr) {
						admin.from('profiles').update({
							messages_today: 1,
							messages_today_reset_at: new Date().toISOString()
						}).eq('id', user.id);
					} else {
						admin.from('profiles').update({
							messages_today: (profile.messages_today ?? 0) + 1
						}).eq('id', user.id);
					}
				}

				// 8. Upsert student_activity for school-linked students
				if (profile?.org_id) {
					const today = new Date().toISOString().split('T')[0];
					admin.from('student_activity').upsert({
						user_id: user.id,
						org_id: profile.org_id,
						date: today,
						message_count: 1
					}, { onConflict: 'user_id,date', ignoreDuplicates: false }).then(({ error: e }) => {
						if (!e) {
							// Increment — re-fetch and update since upsert can't do += in JS client
							admin.from('student_activity')
								.select('message_count')
								.eq('user_id', user.id)
								.eq('date', today)
								.single()
								.then(({ data: act }) => {
									if (act) {
										admin.from('student_activity')
											.update({ message_count: act.message_count + 1 })
											.eq('user_id', user.id)
											.eq('date', today);
									}
								});
						}
					});
				}
			}
		});

		return new Response(stream, {
			headers: {
				'Content-Type': 'text/plain; charset=utf-8',
				'Transfer-Encoding': 'chunked',
				'X-Conversation-Id': conversationId ?? ''
			}
		});
	} catch (err: unknown) {
		const msg = err instanceof Error ? err.message : 'AI processing failed';
		console.error('Groq API Error:', err);
		throw error(500, msg);
	}
};

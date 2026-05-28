import type { SupabaseClient, User } from '@supabase/supabase-js';
import type { Database, Profile } from '$lib/types/database';

type AdminClient = SupabaseClient<Database>;

function roleFromMetadata(user: User): Profile['role'] {
	const metadataRole = user.user_metadata?.role;
	if (metadataRole === 'org_admin' || metadataRole === 'member') {
		return metadataRole;
	}
	return 'individual';
}

export async function ensureProfileForUser(
	admin: AdminClient,
	user: User
): Promise<Profile> {
	const { data: existing, error: existingError } = await admin
		.from('profiles')
		.select('*')
		.eq('id', user.id)
		.single();

	if (existingError && existingError.code !== 'PGRST116') {
		throw new Error(`Failed to load profile: ${existingError.message}`);
	}

	const payload = {
		id: user.id,
		email: user.email ?? null,
		full_name: typeof user.user_metadata?.full_name === 'string' ? user.user_metadata.full_name : null,
		role: existing?.role ?? roleFromMetadata(user)
	};

	if (!existing) {
		const { data: created, error: createError } = await admin
			.from('profiles')
			.insert({
				...payload,
				onboarded: false
			})
			.select('*')
			.single();

		if (createError || !created) {
			throw new Error(`Failed to create profile: ${createError?.message ?? 'unknown error'}`);
		}

		return created;
	}

	const needsUpdate =
		existing.email !== payload.email ||
		(existing.full_name ?? null) !== payload.full_name;

	if (!needsUpdate) {
		return existing;
	}

	const { data: updated, error: updateError } = await admin
		.from('profiles')
		.update({
			email: payload.email,
			full_name: payload.full_name
		})
		.eq('id', user.id)
		.select('*')
		.single();

	if (updateError || !updated) {
		throw new Error(`Failed to update profile: ${updateError?.message ?? 'unknown error'}`);
	}

	return updated;
}

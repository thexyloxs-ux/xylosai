import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	// TEMPORARY: Bypassing authentication and providing mock data for UI testing.
	
	const mockProfile = {
		id: 'mock-user-123',
		role: 'school_admin',
		org_id: 'mock-org-123'
	};

	const mockOrg = {
		id: 'mock-org-123',
		name: 'Demo High School',
		plan: 'school',
		seat_limit: 100,
		invite_code: 'DHS-2026'
	};

	const mockStudents = [
		{
			id: 'st-1',
			full_name: 'John Doe',
			level: 'SS2',
			curriculum: 'WAEC',
			messages_today: 15
		},
		{
			id: 'st-2',
			full_name: 'Jane Smith',
			level: 'SS3',
			curriculum: 'JAMB',
			messages_today: 4
		},
		{
			id: 'st-3',
			full_name: 'Michael Johnson',
			level: 'SS1',
			curriculum: 'NECO',
			messages_today: 0
		}
	];

	return {
		profile: mockProfile,
		org: mockOrg,
		students: mockStudents
	};
};

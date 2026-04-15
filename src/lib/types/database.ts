export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

export interface Database {
	public: {
		Tables: {
			organizations: {
				Row: {
					id: string;
					name: string;
					country: string | null;
					curriculum: string | null;
					invite_code: string | null;
					stripe_customer_id: string | null;
					stripe_subscription_id: string | null;
					plan: string;
					plan_status: string;
					seat_limit: number;
					created_at: string;
				};
				Insert: {
					id?: string;
					name: string;
					country?: string | null;
					curriculum?: string | null;
					invite_code?: string | null;
					stripe_customer_id?: string | null;
					stripe_subscription_id?: string | null;
					plan?: string;
					plan_status?: string;
					seat_limit?: number;
					created_at?: string;
				};
				Update: Partial<Database['public']['Tables']['organizations']['Insert']>;
			};
			profiles: {
				Row: {
					id: string;
					full_name: string | null;
					role: string;
					org_id: string | null;
					level: string | null;
					curriculum: string | null;
					subjects: string[] | null;
					study_challenge: string | null;
					stripe_customer_id: string | null;
					stripe_subscription_id: string | null;
					plan: string;
					plan_status: string;
					messages_today: number;
					messages_today_reset_at: string;
					onboarded: boolean;
					created_at: string;
				};
				Insert: {
					id: string;
					full_name?: string | null;
					role?: string;
					org_id?: string | null;
					level?: string | null;
					curriculum?: string | null;
					subjects?: string[] | null;
					study_challenge?: string | null;
					stripe_customer_id?: string | null;
					stripe_subscription_id?: string | null;
					plan?: string;
					plan_status?: string;
					messages_today?: number;
					messages_today_reset_at?: string;
					onboarded?: boolean;
					created_at?: string;
				};
				Update: Partial<Database['public']['Tables']['profiles']['Insert']>;
			};
			conversations: {
				Row: {
					id: string;
					user_id: string;
					title: string;
					subject: string | null;
					session_type: string | null;
					created_at: string;
					last_message_at: string;
				};
				Insert: {
					id?: string;
					user_id: string;
					title?: string;
					subject?: string | null;
					session_type?: string | null;
					created_at?: string;
					last_message_at?: string;
				};
				Update: Partial<Database['public']['Tables']['conversations']['Insert']>;
			};
			messages: {
				Row: {
					id: string;
					conversation_id: string;
					role: 'user' | 'assistant';
					content: string;
					created_at: string;
				};
				Insert: {
					id?: string;
					conversation_id: string;
					role: 'user' | 'assistant';
					content: string;
					created_at?: string;
				};
				Update: Partial<Database['public']['Tables']['messages']['Insert']>;
			};
			student_activity: {
				Row: {
					id: string;
					user_id: string;
					org_id: string;
					date: string;
					message_count: number;
					session_count: number;
					subjects_studied: string[] | null;
				};
				Insert: {
					id?: string;
					user_id: string;
					org_id: string;
					date?: string;
					message_count?: number;
					session_count?: number;
					subjects_studied?: string[] | null;
				};
				Update: Partial<Database['public']['Tables']['student_activity']['Insert']>;
			};
		};
		Views: Record<string, never>;
		Functions: Record<string, never>;
		Enums: Record<string, never>;
	};
}

// ─── App types ────────────────────────────────────────────────────
export type Profile = Database['public']['Tables']['profiles']['Row'];
export type Organization = Database['public']['Tables']['organizations']['Row'];
export type Conversation = Database['public']['Tables']['conversations']['Row'];
export type Message = Database['public']['Tables']['messages']['Row'];
export type StudentActivity = Database['public']['Tables']['student_activity']['Row'];

export type UserRole = 'individual' | 'school_admin' | 'student';
export type Plan = 'free' | 'individual' | 'school';
export type PlanStatus = 'active' | 'trialing' | 'past_due' | 'canceled' | 'inactive';
export type SessionType = 'understand' | 'quiz' | 'study_plan' | 'exam_prep';

export interface StudentWithActivity {
	id: string;
	full_name: string | null;
	email: string;
	messages_this_week: number;
	last_active: string | null;
	status: 'Active' | 'Inactive' | 'New';
}

export interface DashboardOverview {
	total_students: number;
	active_today: number;
	active_this_week: number;
	needs_attention: number;
}

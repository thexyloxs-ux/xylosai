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
					plan?: string;
					plan_status?: string;
					seat_limit?: number;
					created_at?: string;
				};
				Update: Partial<Database['public']['Tables']['organizations']['Insert']>;
				Relationships: [];
			};
			profiles: {
				Row: {
					id: string;
					full_name: string | null;
					email: string | null;
					role: string;
					org_id: string | null;
					level: string | null;
					curriculum: string | null;
					subjects: string[] | null;
					study_challenge: string | null;
					plan: string;
					plan_status: string;
					messages_today: number;
					messages_today_reset_at: string;
					onboarded: boolean;
					marketing_emails: boolean;
					created_at: string;
				};
				Insert: {
					id: string;
					full_name?: string | null;
					email?: string | null;
					role?: string;
					org_id?: string | null;
					level?: string | null;
					curriculum?: string | null;
					subjects?: string[] | null;
					study_challenge?: string | null;
					plan?: string;
					plan_status?: string;
					messages_today?: number;
					messages_today_reset_at?: string;
					onboarded?: boolean;
					marketing_emails?: boolean;
					created_at?: string;
				};
				Update: Partial<Database['public']['Tables']['profiles']['Insert']>;
				Relationships: [];
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
				Relationships: [];
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
				Relationships: [];
			};
			member_activity: {
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
				Update: Partial<Database['public']['Tables']['member_activity']['Insert']>;
				Relationships: [];
			};
			billing_subscriptions: {
				Row: {
					id: string;
					user_id: string;
					org_id: string | null;
					plan_type: 'plus' | 'pro' | 'org';
					plan_code: string | null;
					customer_code: string | null;
					customer_email: string | null;
					subscription_code: string | null;
					email_token: string | null;
					last_reference: string | null;
					status: string;
					created_at: string;
					updated_at: string;
				};
				Insert: {
					id?: string;
					user_id: string;
					org_id?: string | null;
					plan_type: 'plus' | 'pro' | 'org';
					plan_code?: string | null;
					customer_code?: string | null;
					customer_email?: string | null;
					subscription_code?: string | null;
					email_token?: string | null;
					last_reference?: string | null;
					status?: string;
					created_at?: string;
					updated_at?: string;
				};
				Update: Partial<Database['public']['Tables']['billing_subscriptions']['Insert']>;
				Relationships: [];
			};
		};
		Views: Record<string, never>;
		Functions: {
			increment_member_activity: {
				Args: { p_user_id: string; p_org_id: string; p_date: string };
				Returns: void;
			};
			get_user_id_by_email: {
				Args: { p_email: string };
				Returns: string | null;
			};
			reserve_free_message_quota: {
				Args: { p_user_id: string; p_limit: number };
				Returns: boolean;
			};
		};
		Enums: Record<string, never>;
		CompositeTypes: Record<string, never>;
	};
}

export type Profile = Database['public']['Tables']['profiles']['Row'];
export type Organization = Database['public']['Tables']['organizations']['Row'];
export type Conversation = Database['public']['Tables']['conversations']['Row'];
export type Message = Database['public']['Tables']['messages']['Row'];
export type MemberActivity = Database['public']['Tables']['member_activity']['Row'];

export type UserRole = 'individual' | 'org_admin' | 'member';
export type Plan = 'free' | 'plus' | 'pro' | 'org';
export type PlanStatus = 'active' | 'trialing' | 'past_due' | 'canceled' | 'inactive';
export type SessionType = 'understand' | 'quiz' | 'study_plan' | 'exam_prep';

export interface MemberWithActivity {
	id: string;
	full_name: string | null;
	email: string | null;
	level: string | null;
	curriculum: string | null;
	messages_today: number;
	messages_this_week: number;
	last_active: string | null;
}

export interface DashboardOverview {
	total_members: number;
	active_today: number;
	active_this_week: number;
	needs_attention: number;
}

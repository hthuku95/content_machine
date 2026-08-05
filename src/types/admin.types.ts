// Admin Dashboard types — mirror the Rust `/api/admin/*` response shapes.

export interface AdminStats {
  total_users: number;
  active_users: number;
  total_chat_sessions: number;
  total_files: number;
}

export interface AdminStatsResponse {
  success: boolean;
  stats: AdminStats;
}

export interface AdminUser {
  id: number;
  email: string;
  username: string;
  is_active: boolean;
  is_superuser: boolean;
  is_staff: boolean;
  created_at: string | null;
  subscription_status?: string | null;
  subscription_tier?: string | null;
  trial_ends_at?: string | null;
  subscription_active_until?: string | null;
  last_payment_at?: string | null;
  is_dfy_customer?: boolean;
}

export interface AdminUsersResponse {
  success: boolean;
  users: AdminUser[];
  total: number;
}

export interface Delivery {
  id: string;
  client_ref: string | null;
  title: string;
  gig_type: string;
  display_gig_type: string | null;
  status: string;
  workflow_id: string | null;
  workflow_progress: {
    status: string | null;
    current_step: string | null;
    last_heartbeat_at: string | null;
    error: string | null;
  };
  output_r2_url: string | null;
  output_filename: string | null;
  created_at: string;
  completed_at: string | null;
  error: string | null;
}

export interface DeliveriesResponse {
  deliveries: Delivery[];
  error?: string;
}

export interface CreateDeliveryRequest {
  client_ref?: string | null;
  title: string;
  gig_type: string;
  prompt: string;
  style?: string | null;
  duration?: number | null;
  extra?: Record<string, unknown>;
}

export interface CreateDeliveryResponse {
  success?: boolean;
  delivery?: Delivery;
  delivery_id?: string;
  error?: string;
}

export interface Prospect {
  id: string;
  platform: string;
  channel_id: string;
  display_name: string;
  platform_url: string;
  subscriber_count: number | null;
  avg_viewer_count: number | null;
  content_category: string | null;
  prospect_type: string;
  ai_score: number | null;
  ai_reasoning: string | null;
  dm_script_creator: string | null;
  dm_script_clipper: string | null;
  x_dm_script: string | null;
  email_script: string | null;
  contact_status: string;
  notes: string | null;
  twitter_handle: string | null;
  instagram_handle: string | null;
  business_email: string | null;
  external_url: string | null;
  service_type: string | null;
  service_page_url: string | null;
  sample_delivery_id: string | null;
  sample_delivery_url: string | null;
  contact_enrichment: Record<string, unknown> | null;
  revenue_priority: number;
  referred_by: string | null;
  sourced_by: number | null;
  created_at: string;
}

export interface ProspectsResponse {
  success: boolean;
  prospects: Prospect[];
  error?: string;
}

export interface RegenerateDmResponse {
  success: boolean;
  dm_creator: string | null;
  dm_clipper: string | null;
  score: number | null;
  service: string | null;
  x_dm: string;
  email_script: string;
  error?: string;
}

export interface GenerateOutreachRequest {
  delivery_url: string;
}

export interface GenerateOutreachResponse {
  success: boolean;
  x_dm: string;
  email_script: string;
  error?: string;
}

export interface GenerateSamplePackResponse {
  success: boolean;
  delivery_id?: string;
  delivery_url?: string;
  service?: string;
  unlock_price_usdc?: number;
  message?: string;
  error?: string;
}

export interface SendEmailResponse {
  success: boolean;
  message_id?: string;
  log_id?: string;
  to?: string;
  prospect_name?: string;
  message?: string;
  error?: string;
}

export interface UpdateProspectRequest {
  contact_status?: string;
  notes?: string;
}

export interface Campaign {
  id: string;
  user_id: number;
  user_email: string;
  name: string;
  service_type: string;
  brief: string;
  style: string;
  duration: number;
  schedule: Record<string, unknown>;
  platforms: Record<string, unknown>;
  posts_per_day: number;
  start_date: string;
  end_date: string;
  zernio_profile_id: string | null;
  source_url: string | null;
  status: string;
  total_posts_planned: number;
  total_posts_published: number;
  paid_until: string | null;
  created_at: string;
}

export interface CampaignsResponse {
  success: boolean;
  campaigns: Campaign[];
  error?: string;
}

export interface ActionResponse {
  success: boolean;
  message?: string;
  error?: string;
}
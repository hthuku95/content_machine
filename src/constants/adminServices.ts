// The 12 Managed Campaign services — single source of truth for admin UI labels/pricing.
// Matches CLAUDE.md §17 and the Rust `ServiceType::from_normalized()` map.

export interface AdminServiceChip {
  value: string;
  label: string;
  price: number;
}

export const ADMIN_SERVICE_CHIPS: AdminServiceChip[] = [
  { value: 'clipping', label: 'Clipping', price: 297 },
  { value: 'kick_auto_clipper', label: 'Kick Auto-Clipper', price: 297 },
  { value: 'landing_page', label: 'Landing Page Hero', price: 149 },
  { value: 'education', label: 'Education', price: 199 },
  { value: 'manim_explainer', label: 'Manim Explainer', price: 149 },
  { value: 'whiteboard_animation', label: 'Whiteboard Animation', price: 149 },
  { value: 'kinetic_typography', label: 'Kinetic Typography', price: 149 },
  { value: 'animated_infographic', label: 'Animated Infographic', price: 149 },
  { value: 'algorithm_viz', label: 'Algorithm Viz', price: 149 },
  { value: 'investor_pitch', label: 'Investor Pitch', price: 149 },
  { value: 'year_in_review', label: 'Year in Review', price: 149 },
  { value: 'isometric_explainer', label: 'Isometric Explainer', price: 149 },
];

export const SERVICE_LABELS: Record<string, string> = Object.fromEntries(
  ADMIN_SERVICE_CHIPS.map((s) => [s.value, s.label]),
);

export const SERVICE_PRICING: Record<string, number> = Object.fromEntries(
  ADMIN_SERVICE_CHIPS.map((s) => [s.value, s.price]),
);

export const PROSPECT_CONTACT_STATUSES = [
  'new',
  'contacted',
  'replied',
  'interested',
  'deal',
  'converted',
  'rejected',
] as const;

export const PROSPECT_PLATFORMS = ['youtube', 'twitch', 'kick', 'linkedin', 'twitter'] as const;
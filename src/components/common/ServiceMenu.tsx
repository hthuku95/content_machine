import ContentCutIcon from '@mui/icons-material/ContentCut';
import YouTubeIcon from '@mui/icons-material/YouTube';
import LiveTvIcon from '@mui/icons-material/LiveTv';
import BoltIcon from '@mui/icons-material/Bolt';
import SchoolIcon from '@mui/icons-material/School';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import AnimationIcon from '@mui/icons-material/Animation';
import GestureIcon from '@mui/icons-material/Gesture';
import TitleIcon from '@mui/icons-material/Title';
import BarChartIcon from '@mui/icons-material/BarChart';
import CodeIcon from '@mui/icons-material/Code';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import HistoryIcon from '@mui/icons-material/History';
import ViewInArIcon from '@mui/icons-material/ViewInAr';
import type { SvgIconComponent } from '@mui/icons-material';

/**
 * Single source of truth for the managed services (Group B4 enterprise polish).
 * Replaces the emoji-prefixed labels duplicated in NewCampaignPage and
 * InstagramLeadsPage with MUI icons + plain-text labels.
 */
export interface ServiceOption {
  value: string;
  label: string;
  desc: string;
  Icon: SvgIconComponent;
}

export const SERVICE_OPTIONS: ServiceOption[] = [
  { value: 'clipping', label: 'Clipping (legacy — parked)', desc: '$297/mo — parked, use YouTube/Twitch options', Icon: ContentCutIcon },
  { value: 'youtube_clipping', label: 'YouTube Clipping', desc: '$297/mo — daily clips from YouTube videos', Icon: YouTubeIcon },
  { value: 'twitch_clipping', label: 'Twitch Clipping', desc: '$297/mo — daily clips from Twitch streams', Icon: LiveTvIcon },
  { value: 'kick_auto_clipper', label: 'Kick Auto-Clipper', desc: '$297/mo — daily clips from Kick streamers', Icon: BoltIcon },
  { value: 'education', label: 'Education', desc: '$199/mo — daily Manim explainer videos', Icon: SchoolIcon },
  { value: 'landing_page', label: 'Landing Page Hero', desc: '$149/mo — daily animated hero videos', Icon: RocketLaunchIcon },
  { value: 'manim_explainer', label: 'Manim Explainer', desc: '$149/mo — daily animated explainers', Icon: AnimationIcon },
  { value: 'whiteboard_animation', label: 'Whiteboard Animation', desc: '$149/mo — daily whiteboard explainers', Icon: GestureIcon },
  { value: 'kinetic_typography', label: 'Kinetic Typography', desc: '$149/mo — daily text-motion videos', Icon: TitleIcon },
  { value: 'animated_infographic', label: 'Animated Infographic', desc: '$149/mo — daily data viz videos', Icon: BarChartIcon },
  { value: 'algorithm_viz', label: 'Algorithm Viz', desc: '$149/mo — daily algorithm videos', Icon: CodeIcon },
  { value: 'investor_pitch', label: 'Investor Pitch', desc: '$149/mo — daily pitch deck videos', Icon: TrendingUpIcon },
  { value: 'year_in_review', label: 'Year in Review', desc: '$149/mo — daily recap videos', Icon: HistoryIcon },
  { value: 'isometric_explainer', label: 'Isometric Explainer', desc: '$149/mo — daily isometric 3D videos', Icon: ViewInArIcon },
];

/** Lookup helper for tables/chips that only have the service slug. */
export function serviceOptionFor(value: string): ServiceOption | undefined {
  return SERVICE_OPTIONS.find((o) => o.value === value);
}

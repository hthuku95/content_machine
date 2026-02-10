import { useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import { useConnectedChannels } from './useConnectedChannels';
import type { ConnectedYouTubeChannel } from '@/types/channel.types';

/**
 * Hook to monitor YouTube channel health and notify users of issues
 * Automatically checks for channels requiring reauth and sends notifications
 */
export function useChannelHealthMonitor() {
  const { channels } = useConnectedChannels();
  const previousChannelsRef = useRef<Map<number, ConnectedYouTubeChannel>>(new Map());
  const hasShownInitialWarning = useRef(false);

  useEffect(() => {
    if (!channels || channels.length === 0) return;

    const activeChannels = channels.filter((ch) => ch.is_active);
    const needsReauthChannels = activeChannels.filter((ch) => ch.requires_reauth);

    // Show initial warning if there are channels needing reauth (only once)
    if (!hasShownInitialWarning.current && needsReauthChannels.length > 0) {
      toast.error(
        `${needsReauthChannels.length} YouTube channel${
          needsReauthChannels.length !== 1 ? 's' : ''
        } need reconnection`,
        {
          duration: 8000,
          icon: '⚠️',
          id: 'channel-reauth-warning', // Prevent duplicates
        }
      );

      // Browser notification
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('YouTube Channels Need Attention', {
          body: `${needsReauthChannels.length} channel${
            needsReauthChannels.length !== 1 ? 's' : ''
          } need reconnection to continue working`,
          icon: '/favicon.ico',
          tag: 'channel-reauth', // Prevent duplicate notifications
        });
      }

      hasShownInitialWarning.current = true;
    }

    // Check for status changes
    channels.forEach((channel) => {
      const previous = previousChannelsRef.current.get(channel.id);

      if (previous) {
        // Channel just went into reauth required state
        if (!previous.requires_reauth && channel.requires_reauth) {
          const reason = channel.reauth_reason || 'Token expired';

          toast.error(`${channel.channel_name} needs reconnection`, {
            duration: 6000,
            icon: '🔴',
          });

          // Browser notification
          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification(`${channel.channel_name} Disconnected`, {
              body: `Reason: ${reason}. Click to reconnect.`,
              icon: channel.channel_thumbnail_url || '/favicon.ico',
              tag: `channel-reauth-${channel.id}`,
            });
          }
        }

        // Channel was reconnected successfully
        if (previous.requires_reauth && !channel.requires_reauth) {
          toast.success(`${channel.channel_name} reconnected successfully`, {
            duration: 4000,
            icon: '✅',
          });
        }
      }

      previousChannelsRef.current.set(channel.id, channel);
    });
  }, [channels]);

  return {
    channelsNeedingReauth: channels?.filter((ch) => ch.is_active && ch.requires_reauth).length || 0,
    hasIssues: (channels?.filter((ch) => ch.is_active && ch.requires_reauth).length || 0) > 0,
  };
}

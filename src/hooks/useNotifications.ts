import { useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import { useClippingSettings } from './useClippingSettings';
import type { ClippingJob, ExtractedClip } from '@/types/clipping.types';

/**
 * Hook to manage notifications for clipping events
 */
export function useNotifications() {
  const settings = useClippingSettings();
  const previousJobsRef = useRef<Map<string, ClippingJob>>(new Map());
  const previousClipsRef = useRef<Map<string, ExtractedClip>>(new Map());

  /**
   * Check for job status changes and notify
   */
  const checkJobChanges = (jobs: ClippingJob[]) => {
    if (!settings.notifyOnJobComplete && !settings.notifyOnJobFail) return;

    jobs.forEach((job) => {
      const previous = previousJobsRef.current.get(job.id);

      if (previous) {
        // Job completed
        if (previous.status !== 'completed' && job.status === 'completed' && settings.notifyOnJobComplete) {
          toast.success(`Job completed: ${job.source_video_title}`, {
            duration: 5000,
            icon: '✅',
          });

          // Browser notification
          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('Job Completed', {
              body: job.source_video_title,
              icon: '/favicon.ico',
            });
          }
        }

        // Job failed
        if (previous.status !== 'failed' && job.status === 'failed' && settings.notifyOnJobFail) {
          toast.error(`Job failed: ${job.source_video_title}`, {
            duration: 6000,
            icon: '❌',
          });

          // Browser notification
          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('Job Failed', {
              body: `${job.source_video_title}: ${job.error_message || 'Unknown error'}`,
              icon: '/favicon.ico',
            });
          }
        }
      }

      previousJobsRef.current.set(job.id, job);
    });
  };

  /**
   * Check for clip upload changes and notify
   */
  const checkClipChanges = (clips: ExtractedClip[]) => {
    if (!settings.notifyOnClipUpload) return;

    clips.forEach((clip) => {
      const previous = previousClipsRef.current.get(clip.id);

      if (previous) {
        // Clip uploaded
        if (previous.upload_status !== 'uploaded' && clip.upload_status === 'uploaded') {
          toast.success(`Clip uploaded: ${clip.title}`, {
            duration: 5000,
            icon: '🎬',
          });

          // Browser notification
          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('Clip Uploaded', {
              body: `${clip.title} - ${clip.views_count} views`,
              icon: clip.thumbnail_url || '/favicon.ico',
            });
          }
        }
      }

      previousClipsRef.current.set(clip.id, clip);
    });
  };

  return {
    checkJobChanges,
    checkClipChanges,
  };
}

/**
 * Hook to request notification permission
 */
export function useNotificationPermission() {
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      // Ask for permission after a delay to not be intrusive
      const timeout = setTimeout(() => {
        Notification.requestPermission().then((permission) => {
          if (permission === 'granted') {
            toast.success('Browser notifications enabled', { duration: 3000 });
          }
        });
      }, 5000); // Ask after 5 seconds

      return () => clearTimeout(timeout);
    }
  }, []);
}

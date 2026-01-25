import { useState, useEffect } from 'react';
import type { ClippingSettings } from '@/components/clipping/ClippingSettingsPanel';

const DEFAULT_SETTINGS: ClippingSettings = {
  notifyOnJobComplete: true,
  notifyOnJobFail: true,
  notifyOnClipUpload: true,
  emailNotifications: false,
  pollingEnabled: true,
  pollingInterval: 5,
  defaultJobsView: 'all',
  defaultClipsView: 'all',
  itemsPerPage: 12,
  autoRetryFailedUploads: false,
  maxAutoRetries: 3,
  showDebugInfo: false,
  enableAnalytics: true,
  enableKeyboardShortcuts: true,
};

const STORAGE_KEY = 'clipping_settings';

export function useClippingSettings() {
  const [settings, setSettings] = useState<ClippingSettings>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
    return DEFAULT_SETTINGS;
  });

  // Listen for settings changes from settings panel
  useEffect(() => {
    const handleSettingsChange = (event: CustomEvent<ClippingSettings>) => {
      setSettings(event.detail);
    };

    window.addEventListener('clipping:settings-changed', handleSettingsChange as EventListener);
    return () => {
      window.removeEventListener('clipping:settings-changed', handleSettingsChange as EventListener);
    };
  }, []);

  return settings;
}

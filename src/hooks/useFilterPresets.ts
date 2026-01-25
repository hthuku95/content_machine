import { useState, useEffect, useCallback } from 'react';

export interface FilterPreset<T = any> {
  id: string;
  name: string;
  filters: T;
  createdAt: string;
}

const STORAGE_KEY_PREFIX = 'filter_presets_';

export function useFilterPresets<T = any>(
  category: string,
  defaultPresets: FilterPreset<T>[] = []
) {
  const storageKey = `${STORAGE_KEY_PREFIX}${category}`;

  const [presets, setPresets] = useState<FilterPreset<T>[]>(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error('Failed to load filter presets:', error);
    }
    return defaultPresets;
  });

  // Save to localStorage whenever presets change
  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(presets));
    } catch (error) {
      console.error('Failed to save filter presets:', error);
    }
  }, [presets, storageKey]);

  const savePreset = useCallback((name: string, filters: T) => {
    const newPreset: FilterPreset<T> = {
      id: `preset_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name,
      filters,
      createdAt: new Date().toISOString(),
    };

    setPresets(prev => [...prev, newPreset]);
    return newPreset;
  }, []);

  const updatePreset = useCallback((id: string, updates: Partial<FilterPreset<T>>) => {
    setPresets(prev =>
      prev.map(preset =>
        preset.id === id ? { ...preset, ...updates } : preset
      )
    );
  }, []);

  const deletePreset = useCallback((id: string) => {
    setPresets(prev => prev.filter(preset => preset.id !== id));
  }, []);

  const getPreset = useCallback((id: string) => {
    return presets.find(preset => preset.id === id);
  }, [presets]);

  const clearAll = useCallback(() => {
    setPresets(defaultPresets);
  }, [defaultPresets]);

  return {
    presets,
    savePreset,
    updatePreset,
    deletePreset,
    getPreset,
    clearAll,
  };
}

// Predefined common presets for different entity types
export const commonPresets = {
  jobs: {
    active: {
      id: 'jobs_active',
      name: 'Active Jobs',
      filters: { status: 'processing' as const },
      createdAt: new Date().toISOString(),
    },
    failed: {
      id: 'jobs_failed',
      name: 'Failed Jobs',
      filters: { status: 'failed' as const },
      createdAt: new Date().toISOString(),
    },
    completed: {
      id: 'jobs_completed',
      name: 'Completed Jobs',
      filters: { status: 'completed' as const },
      createdAt: new Date().toISOString(),
    },
    today: {
      id: 'jobs_today',
      name: 'Today\'s Jobs',
      filters: {
        startDate: new Date().toISOString().split('T')[0],
      },
      createdAt: new Date().toISOString(),
    },
  },
  clips: {
    uploaded: {
      id: 'clips_uploaded',
      name: 'Uploaded Clips',
      filters: { uploadStatus: 'uploaded' as const },
      createdAt: new Date().toISOString(),
    },
    failed: {
      id: 'clips_failed',
      name: 'Failed Uploads',
      filters: { uploadStatus: 'failed' as const },
      createdAt: new Date().toISOString(),
    },
    topPerformers: {
      id: 'clips_top',
      name: 'Top Performers',
      filters: {
        uploadStatus: 'uploaded' as const,
        sortBy: 'views' as const,
      },
      createdAt: new Date().toISOString(),
    },
    recent: {
      id: 'clips_recent',
      name: 'Recent Clips',
      filters: {
        sortBy: 'latest' as const,
      },
      createdAt: new Date().toISOString(),
    },
  },
};

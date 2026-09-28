import { useCallback, useEffect, useState } from 'react';
import { serviceFlagsService, type ServiceFlag } from '@/services/serviceFlags.service';

/**
 * Runtime AI service switches (backend `service_flags` table).
 * Fail-open while loading: every service counts as enabled until the flags
 * arrive, so a slow/failed fetch can never hide working features.
 */
export function useServiceFlags() {
  const [flags, setFlags] = useState<ServiceFlag[]>([]);
  const [loaded, setLoaded] = useState(false);

  const refresh = useCallback(async () => {
    try {
      setFlags(await serviceFlagsService.listFlags());
    } catch {
      // Fail-open: leave list empty (everything counts as enabled).
    } finally {
      setLoaded(true);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const isEnabled = useCallback(
    (service: string): boolean => {
      if (!loaded) return true;
      const row = flags.find((f) => f.service === service);
      return row ? row.enabled : true;
    },
    [flags, loaded],
  );

  return { flags, loaded, isEnabled, refresh };
}

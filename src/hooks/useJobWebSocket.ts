import { useState, useEffect, useRef, useCallback } from 'react';
import type { ClippingJob, ClippingProgressUpdate } from '@/types/clipping.types';

interface UseJobWebSocketResult {
  liveJob: Partial<ClippingJob> | null;
  isConnected: boolean;
}

export function useJobWebSocket(jobId: string, enabled: boolean): UseJobWebSocketResult {
  const [liveJob, setLiveJob] = useState<Partial<ClippingJob> | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const enabledRef = useRef(enabled);

  useEffect(() => {
    enabledRef.current = enabled;
  }, [enabled]);

  const connect = useCallback(() => {
    if (!enabledRef.current || !jobId) return;
    const proto = window.location.protocol === 'https:' ? 'wss' : 'ws';
    const url = `${proto}://${window.location.host}/ws/clipping-jobs/${jobId}`;
    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => setIsConnected(true);

    ws.onmessage = (event) => {
      try {
        const update: ClippingProgressUpdate = JSON.parse(event.data as string);
        const s = update.status;
        setLiveJob(prev => ({
          ...prev,
          current_step: s.current_step ?? prev?.current_step,
          progress: s.progress_percent != null ? Math.round(s.progress_percent) : prev?.progress,
          steps_completed: s.steps_completed ?? prev?.steps_completed,
          total_steps: s.total_steps ?? prev?.total_steps,
          current_action_detail: s.current_action_detail ?? prev?.current_action_detail,
          status:
            s.status === 'completed' ? 'completed'
            : s.status === 'failed' ? 'failed'
            : 'processing',
          error_message: s.error ?? prev?.error_message,
        }));
      } catch (_) {
        // ignore malformed messages
      }
    };

    ws.onclose = () => {
      setIsConnected(false);
      wsRef.current = null;
      if (enabledRef.current) {
        reconnectTimer.current = setTimeout(connect, 3000);
      }
    };

    ws.onerror = () => ws.close();
  }, [jobId]);

  useEffect(() => {
    if (enabled) {
      connect();
    } else {
      if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
      wsRef.current?.close();
      wsRef.current = null;
      setIsConnected(false);
    }
    return () => {
      if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
      wsRef.current?.close();
    };
  }, [connect, enabled]);

  return { liveJob, isConnected };
}

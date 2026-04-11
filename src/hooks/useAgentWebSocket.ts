import { useCallback, useEffect, useRef, useState } from 'react';
import { config } from '@/config/config';
import { api } from '@/services/api';

// ─── Message types from server ────────────────────────────────────────────────

export type AgentMessageType =
  | 'progress'
  | 'result'
  | 'error'
  | 'user'
  | 'thinking'          // agent ACK / tool-call updates (live)
  | 'background_job_status'; // sent on reconnect when a task is still running

export interface AgentMessage {
  id: string;
  type: AgentMessageType;
  content: string;
  percentage?: number;    // 0–100, only for progress
  operationId?: string;
  timestamp: Date;
}

export type ConnectionStatus = 'idle' | 'connecting' | 'connected' | 'disconnected' | 'error';

// ─── Session jobs polling ─────────────────────────────────────────────────────

async function pollSessionJobs(sessionId: string): Promise<AgentMessage[]> {
  try {
    const { data } = await api.get(`/api/chat/sessions/${sessionId}/jobs`);
    const jobs: Array<{
      id: string;
      user_message: string;
      status: string;
      result?: string;
      error?: string;
      progress_log: Array<{ ts: string; msg: string }>;
      updated_at: string;
    }> = data.jobs ?? [];

    const msgs: AgentMessage[] = [];
    for (const job of jobs) {
      if (job.status === 'completed' && job.result) {
        msgs.push({
          id: `job-${job.id}`,
          type: 'result',
          content: job.result,
          timestamp: new Date(job.updated_at),
        });
      } else if (job.status === 'failed' && job.error) {
        msgs.push({
          id: `job-err-${job.id}`,
          type: 'error',
          content: `Task failed: ${job.error}`,
          timestamp: new Date(job.updated_at),
        });
      }
    }
    return msgs;
  } catch {
    return [];
  }
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

interface UseAgentWebSocketOptions {
  sessionId: string;
  onMessage?: (msg: AgentMessage) => void;
}

export function useAgentWebSocket({ sessionId, onMessage }: UseAgentWebSocketOptions) {
  const [status, setStatus] = useState<ConnectionStatus>('idle');
  const [messages, setMessages] = useState<AgentMessage[]>([]);
  const wsRef = useRef<WebSocket | null>(null);
  const onMessageRef = useRef(onMessage);
  const pollTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const seenJobIds = useRef<Set<string>>(new Set());
  onMessageRef.current = onMessage;

  // Derive ws:// URL from http:// API base URL
  const wsBaseUrl = config.apiBaseUrl
    .replace(/^https:\/\//, 'wss://')
    .replace(/^http:\/\//, 'ws://');

  const addMessage = useCallback((msg: AgentMessage) => {
    setMessages(prev => {
      // Deduplicate by id
      if (prev.some(m => m.id === msg.id)) return prev;
      return [...prev, msg];
    });
    onMessageRef.current?.(msg);
  }, []);

  // Poll for completed background jobs (used when WS is disconnected or as safety net)
  const startPolling = useCallback(() => {
    if (pollTimerRef.current) return;
    pollTimerRef.current = setInterval(async () => {
      const jobMsgs = await pollSessionJobs(sessionId);
      for (const msg of jobMsgs) {
        if (!seenJobIds.current.has(msg.id)) {
          seenJobIds.current.add(msg.id);
          addMessage(msg);
        }
      }
    }, 10_000); // poll every 10s
  }, [sessionId, addMessage]);

  const stopPolling = useCallback(() => {
    if (pollTimerRef.current) {
      clearInterval(pollTimerRef.current);
      pollTimerRef.current = null;
    }
  }, []);

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    setStatus('connecting');
    const url = `${wsBaseUrl}/ws?session=${sessionId}`;
    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => {
      setStatus('connected');
      stopPolling(); // WS is live — no need to poll
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data as string);
        const base = {
          id: crypto.randomUUID(),
          timestamp: new Date(data.timestamp ?? Date.now()),
          operationId: data.operation_id as string | undefined,
        };

        if (data.type === 'progress') {
          addMessage({
            ...base,
            type: 'progress',
            content: (data.message ?? data.content) as string,
            percentage: data.percentage != null
              ? Math.round((data.percentage as number) * 100)
              : undefined,
          });
        } else if (data.type === 'thinking') {
          // Background-job ACK or tool-call update
          addMessage({ ...base, type: 'thinking', content: data.content as string });
        } else if (data.type === 'background_job_status') {
          // Sent on reconnect when a task is still running
          addMessage({ ...base, type: 'background_job_status', content: data.content as string });
        } else if (data.type === 'result' || data.type === 'message') {
          // 'message' is what the backend actually sends for completed responses
          const msgId = data.job_id ? `job-${data.job_id as string}` : base.id;
          if (!seenJobIds.current.has(msgId)) {
            seenJobIds.current.add(msgId);
            addMessage({ ...base, id: msgId, type: 'result', content: data.content as string });
          }
        } else if (data.type === 'error') {
          addMessage({ ...base, type: 'error', content: (data.message ?? data.content) as string });
        }
      } catch {
        // Non-JSON text (rare) — treat as plain result
        addMessage({
          id: crypto.randomUUID(),
          type: 'result',
          content: event.data as string,
          timestamp: new Date(),
        });
      }
    };

    ws.onerror = () => {
      setStatus('error');
    };

    ws.onclose = () => {
      setStatus('disconnected');
      wsRef.current = null;
      // Start polling so we catch any tasks that complete while disconnected
      startPolling();
    };
  }, [sessionId, wsBaseUrl, addMessage, startPolling, stopPolling]);

  const disconnect = useCallback(() => {
    wsRef.current?.close();
    wsRef.current = null;
    stopPolling();
  }, [stopPolling]);

  const sendMessage = useCallback((text: string) => {
    if (wsRef.current?.readyState !== WebSocket.OPEN) return false;
    wsRef.current.send(text);
    addMessage({
      id: crypto.randomUUID(),
      type: 'user',
      content: text,
      timestamp: new Date(),
    });
    return true;
  }, [addMessage]);

  // Auto-connect on mount / when sessionId changes, cleanup on unmount
  useEffect(() => {
    seenJobIds.current = new Set();
    connect();
    return () => {
      wsRef.current?.close();
      stopPolling();
    };
  }, [connect, stopPolling]);

  const clearMessages = useCallback(() => {
    setMessages([]);
    seenJobIds.current = new Set();
  }, []);

  return { status, messages, sendMessage, connect, disconnect, clearMessages };
}

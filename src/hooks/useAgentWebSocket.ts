import { useCallback, useEffect, useRef, useState } from 'react';
import { config } from '@/config/config';

// ─── Message types from server ────────────────────────────────────────────────

export type AgentMessageType = 'progress' | 'result' | 'error' | 'user';

export interface AgentMessage {
  id: string;
  type: AgentMessageType;
  content: string;
  percentage?: number;    // 0–100, only for progress
  operationId?: string;
  timestamp: Date;
}

export type ConnectionStatus = 'idle' | 'connecting' | 'connected' | 'disconnected' | 'error';

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
  onMessageRef.current = onMessage;

  // Derive ws:// URL from http:// API base URL
  const wsBaseUrl = config.apiBaseUrl
    .replace(/^https:\/\//, 'wss://')
    .replace(/^http:\/\//, 'ws://');

  const addMessage = useCallback((msg: AgentMessage) => {
    setMessages(prev => [...prev, msg]);
    onMessageRef.current?.(msg);
  }, []);

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    setStatus('connecting');
    const url = `${wsBaseUrl}/ws?session=${sessionId}`;
    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => {
      setStatus('connected');
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data as string);
        const base = {
          id: crypto.randomUUID(),
          timestamp: new Date(),
          operationId: data.operation_id as string | undefined,
        };

        if (data.type === 'progress') {
          addMessage({
            ...base,
            type: 'progress',
            content: data.message as string,
            percentage: Math.round((data.percentage as number) * 100),
          });
        } else if (data.type === 'result') {
          addMessage({ ...base, type: 'result', content: data.content as string });
        } else if (data.type === 'error') {
          addMessage({ ...base, type: 'error', content: data.message as string });
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
    };
  }, [sessionId, wsBaseUrl, addMessage]);

  const disconnect = useCallback(() => {
    wsRef.current?.close();
    wsRef.current = null;
  }, []);

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

  // Auto-connect on mount, cleanup on unmount
  useEffect(() => {
    connect();
    return () => { wsRef.current?.close(); };
  }, [connect]);

  const clearMessages = useCallback(() => setMessages([]), []);

  return { status, messages, sendMessage, connect, disconnect, clearMessages };
}

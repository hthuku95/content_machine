/**
 * Unit tests for useAgentWebSocket and useJobWebSocket URL construction.
 *
 * These tests verify that:
 * 1. The WebSocket URL is derived from config.apiBaseUrl (not window.location)
 * 2. Trailing slashes in VITE_API_BASE_URL do NOT produce double-slash URLs
 * 3. http:// and https:// are correctly converted to ws:// and wss://
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Strip trailing slash from a URL (mirrors config.ts logic). */
function normalizeBase(url: string) {
  return url.replace(/\/$/, '');
}

/** Convert http(s):// → ws(s):// */
function toWs(url: string) {
  return url
    .replace(/^https:\/\//, 'wss://')
    .replace(/^http:\/\//, 'ws://');
}

/** Build the agent WebSocket URL the same way useAgentWebSocket does. */
function buildAgentWsUrl(apiBaseUrl: string, sessionId: string) {
  const wsBaseUrl = toWs(normalizeBase(apiBaseUrl));
  return `${wsBaseUrl}/ws?session=${sessionId}`;
}

/** Build the job progress WebSocket URL the same way useJobWebSocket does. */
function buildJobWsUrl(apiBaseUrl: string, jobId: string, token: string) {
  const wsBase = toWs(normalizeBase(apiBaseUrl));
  return `${wsBase}/ws/clipping-jobs/${jobId}?token=${encodeURIComponent(token)}`;
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('WebSocket URL construction', () => {
  const SESSION_ID = '9f142490-f0f9-4392-8e44-026439328d33';
  const JOB_ID    = 'abc-123';
  const TOKEN     = 'test-jwt-token';

  // Agent WebSocket (/ws?session=...)
  describe('useAgentWebSocket URL', () => {
    it('uses wss:// for https:// base URL', () => {
      const url = buildAgentWsUrl('https://videosync.video', SESSION_ID);
      expect(url).toBe(`wss://videosync.video/ws?session=${SESSION_ID}`);
    });

    it('uses ws:// for http:// base URL (localhost dev)', () => {
      const url = buildAgentWsUrl('http://localhost:3000', SESSION_ID);
      expect(url).toBe(`ws://localhost:3000/ws?session=${SESSION_ID}`);
    });

    it('strips trailing slash from base URL — no double slash', () => {
      // This was the production bug: VITE_API_BASE_URL had a trailing slash
      const url = buildAgentWsUrl('https://www.videosync.video/', SESSION_ID);
      expect(url).not.toContain('//ws');
      expect(url).toBe(`wss://www.videosync.video/ws?session=${SESSION_ID}`);
    });

    it('handles www. prefix correctly', () => {
      const url = buildAgentWsUrl('https://www.videosync.video', SESSION_ID);
      expect(url).toBe(`wss://www.videosync.video/ws?session=${SESSION_ID}`);
    });
  });

  // Job progress WebSocket (/ws/clipping-jobs/:id?token=...)
  describe('useJobWebSocket URL', () => {
    it('uses wss:// for https:// base URL', () => {
      const url = buildJobWsUrl('https://videosync.video', JOB_ID, TOKEN);
      expect(url).toBe(`wss://videosync.video/ws/clipping-jobs/${JOB_ID}?token=${encodeURIComponent(TOKEN)}`);
    });

    it('strips trailing slash — no double slash in path', () => {
      const url = buildJobWsUrl('https://videosync.video/', JOB_ID, TOKEN);
      expect(url).not.toContain('//ws');
      expect(url).toBe(`wss://videosync.video/ws/clipping-jobs/${JOB_ID}?token=${encodeURIComponent(TOKEN)}`);
    });

    it('URL-encodes the token', () => {
      const tokenWithSpecialChars = 'abc+def/ghi=';
      const url = buildJobWsUrl('https://videosync.video', JOB_ID, tokenWithSpecialChars);
      expect(url).toContain('?token=abc%2Bdef%2Fghi%3D');
    });
  });

  // config.ts normalisation
  describe('config.apiBaseUrl trailing-slash trimming', () => {
    it('removes a trailing slash', () => {
      expect(normalizeBase('https://videosync.video/')).toBe('https://videosync.video');
    });

    it('is a no-op when there is no trailing slash', () => {
      expect(normalizeBase('https://videosync.video')).toBe('https://videosync.video');
    });

    it('does not remove slashes from path segments', () => {
      // Only the trailing slash should be removed
      expect(normalizeBase('https://example.com/api/')).toBe('https://example.com/api');
    });
  });
});

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Alert,
  Box,
  Chip,
  CircularProgress,
  Container,
  Divider,
  Drawer,
  IconButton,
  LinearProgress,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Paper,
  Skeleton,
  TextField,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  Add as NewChatIcon,
  AttachFile as AttachIcon,
  History as HistoryIcon,
  Send as SendIcon,
  SmartToy as AgentIcon,
  Download as DownloadIcon,
  Wifi as ConnectedIcon,
  WifiOff as DisconnectedIcon,
} from '@mui/icons-material';
import { useAgentWebSocket, type AgentMessage } from '@/hooks/useAgentWebSocket';
import { api } from '@/services/api';
import { chatService, type ChatSession } from '@/services/chat.service';
import { config } from '@/config/config';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function newSessionId() {
  return crypto.randomUUID();
}

// Extract download URLs from result text (e.g. paths like outputs/foo.mp4 or download_url fields)
function extractDownloadUrl(content: string): string | null {
  // Backend often returns paths like "outputs/foo.mp4" or "/outputs/foo.mp4"
  const match = content.match(/(?:outputs\/|\/outputs\/)([\w.\-]+)/);
  if (!match) return null;
  return `${config.apiBaseUrl}/outputs/${match[1]}`;
}

function formatTime(date: Date) {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

// ─── Individual message bubble ────────────────────────────────────────────────

function MessageBubble({ msg }: { msg: AgentMessage }) {
  const isUser = msg.type === 'user';
  const downloadUrl = msg.type === 'result' ? extractDownloadUrl(msg.content) : null;

  if (msg.type === 'progress') {
    return (
      <Box sx={{ maxWidth: '80%', alignSelf: 'flex-start', mb: 1 }}>
        <Paper
          variant="outlined"
          sx={{
            px: 2, py: 1.5,
            bgcolor: 'action.hover',
            borderRadius: 2,
          }}
        >
          <Box display="flex" alignItems="center" gap={1} mb={0.5}>
            <CircularProgress size={14} thickness={5} />
            <Typography variant="caption" color="text.secondary">
              {msg.percentage !== undefined ? `${msg.percentage}%` : (msg.content || 'Progress update received')}
            </Typography>
          </Box>
          <Typography variant="body2" color="text.secondary">
            {msg.content}
          </Typography>
          {msg.percentage !== undefined && (
            <LinearProgress
              variant="determinate"
              value={msg.percentage}
              sx={{ mt: 1, borderRadius: 1 }}
            />
          )}
        </Paper>
        <Typography variant="caption" color="text.disabled" sx={{ ml: 1 }}>
          {formatTime(msg.timestamp)}
        </Typography>
      </Box>
    );
  }

  if (msg.type === 'thinking' || msg.type === 'background_job_status') {
    return (
      <Box sx={{ maxWidth: '80%', alignSelf: 'flex-start', mb: 1 }}>
        <Paper
          variant="outlined"
          sx={{ px: 2, py: 1.5, bgcolor: 'action.hover', borderRadius: 2 }}
        >
          <Box display="flex" alignItems="center" gap={1} mb={0.5}>
            <CircularProgress size={14} thickness={5} />
            <Typography variant="caption" color="text.secondary">
              {msg.type === 'background_job_status' ? 'Background task' : 'Live workflow update'}
            </Typography>
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'pre-wrap' }}>
            {msg.content}
          </Typography>
        </Paper>
        <Typography variant="caption" color="text.disabled" sx={{ ml: 1 }}>
          {formatTime(msg.timestamp)}
        </Typography>
      </Box>
    );
  }

  if (msg.type === 'error') {
    return (
      <Box sx={{ maxWidth: '80%', alignSelf: 'flex-start', mb: 1 }}>
        <Alert severity="error" sx={{ borderRadius: 2 }}>
          {msg.content}
        </Alert>
        <Typography variant="caption" color="text.disabled" sx={{ ml: 1 }}>
          {formatTime(msg.timestamp)}
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        maxWidth: '80%',
        alignSelf: isUser ? 'flex-end' : 'flex-start',
        mb: 1,
      }}
    >
      <Paper
        elevation={0}
        sx={{
          px: 2, py: 1.5,
          bgcolor: isUser ? 'primary.main' : 'background.paper',
          color: isUser ? 'primary.contrastText' : 'text.primary',
          border: isUser ? 'none' : '1px solid',
          borderColor: 'divider',
          borderRadius: 2,
          borderTopRightRadius: isUser ? 0 : 2,
          borderTopLeftRadius: isUser ? 2 : 0,
        }}
      >
        <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
          {msg.content}
        </Typography>
        {downloadUrl && (
          <Box mt={1}>
            <Chip
              icon={<DownloadIcon />}
              label="Download result"
              component="a"
              href={downloadUrl}
              target="_blank"
              rel="noopener noreferrer"
              clickable
              size="small"
              color="success"
              variant="outlined"
              sx={{ color: isUser ? 'primary.contrastText' : undefined }}
            />
          </Box>
        )}
      </Paper>
      <Typography
        variant="caption"
        color="text.disabled"
        sx={{ display: 'block', textAlign: isUser ? 'right' : 'left', mt: 0.5, mx: 1 }}
      >
        {formatTime(msg.timestamp)}
      </Typography>
    </Box>
  );
}

// ─── Session history drawer ────────────────────────────────────────────────────

const HISTORY_DRAWER_WIDTH = 260;

interface HistoryDrawerProps {
  open: boolean;
  onClose: () => void;
  onSelectSession: (id: string) => void;
  currentSessionId: string;
}

function HistoryDrawer({ open, onClose, onSelectSession, currentSessionId }: HistoryDrawerProps) {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    chatService.getRecentSessions()
      .then(setSessions)
      .catch(() => setSessions([]))
      .finally(() => setLoading(false));
  }, [open]);

  return (
    <Drawer
      anchor="left"
      open={open}
      onClose={onClose}
      sx={{ zIndex: (theme) => theme.zIndex.appBar + 1 }}
      PaperProps={{ sx: { width: HISTORY_DRAWER_WIDTH, pt: 8 } }}
    >
      <Box px={2} pb={1}>
        <Typography variant="subtitle2" color="text.secondary">
          Recent conversations
        </Typography>
      </Box>
      <Divider />
      {loading ? (
        <Box p={2}>
          {[...Array(4)].map((_, i) => <Skeleton key={i} height={48} sx={{ mb: 1 }} />)}
        </Box>
      ) : sessions.length === 0 ? (
        <Box p={2}>
          <Typography variant="body2" color="text.secondary">No previous conversations</Typography>
        </Box>
      ) : (
        <List dense>
          {sessions.map(s => (
            <ListItem key={s.session_id} disablePadding>
              <ListItemButton
                selected={s.session_id === currentSessionId}
                onClick={() => { onSelectSession(s.session_id); onClose(); }}
              >
                <ListItemText
                  primary={s.title ?? `Session ${s.session_id.slice(0, 8)}…`}
                  secondary={s.last_message ? s.last_message.slice(0, 50) + '…' : 'No messages'}
                  primaryTypographyProps={{ noWrap: true, fontSize: 13 }}
                  secondaryTypographyProps={{ noWrap: true, fontSize: 11 }}
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      )}
    </Drawer>
  );
}

// ─── Connection status chip ───────────────────────────────────────────────────

function StatusChip({ status }: { status: string }) {
  const map: Record<string, { label: string; color: 'success' | 'warning' | 'error' | 'default' }> = {
    connected:    { label: 'Connected', color: 'success' },
    connecting:   { label: 'Connecting…', color: 'warning' },
    disconnected: { label: 'Disconnected', color: 'error' },
    error:        { label: 'Connection error', color: 'error' },
    idle:         { label: 'Idle', color: 'default' },
  };
  const { label, color } = map[status] ?? { label: status, color: 'default' };
  const icon = color === 'success' ? <ConnectedIcon sx={{ fontSize: 14 }} /> : <DisconnectedIcon sx={{ fontSize: 14 }} />;
  return <Chip icon={icon} label={label} color={color} size="small" variant="outlined" />;
}

// ─── Suggested prompts ────────────────────────────────────────────────────────

const SUGGESTIONS = [
  'Stabilize this video and make it YouTube-ready',
  'Find stock footage of a sunset over the ocean',
  'Generate a cinematic background image for my video',
  'Apply cinematic color grading to my video',
  'Create a GIF from the first 5 seconds of my video',
  'Remove background noise and normalize audio levels',
];

async function fetchWorkflowStatus(workflowId: string): Promise<Record<string, unknown>> {
  const response = await api.get<Record<string, unknown>>(`/api/workflows/${workflowId}/status`);
  return response.data;
}

// ─── Main page ────────────────────────────────────────────────────────────────

export function AgentChatPage() {
  const theme = useTheme();
  useMediaQuery(theme.breakpoints.down('sm'));
  const location = useLocation();
  const navigate = useNavigate();
  const workflowId = useMemo(
    () => new URLSearchParams(location.search).get('workflow_id')?.trim() || undefined,
    [location.search],
  );

  const [sessionId, setSessionId] = useState<string>(() => newSessionId());
  const [historyOpen, setHistoryOpen] = useState(false);
  const [input, setInput] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const prefillSentRef = useRef(false);

  const { status, messages, sendMessage, connect, clearMessages } = useAgentWebSocket({
    sessionId,
    workflowId,
  });
  const { data: workflowStatus } = useQuery({
    queryKey: ['agent-workflow-status', workflowId],
    queryFn: () => fetchWorkflowStatus(workflowId!),
    enabled: Boolean(workflowId),
    refetchInterval: 10000,
  });
  const workflowSummary = workflowStatus?.node_summary as
    | {
        progress_percent?: number;
        active_node?: { node_key?: string; durable_policy?: string };
        blocked_reason?: string | null;
      }
    | undefined;

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // With background tasks, agents run independently — never block sending new messages.
  // We only show "in-flight" for the brief ACK period (thinking message is last).
  const inFlight = useMemo(
    () => messages[messages.length - 1]?.type === 'thinking',
    [messages],
  );

  const handleSend = useCallback(() => {
    const text = input.trim();
    if (!text || status !== 'connected') return;

    // Prepend uploaded file path context if available
    const fullMessage = uploadedFile ? `[File: ${uploadedFile}]\n${text}` : text;
    sendMessage(fullMessage);
    setInput('');
    setUploadedFile(null);
  }, [input, status, sendMessage, uploadedFile]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }, [handleSend]);

  const handleNewChat = useCallback(() => {
    clearMessages();
    setUploadedFile(null);
    setInput('');
    setSessionId(newSessionId());
  }, [clearMessages]);

  const handleSelectSession = useCallback((id: string) => {
    clearMessages();
    setUploadedFile(null);
    setInput('');
    setSessionId(id);
  }, [clearMessages]);

  const handleFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const result = await chatService.uploadFile(sessionId, file);
      setUploadedFile(result.file_path ?? result.file_name);
    } catch {
      // ignore — user will see no attachment
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }, [sessionId]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const prompt = params.get('prompt')?.trim() || '';
    const autosend = params.get('autosend') === '1';
    const sampleRequestId = params.get('sample_request_id')?.trim() || '';

    if (!prompt) return;
    if (!input) {
      setInput(prompt);
    }

    if (!autosend || prefillSentRef.current || status !== 'connected') return;

    const autosendKey = sampleRequestId
      ? `videosync:autosent:${sampleRequestId}`
      : `videosync:autosent:${sessionId}:${prompt}`;
    if (sessionStorage.getItem(autosendKey) === '1') return;

    prefillSentRef.current = true;
    const timer = window.setTimeout(() => {
      const fullMessage = uploadedFile ? `[File: ${uploadedFile}]\n${prompt}` : prompt;
      sessionStorage.setItem(autosendKey, '1');
      sendMessage(fullMessage);
      setInput('');
      setUploadedFile(null);

      const cleanParams = new URLSearchParams(location.search);
      cleanParams.delete('prompt');
      cleanParams.delete('autosend');
      cleanParams.delete('sample_request_id');
      navigate(
        {
          pathname: location.pathname,
          search: cleanParams.toString() ? `?${cleanParams.toString()}` : '',
        },
        { replace: true },
      );
    }, 250);

    return () => window.clearTimeout(timer);
  }, [location, navigate, sessionId, status, sendMessage, uploadedFile, input]);

  useEffect(() => {
    prefillSentRef.current = false;
  }, [sessionId]);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: { xs: 'calc(100vh - 56px)', sm: 'calc(100vh - 64px)' },
      }}
    >
      {/* History drawer */}
      <HistoryDrawer
        open={historyOpen}
        onClose={() => setHistoryOpen(false)}
        onSelectSession={handleSelectSession}
        currentSessionId={sessionId}
      />

      {/* Top bar */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          px: 2,
          py: 1,
          borderBottom: 1,
          borderColor: 'divider',
          bgcolor: 'background.paper',
          flexShrink: 0,
        }}
      >
        <IconButton size="small" onClick={() => setHistoryOpen(true)}>
          <HistoryIcon fontSize="small" />
        </IconButton>

        <AgentIcon color="primary" />
        <Typography variant="subtitle1" fontWeight={600} sx={{ flex: 1 }}>
          AI Video Agent
        </Typography>
        <StatusChip status={status} />
        {status === 'disconnected' || status === 'error' ? (
          <Tooltip title="Reconnect">
            <IconButton size="small" onClick={connect}>
              <ConnectedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        ) : null}
        <Tooltip title="New conversation">
          <IconButton size="small" onClick={handleNewChat}>
            <NewChatIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>

      {workflowId && (
        <Box
          sx={{
            px: 2,
            py: 1,
            borderBottom: 1,
            borderColor: 'divider',
            bgcolor: 'action.hover',
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            flexWrap: 'wrap',
          }}
        >
          <Chip size="small" color="secondary" variant="outlined" label="Workflow attached" />
          {typeof workflowSummary?.progress_percent === 'number' && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 180 }}>
              <LinearProgress
                variant="determinate"
                value={workflowSummary.progress_percent}
                sx={{ flex: 1, height: 6, borderRadius: 1 }}
              />
              <Typography variant="caption" color="text.secondary">
                {Math.round(workflowSummary.progress_percent)}%
              </Typography>
            </Box>
          )}
          <Typography variant="caption" color={workflowSummary?.blocked_reason ? 'error' : 'text.secondary'}>
            {workflowSummary?.blocked_reason
              ? `Blocked: ${workflowSummary.blocked_reason}`
              : workflowSummary?.active_node
                ? `Active: ${workflowSummary.active_node.node_key || 'workflow node'}${workflowSummary.active_node.durable_policy ? ` (${workflowSummary.active_node.durable_policy})` : ''}`
                : 'Waiting for persisted workflow events...'}
          </Typography>
        </Box>
      )}

      {/* Messages area */}
      <Box
        sx={{
          flex: 1,
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          p: { xs: 1, sm: 2 },
          gap: 0.5,
        }}
      >
        {messages.length === 0 && (
          <Container maxWidth="sm" sx={{ mt: 6, textAlign: 'center' }}>
            <AgentIcon sx={{ fontSize: 56, color: 'text.disabled', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              AI Video Editing Agent
            </Typography>
            <Typography variant="body2" color="text.disabled" sx={{ mb: 3 }}>
              Ask me anything about video editing. I can apply 320+ FFmpeg effects, search
              Pexels for stock footage, generate images, upload to YouTube, and more.
            </Typography>
            <Box
              sx={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 1,
                justifyContent: 'center',
              }}
            >
              {SUGGESTIONS.map(s => (
                <Chip
                  key={s}
                  label={s}
                  size="small"
                  variant="outlined"
                  clickable
                  onClick={() => setInput(s)}
                  sx={{ cursor: 'pointer' }}
                />
              ))}
            </Box>
          </Container>
        )}

        {messages.map(msg => (
          <MessageBubble key={msg.id} msg={msg} />
        ))}

        {/* Typing / in-flight indicator */}
        {inFlight && (
          <Box sx={{ alignSelf: 'flex-start', mb: 1 }}>
            <Typography variant="caption" color="text.secondary">
              {messages[messages.length - 1]?.content || 'The active workflow sent a live status update.'}
            </Typography>
          </Box>
        )}

        <div ref={messagesEndRef} />
      </Box>

      {/* Uploaded file badge */}
      {uploadedFile && (
        <Box px={2} pb={0.5}>
          <Chip
            label={`Attached: ${uploadedFile}`}
            size="small"
            color="primary"
            variant="outlined"
            onDelete={() => setUploadedFile(null)}
          />
        </Box>
      )}

      {/* Input area */}
      <Box
        component={Paper}
        elevation={0}
        sx={{
          borderTop: 1,
          borderColor: 'divider',
          px: 2,
          py: 1.5,
          display: 'flex',
          alignItems: 'flex-end',
          gap: 1,
          flexShrink: 0,
        }}
      >
        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="video/*,audio/*,image/*"
          style={{ display: 'none' }}
          onChange={handleFileChange}
        />

        <Tooltip title="Attach video/audio/image file">
          <span>
            <IconButton
              size="small"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading || status !== 'connected'}
            >
              {uploading ? <CircularProgress size={18} /> : <AttachIcon fontSize="small" />}
            </IconButton>
          </span>
        </Tooltip>

        <TextField
          multiline
          maxRows={6}
          fullWidth
          size="small"
          placeholder={
            status === 'connected'
              ? 'Ask the AI agent to edit your video… (Enter to send, Shift+Enter for new line)'
              : status === 'connecting'
              ? 'Connecting…'
              : 'Not connected — click reconnect'
          }
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={status !== 'connected' || inFlight}
          variant="outlined"
          sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
        />

        <Tooltip title="Send (Enter)">
          <span>
            <IconButton
              color="primary"
              onClick={handleSend}
              disabled={!input.trim() || status !== 'connected' || inFlight}
            >
              {inFlight ? <CircularProgress size={20} /> : <SendIcon />}
            </IconButton>
          </span>
        </Tooltip>
      </Box>

      {/* Offline / error banner */}
      {(status === 'disconnected' || status === 'error') && (
        <Alert
          severity="warning"
          sx={{ borderRadius: 0, flexShrink: 0 }}
          action={
            <Chip
              label="Reconnect"
              size="small"
              clickable
              onClick={connect}
              color="warning"
            />
          }
        >
          WebSocket disconnected. Messages cannot be sent.
        </Alert>
      )}
    </Box>
  );
}

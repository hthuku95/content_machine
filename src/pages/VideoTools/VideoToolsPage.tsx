import { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Tabs,
  Tab,
  Paper,
  TextField,
  Button,
  Slider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Divider,
  Stack,
} from '@mui/material';
import {
  Videocam as StabilizeIcon,
  Transform as ConvertIcon,
  GraphicEq as AudioIcon,
  AutoFixHigh as WorkflowIcon,
  Download as DownloadIcon,
} from '@mui/icons-material';
import { toolsService, type ToolResult } from '@/services/tools.service';

// ─── Result display ───────────────────────────────────────────────────────────

function ToolResultBox({ result }: { result: ToolResult | null }) {
  if (!result) return null;
  return (
    <Box mt={2}>
      <Alert
        severity={result.success ? 'success' : 'error'}
        action={
          result.success && result.download_url ? (
            <Button
              color="inherit"
              size="small"
              startIcon={<DownloadIcon />}
              href={result.download_url}
              target="_blank"
              rel="noopener noreferrer"
            >
              Download
            </Button>
          ) : undefined
        }
      >
        {result.message}
      </Alert>
    </Box>
  );
}

// ─── Stabilize panel ──────────────────────────────────────────────────────────

function StabilizePanel() {
  const [inputFile, setInputFile] = useState('');
  const [shakiness, setShakiness] = useState<number>(5);
  const [accuracy] = useState<number>(10);
  const [smoothing, setSmoothing] = useState<number>(10);
  const [zoom, setZoom] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ToolResult | null>(null);

  const handleRun = async () => {
    if (!inputFile.trim()) return;
    setLoading(true);
    setResult(null);
    try {
      const res = await toolsService.stabilize({ input_file: inputFile, shakiness, accuracy, smoothing, zoom });
      setResult(res);
    } catch (e: unknown) {
      setResult({ success: false, message: String(e), output_file_id: null, download_url: null });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Typography variant="body2" color="text.secondary" gutterBottom>
        Stabilize shaky video using vid.stab two-pass analysis. Enter the path of a file already
        uploaded to the server (e.g. <code>my_video.mp4</code> relative to uploads/).
      </Typography>
      <Stack spacing={3} mt={2}>
        <TextField
          label="Input file path"
          value={inputFile}
          onChange={e => setInputFile(e.target.value)}
          placeholder="uploads/my_video.mp4"
          fullWidth
          size="small"
        />

        <Box>
          <Typography gutterBottom>Shakiness detection: {shakiness}</Typography>
          <Slider
            value={shakiness}
            onChange={(_, v) => setShakiness(v as number)}
            min={1} max={10} step={1}
            marks valueLabelDisplay="auto"
          />
          <Typography variant="caption" color="text.secondary">
            1 = gentle shake, 10 = extreme shake
          </Typography>
        </Box>

        <Box>
          <Typography gutterBottom>Smoothing: {smoothing}</Typography>
          <Slider
            value={smoothing}
            onChange={(_, v) => setSmoothing(v as number)}
            min={1} max={50} step={1}
            marks={[{ value: 1, label: '1' }, { value: 25, label: '25' }, { value: 50, label: '50' }]}
            valueLabelDisplay="auto"
          />
          <Typography variant="caption" color="text.secondary">
            Higher = smoother but more cropped
          </Typography>
        </Box>

        <Box>
          <Typography gutterBottom>Zoom: {zoom}%</Typography>
          <Slider
            value={zoom}
            onChange={(_, v) => setZoom(v as number)}
            min={0} max={20} step={1}
            marks={[{ value: 0, label: '0%' }, { value: 10, label: '10%' }, { value: 20, label: '20%' }]}
            valueLabelDisplay="auto"
          />
          <Typography variant="caption" color="text.secondary">
            Zoom in to hide border artifacts from stabilization
          </Typography>
        </Box>

        <Button
          variant="contained"
          startIcon={loading ? <CircularProgress size={16} color="inherit" /> : <StabilizeIcon />}
          onClick={handleRun}
          disabled={loading || !inputFile.trim()}
        >
          {loading ? 'Stabilizing…' : 'Stabilize Video'}
        </Button>
      </Stack>
      <ToolResultBox result={result} />
    </Box>
  );
}

// ─── Format conversion panel ─────────────────────────────────────────────────

const FORMAT_OPTIONS = [
  { value: 'mp4', label: 'MP4 (H.264)' },
  { value: 'mkv', label: 'MKV (Matroska)' },
  { value: 'webm', label: 'WebM (VP8/Vorbis)' },
  { value: 'mov', label: 'MOV (QuickTime)' },
  { value: 'avi', label: 'AVI' },
  { value: 'ts', label: 'MPEG-TS' },
  { value: 'mp3', label: 'MP3 (audio only)' },
  { value: 'aac', label: 'AAC (audio only)' },
  { value: 'flac', label: 'FLAC (lossless audio)' },
  { value: 'wav', label: 'WAV (uncompressed audio)' },
  { value: 'm4a', label: 'M4A (AAC in MP4)' },
];

function ConvertFormatPanel() {
  const [inputFile, setInputFile] = useState('');
  const [format, setFormat] = useState('mp4');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ToolResult | null>(null);

  const handleRun = async () => {
    if (!inputFile.trim()) return;
    setLoading(true);
    setResult(null);
    try {
      const res = await toolsService.convertFormat({ input_file: inputFile, format });
      setResult(res);
    } catch (e: unknown) {
      setResult({ success: false, message: String(e), output_file_id: null, download_url: null });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Typography variant="body2" color="text.secondary" gutterBottom>
        Convert a video or audio file to a different container format.
      </Typography>
      <Stack spacing={3} mt={2}>
        <TextField
          label="Input file path"
          value={inputFile}
          onChange={e => setInputFile(e.target.value)}
          placeholder="uploads/my_video.mp4"
          fullWidth
          size="small"
        />
        <FormControl fullWidth size="small">
          <InputLabel>Target format</InputLabel>
          <Select value={format} label="Target format" onChange={e => setFormat(e.target.value)}>
            {FORMAT_OPTIONS.map(opt => (
              <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <Button
          variant="contained"
          startIcon={loading ? <CircularProgress size={16} color="inherit" /> : <ConvertIcon />}
          onClick={handleRun}
          disabled={loading || !inputFile.trim()}
        >
          {loading ? 'Converting…' : 'Convert Format'}
        </Button>
      </Stack>
      <ToolResultBox result={result} />
    </Box>
  );
}

// ─── Audio visualization panel ───────────────────────────────────────────────

const VIZ_MODES = [
  { value: 'waveform', label: 'Waveform (amplitude over time)' },
  { value: 'spectrum', label: 'Spectrum (frequency intensity)' },
  { value: 'cqt', label: 'CQT (musical frequency bands)' },
];

function AudioVisualizePanel() {
  const [inputFile, setInputFile] = useState('');
  const [mode, setMode] = useState<'waveform' | 'spectrum' | 'cqt'>('waveform');
  const [width, setWidth] = useState<number>(1280);
  const [height, setHeight] = useState<number>(400);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ToolResult | null>(null);

  const handleRun = async () => {
    if (!inputFile.trim()) return;
    setLoading(true);
    setResult(null);
    try {
      const res = await toolsService.visualizeAudio({ input_file: inputFile, mode, width, height });
      setResult(res);
    } catch (e: unknown) {
      setResult({ success: false, message: String(e), output_file_id: null, download_url: null });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Typography variant="body2" color="text.secondary" gutterBottom>
        Generate an audio visualization video from any audio or video file.
      </Typography>
      <Stack spacing={3} mt={2}>
        <TextField
          label="Input file path"
          value={inputFile}
          onChange={e => setInputFile(e.target.value)}
          placeholder="uploads/my_audio.wav"
          fullWidth
          size="small"
        />
        <FormControl fullWidth size="small">
          <InputLabel>Visualization mode</InputLabel>
          <Select
            value={mode}
            label="Visualization mode"
            onChange={e => setMode(e.target.value as typeof mode)}
          >
            {VIZ_MODES.map(m => (
              <MenuItem key={m.value} value={m.value}>{m.label}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <TextField
            label="Width (px)"
            type="number"
            value={width}
            onChange={e => setWidth(Number(e.target.value))}
            size="small"
            fullWidth
            inputProps={{ min: 320, max: 3840, step: 160 }}
          />
          <TextField
            label="Height (px)"
            type="number"
            value={height}
            onChange={e => setHeight(Number(e.target.value))}
            size="small"
            fullWidth
            inputProps={{ min: 100, max: 1080, step: 100 }}
          />
        </Stack>
        <Button
          variant="contained"
          startIcon={loading ? <CircularProgress size={16} color="inherit" /> : <AudioIcon />}
          onClick={handleRun}
          disabled={loading || !inputFile.trim()}
        >
          {loading ? 'Generating…' : 'Generate Visualization'}
        </Button>
      </Stack>
      <ToolResultBox result={result} />
    </Box>
  );
}

// ─── Workflow panel ────────────────────────────────────────────────────────────

const WORKFLOWS = [
  {
    value: 'youtube_ready',
    label: 'YouTube Ready',
    description: 'Stabilize → normalize color → loudnorm −14 LUFS → yuv420p',
  },
  {
    value: 'podcast_cleanup',
    label: 'Podcast Cleanup',
    description: 'Denoise → de-ess sibilance → limit peaks → loudnorm −16 LUFS',
  },
  {
    value: 'cinematic_grade',
    label: 'Cinematic Grade',
    description: 'Vintage curves → vibrance → vignette → film grain',
  },
  {
    value: 'talking_head_cleanup',
    label: 'Talking Head Cleanup',
    description: 'Stabilize → denoise speech → de-ess → loudnorm −16 LUFS',
  },
  {
    value: 'create_gif',
    label: 'Create GIF',
    description: 'Trim segment → scale → optimize palette',
  },
];

function WorkflowPanel() {
  const [inputFile, setInputFile] = useState('');
  const [workflow, setWorkflow] = useState('youtube_ready');
  const [startSec, setStartSec] = useState<number>(0);
  const [durationSec, setDurationSec] = useState<number>(5);
  const [gifWidth, setGifWidth] = useState<number>(480);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ToolResult | null>(null);

  const isGif = workflow === 'create_gif';

  const handleRun = async () => {
    if (!inputFile.trim()) return;
    setLoading(true);
    setResult(null);
    try {
      const res = await toolsService.runWorkflow({
        input_file: inputFile,
        workflow: workflow as Parameters<typeof toolsService.runWorkflow>[0]['workflow'],
        ...(isGif ? { start_seconds: startSec, duration_seconds: durationSec, gif_width: gifWidth } : {}),
      });
      setResult(res);
    } catch (e: unknown) {
      setResult({ success: false, message: String(e), output_file_id: null, download_url: null });
    } finally {
      setLoading(false);
    }
  };

  const selectedWorkflow = WORKFLOWS.find(w => w.value === workflow);

  return (
    <Box>
      <Typography variant="body2" color="text.secondary" gutterBottom>
        Run a multi-step named workflow that chains several FFmpeg tools in sequence.
      </Typography>
      <Stack spacing={3} mt={2}>
        <TextField
          label="Input file path"
          value={inputFile}
          onChange={e => setInputFile(e.target.value)}
          placeholder="uploads/my_video.mp4"
          fullWidth
          size="small"
        />
        <FormControl fullWidth size="small">
          <InputLabel>Workflow</InputLabel>
          <Select value={workflow} label="Workflow" onChange={e => setWorkflow(e.target.value)}>
            {WORKFLOWS.map(w => (
              <MenuItem key={w.value} value={w.value}>
                <Box>
                  <Typography variant="body2">{w.label}</Typography>
                  <Typography variant="caption" color="text.secondary">{w.description}</Typography>
                </Box>
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {selectedWorkflow && (
          <Alert severity="info" sx={{ py: 0.5 }}>
            <Typography variant="caption">{selectedWorkflow.description}</Typography>
          </Alert>
        )}

        {isGif && (
          <>
            <Divider />
            <Typography variant="subtitle2">GIF options</Typography>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                label="Start (s)"
                type="number"
                value={startSec}
                onChange={e => setStartSec(Number(e.target.value))}
                size="small"
                fullWidth
                inputProps={{ min: 0, step: 1 }}
              />
              <TextField
                label="Duration (s)"
                type="number"
                value={durationSec}
                onChange={e => setDurationSec(Number(e.target.value))}
                size="small"
                fullWidth
                inputProps={{ min: 1, max: 60, step: 1 }}
              />
              <TextField
                label="Width (px)"
                type="number"
                value={gifWidth}
                onChange={e => setGifWidth(Number(e.target.value))}
                size="small"
                fullWidth
                inputProps={{ min: 120, max: 960, step: 40 }}
              />
            </Stack>
          </>
        )}

        <Button
          variant="contained"
          startIcon={loading ? <CircularProgress size={16} color="inherit" /> : <WorkflowIcon />}
          onClick={handleRun}
          disabled={loading || !inputFile.trim()}
        >
          {loading ? 'Processing…' : `Run: ${selectedWorkflow?.label ?? workflow}`}
        </Button>
      </Stack>
      <ToolResultBox result={result} />
    </Box>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

const TABS = [
  { label: 'Stabilize', icon: <StabilizeIcon />, component: <StabilizePanel /> },
  { label: 'Convert Format', icon: <ConvertIcon />, component: <ConvertFormatPanel /> },
  { label: 'Audio Visualizer', icon: <AudioIcon />, component: <AudioVisualizePanel /> },
  { label: 'Workflows', icon: <WorkflowIcon />, component: <WorkflowPanel /> },
];

export function VideoToolsPage() {
  const [tab, setTab] = useState(0);

  return (
    <Container maxWidth="md" sx={{ py: 3 }}>
      <Typography variant="h5" fontWeight={600} gutterBottom>
        Video Tools
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        On-demand FFmpeg tools. Enter a file path relative to the server's{' '}
        <code>uploads/</code> directory (e.g. <code>abc123_file.mp4</code>) and run the tool.
        A download link will appear when processing is complete.
      </Typography>

      <Paper>
        <Tabs
          value={tab}
          onChange={(_, v) => setTab(v)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          {TABS.map((t, i) => (
            <Tab key={i} label={t.label} icon={t.icon} iconPosition="start" />
          ))}
        </Tabs>

        <Box p={3}>
          {TABS[tab].component}
        </Box>
      </Paper>
    </Container>
  );
}

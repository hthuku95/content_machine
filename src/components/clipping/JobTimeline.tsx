import { Box, Typography, Stepper, Step, StepLabel, type StepIconProps } from '@mui/material';
import {
  Queue as QueueIcon,
  Download as DownloadIcon,
  Analytics as AnalyticsIcon,
  ContentCut as ExtractIcon,
  Publish as PublishIcon,
  CheckCircle as CompleteIcon,
  Error as ErrorIcon,
} from '@mui/icons-material';
import type { ClippingJob, JobStatus } from '@/types/clipping.types';

interface JobTimelineProps {
  job: ClippingJob;
}

const STEPS = [
  { label: 'Queued', key: 'queued', icon: QueueIcon },
  { label: 'Downloading', key: 'downloading', icon: DownloadIcon },
  { label: 'Analyzing', key: 'analyzing', icon: AnalyticsIcon },
  { label: 'Extracting Clips', key: 'extracting', icon: ExtractIcon },
  { label: 'Publishing', key: 'posting', icon: PublishIcon },
  { label: 'Completed', key: 'completed', icon: CompleteIcon },
];

function getActiveStep(status: JobStatus, currentStep: string | null): number {
  if (status === 'failed') return -1; // Will be handled separately
  if (status === 'completed') return STEPS.length - 1;

  if (!currentStep) return 0; // Queued

  const step = currentStep.toLowerCase();

  // Agent tool names (GeminiClippingAgent)
  if (step === 'get_job_context') return 0;
  if (step === 'download_video') return 1;
  if (step === 'analyze_video_for_clips') return 2;
  if (step === 'extract_clips_from_video') return 3;
  if (step === 'vectorize_clips') return 3;
  if (step === 'upload_clips_to_youtube') return 4;
  if (step === 'mark_job_complete' || step === 'mark_job_failed') return 5;

  // Fallback: keyword matching (backward compat with old pipeline)
  if (step.includes('download')) return 1;
  if (step.includes('analyz')) return 2;
  if (step.includes('extract') || step.includes('clip')) return 3;
  if (step.includes('post') || step.includes('publish') || step.includes('upload')) return 4;

  return 0;
}

function CustomStepIcon(props: StepIconProps & { status: JobStatus }) {
  const { active, completed, icon, status } = props;

  const IconComponent = STEPS[Number(icon) - 1]?.icon || QueueIcon;

  let color: string;
  if (status === 'failed') {
    color = 'error.main';
  } else if (completed) {
    color = 'success.main';
  } else if (active) {
    color = 'primary.main';
  } else {
    color = 'text.disabled';
  }

  return (
    <Box
      sx={{
        width: 40,
        height: 40,
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: completed || active ? 'background.paper' : 'transparent',
        border: completed || active ? '2px solid' : '2px solid',
        borderColor: color,
        color: color,
      }}
    >
      {status === 'failed' && active ? (
        <ErrorIcon />
      ) : (
        <IconComponent fontSize="small" />
      )}
    </Box>
  );
}

export function JobTimeline({ job }: JobTimelineProps) {
  const activeStep = getActiveStep(job.status, job.current_step);

  return (
    <Box sx={{ width: '100%', py: 2 }}>
      <Typography variant="h6" gutterBottom>
        Processing Timeline
      </Typography>
      <Stepper activeStep={activeStep} alternativeLabel>
        {STEPS.map((step, index) => {
          const isError = job.status === 'failed' && index === activeStep;
          return (
            <Step key={step.key} completed={index < activeStep}>
              <StepLabel
                error={isError}
                StepIconComponent={(props) => (
                  <CustomStepIcon {...props} status={job.status} />
                )}
              >
                {step.label}
              </StepLabel>
            </Step>
          );
        })}
      </Stepper>
      {job.current_step && job.status === 'processing' && (
        <Typography
          variant="body2"
          color="text.secondary"
          align="center"
          sx={{ mt: 2 }}
        >
          Current: {job.current_step}
        </Typography>
      )}
    </Box>
  );
}

import { Box, Container, Paper, Typography } from '@mui/material';
import { Outlet } from 'react-router-dom';

export function AuthLayout() {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        position: 'relative',
        background: 'linear-gradient(135deg, #2a2438 0%, #352f44 50%, #2a2438 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2,
      }}
    >
      {/* Decorative blurred circles */}
      <Box
        sx={{
          position: 'absolute',
          top: '10%',
          left: '5%',
          width: 350,
          height: 350,
          borderRadius: '50%',
          background: 'rgba(92,84,112,0.2)',
          filter: 'blur(80px)',
          pointerEvents: 'none',
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          bottom: '10%',
          right: '5%',
          width: 250,
          height: 250,
          borderRadius: '50%',
          background: 'rgba(219,216,227,0.06)',
          filter: 'blur(60px)',
          pointerEvents: 'none',
        }}
      />

      <Container maxWidth="xs" sx={{ position: 'relative', zIndex: 1 }}>
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <Typography
            variant="h5"
            sx={{ fontWeight: 700, color: 'text.secondary', letterSpacing: '-0.02em' }}
          >
            Content Machine
          </Typography>
          <Typography variant="body2" sx={{ color: 'rgba(219,216,227,0.55)', mt: 0.5 }}>
            Enterprise Content Automation
          </Typography>
        </Box>

        <Paper
          elevation={0}
          sx={{
            p: { xs: 3, sm: 4 },
            background: 'rgba(53,47,68,0.75)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(219,216,227,0.12)',
            borderRadius: 3,
          }}
        >
          <Outlet />
        </Paper>
      </Container>
    </Box>
  );
}

import { useEffect, useState } from 'react';
import { Box } from '@mui/material';
import { backgroundService } from '@/services/background.service';

interface DynamicBackgroundProps {
  opacity?: number;
  updateInterval?: number; // in minutes
}

/**
 * DynamicBackground component that fetches and displays AI-generated backgrounds
 * from the backend using Google Gemini's Imagen API.
 *
 * Features:
 * - Automatic periodic refresh based on updateInterval
 * - Smooth fade-in transitions
 * - Fallback gradient if image fails to load
 * - Proper cleanup of blob URLs to prevent memory leaks
 */
export function DynamicBackground({
  opacity = 0.2,
  updateInterval = 5
}: DynamicBackgroundProps) {
  const [backgroundUrl, setBackgroundUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadBackground();

    // Set up periodic refresh
    const interval = setInterval(() => {
      loadBackground();
    }, updateInterval * 60 * 1000);

    // Cleanup on unmount
    return () => {
      clearInterval(interval);
      if (backgroundUrl) {
        URL.revokeObjectURL(backgroundUrl);
      }
    };
  }, [updateInterval]);

  const loadBackground = async () => {
    if (isLoading) return;

    setIsLoading(true);
    try {
      const blob = await backgroundService.getBackgroundImage();
      const url = URL.createObjectURL(blob);

      // Preload image before showing to ensure smooth transition
      const img = new Image();
      img.onload = () => {
        // Cleanup old URL
        if (backgroundUrl) {
          URL.revokeObjectURL(backgroundUrl);
        }
        setBackgroundUrl(url);
      };
      img.onerror = () => {
        console.error('Failed to load background image');
        URL.revokeObjectURL(url);
      };
      img.src = url;
    } catch (error) {
      console.error('Failed to fetch background:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundImage: (theme) =>
          backgroundUrl
            ? `url(${backgroundUrl})`
            : theme.palette.mode === 'dark'
              ? 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f1419 100%)'
              : 'linear-gradient(135deg, #f5f3fa 0%, #ece8f3 50%, #ffffff 100%)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
        opacity: backgroundUrl ? opacity : 1,
        transition: 'opacity 1s ease-in-out',
        zIndex: -1,
        pointerEvents: 'none',
      }}
    />
  );
}

import {
  Dialog,
  DialogTitle,
  DialogContent,
  Box,
  Typography,
  Chip,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from '@mui/material';
import { Close as CloseIcon, Keyboard as KeyboardIcon } from '@mui/icons-material';

interface ShortcutInfo {
  keys: string;
  description: string;
}

interface KeyboardShortcutsDialogProps {
  open: boolean;
  onClose: () => void;
  shortcuts: ShortcutInfo[];
}

export function KeyboardShortcutsDialog({
  open,
  onClose,
  shortcuts,
}: KeyboardShortcutsDialogProps) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <KeyboardIcon />
            <Typography variant="h6">Keyboard Shortcuts</Typography>
          </Box>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Use these keyboard shortcuts to navigate and perform actions quickly
        </Typography>

        <TableContainer component={Paper} variant="outlined">
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>
                  <Typography variant="subtitle2">Shortcut</Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="subtitle2">Action</Typography>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {shortcuts.map((shortcut, index) => (
                <TableRow key={index} hover>
                  <TableCell sx={{ width: '40%' }}>
                    <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                      {shortcut.keys.split(' + ').map((key, i) => (
                        <Chip
                          key={i}
                          label={key}
                          size="small"
                          sx={{
                            fontFamily: 'monospace',
                            fontWeight: 'bold',
                            bgcolor: 'action.selected',
                          }}
                        />
                      ))}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{shortcut.description}</Typography>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
          Tip: Press <Chip label="?" size="small" sx={{ mx: 0.5, fontFamily: 'monospace' }} /> to
          show this dialog anytime
        </Typography>
      </DialogContent>
    </Dialog>
  );
}

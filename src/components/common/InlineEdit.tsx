import { useState, useRef, useEffect } from 'react';
import {
  Box,
  TextField,
  IconButton,
  Tooltip,
  Typography,
  ClickAwayListener,
} from '@mui/material';
import {
  Edit as EditIcon,
  Check as CheckIcon,
  Close as CloseIcon,
} from '@mui/icons-material';

interface InlineEditProps {
  value: string | number;
  onSave: (value: string | number) => Promise<void> | void;
  type?: 'text' | 'number';
  label?: string;
  multiline?: boolean;
  disabled?: boolean;
  min?: number;
  max?: number;
}

export function InlineEdit({
  value,
  onSave,
  type = 'text',
  label,
  multiline = false,
  disabled = false,
  min,
  max,
}: InlineEditProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);
  const [isSaving, setIsSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleEdit = () => {
    setEditValue(value);
    setIsEditing(true);
  };

  const handleCancel = () => {
    setEditValue(value);
    setIsEditing(false);
  };

  const handleSave = async () => {
    if (editValue === value) {
      setIsEditing(false);
      return;
    }

    setIsSaving(true);
    try {
      await onSave(editValue);
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to save:', error);
      // Error will be shown via toast from interceptor
    } finally {
      setIsSaving(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !multiline) {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  if (isEditing) {
    return (
      <ClickAwayListener onClickAway={handleCancel}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <TextField
            inputRef={inputRef}
            size="small"
            type={type}
            value={editValue}
            onChange={(e) =>
              setEditValue(type === 'number' ? parseFloat(e.target.value) : e.target.value)
            }
            onKeyDown={handleKeyDown}
            disabled={isSaving}
            multiline={multiline}
            inputProps={{ min, max }}
            sx={{ flexGrow: 1 }}
          />
          <Tooltip title="Save">
            <IconButton
              size="small"
              color="success"
              onClick={handleSave}
              disabled={isSaving}
            >
              <CheckIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Cancel">
            <IconButton
              size="small"
              color="error"
              onClick={handleCancel}
              disabled={isSaving}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </ClickAwayListener>
    );
  }

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        '&:hover .edit-icon': {
          opacity: 1,
        },
      }}
    >
      {label && (
        <Typography variant="caption" color="text.secondary">
          {label}:
        </Typography>
      )}
      <Typography variant="body2">{value}</Typography>
      {!disabled && (
        <Tooltip title="Edit">
          <IconButton
            size="small"
            onClick={handleEdit}
            className="edit-icon"
            sx={{
              opacity: 0,
              transition: 'opacity 0.2s',
              ml: -0.5,
            }}
          >
            <EditIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      )}
    </Box>
  );
}

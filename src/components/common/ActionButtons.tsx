import React from 'react';
import { Box, IconButton, Tooltip } from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  ContentCopy as ContentCopyIcon,
  MoreVert as MoreVertIcon,
} from '@mui/icons-material';

interface ActionButtonsProps {
  onEdit?: () => void;
  onDelete?: () => void;
  onView?: () => void;
  onDuplicate?: () => void;
  onMore?: () => void;
  size?: 'small' | 'medium';
  showLabels?: boolean;
  variant?: 'default' | 'compact' | 'colorful';
}

export const ActionButtons: React.FC<ActionButtonsProps> = ({
  onEdit,
  onDelete,
  onView,
  onDuplicate,
  onMore,
  size = 'small',
}) => {
  const btnSx = (hoverColor?: string) => ({
    color: '#787C82',
    borderRadius: '2px',
    '&:hover': {
      color: hoverColor || '#1D2327',
      backgroundColor: '#F0F0F1',
    },
  });

  return (
    <Box sx={{ display: 'flex', gap: '2px', alignItems: 'center' }}>
      {onView && (
        <Tooltip title="View" arrow enterDelay={400} placement="top">
          <IconButton size={size} onClick={(e) => { e.stopPropagation(); onView(); }} sx={btnSx('#0073AA')}>
            <VisibilityIcon fontSize={size} />
          </IconButton>
        </Tooltip>
      )}
      {onEdit && (
        <Tooltip title="Edit" arrow enterDelay={400} placement="top">
          <IconButton size={size} onClick={(e) => { e.stopPropagation(); onEdit(); }} sx={btnSx()}>
            <EditIcon fontSize={size} />
          </IconButton>
        </Tooltip>
      )}
      {onDuplicate && (
        <Tooltip title="Duplicate" arrow enterDelay={400} placement="top">
          <IconButton size={size} onClick={(e) => { e.stopPropagation(); onDuplicate(); }} sx={btnSx()}>
            <ContentCopyIcon fontSize={size} />
          </IconButton>
        </Tooltip>
      )}
      {onDelete && (
        <Tooltip title="Delete" arrow enterDelay={400} placement="top">
          <IconButton size={size} onClick={(e) => { e.stopPropagation(); onDelete(); }} sx={btnSx('#D63638')}>
            <DeleteIcon fontSize={size} />
          </IconButton>
        </Tooltip>
      )}
      {onMore && (
        <Tooltip title="More" arrow enterDelay={400} placement="top">
          <IconButton size={size} onClick={(e) => { e.stopPropagation(); onMore(); }} sx={btnSx()}>
            <MoreVertIcon fontSize={size} />
          </IconButton>
        </Tooltip>
      )}
    </Box>
  );
};

export default ActionButtons;

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
}

export const ActionButtons: React.FC<ActionButtonsProps> = ({
  onEdit,
  onDelete,
  onView,
  onDuplicate,
  onMore,
  size = 'small',
}) => {
  return (
    <Box sx={{ display: 'flex', gap: '2px', alignItems: 'center' }}>
      {onView && (
        <Tooltip title="View" arrow enterDelay={400} placement="top">
          <IconButton size={size} onClick={(e) => { e.stopPropagation(); onView(); }}
            sx={{ color: '#0073AA', borderRadius: '2px', '&:hover': { bgcolor: 'rgba(0,115,170,0.08)' } }}>
            <VisibilityIcon fontSize={size} />
          </IconButton>
        </Tooltip>
      )}
      {onEdit && (
        <Tooltip title="Edit" arrow enterDelay={400} placement="top">
          <IconButton size={size} onClick={(e) => { e.stopPropagation(); onEdit(); }}
            sx={{ color: '#BE5953', borderRadius: '2px', '&:hover': { bgcolor: 'rgba(190,89,83,0.08)' } }}>
            <EditIcon fontSize={size} />
          </IconButton>
        </Tooltip>
      )}
      {onDuplicate && (
        <Tooltip title="Duplicate" arrow enterDelay={400} placement="top">
          <IconButton size={size} onClick={(e) => { e.stopPropagation(); onDuplicate(); }}
            sx={{ color: '#787C82', borderRadius: '2px', '&:hover': { color: '#1D2327', bgcolor: '#F0F0F1' } }}>
            <ContentCopyIcon fontSize={size} />
          </IconButton>
        </Tooltip>
      )}
      {onDelete && (
        <Tooltip title="Delete" arrow enterDelay={400} placement="top">
          <IconButton size={size} onClick={(e) => { e.stopPropagation(); onDelete(); }}
            sx={{ color: '#D63638', borderRadius: '2px', '&:hover': { bgcolor: 'rgba(214,54,56,0.08)' } }}>
            <DeleteIcon fontSize={size} />
          </IconButton>
        </Tooltip>
      )}
      {onMore && (
        <Tooltip title="More" arrow enterDelay={400} placement="top">
          <IconButton size={size} onClick={(e) => { e.stopPropagation(); onMore(); }}
            sx={{ color: '#787C82', borderRadius: '2px', '&:hover': { color: '#1D2327', bgcolor: '#F0F0F1' } }}>
            <MoreVertIcon fontSize={size} />
          </IconButton>
        </Tooltip>
      )}
    </Box>
  );
};

export default ActionButtons;

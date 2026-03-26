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
  variant = 'default',
}) => {
  const btnSx = (color: string) =>
    variant === 'compact'
      ? {
          color,
          '&:hover': { backgroundColor: `${color}12`, color },
        }
      : {
          color,
          backgroundColor: '#FFFFFF',
          border: `1.5px solid ${color}25`,
          '&:hover': {
            backgroundColor: `${color}08`,
            borderColor: `${color}60`,
          },
        };

  return (
    <Box sx={{ display: 'flex', gap: variant === 'compact' ? 0.25 : 0.75, alignItems: 'center' }}>
      {onView && (
        <Tooltip title="View" arrow enterDelay={400} placement="top">
          <IconButton size={size} onClick={(e) => { e.stopPropagation(); onView(); }} sx={btnSx('#243A7D')}>
            <VisibilityIcon fontSize={size} />
          </IconButton>
        </Tooltip>
      )}
      {onEdit && (
        <Tooltip title="Edit" arrow enterDelay={400} placement="top">
          <IconButton size={size} onClick={(e) => { e.stopPropagation(); onEdit(); }} sx={btnSx('#BE5953')}>
            <EditIcon fontSize={size} />
          </IconButton>
        </Tooltip>
      )}
      {onDuplicate && (
        <Tooltip title="Duplicate" arrow enterDelay={400} placement="top">
          <IconButton size={size} onClick={(e) => { e.stopPropagation(); onDuplicate(); }} sx={btnSx('#8B9D77')}>
            <ContentCopyIcon fontSize={size} />
          </IconButton>
        </Tooltip>
      )}
      {onDelete && (
        <Tooltip title="Delete" arrow enterDelay={400} placement="top">
          <IconButton size={size} onClick={(e) => { e.stopPropagation(); onDelete(); }} sx={btnSx('#BE5953')}>
            <DeleteIcon fontSize={size} />
          </IconButton>
        </Tooltip>
      )}
      {onMore && (
        <Tooltip title="More" arrow enterDelay={400} placement="top">
          <IconButton size={size} onClick={(e) => { e.stopPropagation(); onMore(); }} sx={btnSx('#5C524D')}>
            <MoreVertIcon fontSize={size} />
          </IconButton>
        </Tooltip>
      )}
    </Box>
  );
};

export default ActionButtons;

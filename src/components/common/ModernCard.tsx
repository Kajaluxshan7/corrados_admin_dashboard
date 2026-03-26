import React from 'react';
import { Card, CardContent, Box, Typography, IconButton, Chip } from '@mui/material';
import { MoreVert as MoreVertIcon } from '@mui/icons-material';

interface ModernCardProps {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  action?: React.ReactNode;
  icon?: React.ReactNode;
  variant?: 'default' | 'gradient' | 'glass' | 'elevated';
  tag?: string;
  tagColor?: string;
  onClick?: () => void;
  onMenuClick?: () => void;
}

export const ModernCard: React.FC<ModernCardProps> = ({
  title,
  subtitle,
  children,
  action,
  tag,
  tagColor,
  onClick,
  onMenuClick,
}) => {
  return (
    <Card
      onClick={onClick}
      sx={{
        borderRadius: '2px',
        border: '1px solid #E2E4E7',
        backgroundColor: '#FFFFFF',
        boxShadow: '0 1px 3px rgba(0,0,0,0.07), 0 1px 2px rgba(0,0,0,0.05)',
        cursor: onClick ? 'pointer' : 'default',
        position: 'relative',
        overflow: 'hidden',
        transition: 'border-color 150ms ease',
        '&:hover': onClick ? { borderColor: '#CDD0D4' } : {},
      }}
    >
      <CardContent sx={{ p: '16px', '&:last-child': { pb: '16px' } }}>
        {/* Header Section */}
        {(title || action || tag || onMenuClick) && (
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              mb: title || subtitle ? '16px' : 0,
              pb: title || subtitle ? '12px' : 0,
              borderBottom: title || subtitle ? '1px solid #E2E4E7' : 'none',
            }}
          >
            <Box sx={{ flex: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px', mb: subtitle ? '2px' : 0 }}>
                {title && (
                  <Typography
                    sx={{
                      fontFamily: '"Inter", sans-serif',
                      fontWeight: 600,
                      fontSize: '1rem',
                      color: '#1D2327',
                    }}
                  >
                    {title}
                  </Typography>
                )}
                {tag && (
                  <Chip
                    label={tag}
                    size="small"
                    sx={{
                      height: 20,
                      fontSize: '0.6875rem',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      backgroundColor: tagColor ? `${tagColor}15` : '#F0F0F1',
                      color: tagColor || '#50575E',
                      border: `1px solid ${tagColor ? `${tagColor}25` : '#CDD0D4'}`,
                      borderRadius: '2px',
                    }}
                  />
                )}
              </Box>
              {subtitle && (
                <Typography sx={{ fontSize: '0.8125rem', color: '#787C82' }}>
                  {subtitle}
                </Typography>
              )}
            </Box>
            <Box sx={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
              {action}
              {onMenuClick && (
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    onMenuClick();
                  }}
                  sx={{
                    color: '#787C82',
                    borderRadius: '2px',
                    '&:hover': { backgroundColor: '#F0F0F1', color: '#1D2327' },
                  }}
                >
                  <MoreVertIcon fontSize="small" />
                </IconButton>
              )}
            </Box>
          </Box>
        )}

        <Box>{children}</Box>
      </CardContent>
    </Card>
  );
};

export default ModernCard;

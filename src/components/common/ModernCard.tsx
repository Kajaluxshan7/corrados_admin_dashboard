import React from 'react';
import { Card, CardContent, Box, Typography, IconButton, Chip, Avatar } from '@mui/material';
import { MoreVert as MoreVertIcon } from '@mui/icons-material';

interface ModernCardProps {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  action?: React.ReactNode;
  icon?: React.ReactNode;
  color?: string;
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
  icon,
  color = '#BE5953',
  variant = 'default',
  tag,
  tagColor,
  onClick,
  onMenuClick,
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'gradient':
        return {
          background: '#FFFFFF',
          border: `1px solid ${color}15`,
          borderTop: `3px solid ${color}`,
          boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
        };
      case 'glass':
        return {
          background: 'rgba(255, 255, 255, 0.92)',
          border: '1px solid rgba(232, 224, 216, 0.8)',
          boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
        };
      case 'elevated':
        return {
          background: '#FFFFFF',
          border: '1px solid #EDE0D8',
          boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
        };
      default:
        return {
          background: '#FFFFFF',
          border: '1px solid #EDE0D8',
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
        };
    }
  };

  return (
    <Card
      onClick={onClick}
      sx={{
        borderRadius: 2,
        transition: 'box-shadow 0.2s ease, transform 0.2s ease',
        cursor: onClick ? 'pointer' : 'default',
        position: 'relative',
        overflow: 'hidden',
        ...getVariantStyles(),
        '&:hover': onClick
          ? {
              transform: 'translateY(-2px)',
              boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
              borderColor: `${color}30`,
            }
          : {},
      }}
    >
      <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
        {/* Header Section */}
        {(title || action || icon || tag || onMenuClick) && (
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              mb: title || subtitle ? 2 : 0,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flex: 1 }}>
              {icon && (
                <Avatar
                  sx={{
                    width: 40,
                    height: 40,
                    backgroundColor: `${color}12`,
                    color,
                    border: `1.5px solid ${color}20`,
                    borderRadius: 1.5,
                  }}
                >
                  {icon}
                </Avatar>
              )}
              <Box sx={{ flex: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: subtitle ? 0.5 : 0 }}>
                  {title && (
                    <Typography
                      variant="h6"
                      sx={{
                        fontFamily: '"Playfair Display", "Georgia", serif',
                        fontWeight: 700,
                        fontSize: '1rem',
                        color: '#2D2926',
                        letterSpacing: '-0.01em',
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
                        fontSize: '0.65rem',
                        fontWeight: 700,
                        letterSpacing: '0.04em',
                        backgroundColor: tagColor ? `${tagColor}15` : `${color}12`,
                        color: tagColor || color,
                        border: `1px solid ${tagColor || color}25`,
                        borderRadius: 1,
                      }}
                    />
                  )}
                </Box>
                {subtitle && (
                  <Typography variant="body2" sx={{ color: '#5C524D', fontSize: '0.85rem' }}>
                    {subtitle}
                  </Typography>
                )}
              </Box>
            </Box>
            <Box sx={{ display: 'flex', gap: 1, flexShrink: 0 }}>
              {action}
              {onMenuClick && (
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    onMenuClick();
                  }}
                  sx={{
                    color: '#B0A8A2',
                    '&:hover': {
                      backgroundColor: `${color}10`,
                      color,
                    },
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

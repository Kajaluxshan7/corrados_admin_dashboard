import React from 'react';
import { Card, CardContent, Box, Typography, LinearProgress } from '@mui/material';
import type { SvgIconComponent } from '@mui/icons-material';

interface StatsCardProps {
  title: string;
  value: number;
  total?: number;
  icon: SvgIconComponent;
  color: string;
  progress?: number;
  onClick?: () => void;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  total,
  icon: Icon,
  color,
  progress,
  onClick,
  trend,
}) => {
  return (
    <Card
      onClick={onClick}
      sx={{
        height: '100%',
        border: '1px solid #EDE0D8',
        borderRadius: '10px',
        backgroundColor: '#FFFFFF',
        boxShadow: '0 1px 6px rgba(0,0,0,0.04)',
        transition: 'box-shadow 0.2s ease, transform 0.2s ease',
        cursor: onClick ? 'pointer' : 'default',
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 3,
          backgroundColor: color,
          borderRadius: '10px 10px 0 0',
        },
        '&:hover': onClick
          ? {
              boxShadow: '0 6px 20px rgba(0,0,0,0.09)',
              transform: 'translateY(-2px)',
            }
          : {},
      }}
    >
      <CardContent sx={{ p: 2.5, pt: 3 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 1.5 }}>
          <Typography
            sx={{
              fontSize: '0.68rem',
              fontWeight: 700,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: '#A89080',
            }}
          >
            {title}
          </Typography>
          <Box
            sx={{
              width: 34,
              height: 34,
              borderRadius: '8px',
              backgroundColor: `${color}12`,
              border: `1px solid ${color}22`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Icon sx={{ fontSize: 17, color }} />
          </Box>
        </Box>

        {/* Value */}
        <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, mb: 0.25 }}>
          <Typography
            sx={{
              fontFamily: '"Playfair Display", "Georgia", serif',
              fontWeight: 700,
              color: '#2D2926',
              fontSize: { xs: '1.75rem', sm: '2rem' },
              lineHeight: 1,
            }}
          >
            {value.toLocaleString()}
          </Typography>
          {total !== undefined && total > 0 && value !== total && (
            <Typography sx={{ color: '#C4BBB5', fontSize: '0.78rem', fontWeight: 500 }}>
              / {total.toLocaleString()}
            </Typography>
          )}
          {trend && (
            <Box
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                px: 0.75,
                py: 0.2,
                borderRadius: '4px',
                backgroundColor: trend.isPositive ? 'rgba(44,85,48,0.1)' : 'rgba(190,89,83,0.09)',
                border: `1px solid ${trend.isPositive ? 'rgba(44,85,48,0.2)' : 'rgba(190,89,83,0.2)'}`,
              }}
            >
              <Typography
                sx={{
                  color: trend.isPositive ? '#2C5530' : '#BE5953',
                  fontWeight: 700,
                  fontSize: '0.7rem',
                }}
              >
                {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
              </Typography>
            </Box>
          )}
        </Box>

        {/* Progress Bar */}
        {progress !== undefined && progress < 100 && (
          <Box sx={{ mt: 1.5 }}>
            <LinearProgress
              variant="determinate"
              value={progress}
              sx={{
                height: 3,
                borderRadius: 2,
                backgroundColor: `${color}18`,
                '& .MuiLinearProgress-bar': {
                  borderRadius: 2,
                  backgroundColor: color,
                },
              }}
            />
            <Typography sx={{ fontSize: '0.68rem', fontWeight: 600, color, mt: 0.5 }}>
              {Math.round(progress)}% active
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default StatsCard;

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
        border: '1px solid #E2E4E7',
        borderRadius: '2px',
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
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: '12px' }}>
          <Typography
            sx={{
              fontSize: '0.6875rem',
              fontWeight: 600,
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              color: '#787C82',
            }}
          >
            {title}
          </Typography>
          <Icon sx={{ fontSize: 24, color: '#CDD0D4' }} />
        </Box>

        {/* Value */}
        <Box sx={{ display: 'flex', alignItems: 'baseline', gap: '8px', mb: '2px' }}>
          <Typography
            sx={{
              fontFamily: '"Inter", sans-serif',
              fontWeight: 700,
              color: '#1D2327',
              fontSize: '1.75rem',
              lineHeight: 1,
            }}
          >
            {value.toLocaleString()}
          </Typography>
          {total !== undefined && total > 0 && value !== total && (
            <Typography sx={{ color: '#A7AAAD', fontSize: '0.8125rem', fontWeight: 400 }}>
              / {total.toLocaleString()}
            </Typography>
          )}
          {trend && (
            <Box
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                px: '6px',
                py: '2px',
                borderRadius: '2px',
                backgroundColor: trend.isPositive ? '#EEF7EE' : '#FCEEEE',
                border: `1px solid ${trend.isPositive ? '#B3DFBB' : '#E9A8A8'}`,
              }}
            >
              <Typography
                sx={{
                  color: trend.isPositive ? '#00A32A' : '#D63638',
                  fontWeight: 700,
                  fontSize: '0.75rem',
                }}
              >
                {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
              </Typography>
            </Box>
          )}
        </Box>

        {/* Progress Bar */}
        {progress !== undefined && progress < 100 && (
          <Box sx={{ mt: '12px' }}>
            <LinearProgress
              variant="determinate"
              value={progress}
              sx={{
                height: 3,
                borderRadius: 0,
                backgroundColor: '#E2E4E7',
                '& .MuiLinearProgress-bar': {
                  borderRadius: 0,
                  backgroundColor: color,
                },
              }}
            />
            <Typography sx={{ fontSize: '0.6875rem', fontWeight: 600, color: '#787C82', mt: '4px' }}>
              {Math.round(progress)}% active
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default StatsCard;

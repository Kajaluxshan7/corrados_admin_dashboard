import React from 'react';
import { Box, Typography, Grid } from '@mui/material';
import { TrendingUp, TrendingDown, TrendingFlat } from '@mui/icons-material';

export interface StatItem {
  label: string;
  value: number | string;
  icon?: React.ReactNode;
  color?: string;
  suffix?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
}

interface SummaryStatsProps {
  stats: StatItem[];
  columns?: number;
  variant?: 'default' | 'compact' | 'card';
}

// WP-style stat card: white card with colored left border accent
const StatCard: React.FC<{ stat: StatItem }> = ({ stat }) => {
  const accent = stat.color || '#BE5953';
  const trendColor =
    stat.trend === 'up' ? '#2C5530' : stat.trend === 'down' ? '#BE5953' : '#9B8B80';
  const TrendIcon =
    stat.trend === 'up' ? TrendingUp : stat.trend === 'down' ? TrendingDown : TrendingFlat;

  return (
    <Box
      sx={{
        bgcolor: '#FFFFFF',
        border: '1px solid #E8E0D8',
        borderLeft: `4px solid ${accent}`,
        borderRadius: '6px',
        p: 2,
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
        transition: 'box-shadow 0.15s',
        '&:hover': { boxShadow: '0 3px 10px rgba(0,0,0,0.08)' },
      }}
    >
      {stat.icon && (
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: '8px',
            bgcolor: `${accent}12`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: accent,
            flexShrink: 0,
            '& svg': { fontSize: '1.2rem' },
          }}
        >
          {stat.icon}
        </Box>
      )}
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography
          sx={{
            fontSize: '0.7rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            color: '#9B8B80',
            mb: 0.375,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {stat.label}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.75 }}>
          <Typography
            sx={{
              fontSize: '1.625rem',
              fontWeight: 800,
              color: '#1C1917',
              lineHeight: 1,
              letterSpacing: '-0.03em',
            }}
          >
            {stat.value}
          </Typography>
          {stat.suffix && (
            <Typography sx={{ fontSize: '0.8rem', color: '#9B8B80', fontWeight: 500 }}>
              {stat.suffix}
            </Typography>
          )}
        </Box>
        {stat.trendValue && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.375, mt: 0.375 }}>
            <TrendIcon sx={{ fontSize: 13, color: trendColor }} />
            <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: trendColor }}>
              {stat.trendValue}
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export const SummaryStats: React.FC<SummaryStatsProps> = ({
  stats,
  columns = 4,
  variant = 'default',
}) => {
  const gridSize = () => {
    switch (columns) {
      case 2: return { xs: 6 };
      case 3: return { xs: 6, sm: 4 };
      case 4: return { xs: 6, sm: 3 };
      case 5: return { xs: 6, sm: 4, md: 2.4 };
      case 6: return { xs: 6, sm: 4, md: 2 };
      default: return { xs: 6, sm: 3 };
    }
  };

  // Compact: inline pills row (e.g. for quick filter area)
  if (variant === 'compact') {
    return (
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 1,
          mb: 3,
          p: 2,
          bgcolor: '#FFFFFF',
          border: '1px solid #E8E0D8',
          borderRadius: '6px',
        }}
      >
        {stats.map((stat, i) => (
          <Box
            key={i}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 0.75,
              px: 1.5,
              py: 0.75,
              borderRadius: '5px',
              bgcolor: stat.color ? `${stat.color}0D` : 'rgba(190,89,83,0.06)',
              border: `1px solid ${stat.color ? `${stat.color}20` : 'rgba(190,89,83,0.12)'}`,
            }}
          >
            {stat.icon && (
              <Box sx={{ color: stat.color || '#BE5953', '& svg': { fontSize: '0.9rem' } }}>
                {stat.icon}
              </Box>
            )}
            <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: stat.color || '#1C1917' }}>
              {stat.value}
            </Typography>
            <Typography sx={{ fontSize: '0.7rem', color: '#9B8B80' }}>
              {stat.label}
            </Typography>
          </Box>
        ))}
      </Box>
    );
  }

  // Default and card variant both use the stat card grid
  return (
    <Grid container spacing={2} sx={{ mb: 3 }}>
      {stats.map((stat, i) => (
        <Grid key={i} size={gridSize()}>
          <StatCard stat={stat} />
        </Grid>
      ))}
    </Grid>
  );
};

export default SummaryStats;

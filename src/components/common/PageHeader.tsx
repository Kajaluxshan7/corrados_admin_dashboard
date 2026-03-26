import React from 'react';
import { Box, Typography, Breadcrumbs, Link } from '@mui/material';
import { NavigateNext as NavigateNextIcon } from '@mui/icons-material';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  statusChip?: React.ReactNode;
  breadcrumbs?: Array<{ label: string; href?: string }>;
  icon?: React.ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  action,
  statusChip,
  breadcrumbs,
  icon,
}) => {
  return (
    <Box
      sx={{
        mb: 3,
        pb: 2.5,
        borderBottom: '2px solid #E8E0D8',
        display: 'flex',
        alignItems: { xs: 'flex-start', sm: 'center' },
        flexDirection: { xs: 'column', sm: 'row' },
        justifyContent: 'space-between',
        gap: 2,
      }}
    >
      <Box sx={{ flex: 1 }}>
        {breadcrumbs && breadcrumbs.length > 0 && (
          <Breadcrumbs
            separator={<NavigateNextIcon sx={{ fontSize: 12, color: '#C4BBB5' }} />}
            sx={{ mb: 1 }}
          >
            {breadcrumbs.map((crumb, i) => (
              <Link
                key={i}
                href={crumb.href}
                underline="hover"
                sx={{
                  fontSize: '0.75rem',
                  fontWeight: i === breadcrumbs.length - 1 ? 600 : 400,
                  color: i === breadcrumbs.length - 1 ? '#5C524D' : '#9B8B80',
                  '&:hover': { color: '#BE5953' },
                }}
              >
                {crumb.label}
              </Link>
            ))}
          </Breadcrumbs>
        )}

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
          {icon && (
            <Box
              sx={{
                width: 38,
                height: 38,
                borderRadius: '8px',
                bgcolor: 'rgba(190,89,83,0.1)',
                border: '1px solid rgba(190,89,83,0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#BE5953',
                flexShrink: 0,
                '& svg': { fontSize: 20 },
              }}
            >
              {icon}
            </Box>
          )}
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 700,
                  fontSize: { xs: '1.2rem', sm: '1.35rem' },
                  color: '#1C1917',
                  letterSpacing: '-0.02em',
                  lineHeight: 1.2,
                }}
              >
                {title}
              </Typography>
              {statusChip}
            </Box>
            {subtitle && (
              <Typography
                sx={{
                  fontSize: '0.8rem',
                  color: '#9B8B80',
                  mt: 0.25,
                  lineHeight: 1.4,
                }}
              >
                {subtitle}
              </Typography>
            )}
          </Box>
        </Box>
      </Box>

      {action && (
        <Box sx={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: 1 }}>
          {action}
        </Box>
      )}
    </Box>
  );
};

export default PageHeader;

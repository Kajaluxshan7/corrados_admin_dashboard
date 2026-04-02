import React from 'react';
import { Box, Typography, Breadcrumbs, Link } from '@mui/material';

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
        mb: '24px',
        pb: '16px',
        borderBottom: '1px solid #E2E4E7',
        display: 'flex',
        alignItems: { xs: 'flex-start', sm: 'center' },
        flexDirection: { xs: 'column', sm: 'row' },
        justifyContent: 'space-between',
        gap: '16px',
      }}
    >
      <Box sx={{ flex: 1 }}>
        {breadcrumbs && breadcrumbs.length > 0 && (
          <Breadcrumbs
            separator="›"
            sx={{ mb: '6px', '& .MuiBreadcrumbs-separator': { color: '#A7AAAD' } }}
          >
            {breadcrumbs.map((crumb, i) => (
              <Link
                key={i}
                href={crumb.href}
                underline="hover"
                sx={{
                  fontSize: '0.75rem',
                  color: i === breadcrumbs.length - 1 ? '#50575E' : '#0073AA',
                  '&:hover': { color: '#BE5953' },
                }}
              >
                {crumb.label}
              </Link>
            ))}
          </Breadcrumbs>
        )}

        <Box sx={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          {icon && (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#BE5953',
                '& svg': { fontSize: 22 },
              }}
            >
              {icon}
            </Box>
          )}
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Typography
                sx={{
                  fontWeight: 700,
                  fontSize: '1.25rem',
                  color: '#1D2327',
                  lineHeight: 1.3,
                }}
              >
                {title}
              </Typography>
              {statusChip}
            </Box>
            {subtitle && (
              <Typography
                sx={{
                  fontSize: '0.8125rem',
                  color: '#787C82',
                  mt: '2px',
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
        <Box sx={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
          {action}
        </Box>
      )}
    </Box>
  );
};

export default PageHeader;

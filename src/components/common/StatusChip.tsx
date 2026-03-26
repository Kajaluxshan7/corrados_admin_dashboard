import React from "react";
import { Chip } from "@mui/material";
import type { ChipProps } from "@mui/material";
import {
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  HourglassEmpty as HourglassEmptyIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
} from "@mui/icons-material";

export type StatusType =
  | "active"
  | "inactive"
  | "open"
  | "closed"
  | "pending"
  | "success"
  | "error"
  | "warning"
  | "info";

interface StatusChipProps extends Omit<ChipProps, "color"> {
  status: StatusType;
  label?: string;
}

const STATUS_CONFIG: Record<StatusType, {
  color: string;
  bg: string;
  border: string;
  icon: React.ElementType;
  defaultLabel: string;
}> = {
  active:   { color: '#2C5530', bg: 'rgba(44,85,48,0.08)',   border: 'rgba(44,85,48,0.2)',   icon: CheckCircleIcon,   defaultLabel: 'Active' },
  inactive: { color: '#757575', bg: 'rgba(117,117,117,0.08)',border: 'rgba(117,117,117,0.2)',icon: CancelIcon,        defaultLabel: 'Inactive' },
  open:     { color: '#2C5530', bg: 'rgba(44,85,48,0.08)',   border: 'rgba(44,85,48,0.2)',   icon: CheckCircleIcon,   defaultLabel: 'Open' },
  closed:   { color: '#BE5953', bg: 'rgba(190,89,83,0.08)',  border: 'rgba(190,89,83,0.2)',  icon: CancelIcon,        defaultLabel: 'Closed' },
  pending:  { color: '#C9A96E', bg: 'rgba(201,169,110,0.1)', border: 'rgba(201,169,110,0.25)',icon: HourglassEmptyIcon,defaultLabel: 'Pending' },
  warning:  { color: '#B07A2A', bg: 'rgba(201,169,110,0.1)', border: 'rgba(201,169,110,0.25)',icon: WarningIcon,       defaultLabel: 'Warning' },
  error:    { color: '#BE5953', bg: 'rgba(190,89,83,0.08)',  border: 'rgba(190,89,83,0.2)',  icon: CancelIcon,        defaultLabel: 'Error' },
  success:  { color: '#2C5530', bg: 'rgba(44,85,48,0.08)',   border: 'rgba(44,85,48,0.2)',   icon: CheckCircleIcon,   defaultLabel: 'Success' },
  info:     { color: '#243A7D', bg: 'rgba(36,58,125,0.08)',  border: 'rgba(36,58,125,0.2)',  icon: InfoIcon,          defaultLabel: 'Info' },
};

export const StatusChip: React.FC<StatusChipProps> = ({
  status,
  label,
  size = 'small',
  ...rest
}) => {
  const cfg = STATUS_CONFIG[status];
  const Icon = cfg.icon;

  return (
    <Chip
      icon={<Icon sx={{ fontSize: '0.85rem !important' }} />}
      label={label || cfg.defaultLabel}
      size={size}
      sx={{
        bgcolor: cfg.bg,
        color: cfg.color,
        border: `1px solid ${cfg.border}`,
        borderRadius: '4px',
        fontWeight: 600,
        fontSize: '0.72rem',
        letterSpacing: '0.02em',
        height: 22,
        '& .MuiChip-icon': { color: cfg.color, ml: '5px' },
        '& .MuiChip-label': { px: '6px' },
        ...rest.sx,
      }}
      {...rest}
    />
  );
};

export default StatusChip;

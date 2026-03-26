import React from "react";
import { Chip } from "@mui/material";
import type { ChipProps } from "@mui/material";

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
  defaultLabel: string;
}> = {
  active:   { color: '#00A32A', bg: '#EEF7EE', border: '#B3DFBB', defaultLabel: 'Active' },
  inactive: { color: '#50575E', bg: '#F0F0F1', border: '#CDD0D4', defaultLabel: 'Inactive' },
  open:     { color: '#00A32A', bg: '#EEF7EE', border: '#B3DFBB', defaultLabel: 'Open' },
  closed:   { color: '#50575E', bg: '#F0F0F1', border: '#CDD0D4', defaultLabel: 'Closed' },
  pending:  { color: '#996800', bg: '#FEF8EE', border: '#F5D567', defaultLabel: 'Pending' },
  warning:  { color: '#996800', bg: '#FEF8EE', border: '#F5D567', defaultLabel: 'Warning' },
  error:    { color: '#D63638', bg: '#FCEEEE', border: '#E9A8A8', defaultLabel: 'Error' },
  success:  { color: '#00A32A', bg: '#EEF7EE', border: '#B3DFBB', defaultLabel: 'Success' },
  info:     { color: '#0073AA', bg: '#EEF5FA', border: '#99C8E0', defaultLabel: 'Info' },
};

export const StatusChip: React.FC<StatusChipProps> = ({
  status,
  label,
  size = 'small',
  ...rest
}) => {
  const cfg = STATUS_CONFIG[status];

  return (
    <Chip
      label={label || cfg.defaultLabel}
      size={size}
      sx={{
        bgcolor: cfg.bg,
        color: cfg.color,
        border: `1px solid ${cfg.border}`,
        borderRadius: '2px',
        fontWeight: 700,
        fontSize: '0.6875rem',
        letterSpacing: '0.04em',
        textTransform: 'uppercase',
        height: 22,
        '& .MuiChip-label': { px: '6px' },
        ...rest.sx,
      }}
      {...rest}
    />
  );
};

export default StatusChip;

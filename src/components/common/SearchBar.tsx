import React, { useState } from 'react';
import {
  Paper,
  InputBase,
  IconButton,
  Box,
  Chip,
  Fade,
  Popper,
  ClickAwayListener,
} from '@mui/material';
import {
  Search as SearchIcon,
  Clear as ClearIcon,
  TuneRounded as TuneIcon,
} from '@mui/icons-material';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  onFilterClick?: () => void;
  filters?: Array<{ label: string; value: string; active: boolean }>;
  onFilterToggle?: (value: string) => void;
  variant?: 'default' | 'elevated' | 'glass';
  fullWidth?: boolean;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChange,
  placeholder = 'Search…',
  onFilterClick,
  filters = [],
  onFilterToggle,
  fullWidth = false,
}) => {
  const [focused, setFocused] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleFilterClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
    setShowFilters(!showFilters);
  };

  const hasActiveFilter = filters.some((f) => f.active);

  return (
    <Box sx={{ width: fullWidth ? '100%' : 'auto' }}>
      <Paper
        elevation={0}
        sx={{
          display: 'flex',
          alignItems: 'center',
          width: fullWidth ? '100%' : { xs: '100%', sm: 360 },
          maxWidth: fullWidth ? '100%' : 560,
          height: 44,
          px: 2,
          borderRadius: 2,
          border: focused ? '2px solid #BE5953' : '1.5px solid #EDE0D8',
          backgroundColor: '#FFFFFF',
          transition: 'border-color 0.2s ease',
          '&:hover': {
            borderColor: focused ? '#BE5953' : '#D4817C',
          },
        }}
      >
        <SearchIcon
          sx={{
            color: focused ? '#BE5953' : '#B0A8A2',
            mr: 1.5,
            fontSize: 20,
            transition: 'color 0.2s ease',
            flexShrink: 0,
          }}
        />
        <InputBase
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          sx={{
            flex: 1,
            fontSize: '0.875rem',
            color: '#2D2926',
            '& input::placeholder': { color: '#B0A8A2', opacity: 1 },
          }}
        />
        {value && (
          <Fade in>
            <IconButton
              size="small"
              onClick={() => onChange('')}
              sx={{
                color: '#B0A8A2',
                p: 0.5,
                '&:hover': { color: '#BE5953', backgroundColor: 'rgba(190,89,83,0.08)' },
              }}
            >
              <ClearIcon sx={{ fontSize: 16 }} />
            </IconButton>
          </Fade>
        )}
        {(onFilterClick || filters.length > 0) && (
          <>
            <Box sx={{ width: 1, height: 20, bgcolor: '#EDE0D8', mx: 1 }} />
            <IconButton
              size="small"
              onClick={onFilterClick || handleFilterClick}
              sx={{
                p: 0.5,
                color: hasActiveFilter ? '#BE5953' : '#B0A8A2',
                '&:hover': { color: '#BE5953', backgroundColor: 'rgba(190,89,83,0.08)' },
              }}
            >
              <TuneIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </>
        )}
      </Paper>

      {filters.length > 0 && (
        <Popper
          open={showFilters}
          anchorEl={anchorEl}
          placement="bottom-end"
          transition
          sx={{ zIndex: 1300 }}
        >
          {({ TransitionProps }) => (
            <Fade {...TransitionProps} timeout={200}>
              <ClickAwayListener onClickAway={() => setShowFilters(false)}>
                <Paper
                  elevation={0}
                  sx={{
                    mt: 1,
                    p: 1.5,
                    borderRadius: 2,
                    border: '1px solid #EDE0D8',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
                    minWidth: 180,
                    backgroundColor: '#FFFFFF',
                  }}
                >
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
                    {filters.map((filter) => (
                      <Chip
                        key={filter.value}
                        label={filter.label}
                        size="small"
                        onClick={() => onFilterToggle?.(filter.value)}
                        sx={{
                          cursor: 'pointer',
                          fontWeight: 600,
                          fontSize: '0.75rem',
                          borderRadius: 1.5,
                          ...(filter.active
                            ? {
                                backgroundColor: '#BE5953',
                                color: '#FFFFFF',
                                '&:hover': { backgroundColor: '#8E3830' },
                              }
                            : {
                                backgroundColor: 'rgba(190,89,83,0.08)',
                                color: '#BE5953',
                                border: '1px solid rgba(190,89,83,0.2)',
                                '&:hover': { backgroundColor: 'rgba(190,89,83,0.14)' },
                              }),
                        }}
                      />
                    ))}
                  </Box>
                </Paper>
              </ClickAwayListener>
            </Fade>
          )}
        </Popper>
      )}
    </Box>
  );
};

export default SearchBar;

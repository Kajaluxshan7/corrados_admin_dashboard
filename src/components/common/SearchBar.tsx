import React, { useState } from 'react';
import {
  Paper,
  InputBase,
  IconButton,
  Box,
  Fade,
} from '@mui/material';
import {
  Search as SearchIcon,
  Clear as ClearIcon,
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
  fullWidth = false,
}) => {
  const [focused, setFocused] = useState(false);

  return (
    <Box sx={{ width: fullWidth ? '100%' : 'auto' }}>
      <Paper
        elevation={0}
        sx={{
          display: 'flex',
          alignItems: 'center',
          width: fullWidth ? '100%' : { xs: '100%', sm: 280 },
          height: 36,
          px: '10px',
          borderRadius: '2px',
          border: focused ? '1px solid #BE5953' : '1px solid #CDD0D4',
          backgroundColor: '#FFFFFF',
          boxShadow: focused ? '0 0 0 2px rgba(190,89,83,0.15)' : 'none',
          transition: 'border-color 100ms ease, box-shadow 100ms ease',
          '&:hover': {
            borderColor: focused ? '#BE5953' : '#A7AAAD',
          },
        }}
      >
        <SearchIcon
          sx={{
            color: '#787C82',
            mr: '8px',
            fontSize: 18,
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
            color: '#1D2327',
            '& input::placeholder': { color: '#A7AAAD', opacity: 1 },
          }}
        />
        {value && (
          <Fade in>
            <IconButton
              size="small"
              onClick={() => onChange('')}
              sx={{
                color: '#787C82',
                p: '2px',
                borderRadius: '2px',
                '&:hover': { color: '#1D2327', backgroundColor: '#F0F0F1' },
              }}
            >
              <ClearIcon sx={{ fontSize: 14 }} />
            </IconButton>
          </Fade>
        )}
      </Paper>
    </Box>
  );
};

export default SearchBar;

import React, { useState } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  IconButton,
  Chip,
  Tooltip,
  Skeleton,
} from '@mui/material';
import FolderIcon from '@mui/icons-material/Folder';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import type { PrimaryCategory, MenuCategory, MenuItem } from './types';
import { getImageUrl } from '../../utils/uploadHelpers';

interface Props {
  primaryCategories: PrimaryCategory[];
  categories: MenuCategory[];
  menuItems: MenuItem[];
  loading: boolean;
  onEnter: (pc: PrimaryCategory) => void;
  onEdit: (pc: PrimaryCategory) => void;
  onDelete: (pc: PrimaryCategory) => void;
  onMove: (id: string, direction: 'up' | 'down') => void;
  onAdd: () => void;
}

export const PrimaryCategoriesView: React.FC<Props> = ({
  primaryCategories,
  categories,
  menuItems,
  loading,
  onEnter,
  onEdit,
  onDelete,
  onMove,
  onAdd,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = primaryCategories.filter(
    (pc) =>
      pc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pc.description.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const totalCategories = categories.length;
  const totalItems = menuItems.length;
  const activeCount = primaryCategories.filter((pc) => pc.isActive).length;

  const skeletonCards = Array.from({ length: 6 });

  return (
    <Box>
      {/* Toolbar */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          mb: 3,
          flexWrap: 'wrap',
        }}
      >
        <TextField
          size="small"
          placeholder="Search primary categories..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ flex: 1, maxWidth: 360 }}
        />
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            flexWrap: 'wrap',
          }}
        >
          <Chip
            label={`${primaryCategories.length} total`}
            size="small"
            sx={{ bgcolor: '#F0F0F1', color: '#50575E', fontSize: '0.75rem' }}
          />
          <Chip
            label={`${activeCount} active`}
            size="small"
            sx={{ bgcolor: '#EEF7EE', color: '#00A32A', fontSize: '0.75rem' }}
          />
          <Chip
            label={`${totalCategories} categories`}
            size="small"
            sx={{ bgcolor: '#EEF5FA', color: '#0073AA', fontSize: '0.75rem' }}
          />
          <Chip
            label={`${totalItems} items`}
            size="small"
            sx={{ bgcolor: '#F5E9E8', color: '#BE5953', fontSize: '0.75rem' }}
          />
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={onAdd}
          sx={{
            bgcolor: '#BE5953',
            color: '#fff',
            fontWeight: 600,
            textTransform: 'none',
            boxShadow: 'none',
            '&:hover': { bgcolor: '#9A413C', boxShadow: 'none' },
          }}
        >
          Add Primary Category
        </Button>
      </Box>

      {/* Loading skeletons */}
      {loading && (
        <Grid container spacing={2.5}>
          {skeletonCards.map((_, i) => (
            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={i}>
              <Skeleton
                variant="rectangular"
                height={280}
                sx={{ borderRadius: '6px' }}
              />
            </Grid>
          ))}
        </Grid>
      )}

      {/* Empty state */}
      {!loading && filtered.length === 0 && (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            py: 10,
            gap: 2,
          }}
        >
          <FolderIcon sx={{ fontSize: 64, color: '#CDD0D4' }} />
          <Typography fontWeight={600} fontSize="1rem" color="#50575E">
            {searchTerm
              ? 'No primary categories match your search'
              : 'No primary categories yet'}
          </Typography>
          <Typography fontSize="0.875rem" color="#787C82">
            {searchTerm
              ? 'Try a different search term'
              : 'Get started by adding your first primary category'}
          </Typography>
          {!searchTerm && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={onAdd}
              sx={{
                bgcolor: '#BE5953',
                color: '#fff',
                fontWeight: 600,
                textTransform: 'none',
                boxShadow: 'none',
                mt: 1,
                '&:hover': { bgcolor: '#9A413C', boxShadow: 'none' },
              }}
            >
              Add Primary Category
            </Button>
          )}
        </Box>
      )}

      {/* Cards grid */}
      {!loading && filtered.length > 0 && (
        <Grid container spacing={2.5}>
          {filtered.map((pc, index) => {
            const catCount = categories.filter(
              (c) => c.primaryCategoryId === pc.id,
            ).length;
            const itemCount = menuItems.filter((item) => {
              const cat = categories.find((c) => c.id === item.categoryId);
              return cat?.primaryCategoryId === pc.id;
            }).length;
            const imgSrc = pc.imageUrl ? getImageUrl(pc.imageUrl) : null;

            return (
              <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={pc.id}>
                <Card
                  onClick={() => onEnter(pc)}
                  sx={{
                    cursor: 'pointer',
                    bgcolor: '#FFFFFF',
                    border: '1px solid #E2E4E7',
                    borderRadius: '6px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                    transition:
                      'box-shadow 0.18s ease, border-color 0.18s ease, transform 0.18s ease',
                    '&:hover': {
                      boxShadow: '0 4px 14px rgba(0,0,0,0.12)',
                      borderColor: '#BE5953',
                      transform: 'translateY(-1px)',
                    },
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden',
                  }}
                  elevation={0}
                >
                  {/* Image section */}
                  <Box
                    sx={{
                      height: 160,
                      bgcolor: '#F6F7F7',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      position: 'relative',
                      overflow: 'hidden',
                    }}
                  >
                    {imgSrc ? (
                      <Box
                        component="img"
                        src={imgSrc}
                        alt={pc.name}
                        sx={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                        }}
                      />
                    ) : (
                      <FolderIcon sx={{ fontSize: 52, color: '#CDD0D4' }} />
                    )}
                    {/* Active/Inactive badge */}
                    <Box
                      sx={{
                        position: 'absolute',
                        top: 8,
                        right: 8,
                      }}
                    >
                      <Chip
                        label={pc.isActive ? 'Active' : 'Inactive'}
                        size="small"
                        sx={{
                          bgcolor: pc.isActive ? '#EEF7EE' : '#F0F0F1',
                          color: pc.isActive ? '#00A32A' : '#787C82',
                          border: `1px solid ${pc.isActive ? '#B3DFBB' : '#CDD0D4'}`,
                          fontWeight: 600,
                          fontSize: '0.6875rem',
                          height: 22,
                        }}
                      />
                    </Box>
                  </Box>

                  {/* Card content */}
                  <CardContent sx={{ p: 2, pb: '12px !important', flex: 1 }}>
                    <Typography
                      fontWeight={700}
                      fontSize="0.9375rem"
                      color="#1D2327"
                      noWrap
                      sx={{ mb: 0.5 }}
                    >
                      {pc.name}
                    </Typography>
                    <Typography
                      fontSize="0.8125rem"
                      color="#787C82"
                      sx={{
                        mb: 1.5,
                        minHeight: '2.4em',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}
                    >
                      {pc.description || '\u00A0'}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap' }}>
                      <Chip
                        label={`${catCount} categories`}
                        size="small"
                        sx={{
                          bgcolor: '#EEF5FA',
                          color: '#0073AA',
                          fontSize: '0.75rem',
                          height: 22,
                          fontWeight: 500,
                        }}
                      />
                      <Chip
                        label={`${itemCount} items`}
                        size="small"
                        sx={{
                          bgcolor: '#F5E9E8',
                          color: '#BE5953',
                          fontSize: '0.75rem',
                          height: 22,
                          fontWeight: 500,
                        }}
                      />
                    </Box>
                  </CardContent>

                  {/* Card footer */}
                  <Box
                    sx={{
                      px: 2,
                      py: 1,
                      borderTop: '1px solid #F0F0F1',
                      bgcolor: '#FAFAFA',
                      display: 'flex',
                      alignItems: 'center',
                    }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Tooltip title="Move up">
                      <span>
                        <IconButton
                          size="small"
                          disabled={index === 0}
                          onClick={() => onMove(pc.id, 'up')}
                          sx={{ color: '#787C82' }}
                        >
                          <ArrowUpwardIcon fontSize="small" />
                        </IconButton>
                      </span>
                    </Tooltip>
                    <Tooltip title="Move down">
                      <span>
                        <IconButton
                          size="small"
                          disabled={index === filtered.length - 1}
                          onClick={() => onMove(pc.id, 'down')}
                          sx={{ color: '#787C82' }}
                        >
                          <ArrowDownwardIcon fontSize="small" />
                        </IconButton>
                      </span>
                    </Tooltip>
                    <Box sx={{ flex: 1 }} />
                    <Tooltip title="Edit">
                      <IconButton
                        size="small"
                        onClick={() => onEdit(pc)}
                        sx={{
                          color: '#787C82',
                          '&:hover': { color: '#BE5953', bgcolor: '#F5E9E8' },
                        }}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton
                        size="small"
                        onClick={() => onDelete(pc)}
                        sx={{
                          color: '#787C82',
                          '&:hover': { color: '#D63638', bgcolor: '#FCEEEE' },
                        }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Browse categories">
                      <IconButton
                        size="small"
                        onClick={() => onEnter(pc)}
                        sx={{
                          ml: 0.5,
                          bgcolor: '#BE5953',
                          color: '#fff',
                          '&:hover': { bgcolor: '#9A413C' },
                        }}
                      >
                        <ChevronRightIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}
    </Box>
  );
};

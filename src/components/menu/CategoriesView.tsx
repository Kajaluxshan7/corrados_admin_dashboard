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
import CategoryIcon from '@mui/icons-material/Category';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import type { PrimaryCategory, MenuCategory, MenuItem } from './types';
import { getImageUrl } from '../../utils/uploadHelpers';

interface Props {
  primaryCategory: PrimaryCategory;
  categories: MenuCategory[];
  menuItems: MenuItem[];
  loading: boolean;
  onEnter: (cat: MenuCategory) => void;
  onEdit: (cat: MenuCategory) => void;
  onDelete: (cat: MenuCategory) => void;
  onMove: (id: string, direction: 'up' | 'down') => void;
  onAdd: () => void;
}

export const CategoriesView: React.FC<Props> = ({
  primaryCategory,
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

  const filtered = categories.filter(
    (cat) =>
      cat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cat.description.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const activeCount = categories.filter((c) => c.isActive).length;
  const totalItems = menuItems.filter((item) =>
    categories.some((c) => c.id === item.categoryId),
  ).length;

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
          placeholder="Search categories..."
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
            label={`${categories.length} total`}
            size="small"
            sx={{ bgcolor: '#F0F0F1', color: '#50575E', fontSize: '0.75rem' }}
          />
          <Chip
            label={`${activeCount} active`}
            size="small"
            sx={{ bgcolor: '#EEF7EE', color: '#00A32A', fontSize: '0.75rem' }}
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
          Add Category
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
          <CategoryIcon sx={{ fontSize: 64, color: '#CDD0D4' }} />
          <Typography fontWeight={600} fontSize="1rem" color="#50575E">
            {searchTerm
              ? 'No categories match your search'
              : `No categories in ${primaryCategory.name} yet`}
          </Typography>
          <Typography fontSize="0.875rem" color="#787C82">
            {searchTerm
              ? 'Try a different search term'
              : 'Get started by adding your first category'}
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
              Add Category
            </Button>
          )}
        </Box>
      )}

      {/* Cards grid */}
      {!loading && filtered.length > 0 && (
        <Grid container spacing={2.5}>
          {filtered.map((cat, index) => {
            const itemCount = menuItems.filter(
              (item) => item.categoryId === cat.id,
            ).length;
            const imgSrc = cat.imageUrl ? getImageUrl(cat.imageUrl) : null;

            return (
              <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={cat.id}>
                <Card
                  onClick={() => onEnter(cat)}
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
                        alt={cat.name}
                        sx={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                        }}
                      />
                    ) : (
                      <CategoryIcon sx={{ fontSize: 52, color: '#CDD0D4' }} />
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
                        label={cat.isActive ? 'Active' : 'Inactive'}
                        size="small"
                        sx={{
                          bgcolor: cat.isActive ? '#EEF7EE' : '#F0F0F1',
                          color: cat.isActive ? '#00A32A' : '#787C82',
                          border: `1px solid ${cat.isActive ? '#B3DFBB' : '#CDD0D4'}`,
                          fontWeight: 600,
                          fontSize: '0.6875rem',
                          height: 22,
                        }}
                      />
                    </Box>
                  </Box>

                  {/* Card content */}
                  <CardContent sx={{ p: 2, pb: '12px !important', flex: 1 }}>
                    {/* Primary category chip above name */}
                    <Chip
                      label={cat.primaryCategory?.name || primaryCategory.name}
                      size="small"
                      sx={{
                        bgcolor: '#F5E9E8',
                        color: '#BE5953',
                        fontSize: '0.6875rem',
                        height: 20,
                        fontWeight: 600,
                        mb: 0.75,
                      }}
                    />
                    <Typography
                      fontWeight={700}
                      fontSize="0.9375rem"
                      color="#1D2327"
                      noWrap
                      sx={{ mb: 0.5 }}
                    >
                      {cat.name}
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
                      {cat.description || '\u00A0'}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap' }}>
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
                          onClick={() => onMove(cat.id, 'up')}
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
                          onClick={() => onMove(cat.id, 'down')}
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
                        onClick={() => onEdit(cat)}
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
                        onClick={() => onDelete(cat)}
                        sx={{
                          color: '#787C82',
                          '&:hover': { color: '#D63638', bgcolor: '#FCEEEE' },
                        }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Browse items">
                      <IconButton
                        size="small"
                        onClick={() => onEnter(cat)}
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

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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from '@mui/material';
import FolderIcon from '@mui/icons-material/Folder';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import GridViewIcon from '@mui/icons-material/GridView';
import TableRowsIcon from '@mui/icons-material/TableRows';
import type { PrimaryCategory, MenuCategory, MenuItem } from './types';
import { getImageUrl } from '../../utils/uploadHelpers';

interface Props {
  primaryCategories: PrimaryCategory[];
  categories: MenuCategory[];
  menuItems: MenuItem[];
  loading: boolean;
  viewMode: 'grid' | 'table';
  onViewModeChange: (mode: 'grid' | 'table') => void;
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
  viewMode,
  onViewModeChange,
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

  const statusChip = (isActive: boolean) => (
    <Chip
      label={isActive ? 'Active' : 'Inactive'}
      size="small"
      sx={{
        bgcolor: isActive ? '#EEF7EE' : '#F0F0F1',
        color: isActive ? '#00A32A' : '#787C82',
        border: `1px solid ${isActive ? '#B3DFBB' : '#CDD0D4'}`,
        fontWeight: 600,
        fontSize: '0.6875rem',
        height: 22,
        borderRadius: '2px',
      }}
    />
  );

  return (
    <Box>
      {/* Toolbar */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <TextField
          size="small"
          placeholder="Search primary categories..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ flex: 1, maxWidth: 360 }}
        />
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
          <Chip label={`${primaryCategories.length} total`} size="small" sx={{ bgcolor: '#F0F0F1', color: '#50575E', fontSize: '0.75rem' }} />
          <Chip label={`${activeCount} active`} size="small" sx={{ bgcolor: '#EEF7EE', color: '#00A32A', fontSize: '0.75rem' }} />
          <Chip label={`${totalCategories} categories`} size="small" sx={{ bgcolor: '#EEF5FA', color: '#0073AA', fontSize: '0.75rem' }} />
          <Chip label={`${totalItems} items`} size="small" sx={{ bgcolor: '#F5E9E8', color: '#BE5953', fontSize: '0.75rem' }} />
        </Box>
        {/* View toggle */}
        <Box sx={{ display: 'flex', border: '1px solid #E2E4E7', borderRadius: '2px', overflow: 'hidden' }}>
          <Tooltip title="Grid view">
            <IconButton
              size="small"
              onClick={() => onViewModeChange('grid')}
              sx={{ borderRadius: 0, px: 1, bgcolor: viewMode === 'grid' ? '#BE5953' : 'transparent', color: viewMode === 'grid' ? '#fff' : '#50575E', '&:hover': { bgcolor: viewMode === 'grid' ? '#A84E48' : '#F6F7F7' } }}
            >
              <GridViewIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Table view">
            <IconButton
              size="small"
              onClick={() => onViewModeChange('table')}
              sx={{ borderRadius: 0, px: 1, bgcolor: viewMode === 'table' ? '#BE5953' : 'transparent', color: viewMode === 'table' ? '#fff' : '#50575E', '&:hover': { bgcolor: viewMode === 'table' ? '#A84E48' : '#F6F7F7' } }}
            >
              <TableRowsIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={onAdd}
          sx={{ bgcolor: '#BE5953', color: '#fff', fontWeight: 700, textTransform: 'none', boxShadow: 'none', borderRadius: '2px', '&:hover': { bgcolor: '#A84E48', boxShadow: 'none' } }}
        >
          Add Primary Category
        </Button>
      </Box>

      {/* Loading */}
      {loading && viewMode === 'grid' && (
        <Grid container spacing={2.5}>
          {skeletonCards.map((_, i) => (
            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={i}>
              <Skeleton variant="rectangular" height={280} sx={{ borderRadius: '2px' }} />
            </Grid>
          ))}
        </Grid>
      )}
      {loading && viewMode === 'table' && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {skeletonCards.map((_, i) => <Skeleton key={i} variant="rectangular" height={56} sx={{ borderRadius: '2px' }} />)}
        </Box>
      )}

      {/* Empty state */}
      {!loading && filtered.length === 0 && (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', py: 10, gap: 2 }}>
          <FolderIcon sx={{ fontSize: 64, color: '#CDD0D4' }} />
          <Typography fontWeight={600} fontSize="1rem" color="#50575E">
            {searchTerm ? 'No primary categories match your search' : 'No primary categories yet'}
          </Typography>
          <Typography fontSize="0.875rem" color="#787C82">
            {searchTerm ? 'Try a different search term' : 'Get started by adding your first primary category'}
          </Typography>
          {!searchTerm && (
            <Button variant="contained" startIcon={<AddIcon />} onClick={onAdd}
              sx={{ bgcolor: '#BE5953', color: '#fff', fontWeight: 700, textTransform: 'none', boxShadow: 'none', borderRadius: '2px', mt: 1, '&:hover': { bgcolor: '#A84E48', boxShadow: 'none' } }}>
              Add Primary Category
            </Button>
          )}
        </Box>
      )}

      {/* Grid view */}
      {!loading && filtered.length > 0 && viewMode === 'grid' && (
        <Grid container spacing={2.5}>
          {filtered.map((pc, index) => {
            const catCount = categories.filter((c) => c.primaryCategoryId === pc.id).length;
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
                    borderRadius: '2px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                    transition: 'box-shadow 0.18s ease, border-color 0.18s ease, transform 0.18s ease',
                    '&:hover': { boxShadow: '0 4px 14px rgba(0,0,0,0.12)', borderColor: '#BE5953', transform: 'translateY(-1px)' },
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden',
                  }}
                  elevation={0}
                >
                  {/* Image */}
                  <Box sx={{ height: 160, bgcolor: '#F6F7F7', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
                    {imgSrc ? (
                      <Box component="img" src={imgSrc} alt={pc.name} sx={{ width: '100%', height: '100%', objectFit: 'contain', p: 1 }} />
                    ) : (
                      <FolderIcon sx={{ fontSize: 52, color: '#CDD0D4' }} />
                    )}
                    <Box sx={{ position: 'absolute', top: 8, right: 8 }}>
                      {statusChip(pc.isActive)}
                    </Box>
                  </Box>

                  <CardContent sx={{ p: 2, pb: '12px !important', flex: 1 }}>
                    <Typography fontWeight={700} fontSize="0.9375rem" color="#1D2327" noWrap sx={{ mb: 0.5 }}>{pc.name}</Typography>
                    <Typography fontSize="0.8125rem" color="#787C82"
                      sx={{ mb: 1.5, minHeight: '2.4em', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {pc.description || '\u00A0'}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap' }}>
                      <Chip label={`${catCount} categories`} size="small" sx={{ bgcolor: '#EEF5FA', color: '#0073AA', fontSize: '0.75rem', height: 22, fontWeight: 500 }} />
                      <Chip label={`${itemCount} items`} size="small" sx={{ bgcolor: '#F5E9E8', color: '#BE5953', fontSize: '0.75rem', height: 22, fontWeight: 500 }} />
                    </Box>
                  </CardContent>

                  <Box sx={{ px: 2, py: 1, borderTop: '1px solid #F0F0F1', bgcolor: '#FAFAFA', display: 'flex', alignItems: 'center' }} onClick={(e) => e.stopPropagation()}>
                    <Tooltip title="Move up"><span>
                      <IconButton size="small" disabled={index === 0} onClick={() => onMove(pc.id, 'up')} sx={{ color: '#787C82' }}><ArrowUpwardIcon fontSize="small" /></IconButton>
                    </span></Tooltip>
                    <Tooltip title="Move down"><span>
                      <IconButton size="small" disabled={index === filtered.length - 1} onClick={() => onMove(pc.id, 'down')} sx={{ color: '#787C82' }}><ArrowDownwardIcon fontSize="small" /></IconButton>
                    </span></Tooltip>
                    <Box sx={{ flex: 1 }} />
                    <Tooltip title="Edit">
                      <IconButton size="small" onClick={() => onEdit(pc)} sx={{ color: '#787C82', '&:hover': { color: '#BE5953', bgcolor: '#F5E9E8' } }}><EditIcon fontSize="small" /></IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton size="small" onClick={() => onDelete(pc)} sx={{ color: '#787C82', '&:hover': { color: '#D63638', bgcolor: '#FCEEEE' } }}><DeleteIcon fontSize="small" /></IconButton>
                    </Tooltip>
                    <Tooltip title="Browse categories">
                      <IconButton size="small" onClick={() => onEnter(pc)} sx={{ ml: 0.5, bgcolor: '#BE5953', color: '#fff', '&:hover': { bgcolor: '#A84E48' } }}><ChevronRightIcon fontSize="small" /></IconButton>
                    </Tooltip>
                  </Box>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}

      {/* Table view */}
      {!loading && filtered.length > 0 && viewMode === 'table' && (
        <Box sx={{ bgcolor: '#FFFFFF', border: '1px solid #E2E4E7', borderRadius: '2px', overflow: 'hidden' }}>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: '#F6F7F7' }}>
                <TableCell sx={{ fontWeight: 700, fontSize: '0.72rem', color: '#50575E', textTransform: 'uppercase', letterSpacing: '0.05em', py: 1.5, width: 64 }}>Image</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: '0.72rem', color: '#50575E', textTransform: 'uppercase', letterSpacing: '0.05em', py: 1.5 }}>Name</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: '0.72rem', color: '#50575E', textTransform: 'uppercase', letterSpacing: '0.05em', py: 1.5 }}>Description</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: '0.72rem', color: '#50575E', textTransform: 'uppercase', letterSpacing: '0.05em', py: 1.5, width: 100 }}>Categories</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: '0.72rem', color: '#50575E', textTransform: 'uppercase', letterSpacing: '0.05em', py: 1.5, width: 80 }}>Items</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: '0.72rem', color: '#50575E', textTransform: 'uppercase', letterSpacing: '0.05em', py: 1.5, width: 90 }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: '0.72rem', color: '#50575E', textTransform: 'uppercase', letterSpacing: '0.05em', py: 1.5, width: 140 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.map((pc, index) => {
                const catCount = categories.filter((c) => c.primaryCategoryId === pc.id).length;
                const itemCount = menuItems.filter((item) => {
                  const cat = categories.find((c) => c.id === item.categoryId);
                  return cat?.primaryCategoryId === pc.id;
                }).length;
                const imgSrc = pc.imageUrl ? getImageUrl(pc.imageUrl) : null;

                return (
                  <TableRow
                    key={pc.id}
                    sx={{
                      borderLeft: '3px solid',
                      borderLeftColor: pc.isActive ? '#BE5953' : 'transparent',
                      '&:hover': { bgcolor: 'rgba(190,89,83,0.03)' },
                      cursor: 'pointer',
                    }}
                    onClick={() => onEnter(pc)}
                  >
                    <TableCell sx={{ py: 1 }}>
                      <Box sx={{ width: 48, height: 48, bgcolor: '#F6F7F7', borderRadius: '2px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                        {imgSrc
                          ? <Box component="img" src={imgSrc} alt={pc.name} sx={{ width: '100%', height: '100%', objectFit: 'contain', p: 0.25 }} />
                          : <FolderIcon sx={{ fontSize: 22, color: '#CDD0D4' }} />}
                      </Box>
                    </TableCell>
                    <TableCell sx={{ py: 1 }}>
                      <Typography fontWeight={700} fontSize="0.875rem" color="#1D2327">{pc.name}</Typography>
                    </TableCell>
                    <TableCell sx={{ py: 1, maxWidth: 240 }}>
                      <Typography fontSize="0.8125rem" color="#50575E" sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {pc.description || <Box component="span" sx={{ color: '#A7AAAD', fontStyle: 'italic' }}>No description</Box>}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ py: 1 }}>
                      <Chip label={catCount} size="small" sx={{ bgcolor: '#EEF5FA', color: '#0073AA', fontWeight: 700, fontSize: '0.75rem' }} />
                    </TableCell>
                    <TableCell sx={{ py: 1 }}>
                      <Chip label={itemCount} size="small" sx={{ bgcolor: '#F5E9E8', color: '#BE5953', fontWeight: 700, fontSize: '0.75rem' }} />
                    </TableCell>
                    <TableCell sx={{ py: 1 }}>{statusChip(pc.isActive)}</TableCell>
                    <TableCell sx={{ py: 1 }} onClick={(e) => e.stopPropagation()}>
                      <Box sx={{ display: 'flex', gap: 0.25, alignItems: 'center' }}>
                        <Tooltip title="Move up"><span>
                          <IconButton size="small" disabled={index === 0} onClick={() => onMove(pc.id, 'up')} sx={{ color: '#787C82' }}><ArrowUpwardIcon sx={{ fontSize: 16 }} /></IconButton>
                        </span></Tooltip>
                        <Tooltip title="Move down"><span>
                          <IconButton size="small" disabled={index === filtered.length - 1} onClick={() => onMove(pc.id, 'down')} sx={{ color: '#787C82' }}><ArrowDownwardIcon sx={{ fontSize: 16 }} /></IconButton>
                        </span></Tooltip>
                        <Tooltip title="Edit">
                          <IconButton size="small" onClick={() => onEdit(pc)} sx={{ color: '#BE5953', '&:hover': { bgcolor: 'rgba(190,89,83,0.08)' } }}><EditIcon sx={{ fontSize: 16 }} /></IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton size="small" onClick={() => onDelete(pc)} sx={{ color: '#D63638', '&:hover': { bgcolor: 'rgba(214,54,56,0.08)' } }}><DeleteIcon sx={{ fontSize: 16 }} /></IconButton>
                        </Tooltip>
                        <Tooltip title="Browse categories">
                          <IconButton size="small" onClick={() => onEnter(pc)} sx={{ bgcolor: '#BE5953', color: '#fff', '&:hover': { bgcolor: '#A84E48' } }}><ChevronRightIcon sx={{ fontSize: 16 }} /></IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Box>
      )}
    </Box>
  );
};

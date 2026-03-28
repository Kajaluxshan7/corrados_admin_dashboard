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
  FormControl,
  Select,
  MenuItem as MuiMenuItem,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Switch,
} from '@mui/material';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import RestaurantMenuIcon from '@mui/icons-material/RestaurantMenu';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import GridViewIcon from '@mui/icons-material/GridView';
import TableRowsIcon from '@mui/icons-material/TableRows';
import type { MenuCategory, MenuItem } from './types';
import { getImageUrl } from '../../utils/uploadHelpers';

interface Props {
  category: MenuCategory;
  items: MenuItem[];
  loading: boolean;
  viewMode: 'grid' | 'table';
  onViewModeChange: (mode: 'grid' | 'table') => void;
  onEdit: (item: MenuItem) => void;
  onDelete: (item: MenuItem) => void;
  onMove: (id: string, direction: 'up' | 'down') => void;
  onToggleAvailability: (item: MenuItem) => void;
  onAdd: () => void;
}

export const MenuItemsView: React.FC<Props> = ({
  category,
  items,
  loading,
  viewMode,
  onViewModeChange,
  onEdit,
  onDelete,
  onMove,
  onToggleAvailability,
  onAdd,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAvailability, setFilterAvailability] = useState<'all' | 'available' | 'unavailable'>('all');

  const filtered = items.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.categoryName || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesAvailability =
      filterAvailability === 'all' ? true :
      filterAvailability === 'available' ? item.isAvailable : !item.isAvailable;
    return matchesSearch && matchesAvailability;
  });

  const availableCount = items.filter((i) => i.isAvailable).length;
  const unavailableCount = items.filter((i) => !i.isAvailable).length;
  const skeletonCards = Array.from({ length: 6 });

  const availabilitySwitch = (item: MenuItem) => (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }} onClick={(e) => e.stopPropagation()}>
      <Switch
        size="small"
        checked={item.isAvailable}
        onChange={() => onToggleAvailability(item)}
        sx={{ '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: '#00A32A', opacity: 1 } }}
        onClick={(e) => e.stopPropagation()}
      />
      <Typography sx={{ fontSize: '0.6875rem', fontWeight: 600, color: item.isAvailable ? '#00A32A' : '#787C82', whiteSpace: 'nowrap' }}>
        {item.isAvailable ? 'Available' : 'Unavailable'}
      </Typography>
    </Box>
  );

  const dietaryBadges = (item: MenuItem) => (
    <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
      {item.dietaryInfo?.includes('vegetarian') && (
        <Box sx={{ width: 22, height: 22, borderRadius: '50%', bgcolor: '#00A32A', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '0.625rem', fontWeight: 700 }} title="Vegetarian">V</Box>
      )}
      {item.dietaryInfo?.includes('vegan') && (
        <Box sx={{ width: 22, height: 22, borderRadius: '50%', bgcolor: '#00A32A', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '0.625rem', fontWeight: 700 }} title="Vegan">Ve</Box>
      )}
      {item.dietaryInfo?.includes('glutenFree') && (
        <Box sx={{ width: 22, height: 22, borderRadius: '50%', bgcolor: '#BE5953', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '0.625rem', fontWeight: 700 }} title="Gluten-Free">GF</Box>
      )}
      {item.dietaryInfo?.includes('dairyFree') && (
        <Box sx={{ width: 22, height: 22, borderRadius: '50%', bgcolor: '#BE5953', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '0.625rem', fontWeight: 700 }} title="Dairy-Free">DF</Box>
      )}
    </Box>
  );

  const priceDisplay = (item: MenuItem) => {
    if (item.hasMeasurements && item.measurements && item.measurements.length > 0) {
      return (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
          {item.measurements.slice(0, 3).map((m, mIdx) => (
            <Chip key={mIdx} label={`$${Number(m.price).toFixed(2)}`} size="small"
              sx={{ fontSize: '0.6875rem', height: 20, bgcolor: '#F0F0F1', color: '#50575E', borderRadius: '2px' }} />
          ))}
          {item.measurements.length > 3 && (
            <Chip label={`+${item.measurements.length - 3}`} size="small"
              sx={{ fontSize: '0.6875rem', height: 20, bgcolor: '#F0F0F1', color: '#787C82', borderRadius: '2px' }} />
          )}
        </Box>
      );
    }
    return <Typography fontWeight={700} fontSize="0.9375rem" color="#00A32A">${Number(item.price).toFixed(2)}</Typography>;
  };

  return (
    <Box>
      {/* Toolbar */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <TextField
          size="small"
          placeholder="Search menu items..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ flex: 1, maxWidth: 360 }}
        />
        <FormControl size="small" sx={{ minWidth: 140 }}>
          <Select value={filterAvailability} onChange={(e) => setFilterAvailability(e.target.value as 'all' | 'available' | 'unavailable')} displayEmpty>
            <MuiMenuItem value="all">All Items</MuiMenuItem>
            <MuiMenuItem value="available">Available Only</MuiMenuItem>
            <MuiMenuItem value="unavailable">Unavailable</MuiMenuItem>
          </Select>
        </FormControl>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
          <Chip label={`${items.length} total`} size="small" sx={{ bgcolor: '#F0F0F1', color: '#50575E', fontSize: '0.75rem' }} />
          <Chip label={`${availableCount} available`} size="small" sx={{ bgcolor: '#EEF7EE', color: '#00A32A', fontSize: '0.75rem' }} />
          <Chip label={`${unavailableCount} unavailable`} size="small" sx={{ bgcolor: '#FCEEEE', color: '#D63638', fontSize: '0.75rem' }} />
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
          Add Item
        </Button>
      </Box>

      {/* Loading */}
      {loading && viewMode === 'grid' && (
        <Grid container spacing={2.5}>
          {skeletonCards.map((_, i) => (
            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={i}>
              <Skeleton variant="rectangular" height={300} sx={{ borderRadius: '2px' }} />
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
          <RestaurantIcon sx={{ fontSize: 64, color: '#CDD0D4' }} />
          <Typography fontWeight={600} fontSize="1rem" color="#50575E">
            {searchTerm || filterAvailability !== 'all' ? 'No items match your filters' : `No items in ${category.name} yet`}
          </Typography>
          <Typography fontSize="0.875rem" color="#787C82">
            {searchTerm || filterAvailability !== 'all' ? 'Try adjusting your search or filters' : 'Get started by adding your first menu item'}
          </Typography>
          {!searchTerm && filterAvailability === 'all' && (
            <Button variant="contained" startIcon={<AddIcon />} onClick={onAdd}
              sx={{ bgcolor: '#BE5953', color: '#fff', fontWeight: 700, textTransform: 'none', boxShadow: 'none', borderRadius: '2px', mt: 1, '&:hover': { bgcolor: '#A84E48', boxShadow: 'none' } }}>
              Add Item
            </Button>
          )}
        </Box>
      )}

      {/* Grid view */}
      {!loading && filtered.length > 0 && viewMode === 'grid' && (
        <Grid container spacing={2.5}>
          {filtered.map((item, index) => {
            const imgSrc = item.imageUrls && item.imageUrls.length > 0 ? getImageUrl(item.imageUrls[0]) : null;
            const extraImageCount = item.imageUrls && item.imageUrls.length > 1 ? item.imageUrls.length - 1 : 0;

            return (
              <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={item.id}>
                <Card
                  sx={{
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
                      <Box component="img" src={imgSrc} alt={item.name} sx={{ width: '100%', height: '100%', objectFit: 'contain', p: 1 }} />
                    ) : (
                      <RestaurantMenuIcon sx={{ fontSize: 52, color: '#CDD0D4' }} />
                    )}
                    {extraImageCount > 0 && (
                      <Box sx={{ position: 'absolute', bottom: 8, left: 8, bgcolor: 'rgba(0,0,0,0.55)', color: '#fff', fontSize: '0.6875rem', fontWeight: 700, px: 0.75, py: 0.25, borderRadius: '2px' }}>
                        +{extraImageCount}
                      </Box>
                    )}
                    {/* Availability toggle top-right */}
                    <Box
                      sx={{ position: 'absolute', top: 8, right: 8, display: 'flex', alignItems: 'center' }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      {availabilitySwitch(item)}
                    </Box>
                  </Box>

                  <CardContent sx={{ px: 2, pt: 1.5, pb: 0.5, flex: 1 }}>
                    <Typography fontWeight={700} fontSize="0.9375rem" color="#1D2327" noWrap sx={{ mb: 0.5 }}>{item.name}</Typography>
                    <Box sx={{ mb: 1 }}>{priceDisplay(item)}</Box>
                    <Box sx={{ mb: 0.75 }}>{dietaryBadges(item)}</Box>
                    {item.allergens && item.allergens.length > 0 && (
                      <Typography fontSize="0.6875rem" color="#787C82" noWrap sx={{ mb: 0.5 }}>Contains: {item.allergens.join(', ')}</Typography>
                    )}
                    {item.preparationTime && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                        <AccessTimeIcon sx={{ fontSize: 14, color: '#787C82' }} />
                        <Typography fontSize="0.75rem" color="#787C82">{item.preparationTime} min</Typography>
                      </Box>
                    )}
                  </CardContent>

                  <Box sx={{ px: 2, py: 1, borderTop: '1px solid #F0F0F1', bgcolor: '#FAFAFA', display: 'flex', alignItems: 'center' }} onClick={(e) => e.stopPropagation()}>
                    <Tooltip title="Move up"><span>
                      <IconButton size="small" disabled={index === 0} onClick={() => onMove(item.id, 'up')} sx={{ color: '#787C82' }}><ArrowUpwardIcon fontSize="small" /></IconButton>
                    </span></Tooltip>
                    <Tooltip title="Move down"><span>
                      <IconButton size="small" disabled={index === filtered.length - 1} onClick={() => onMove(item.id, 'down')} sx={{ color: '#787C82' }}><ArrowDownwardIcon fontSize="small" /></IconButton>
                    </span></Tooltip>
                    <Box sx={{ flex: 1 }} />
                    <Tooltip title="Edit">
                      <IconButton size="small" onClick={() => onEdit(item)} sx={{ color: '#787C82', '&:hover': { color: '#BE5953', bgcolor: '#F5E9E8' } }}><EditIcon fontSize="small" /></IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton size="small" onClick={() => onDelete(item)} sx={{ color: '#787C82', '&:hover': { color: '#D63638', bgcolor: '#FCEEEE' } }}><DeleteIcon fontSize="small" /></IconButton>
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
                <TableCell sx={{ fontWeight: 700, fontSize: '0.72rem', color: '#50575E', textTransform: 'uppercase', letterSpacing: '0.05em', py: 1.5, width: 140 }}>Price</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: '0.72rem', color: '#50575E', textTransform: 'uppercase', letterSpacing: '0.05em', py: 1.5, width: 100 }}>Dietary</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: '0.72rem', color: '#50575E', textTransform: 'uppercase', letterSpacing: '0.05em', py: 1.5, width: 130 }}>Availability</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: '0.72rem', color: '#50575E', textTransform: 'uppercase', letterSpacing: '0.05em', py: 1.5, width: 130 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.map((item, index) => {
                const imgSrc = item.imageUrls && item.imageUrls.length > 0 ? getImageUrl(item.imageUrls[0]) : null;

                return (
                  <TableRow
                    key={item.id}
                    sx={{
                      borderLeft: '3px solid',
                      borderLeftColor: item.isAvailable ? '#BE5953' : 'transparent',
                      '&:hover': { bgcolor: 'rgba(190,89,83,0.03)' },
                    }}
                  >
                    <TableCell sx={{ py: 1 }}>
                      <Box sx={{ width: 48, height: 48, bgcolor: '#F6F7F7', borderRadius: '2px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                        {imgSrc
                          ? <Box component="img" src={imgSrc} alt={item.name} sx={{ width: '100%', height: '100%', objectFit: 'contain', p: 0.25 }} />
                          : <RestaurantMenuIcon sx={{ fontSize: 22, color: '#CDD0D4' }} />}
                      </Box>
                    </TableCell>
                    <TableCell sx={{ py: 1 }}>
                      <Typography fontWeight={700} fontSize="0.875rem" color="#1D2327">{item.name}</Typography>
                      {item.preparationTime && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.25 }}>
                          <AccessTimeIcon sx={{ fontSize: 12, color: '#787C82' }} />
                          <Typography fontSize="0.7rem" color="#787C82">{item.preparationTime} min</Typography>
                        </Box>
                      )}
                    </TableCell>
                    <TableCell sx={{ py: 1 }}>{priceDisplay(item)}</TableCell>
                    <TableCell sx={{ py: 1 }}>{dietaryBadges(item)}</TableCell>
                    <TableCell sx={{ py: 1 }}>{availabilitySwitch(item)}</TableCell>
                    <TableCell sx={{ py: 1 }} onClick={(e) => e.stopPropagation()}>
                      <Box sx={{ display: 'flex', gap: 0.25, alignItems: 'center' }}>
                        <Tooltip title="Move up"><span>
                          <IconButton size="small" disabled={index === 0} onClick={() => onMove(item.id, 'up')} sx={{ color: '#787C82' }}><ArrowUpwardIcon sx={{ fontSize: 16 }} /></IconButton>
                        </span></Tooltip>
                        <Tooltip title="Move down"><span>
                          <IconButton size="small" disabled={index === filtered.length - 1} onClick={() => onMove(item.id, 'down')} sx={{ color: '#787C82' }}><ArrowDownwardIcon sx={{ fontSize: 16 }} /></IconButton>
                        </span></Tooltip>
                        <Tooltip title="Edit">
                          <IconButton size="small" onClick={() => onEdit(item)} sx={{ color: '#BE5953', '&:hover': { bgcolor: 'rgba(190,89,83,0.08)' } }}><EditIcon sx={{ fontSize: 16 }} /></IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton size="small" onClick={() => onDelete(item)} sx={{ color: '#D63638', '&:hover': { bgcolor: 'rgba(214,54,56,0.08)' } }}><DeleteIcon sx={{ fontSize: 16 }} /></IconButton>
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

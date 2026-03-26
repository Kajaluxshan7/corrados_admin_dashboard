import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { api } from '../utils/api';
import {
  Box,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Snackbar,
  Alert,
  FormControlLabel,
  Switch,
  Chip,
  Typography,
  Skeleton,
  Tooltip,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Straighten as MeasureIcon,
  CheckCircle as ActiveIcon,
  Cancel as InactiveIcon,
  Close as CloseIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import { PageHeader } from '../components/common/PageHeader';
import { SummaryStats } from '../components/common/SummaryStats';
import type { StatItem } from '../components/common/SummaryStats';

interface MeasurementType {
  id: string;
  name: string;
  description?: string;
  isActive?: boolean;
  sortOrder?: number;
}

const MeasurementsManagement: React.FC = () => {
  const [measurementTypes, setMeasurementTypes] = useState<MeasurementType[]>(
    [],
  );
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [measurementToDelete, setMeasurementToDelete] =
    useState<MeasurementType | null>(null);
  const [selected, setSelected] = useState<MeasurementType | null>(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error',
  });
  const [form, setForm] = useState({
    name: '',
    description: '',
    isActive: true,
    sortOrder: 0,
  });

  // Calculate stats
  const stats: StatItem[] = useMemo(() => {
    const total = measurementTypes.length;
    const active = measurementTypes.filter((m) => m.isActive !== false).length;
    const inactive = total - active;

    return [
      {
        label: 'Total Measurements',
        value: total,
        icon: <MeasureIcon fontSize="small" />,
        color: '#BE5953',
      },
      {
        label: 'Active',
        value: active,
        icon: <ActiveIcon fontSize="small" />,
        color: '#00A32A',
      },
      {
        label: 'Inactive',
        value: inactive,
        icon: <InactiveIcon fontSize="small" />,
        color: '#787C82',
      },
    ];
  }, [measurementTypes]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/measurements');
      setMeasurementTypes(res.data);
    } catch (error) {
      console.error(error);
      setSnackbar({
        open: true,
        message: 'Failed to load measurement types',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const openCreate = () => {
    setSelected(null);
    setForm({
      name: '',
      description: '',
      isActive: true,
      sortOrder: measurementTypes.length,
    });
    setDialogOpen(true);
  };

  const openEdit = (m: MeasurementType) => {
    setSelected(m);
    setForm({
      name: m.name,
      description: m.description || '',
      isActive: m.isActive ?? true,
      sortOrder: m.sortOrder || 0,
    });
    setDialogOpen(true);
  };

  const save = async () => {
    if (!form.name.trim()) {
      setSnackbar({
        open: true,
        message: 'Name is required',
        severity: 'error',
      });
      return;
    }

    setLoading(true);
    try {
      if (selected) {
        await api.patch(`/measurements/${selected.id}`, form);
        setSnackbar({
          open: true,
          message: 'Measurement type updated successfully',
          severity: 'success',
        });
      } else {
        await api.post('/measurements', form);
        setSnackbar({
          open: true,
          message: 'Measurement type created successfully',
          severity: 'success',
        });
      }
      setDialogOpen(false);
      load();
    } catch (error) {
      console.error(error);
      setSnackbar({
        open: true,
        message: 'Failed to save measurement type',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (m: MeasurementType) => {
    setMeasurementToDelete(m);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!measurementToDelete) return;

    setLoading(true);
    try {
      await api.delete(`/measurements/${measurementToDelete.id}`);
      setSnackbar({
        open: true,
        message: 'Measurement type deleted successfully',
        severity: 'success',
      });
      setDeleteDialogOpen(false);
      setMeasurementToDelete(null);
      load();
    } catch (error) {
      console.error(error);
      setSnackbar({
        open: true,
        message: 'Failed to delete measurement type',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const sortedMeasurements = useMemo(() => {
    return [...measurementTypes].sort(
      (a, b) => (a.sortOrder || 0) - (b.sortOrder || 0),
    );
  }, [measurementTypes]);

  return (
    <Box sx={{ p: 3 }}>
      {/* Page Header */}
      <PageHeader
        title="Measurement Types"
        subtitle="Manage measurement units used for menu items (e.g., oz, ml, pieces)"
        icon={<MeasureIcon />}
        action={
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={openCreate}
            sx={{
              backgroundColor: '#BE5953',
              color: '#fff',
              fontWeight: 600,
              px: 3,
              borderRadius: '2px',
              boxShadow: '0 4px 14px rgba(190, 89, 83, 0.3)',
              '&:hover': { backgroundColor: '#9A413C' },
            }}
          >
            Add Measurement
          </Button>
        }
      />

      {/* Summary Stats */}
      <SummaryStats stats={stats} columns={3} variant="card" />

      {/* Unit Cards List */}
      <Box
        sx={{
          borderRadius: '2px',
          background: '#FFFFFF',
          border: '1px solid rgba(190,89,83,0.08)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
          overflow: 'hidden',
        }}
      >
        {/* List header */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: '1fr 2fr 80px 100px 120px',
            px: 3,
            py: 1.5,
            borderBottom: '1px solid rgba(190,89,83,0.08)',
            background: 'rgba(190,89,83,0.03)',
          }}
        >
          {['Unit Name', 'Description', 'Order', 'Status', 'Actions'].map((h) => (
            <Typography key={h} sx={{ fontSize: '0.72rem', fontWeight: 700, color: '#50575E', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {h}
            </Typography>
          ))}
        </Box>

        {loading ? (
          <Box sx={{ p: 2 }}>
            {[...Array(4)].map((_, i) => (
              <Box key={i} sx={{ display: 'flex', gap: 2, alignItems: 'center', py: 2, px: 1, borderBottom: '1px solid rgba(0,0,0,0.04)' }}>
                <Skeleton variant="rounded" width={44} height={44} sx={{ flexShrink: 0 }} />
                <Box sx={{ flex: 1 }}>
                  <Skeleton variant="text" width="40%" height={22} />
                  <Skeleton variant="text" width="65%" height={18} />
                </Box>
                <Skeleton variant="rounded" width={60} height={24} />
                <Skeleton variant="rounded" width={72} height={26} />
                <Skeleton variant="rounded" width={100} height={32} />
              </Box>
            ))}
          </Box>
        ) : sortedMeasurements.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 10 }}>
            <Box sx={{
              width: 80, height: 80, borderRadius: '50%',
              background: 'rgba(190,89,83,0.08)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              mx: 'auto', mb: 3,
            }}>
              <MeasureIcon sx={{ fontSize: 40, color: 'rgba(190,89,83,0.4)' }} />
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#1D2327', mb: 1 }}>
              No Measurement Types Yet
            </Typography>
            <Typography variant="body2" sx={{ color: '#50575E', mb: 3 }}>
              Add your first measurement unit to start sizing menu items
            </Typography>
            <Button variant="outlined" startIcon={<AddIcon />} onClick={openCreate}
              sx={{ borderColor: '#BE5953', color: '#BE5953', borderRadius: '2px', fontWeight: 600, '&:hover': { background: 'rgba(0,0,0,0.04)' } }}>
              Add Measurement Type
            </Button>
          </Box>
        ) : (
          sortedMeasurements.map((m, idx) => (
            <Box
              key={m.id}
              sx={{
                display: 'grid',
                gridTemplateColumns: '1fr 2fr 80px 100px 120px',
                alignItems: 'center',
                px: 3,
                py: 2,
                borderBottom: idx < sortedMeasurements.length - 1 ? '1px solid rgba(190,89,83,0.07)' : 'none',
                borderLeft: '3px solid',
                borderLeftColor: m.isActive !== false ? '#BE5953' : 'transparent',
                transition: 'all 0.18s ease',
                '&:hover': {
                  background: 'rgba(190,89,83,0.03)',
                },
              }}
            >
              {/* Name */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Box sx={{
                  width: 40, height: 40, borderRadius: '2px',
                  background: m.isActive !== false ? 'rgba(190,89,83,0.1)' : 'rgba(0,0,0,0.04)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: m.isActive !== false ? '#BE5953' : '#9E9E9E',
                  flexShrink: 0,
                }}>
                  <MeasureIcon sx={{ fontSize: '1.1rem' }} />
                </Box>
                <Typography sx={{ fontWeight: 700, color: '#1D2327', fontSize: '0.938rem' }}>
                  {m.name}
                </Typography>
              </Box>

              {/* Description */}
              <Typography sx={{ color: '#6B4E3D', fontSize: '0.85rem', pr: 2,
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {m.description || (
                  <Box component="span" sx={{ color: '#C0B0A4', fontStyle: 'italic' }}>No description</Box>
                )}
              </Typography>

              {/* Order */}
              <Box>
                <Chip label={`#${(m.sortOrder ?? 0) + 1}`} size="small"
                  sx={{ fontSize: '0.75rem', fontWeight: 700, bgcolor: 'rgba(190,89,83,0.08)', color: '#50575E', border: 'none' }} />
              </Box>

              {/* Status */}
              <Box>
                <Chip
                  label={m.isActive !== false ? 'Active' : 'Inactive'}
                  size="small"
                  sx={{
                    fontSize: '0.72rem', fontWeight: 700,
                    bgcolor: m.isActive !== false ? 'rgba(0,163,42,0.1)' : 'rgba(0,0,0,0.06)',
                    color: m.isActive !== false ? '#00A32A' : '#787C82',
                  }}
                />
              </Box>

              {/* Actions */}
              <Box sx={{ display: 'flex', gap: 0.5 }}>
                <Tooltip title="Edit">
                  <IconButton size="small" onClick={() => openEdit(m)}
                    sx={{ color: '#BE5953', '&:hover': { bgcolor: 'rgba(190,89,83,0.1)' } }}>
                    <EditIcon sx={{ fontSize: '1rem' }} />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Delete">
                  <IconButton size="small" onClick={() => handleDeleteClick(m)}
                    sx={{ color: '#EF5350', '&:hover': { bgcolor: 'rgba(239,83,80,0.1)' } }}>
                    <DeleteIcon sx={{ fontSize: '1rem' }} />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>
          ))
        )}
      </Box>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          px: 3, py: 2.5, borderBottom: '1px solid rgba(190,89,83,0.1)',
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box sx={{ width: 36, height: 36, borderRadius: '2px', background: 'rgba(190,89,83,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#BE5953' }}>
              <MeasureIcon fontSize="small" />
            </Box>
            <Typography sx={{ fontWeight: 700, fontSize: '1.05rem', color: '#1D2327' }}>
              {selected ? 'Edit' : 'New'} Measurement Type
            </Typography>
          </Box>
          <IconButton size="small" onClick={() => setDialogOpen(false)}
            sx={{ color: 'text.secondary', '&:hover': { color: '#BE5953', bgcolor: 'rgba(190,89,83,0.08)' } }}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ px: 3, pt: 3, pb: 1 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <TextField fullWidth label="Name" value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required placeholder="e.g., Ounces, Milliliters, Pieces" />
            <TextField fullWidth label="Description" value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              multiline rows={2} placeholder="Optional description for this measurement type" />
            <TextField fullWidth label="Sort Order" type="number" value={form.sortOrder}
              onChange={(e) => setForm({ ...form, sortOrder: parseInt(e.target.value || '0') })}
              helperText="Lower numbers appear first in the list" />
            <FormControlLabel
              control={
                <Switch checked={form.isActive}
                  onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                  sx={{ '& .MuiSwitch-switchBase.Mui-checked': { color: '#BE5953' }, '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: '#BE5953' } }} />
              }
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography sx={{ fontWeight: 500 }}>Active</Typography>
                  <Chip label={form.isActive ? 'Visible' : 'Hidden'} size="small"
                    sx={{ height: 20, fontSize: '0.7rem', bgcolor: form.isActive ? 'rgba(44,85,48,0.12)' : 'rgba(0,0,0,0.06)', color: form.isActive ? '#00A32A' : '#787C82' }} />
                </Box>
              }
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, pt: 2, gap: 1.5 }}>
          <Button onClick={() => setDialogOpen(false)} variant="outlined" sx={{ borderRadius: '2px', fontWeight: 600, px: 3 }}>
            Cancel
          </Button>
          <Button onClick={save} variant="contained" disabled={loading || !form.name.trim()}
            sx={{ borderRadius: '2px', fontWeight: 600, px: 3, backgroundColor: '#BE5953', '&:hover': { backgroundColor: '#9A413C' } }}>
            {loading ? 'Saving…' : selected ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => { setDeleteDialogOpen(false); setMeasurementToDelete(null); }} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1.5, px: 3, py: 2.5, borderBottom: '1px solid rgba(190,89,83,0.1)' }}>
          <Box sx={{ width: 36, height: 36, borderRadius: '2px', background: 'rgba(239,68,68,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#D63638' }}>
            <WarningIcon fontSize="small" />
          </Box>
          <Typography sx={{ fontWeight: 700, fontSize: '1.05rem', color: '#1D2327' }}>
            Delete Measurement Type
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ px: 3, py: 3 }}>
          <Typography sx={{ color: '#6B4E3D', fontSize: '0.938rem', lineHeight: 1.6 }}>
            Are you sure you want to delete <strong>"{measurementToDelete?.name}"</strong>? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, gap: 1.5 }}>
          <Button onClick={() => { setDeleteDialogOpen(false); setMeasurementToDelete(null); }} variant="outlined" sx={{ borderRadius: '2px', fontWeight: 600, px: 3 }}>
            Cancel
          </Button>
          <Button onClick={confirmDelete} variant="contained"
            sx={{ borderRadius: '2px', fontWeight: 600, px: 3, bgcolor: '#D63638', '&:hover': { bgcolor: '#A62527' } }}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar open={snackbar.open} autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        sx={{ zIndex: 99999, position: 'fixed' }}>
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity}
          variant="filled" sx={{ borderRadius: '2px', boxShadow: '0 4px 16px rgba(0,0,0,0.15)' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default MeasurementsManagement;

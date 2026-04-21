import React, { useState, useEffect, useCallback } from 'react';
import { useWsRefresh, WsEvent } from '../contexts/WebSocketContext';
import {
  Box,
  Typography,
  Button,
  Chip,
  IconButton,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  LinearProgress,
  Switch,
  FormControlLabel,
  InputAdornment,
  MenuItem as MuiMenuItem,
  Select,
  FormControl,
  InputLabel,
  Grid,
  Divider,
  Stack,
  Checkbox,
  FormGroup,
  FormLabel,
  Tooltip,
  Paper,
  alpha,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Close as CloseIcon,
  Save as SaveIcon,
  CloudUpload as CloudUploadIcon,
  Restaurant as ComboIcon,
  LocalOffer as SpecialIcon,
  CheckCircleOutline as ActiveIcon,
  AddCircleOutline as AddItemIcon,
} from '@mui/icons-material';
import { api } from '../utils/api';
import logger from '../utils/logger';
import { useGlobalToast } from '../contexts/ToastContext';
import {
  getErrorMessage,
  getImageUrl,
  uploadImages,
} from '../utils/uploadHelpers';
import { PageHeader } from '../components/common/PageHeader';
import { EmptyState } from '../components/common/EmptyState';

import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { SummaryStats } from '../components/common/SummaryStats';

// ─── Types ────────────────────────────────────────────────────────────────────

interface FamilyMealAddon {
  id?: string;
  name: string;
  price: number;
  isAvailable: boolean;
  sortOrder: number;
}

interface FamilyMeal {
  id: string;
  name: string;
  description: string | null;
  serves: string;
  basePrice: number;
  priceLabel: string;
  mealType: 'combo' | 'daily_special';
  availableFor: string[];
  items: string[];
  isActive: boolean;
  sortOrder: number;
  imageUrls: string[];
  addons: FamilyMealAddon[];
  createdAt: string;
  updatedAt: string;
}

const BLANK_FORM = {
  name: '',
  description: '',
  serves: '4',
  basePrice: 0,
  priceLabel: '+tax',
  mealType: 'combo' as 'combo' | 'daily_special',
  availableFor: ['dine_in', 'take_out', 'delivery'] as string[],
  items: [] as string[],
  isActive: true,
  sortOrder: 0,
  imageUrls: [] as string[],
  addons: [] as FamilyMealAddon[],
};

type FormState = typeof BLANK_FORM;

const AVAILABILITY_OPTIONS = [
  { value: 'dine_in', label: 'Dine In' },
  { value: 'take_out', label: 'Take Out' },
  { value: 'delivery', label: 'Delivery' },
];

// ─── Component ────────────────────────────────────────────────────────────────

export default function FamilyMealsManagement() {
  const { showToast } = useGlobalToast();
  const [meals, setMeals] = useState<FamilyMeal[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingMeal, setEditingMeal] = useState<FamilyMeal | null>(null);
  const [form, setForm] = useState<FormState>(BLANK_FORM);
  const [newItem, setNewItem] = useState('');
  const [newAddonName, setNewAddonName] = useState('');
  const [newAddonPrice, setNewAddonPrice] = useState('');
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [uploadingImages, setUploadingImages] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<FamilyMeal | null>(null);
  const [toggling, setToggling] = useState<string | null>(null);

  // ─── Load ───────────────────────────────────────────────────────────────────

  const loadMeals = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get<FamilyMeal[]>('/family-meals/admin/all');
      setMeals(res.data);
    } catch (err) {
      logger.error('Failed to load family meals', err);
      showToast('Failed to load family meals', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadMeals();
  }, [loadMeals]);
  useWsRefresh(WsEvent.FAMILY_MEAL_UPDATED, loadMeals);

  // ─── Dialog ─────────────────────────────────────────────────────────────────

  const openCreate = () => {
    setEditingMeal(null);
    setForm({ ...BLANK_FORM, addons: [], items: [] });
    setImageFiles([]);
    setImagePreviews([]);
    setDialogOpen(true);
  };

  const openEdit = (meal: FamilyMeal) => {
    setEditingMeal(meal);
    setForm({
      name: meal.name,
      description: meal.description ?? '',
      serves: meal.serves,
      basePrice: meal.basePrice,
      priceLabel: meal.priceLabel,
      mealType: meal.mealType,
      availableFor: [...meal.availableFor],
      items: [...meal.items],
      isActive: meal.isActive,
      sortOrder: meal.sortOrder,
      imageUrls: [...meal.imageUrls],
      addons: meal.addons.map((a) => ({ ...a })),
    });
    setImageFiles([]);
    setImagePreviews([]);
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setEditingMeal(null);
    setNewItem('');
    setNewAddonName('');
    setNewAddonPrice('');
  };

  // ─── Items ──────────────────────────────────────────────────────────────────

  const addItem = () => {
    const v = newItem.trim();
    if (!v) return;
    setForm((f) => ({ ...f, items: [...f.items, v] }));
    setNewItem('');
  };

  const removeItem = (idx: number) => {
    setForm((f) => ({ ...f, items: f.items.filter((_, i) => i !== idx) }));
  };

  // ─── Add-ons ─────────────────────────────────────────────────────────────────

  const addAddon = () => {
    const name = newAddonName.trim();
    const price = parseFloat(newAddonPrice);
    if (!name || isNaN(price)) return;
    setForm((f) => ({
      ...f,
      addons: [
        ...f.addons,
        { name, price, isAvailable: true, sortOrder: f.addons.length },
      ],
    }));
    setNewAddonName('');
    setNewAddonPrice('');
  };

  const removeAddon = (idx: number) => {
    setForm((f) => ({ ...f, addons: f.addons.filter((_, i) => i !== idx) }));
  };

  const toggleAddonAvail = (idx: number) => {
    setForm((f) => ({
      ...f,
      addons: f.addons.map((a, i) =>
        i === idx ? { ...a, isAvailable: !a.isAvailable } : a,
      ),
    }));
  };

  // ─── Images ─────────────────────────────────────────────────────────────────

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    setImageFiles((prev) => [...prev, ...files]);
    files.forEach((f) => {
      const reader = new FileReader();
      reader.onload = (ev) =>
        setImagePreviews((prev) => [...prev, ev.target?.result as string]);
      reader.readAsDataURL(f);
    });
    e.target.value = '';
  };

  const removeNewImage = (idx: number) => {
    setImageFiles((prev) => prev.filter((_, i) => i !== idx));
    setImagePreviews((prev) => prev.filter((_, i) => i !== idx));
  };

  const removeExistingImage = (idx: number) => {
    setForm((f) => ({
      ...f,
      imageUrls: f.imageUrls.filter((_, i) => i !== idx),
    }));
  };

  // ─── Save ────────────────────────────────────────────────────────────────────

  const handleSave = async () => {
    if (!form.name.trim()) {
      showToast('Meal name is required', 'error');
      return;
    }

    try {
      setSaving(true);

      let uploadedUrls: string[] = [];
      if (imageFiles.length > 0) {
        setUploadingImages(true);
        uploadedUrls = await uploadImages(imageFiles, 'family-meals');
        setUploadingImages(false);
      }

      const payload = {
        ...form,
        description: form.description || null,
        basePrice: Number(form.basePrice),
        sortOrder: Number(form.sortOrder),
        imageUrls: [...form.imageUrls, ...uploadedUrls],
        addons: form.addons.map((a, i) => ({
          ...a,
          price: Number(a.price),
          sortOrder: i,
        })),
      };

      if (editingMeal) {
        await api.patch(`/family-meals/${editingMeal.id}`, payload);
        showToast('Family meal updated', 'success');
      } else {
        await api.post('/family-meals', payload);
        showToast('Family meal created', 'success');
      }

      closeDialog();
      await loadMeals();
    } catch (err) {
      logger.error('Failed to save family meal', err);
      showToast(getErrorMessage(err), 'error');
    } finally {
      setSaving(false);
      setUploadingImages(false);
    }
  };

  // ─── Toggle active ───────────────────────────────────────────────────────────

  const handleToggleActive = async (meal: FamilyMeal) => {
    try {
      setToggling(meal.id);
      await api.patch(`/family-meals/${meal.id}`, { isActive: !meal.isActive });
      showToast(
        `${meal.name} ${!meal.isActive ? 'activated' : 'deactivated'}`,
        'success',
      );
      await loadMeals();
    } catch (err) {
      showToast(getErrorMessage(err), 'error');
    } finally {
      setToggling(null);
    }
  };

  // ─── Delete ──────────────────────────────────────────────────────────────────

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await api.delete(`/family-meals/${deleteTarget.id}`);
      showToast('Family meal deleted', 'success');
      setDeleteTarget(null);
      await loadMeals();
    } catch (err) {
      showToast(getErrorMessage(err), 'error');
    }
  };

  // ─── Derived stats ────────────────────────────────────────────────────────────

  const stats = [
    { label: 'Total', value: meals.length, color: 'primary' as const },
    {
      label: 'Active',
      value: meals.filter((m) => m.isActive).length,
      color: 'success' as const,
    },
    {
      label: 'Combos',
      value: meals.filter((m) => m.mealType === 'combo').length,
      color: 'info' as const,
    },
    {
      label: 'Daily Specials',
      value: meals.filter((m) => m.mealType === 'daily_special').length,
      color: 'warning' as const,
    },
  ];

  // ─── Render ───────────────────────────────────────────────────────────────────

  return (
    <Box>
      <PageHeader
        title="Family Meals"
        subtitle="Manage family combo packages and daily specials"
        action={
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={openCreate}
          >
            Add Family Meal
          </Button>
        }
      />

      <SummaryStats stats={stats} />

      {loading && <LinearProgress sx={{ mb: 2 }} />}

      {!loading && meals.length === 0 && (
        <EmptyState
          icon={<ComboIcon sx={{ fontSize: 64 }} />}
          title="No family meals yet"
          description="Create your first family meal or daily special to display them on the website."
          action={{
            label: 'Add Family Meal',
            onClick: openCreate,
            icon: <AddIcon />,
          }}
        />
      )}

      <Grid container spacing={2}>
        {meals.map((meal) => (
          <Grid key={meal.id} size={{ xs: 12, md: 6, lg: 4 }}>
            <Paper
              elevation={2}
              sx={{
                p: 2,
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                opacity: meal.isActive ? 1 : 0.65,
                border: '1px solid',
                borderColor: meal.isActive ? 'transparent' : 'divider',
              }}
            >
              {/* Image */}
              {meal.imageUrls.length > 0 && (
                <Box
                  sx={{
                    mb: 1.5,
                    height: 140,
                    borderRadius: 1,
                    overflow: 'hidden',
                  }}
                >
                  <Box
                    component="img"
                    src={getImageUrl(meal.imageUrls[0])}
                    alt={meal.name}
                    sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </Box>
              )}

              {/* Header */}
              <Box
                sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}
              >
                <Box sx={{ flex: 1 }}>
                  <Typography variant="subtitle1" fontWeight={700} gutterBottom>
                    {meal.name}
                  </Typography>
                  <Stack
                    direction="row"
                    spacing={0.5}
                    flexWrap="wrap"
                    useFlexGap
                  >
                    <Chip
                      size="small"
                      label={
                        meal.mealType === 'combo' ? 'Combo' : 'Daily Special'
                      }
                      icon={
                        meal.mealType === 'combo' ? (
                          <ComboIcon />
                        ) : (
                          <SpecialIcon />
                        )
                      }
                      color={meal.mealType === 'combo' ? 'primary' : 'warning'}
                      variant="outlined"
                    />
                    <Chip
                      size="small"
                      label={`Serves ${meal.serves}`}
                      variant="outlined"
                    />
                    {!meal.isActive && (
                      <Chip size="small" label="Inactive" color="default" />
                    )}
                  </Stack>
                </Box>
                <Box sx={{ textAlign: 'right', ml: 1, flexShrink: 0 }}>
                  <Typography variant="h6" color="primary" fontWeight={700}>
                    ${Number(meal.basePrice).toFixed(2)}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {meal.priceLabel}
                  </Typography>
                </Box>
              </Box>

              {/* Items preview */}
              {meal.items.length > 0 && (
                <Box sx={{ mb: 1 }}>
                  {meal.items.slice(0, 2).map((item, i) => (
                    <Typography
                      key={i}
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        fontSize: '0.75rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 0.5,
                      }}
                    >
                      <ActiveIcon
                        sx={{ fontSize: 12, color: 'success.main' }}
                      />
                      {item}
                    </Typography>
                  ))}
                  {meal.items.length > 2 && (
                    <Typography variant="caption" color="text.disabled">
                      +{meal.items.length - 2} more items
                    </Typography>
                  )}
                </Box>
              )}

              {/* Availability */}
              <Box sx={{ mb: 1 }}>
                {meal.availableFor.map((a) => (
                  <Chip
                    key={a}
                    size="small"
                    label={a.replace('_', ' ')}
                    sx={{
                      mr: 0.5,
                      mb: 0.5,
                      fontSize: '0.65rem',
                      height: 20,
                      textTransform: 'capitalize',
                    }}
                    variant="filled"
                    color="default"
                  />
                ))}
              </Box>

              <Box sx={{ flexGrow: 1 }} />

              {/* Actions */}
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  mt: 1.5,
                  pt: 1.5,
                  borderTop: '1px solid',
                  borderColor: 'divider',
                }}
              >
                <FormControlLabel
                  control={
                    <Switch
                      size="small"
                      checked={meal.isActive}
                      disabled={toggling === meal.id}
                      onChange={() => handleToggleActive(meal)}
                    />
                  }
                  label={
                    <Typography variant="caption">
                      {meal.isActive ? 'Active' : 'Inactive'}
                    </Typography>
                  }
                />
                <Stack direction="row" spacing={0.5}>
                  <Tooltip title="Edit">
                    <IconButton size="small" onClick={() => openEdit(meal)}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete">
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => setDeleteTarget(meal)}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Stack>
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* ─── Create / Edit Dialog ────────────────────────────────────────────── */}
      <Dialog
        open={dialogOpen}
        onClose={closeDialog}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { maxHeight: '90vh' } }}
      >
        <DialogTitle
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          {editingMeal ? 'Edit Family Meal' : 'Add Family Meal'}
          <IconButton onClick={closeDialog} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers>
          <Grid container spacing={2}>
            {/* Name */}
            <Grid size={{ xs: 12 }}>
              <TextField
                label="Meal Name"
                fullWidth
                required
                value={form.name}
                onChange={(e) =>
                  setForm((f) => ({ ...f, name: e.target.value }))
                }
              />
            </Grid>

            {/* Description */}
            <Grid size={{ xs: 12 }}>
              <TextField
                label="Description"
                fullWidth
                multiline
                rows={2}
                value={form.description}
                onChange={(e) =>
                  setForm((f) => ({ ...f, description: e.target.value }))
                }
              />
            </Grid>

            {/* Type + Serves + Price */}
            <Grid size={{ xs: 12, sm: 4 }}>
              <FormControl fullWidth>
                <InputLabel>Meal Type</InputLabel>
                <Select
                  label="Meal Type"
                  value={form.mealType}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      mealType: e.target.value as 'combo' | 'daily_special',
                    }))
                  }
                >
                  <MuiMenuItem value="combo">Combo Package</MuiMenuItem>
                  <MuiMenuItem value="daily_special">Daily Special</MuiMenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                label="Serves"
                fullWidth
                value={form.serves}
                onChange={(e) =>
                  setForm((f) => ({ ...f, serves: e.target.value }))
                }
                helperText='e.g. "4" or "Per Person"'
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                label="Base Price"
                fullWidth
                type="number"
                value={form.basePrice}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    basePrice: parseFloat(e.target.value) || 0,
                  }))
                }
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">$</InputAdornment>
                  ),
                }}
              />
            </Grid>

            {/* Price label + Sort order */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Price Label"
                fullWidth
                value={form.priceLabel}
                onChange={(e) =>
                  setForm((f) => ({ ...f, priceLabel: e.target.value }))
                }
                helperText='e.g. "+tax" or "FREE"'
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Sort Order"
                fullWidth
                type="number"
                value={form.sortOrder}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    sortOrder: parseInt(e.target.value, 10) || 0,
                  }))
                }
              />
            </Grid>

            {/* Availability */}
            <Grid size={{ xs: 12 }}>
              <FormControl component="fieldset">
                <FormLabel component="legend">
                  <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                    Available For
                  </Typography>
                </FormLabel>
                <FormGroup row>
                  {AVAILABILITY_OPTIONS.map((opt) => (
                    <FormControlLabel
                      key={opt.value}
                      control={
                        <Checkbox
                          checked={form.availableFor.includes(opt.value)}
                          onChange={(e) => {
                            setForm((f) => ({
                              ...f,
                              availableFor: e.target.checked
                                ? [...f.availableFor, opt.value]
                                : f.availableFor.filter((v) => v !== opt.value),
                            }));
                          }}
                        />
                      }
                      label={opt.label}
                    />
                  ))}
                </FormGroup>
              </FormControl>
            </Grid>

            {/* Active toggle */}
            <Grid size={{ xs: 12 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={form.isActive}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, isActive: e.target.checked }))
                    }
                  />
                }
                label="Active (visible on website)"
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <Divider />
            </Grid>

            {/* Items list */}
            <Grid size={{ xs: 12 }}>
              <Typography variant="subtitle2" gutterBottom>
                What's Included
              </Typography>
              {form.items.map((item, idx) => (
                <Box
                  key={idx}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    mb: 0.5,
                    p: 1,
                    bgcolor: (t) => alpha(t.palette.success.main, 0.08),
                    borderRadius: 1,
                  }}
                >
                  <ActiveIcon
                    sx={{ fontSize: 14, color: 'success.main', mr: 1 }}
                  />
                  <Typography variant="body2" sx={{ flex: 1 }}>
                    {item}
                  </Typography>
                  <IconButton size="small" onClick={() => removeItem(idx)}>
                    <CloseIcon sx={{ fontSize: 14 }} />
                  </IconButton>
                </Box>
              ))}
              <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                <TextField
                  size="small"
                  placeholder="Add included item..."
                  value={newItem}
                  onChange={(e) => setNewItem(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addItem();
                    }
                  }}
                  fullWidth
                />
                <Button
                  variant="outlined"
                  size="small"
                  onClick={addItem}
                  startIcon={<AddItemIcon />}
                  sx={{ flexShrink: 0 }}
                >
                  Add
                </Button>
              </Box>
            </Grid>

            <Grid size={{ xs: 12 }}>
              <Divider />
            </Grid>

            {/* Add-ons */}
            <Grid size={{ xs: 12 }}>
              <Typography variant="subtitle2" gutterBottom>
                Add-Ons (Optional Upgrades)
              </Typography>
              {form.addons.map((addon, idx) => (
                <Box
                  key={idx}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    mb: 0.5,
                    p: 1,
                    bgcolor: (t) => alpha(t.palette.info.main, 0.08),
                    borderRadius: 1,
                  }}
                >
                  <Typography variant="body2" sx={{ flex: 1 }}>
                    {addon.name}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="primary"
                    fontWeight={600}
                    sx={{ minWidth: 60 }}
                  >
                    +${Number(addon.price).toFixed(2)}
                  </Typography>
                  <Tooltip
                    title={addon.isAvailable ? 'Available' : 'Unavailable'}
                  >
                    <Switch
                      size="small"
                      checked={addon.isAvailable}
                      onChange={() => toggleAddonAvail(idx)}
                    />
                  </Tooltip>
                  <IconButton size="small" onClick={() => removeAddon(idx)}>
                    <CloseIcon sx={{ fontSize: 14 }} />
                  </IconButton>
                </Box>
              ))}
              <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                <TextField
                  size="small"
                  placeholder="Add-on name..."
                  value={newAddonName}
                  onChange={(e) => setNewAddonName(e.target.value)}
                  sx={{ flex: 2 }}
                />
                <TextField
                  size="small"
                  placeholder="Price"
                  value={newAddonPrice}
                  onChange={(e) => setNewAddonPrice(e.target.value)}
                  type="number"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">$</InputAdornment>
                    ),
                  }}
                  sx={{ flex: 1 }}
                />
                <Button
                  variant="outlined"
                  size="small"
                  onClick={addAddon}
                  startIcon={<AddItemIcon />}
                  sx={{ flexShrink: 0 }}
                >
                  Add
                </Button>
              </Box>
            </Grid>

            <Grid size={{ xs: 12 }}>
              <Divider />
            </Grid>

            {/* Images */}
            <Grid size={{ xs: 12 }}>
              <Typography variant="subtitle2" gutterBottom>
                Images
              </Typography>

              {/* Existing images */}
              {form.imageUrls.length > 0 && (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 1 }}>
                  {form.imageUrls.map((url, idx) => (
                    <Box
                      key={idx}
                      sx={{ position: 'relative', width: 80, height: 80 }}
                    >
                      <Box
                        component="img"
                        src={getImageUrl(url)}
                        alt=""
                        sx={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          borderRadius: 1,
                        }}
                      />
                      <IconButton
                        size="small"
                        sx={{
                          position: 'absolute',
                          top: -6,
                          right: -6,
                          bgcolor: 'error.main',
                          color: '#fff',
                          '&:hover': { bgcolor: 'error.dark' },
                          width: 20,
                          height: 20,
                        }}
                        onClick={() => removeExistingImage(idx)}
                      >
                        <CloseIcon sx={{ fontSize: 12 }} />
                      </IconButton>
                    </Box>
                  ))}
                </Box>
              )}

              {/* New image previews */}
              {imagePreviews.length > 0 && (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 1 }}>
                  {imagePreviews.map((src, idx) => (
                    <Box
                      key={idx}
                      sx={{ position: 'relative', width: 80, height: 80 }}
                    >
                      <Box
                        component="img"
                        src={src}
                        alt=""
                        sx={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          borderRadius: 1,
                          opacity: 0.7,
                        }}
                      />
                      <IconButton
                        size="small"
                        sx={{
                          position: 'absolute',
                          top: -6,
                          right: -6,
                          bgcolor: 'error.main',
                          color: '#fff',
                          '&:hover': { bgcolor: 'error.dark' },
                          width: 20,
                          height: 20,
                        }}
                        onClick={() => removeNewImage(idx)}
                      >
                        <CloseIcon sx={{ fontSize: 12 }} />
                      </IconButton>
                    </Box>
                  ))}
                </Box>
              )}

              <Button
                component="label"
                variant="outlined"
                startIcon={<CloudUploadIcon />}
                size="small"
              >
                Upload Images
                <input
                  type="file"
                  hidden
                  multiple
                  accept="image/*"
                  onChange={handleImageSelect}
                />
              </Button>
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={closeDialog} disabled={saving}>
            Cancel
          </Button>
          <Button
            variant="contained"
            startIcon={saving ? undefined : <SaveIcon />}
            onClick={handleSave}
            disabled={saving || uploadingImages}
          >
            {saving
              ? uploadingImages
                ? 'Uploading Images…'
                : 'Saving…'
              : editingMeal
                ? 'Save Changes'
                : 'Create Meal'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ─── Confirm Delete ──────────────────────────────────────────────────── */}
      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Family Meal"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        severity="error"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </Box>
  );
}

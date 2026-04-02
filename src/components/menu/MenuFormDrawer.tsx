import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Drawer,
  Typography,
  IconButton,
  Button,
  TextField,
  FormControlLabel,
  Switch,
  Select,
  MenuItem as MuiMenuItem,
  FormControl,
  InputLabel,
  Divider,
  Chip,
  Checkbox,
  InputAdornment,
  Alert,
  CircularProgress,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import type {
  PrimaryCategory,
  MenuCategory,
  MenuItem,
  MeasurementType,
  MenuItemMeasurement,
  DrawerFormType,
} from './types';
import {
  getImageUrl,
  uploadImages,
  getErrorMessage,
} from '../../utils/uploadHelpers';
import logger from '../../utils/logger';

interface Props {
  open: boolean;
  formType: DrawerFormType | null;
  editData: PrimaryCategory | MenuCategory | MenuItem | null;
  primaryCategories: PrimaryCategory[];
  categories: MenuCategory[];
  measurementTypes: MeasurementType[];
  prefilledPrimaryCategoryId?: string;
  prefilledCategoryId?: string;
  saving: boolean;
  onSave: (
    type: DrawerFormType,
    editId: string | null,
    payload: Record<string, unknown>,
    imagesToDelete: string[],
  ) => void;
  onClose: () => void;
}

const defaultPcForm = {
  name: '',
  description: '',
  imageUrl: '',
  isActive: true,
  sortOrder: 0,
};

const defaultCatForm = {
  name: '',
  description: '',
  imageUrl: '',
  primaryCategoryId: '',
  isActive: true,
  sortOrder: 0,
};

const defaultItemForm = {
  name: '',
  description: '',
  price: 0,
  categoryId: '',
  preparationTime: '' as number | '',
  isAvailable: true,
  isVegetarian: false,
  isVegan: false,
  isGlutenFree: false,
  isDairyFree: false,
  allergens: [] as string[],
  sortOrder: 0,
  hasMeasurements: false,
  measurements: [] as MenuItemMeasurement[],
};

export const MenuFormDrawer: React.FC<Props> = ({
  open,
  formType,
  editData,
  primaryCategories,
  categories,
  measurementTypes,
  prefilledPrimaryCategoryId,
  prefilledCategoryId,
  saving,
  onSave,
  onClose,
}) => {
  const [pcForm, setPcForm] = useState({ ...defaultPcForm });
  const [catForm, setCatForm] = useState({ ...defaultCatForm });
  const [itemForm, setItemForm] = useState({ ...defaultItemForm });

  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [newPreviews, setNewPreviews] = useState<string[]>([]);
  const [imagesToDelete, setImagesToDelete] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [formError, setFormError] = useState('');
  const [allergenInput, setAllergenInput] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize form when drawer opens
  useEffect(() => {
    if (!open) return;

    setFormError('');
    setUploading(false);
    setNewFiles([]);
    setNewPreviews([]);
    setImagesToDelete([]);
    setAllergenInput('');

    if (formType === 'primaryCategory') {
      const pc = editData as PrimaryCategory | null;
      setPcForm({
        name: pc?.name || '',
        description: pc?.description || '',
        imageUrl: pc?.imageUrl || '',
        isActive: pc?.isActive ?? true,
        sortOrder: pc?.sortOrder ?? 0,
      });
      setExistingImages(pc?.imageUrl ? [pc.imageUrl] : []);
    } else if (formType === 'category') {
      const cat = editData as MenuCategory | null;
      setCatForm({
        name: cat?.name || '',
        description: cat?.description || '',
        imageUrl: cat?.imageUrl || '',
        primaryCategoryId:
          cat?.primaryCategoryId || prefilledPrimaryCategoryId || '',
        isActive: cat?.isActive ?? true,
        sortOrder: cat?.sortOrder ?? 0,
      });
      setExistingImages(cat?.imageUrl ? [cat.imageUrl] : []);
    } else if (formType === 'item') {
      const item = editData as MenuItem | null;
      setItemForm({
        name: item?.name || '',
        description: item?.description || '',
        price: item?.price ?? 0,
        categoryId: item?.categoryId || prefilledCategoryId || '',
        preparationTime: item?.preparationTime ?? '',
        isAvailable: item?.isAvailable ?? true,
        isVegetarian: item?.dietaryInfo?.includes('vegetarian') ?? false,
        isVegan: item?.dietaryInfo?.includes('vegan') ?? false,
        isGlutenFree: item?.dietaryInfo?.includes('glutenFree') ?? false,
        isDairyFree: item?.dietaryInfo?.includes('dairyFree') ?? false,
        allergens: item?.allergens ? [...item.allergens] : [],
        sortOrder: item?.sortOrder ?? 0,
        hasMeasurements: item?.hasMeasurements ?? false,
        measurements: item?.measurements
          ? item.measurements.map((m) => ({
              id: m.id,
              measurementTypeId:
                m.measurementTypeId ||
                (m as unknown as Record<string, unknown>).measurementType
                  ? ((m as unknown as Record<string, unknown>)
                      .measurementTypeId as string) ||
                    ((
                      (m as unknown as Record<string, unknown>)
                        .measurementType as Record<string, unknown>
                    )?.id as string) ||
                    ''
                  : '',
              price: m.price,
              isAvailable: m.isAvailable,
              sortOrder: m.sortOrder,
            }))
          : [],
      });
      setExistingImages(item?.imageUrls ? [...item.imageUrls] : []);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, formType, editData]);

  const maxImages = formType === 'item' ? 5 : 1;

  const currentImageCount =
    existingImages.filter((u) => !imagesToDelete.includes(u)).length +
    newFiles.length;

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    const maxSizeBytes = 1 * 1024 * 1024; // 1MB

    let addedCount = 0;
    const newFilesArr: File[] = [];
    const newPreviewsArr: string[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (currentImageCount + addedCount >= maxImages) {
        setFormError(`Maximum ${maxImages} image(s) allowed.`);
        break;
      }
      if (!validTypes.includes(file.type)) {
        setFormError('Only JPEG, PNG, and WebP images are allowed.');
        continue;
      }
      if (file.size > maxSizeBytes) {
        setFormError('Each image must be under 1MB.');
        continue;
      }
      newFilesArr.push(file);
      newPreviewsArr.push(URL.createObjectURL(file));
      addedCount++;
    }

    setNewFiles((prev) => [...prev, ...newFilesArr]);
    setNewPreviews((prev) => [...prev, ...newPreviewsArr]);

    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleRemoveExisting = (url: string) => {
    setImagesToDelete((prev) => [...prev, url]);
  };

  const handleRemoveNew = (index: number) => {
    URL.revokeObjectURL(newPreviews[index]);
    setNewFiles((prev) => prev.filter((_, i) => i !== index));
    setNewPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAddMeasurement = () => {
    setItemForm((prev) => ({
      ...prev,
      measurements: [
        ...prev.measurements,
        {
          measurementTypeId: measurementTypes[0]?.id || '',
          price: 0,
          isAvailable: true,
          sortOrder: prev.measurements.length,
        },
      ],
    }));
  };

  const handleRemoveMeasurement = (index: number) => {
    setItemForm((prev) => ({
      ...prev,
      measurements: prev.measurements.filter((_, i) => i !== index),
    }));
  };

  const handleMeasurementChange = (
    index: number,
    field: keyof MenuItemMeasurement,
    value: string | number | boolean,
  ) => {
    setItemForm((prev) => {
      const updated = [...prev.measurements];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, measurements: updated };
    });
  };

  const handleAddAllergen = () => {
    const val = allergenInput.trim().replace(/,$/, '').trim();
    if (!val) return;
    if (!itemForm.allergens.includes(val)) {
      setItemForm((prev) => ({
        ...prev,
        allergens: [...prev.allergens, val],
      }));
    }
    setAllergenInput('');
  };

  const handleAllergenKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      handleAddAllergen();
    }
  };

  const handleRemoveAllergen = (allergen: string) => {
    setItemForm((prev) => ({
      ...prev,
      allergens: prev.allergens.filter((a) => a !== allergen),
    }));
  };

  const validate = (): boolean => {
    if (formType === 'primaryCategory') {
      if (!pcForm.name.trim()) {
        setFormError('Name is required.');
        return false;
      }
    } else if (formType === 'category') {
      if (!catForm.name.trim()) {
        setFormError('Name is required.');
        return false;
      }
      if (!catForm.primaryCategoryId) {
        setFormError('Primary category is required.');
        return false;
      }
    } else if (formType === 'item') {
      if (!itemForm.name.trim()) {
        setFormError('Name is required.');
        return false;
      }
      if (!itemForm.categoryId) {
        setFormError('Category is required.');
        return false;
      }
      if (itemForm.hasMeasurements) {
        if (itemForm.measurements.length === 0) {
          setFormError('Add at least one size/measurement.');
          return false;
        }
        for (const m of itemForm.measurements) {
          if (!m.measurementTypeId) {
            setFormError('All measurements must have a type selected.');
            return false;
          }
          if (m.price < 0) {
            setFormError('Measurement prices must be 0 or greater.');
            return false;
          }
        }
      } else {
        if (itemForm.price < 0) {
          setFormError('Price must be 0 or greater.');
          return false;
        }
      }
    }
    return true;
  };

  const handleSave = async () => {
    setFormError('');
    if (!validate()) return;
    if (!formType) return;

    setUploading(true);
    try {
      if (formType === 'primaryCategory') {
        let finalImageUrl = existingImages[0] || '';
        if (newFiles.length > 0) {
          const uploaded = await uploadImages(
            newFiles,
            'menu/categories/primary',
          );
          if (uploaded && uploaded.length > 0) {
            finalImageUrl = uploaded[0];
          }
        }
        const payload: Record<string, unknown> = {
          ...pcForm,
          imageUrl: finalImageUrl,
        };
        onSave(
          formType,
          (editData as PrimaryCategory | null)?.id || null,
          payload,
          imagesToDelete,
        );
      } else if (formType === 'category') {
        let finalImageUrl = existingImages[0] || '';
        if (newFiles.length > 0) {
          const uploaded = await uploadImages(newFiles, 'menu/categories');
          if (uploaded && uploaded.length > 0) {
            finalImageUrl = uploaded[0];
          }
        }
        const payload: Record<string, unknown> = {
          ...catForm,
          imageUrl: finalImageUrl,
        };
        onSave(
          formType,
          (editData as MenuCategory | null)?.id || null,
          payload,
          imagesToDelete,
        );
      } else if (formType === 'item') {
        let uploadedUrls: string[] = [];
        if (newFiles.length > 0) {
          uploadedUrls = await uploadImages(newFiles, 'menu/items');
        }
        const keptExisting = existingImages.filter(
          (u) => !imagesToDelete.includes(u),
        );
        const finalImageUrls = [...keptExisting, ...uploadedUrls];

        const dietaryInfo: string[] = [];
        if (itemForm.isVegetarian) dietaryInfo.push('vegetarian');
        if (itemForm.isVegan) dietaryInfo.push('vegan');
        if (itemForm.isGlutenFree) dietaryInfo.push('glutenFree');
        if (itemForm.isDairyFree) dietaryInfo.push('dairyFree');

        const payload: Record<string, unknown> = {
          name: itemForm.name,
          description: itemForm.description,
          categoryId: itemForm.categoryId,
          allergens: itemForm.allergens,
          dietaryInfo,
          isAvailable: itemForm.isAvailable,
          imageUrls: finalImageUrls,
          sortOrder: itemForm.sortOrder,
          hasMeasurements: itemForm.hasMeasurements,
        };

        if (
          itemForm.preparationTime !== '' &&
          itemForm.preparationTime !== undefined
        ) {
          payload.preparationTime = Number(itemForm.preparationTime);
        }

        if (itemForm.hasMeasurements) {
          payload.measurements = itemForm.measurements.map(
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            ({ id: _id, ...rest }) => rest,
          );
        } else {
          payload.price = itemForm.price;
        }

        onSave(
          formType,
          (editData as MenuItem | null)?.id || null,
          payload,
          imagesToDelete,
        );
      }
    } catch (err) {
      logger.error('Error during save in MenuFormDrawer:', err);
      setFormError(getErrorMessage(err));
    } finally {
      setUploading(false);
    }
  };

  const getTitle = (): string => {
    if (formType === 'primaryCategory') {
      return editData ? 'Edit Primary Category' : 'Add Primary Category';
    } else if (formType === 'category') {
      return editData ? 'Edit Category' : 'Add Category';
    } else if (formType === 'item') {
      return editData ? 'Edit Menu Item' : 'Add Menu Item';
    }
    return '';
  };

  const isBusy = saving || uploading;

  // Image upload zone section
  const renderImageUploadZone = () => {
    const canAddMore = currentImageCount < maxImages;
    return (
      <Box>
        <Typography
          fontWeight={600}
          fontSize="0.875rem"
          color="#1D2327"
          sx={{ mb: 1.5 }}
        >
          {formType === 'item' ? 'Images (up to 5)' : 'Image'}
        </Typography>

        {/* Existing images */}
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 1 }}>
          {existingImages
            .filter((u) => !imagesToDelete.includes(u))
            .map((url) => (
              <Box
                key={url}
                sx={{
                  position: 'relative',
                  width: 80,
                  height: 80,
                  borderRadius: '2px',
                  overflow: 'hidden',
                  border: '1px solid #E2E4E7',
                }}
              >
                <Box
                  component="img"
                  src={getImageUrl(url)}
                  alt=""
                  sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <IconButton
                  size="small"
                  onClick={() => handleRemoveExisting(url)}
                  sx={{
                    position: 'absolute',
                    top: 2,
                    right: 2,
                    bgcolor: 'rgba(0,0,0,0.55)',
                    color: '#fff',
                    p: '2px',
                    '&:hover': { bgcolor: 'rgba(0,0,0,0.8)' },
                  }}
                >
                  <CloseIcon sx={{ fontSize: 12 }} />
                </IconButton>
              </Box>
            ))}

          {/* New file previews */}
          {newPreviews.map((preview, idx) => (
            <Box
              key={idx}
              sx={{
                position: 'relative',
                width: 80,
                height: 80,
                borderRadius: '2px',
                overflow: 'hidden',
                border: '1px solid #E2E4E7',
              }}
            >
              <Box
                component="img"
                src={preview}
                alt=""
                sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              <IconButton
                size="small"
                onClick={() => handleRemoveNew(idx)}
                sx={{
                  position: 'absolute',
                  top: 2,
                  right: 2,
                  bgcolor: 'rgba(0,0,0,0.55)',
                  color: '#fff',
                  p: '2px',
                  '&:hover': { bgcolor: 'rgba(0,0,0,0.8)' },
                }}
              >
                <CloseIcon sx={{ fontSize: 12 }} />
              </IconButton>
            </Box>
          ))}
        </Box>

        {/* Upload zone */}
        {canAddMore && (
          <Box
            onClick={() => fileInputRef.current?.click()}
            sx={{
              border: '2px dashed #CDD0D4',
              borderRadius: '2px',
              p: 3,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 1,
              cursor: 'pointer',
              bgcolor: '#FAFAFA',
              transition: 'border-color 0.15s',
              '&:hover': {
                borderColor: '#BE5953',
                bgcolor: '#F5E9E8',
              },
            }}
          >
            <CloudUploadIcon sx={{ fontSize: 32, color: '#CDD0D4' }} />
            <Typography fontSize="0.8125rem" color="#50575E" fontWeight={500}>
              Click to upload image
            </Typography>
            <Typography fontSize="0.75rem" color="#787C82">
              JPEG, PNG, WebP — max 1MB each
            </Typography>
          </Box>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple={maxImages > 1}
          style={{ display: 'none' }}
          onChange={handleFileSelect}
        />
      </Box>
    );
  };

  const renderPrimaryCategoryForm = () => (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Basic Information */}
      <Box>
        <Typography
          fontWeight={700}
          fontSize="0.875rem"
          color="#1D2327"
          sx={{ mb: 2 }}
        >
          Basic Information
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            label="Name"
            required
            fullWidth
            size="small"
            value={pcForm.name}
            onChange={(e) => setPcForm((p) => ({ ...p, name: e.target.value }))}
          />
          <TextField
            label="Description"
            fullWidth
            size="small"
            multiline
            rows={3}
            value={pcForm.description}
            onChange={(e) =>
              setPcForm((p) => ({ ...p, description: e.target.value }))
            }
          />
        </Box>
      </Box>

      <Divider />

      {/* Settings */}
      <Box>
        <Typography
          fontWeight={700}
          fontSize="0.875rem"
          color="#1D2327"
          sx={{ mb: 2 }}
        >
          Settings
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <FormControlLabel
            control={
              <Switch
                checked={pcForm.isActive}
                onChange={(e) =>
                  setPcForm((p) => ({ ...p, isActive: e.target.checked }))
                }
                sx={{
                  '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                    backgroundColor: '#00A32A',
                    opacity: 1,
                  },
                }}
              />
            }
            label="Active"
          />
          <TextField
            label="Sort Order"
            type="number"
            size="small"
            value={pcForm.sortOrder}
            onChange={(e) =>
              setPcForm((p) => ({ ...p, sortOrder: Number(e.target.value) }))
            }
            sx={{ maxWidth: 160 }}
          />
        </Box>
      </Box>

      <Divider />

      {/* Image */}
      {renderImageUploadZone()}
    </Box>
  );

  const renderCategoryForm = () => (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Basic Information */}
      <Box>
        <Typography
          fontWeight={700}
          fontSize="0.875rem"
          color="#1D2327"
          sx={{ mb: 2 }}
        >
          Basic Information
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <FormControl fullWidth size="small" required>
            <InputLabel>Primary Category</InputLabel>
            <Select
              label="Primary Category"
              value={catForm.primaryCategoryId}
              onChange={(e) =>
                setCatForm((p) => ({
                  ...p,
                  primaryCategoryId: e.target.value,
                }))
              }
            >
              {primaryCategories.map((pc) => (
                <MuiMenuItem key={pc.id} value={pc.id}>
                  {pc.name}
                </MuiMenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            label="Name"
            required
            fullWidth
            size="small"
            value={catForm.name}
            onChange={(e) =>
              setCatForm((p) => ({ ...p, name: e.target.value }))
            }
          />
          <TextField
            label="Description"
            fullWidth
            size="small"
            multiline
            rows={3}
            value={catForm.description}
            onChange={(e) =>
              setCatForm((p) => ({ ...p, description: e.target.value }))
            }
          />
        </Box>
      </Box>

      <Divider />

      {/* Settings */}
      <Box>
        <Typography
          fontWeight={700}
          fontSize="0.875rem"
          color="#1D2327"
          sx={{ mb: 2 }}
        >
          Settings
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <FormControlLabel
            control={
              <Switch
                checked={catForm.isActive}
                onChange={(e) =>
                  setCatForm((p) => ({ ...p, isActive: e.target.checked }))
                }
                sx={{
                  '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                    backgroundColor: '#00A32A',
                    opacity: 1,
                  },
                }}
              />
            }
            label="Active"
          />
          <TextField
            label="Sort Order"
            type="number"
            size="small"
            value={catForm.sortOrder}
            onChange={(e) =>
              setCatForm((p) => ({ ...p, sortOrder: Number(e.target.value) }))
            }
            sx={{ maxWidth: 160 }}
          />
        </Box>
      </Box>

      <Divider />

      {/* Image */}
      {renderImageUploadZone()}
    </Box>
  );

  const renderMenuItemForm = () => (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Basic Information */}
      <Box>
        <Typography
          fontWeight={700}
          fontSize="0.875rem"
          color="#1D2327"
          sx={{ mb: 2 }}
        >
          Basic Information
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <FormControl fullWidth size="small" required>
            <InputLabel>Category</InputLabel>
            <Select
              label="Category"
              value={itemForm.categoryId}
              onChange={(e) =>
                setItemForm((p) => ({ ...p, categoryId: e.target.value }))
              }
            >
              {categories.map((cat) => (
                <MuiMenuItem key={cat.id} value={cat.id}>
                  {cat.name}
                </MuiMenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            label="Name"
            required
            fullWidth
            size="small"
            value={itemForm.name}
            onChange={(e) =>
              setItemForm((p) => ({ ...p, name: e.target.value }))
            }
          />
          <TextField
            label="Description"
            fullWidth
            size="small"
            multiline
            rows={3}
            value={itemForm.description}
            onChange={(e) =>
              setItemForm((p) => ({ ...p, description: e.target.value }))
            }
          />
        </Box>
      </Box>

      <Divider />

      {/* Pricing */}
      <Box>
        <Typography
          fontWeight={700}
          fontSize="0.875rem"
          color="#1D2327"
          sx={{ mb: 2 }}
        >
          Pricing
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Box>
            <FormControlLabel
              control={
                <Switch
                  checked={itemForm.hasMeasurements}
                  onChange={(e) =>
                    setItemForm((p) => ({
                      ...p,
                      hasMeasurements: e.target.checked,
                    }))
                  }
                  sx={{
                    '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                      backgroundColor: '#BE5953',
                      opacity: 1,
                    },
                  }}
                />
              }
              label="Use Multiple Sizes"
            />
            <Typography
              fontSize="0.75rem"
              color="#787C82"
              sx={{ mt: 0.25, ml: '44px' }}
            >
              Enable to define different sizes with separate prices
            </Typography>
          </Box>

          {!itemForm.hasMeasurements ? (
            <TextField
              label="Price"
              type="number"
              size="small"
              value={itemForm.price}
              onChange={(e) =>
                setItemForm((p) => ({ ...p, price: Number(e.target.value) }))
              }
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">$</InputAdornment>
                  ),
                },
                htmlInput: { min: 0, step: 0.01 },
              }}
              sx={{ maxWidth: 180 }}
            />
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {itemForm.measurements.map((m, idx) => (
                <Box
                  key={idx}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    bgcolor: '#FAFAFA',
                    border: '1px solid #E2E4E7',
                    borderRadius: '2px',
                    p: 1,
                  }}
                >
                  <FormControl size="small" sx={{ flex: 1 }}>
                    <InputLabel>Size</InputLabel>
                    <Select
                      label="Size"
                      value={m.measurementTypeId || ''}
                      onChange={(e) =>
                        handleMeasurementChange(
                          idx,
                          'measurementTypeId',
                          e.target.value,
                        )
                      }
                    >
                      {measurementTypes.map((mt) => (
                        <MuiMenuItem key={mt.id} value={mt.id}>
                          {mt.name}
                        </MuiMenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <TextField
                    label="Price"
                    type="number"
                    size="small"
                    value={m.price}
                    onChange={(e) =>
                      handleMeasurementChange(
                        idx,
                        'price',
                        Number(e.target.value),
                      )
                    }
                    slotProps={{
                      input: {
                        startAdornment: (
                          <InputAdornment position="start">$</InputAdornment>
                        ),
                      },
                      htmlInput: { min: 0, step: 0.01 },
                    }}
                    sx={{ width: 110 }}
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        size="small"
                        checked={m.isAvailable}
                        onChange={(e) =>
                          handleMeasurementChange(
                            idx,
                            'isAvailable',
                            e.target.checked,
                          )
                        }
                        sx={{
                          color: '#CDD0D4',
                          '&.Mui-checked': { color: '#00A32A' },
                        }}
                      />
                    }
                    label={
                      <Typography fontSize="0.75rem" color="#50575E">
                        Avail.
                      </Typography>
                    }
                    sx={{ mr: 0 }}
                  />
                  <IconButton
                    size="small"
                    onClick={() => handleRemoveMeasurement(idx)}
                    sx={{
                      color: '#787C82',
                      '&:hover': { color: '#D63638', bgcolor: '#FCEEEE' },
                    }}
                  >
                    <DeleteOutlineIcon fontSize="small" />
                  </IconButton>
                </Box>
              ))}
              <Button
                variant="outlined"
                size="small"
                startIcon={<AddIcon />}
                onClick={handleAddMeasurement}
                sx={{
                  alignSelf: 'flex-start',
                  borderRadius: '2px',
                  fontWeight: 600,
                  textTransform: 'none',
                  borderColor: '#E2E4E7',
                  color: '#50575E',
                  '&:hover': {
                    borderColor: '#BE5953',
                    color: '#BE5953',
                    bgcolor: 'transparent',
                  },
                }}
              >
                Add Size
              </Button>
            </Box>
          )}
        </Box>
      </Box>

      <Divider />

      {/* Details */}
      <Box>
        <Typography
          fontWeight={700}
          fontSize="0.875rem"
          color="#1D2327"
          sx={{ mb: 2 }}
        >
          Details
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <TextField
            label="Preparation Time"
            type="number"
            size="small"
            value={itemForm.preparationTime}
            onChange={(e) =>
              setItemForm((p) => ({
                ...p,
                preparationTime:
                  e.target.value === '' ? '' : Number(e.target.value),
              }))
            }
            slotProps={{
              input: {
                endAdornment: <InputAdornment position="end">min</InputAdornment>,
              },
              htmlInput: { min: 0 },
            }}
            sx={{ width: 180 }}
          />
          <TextField
            label="Sort Order"
            type="number"
            size="small"
            value={itemForm.sortOrder}
            onChange={(e) =>
              setItemForm((p) => ({
                ...p,
                sortOrder: Number(e.target.value),
              }))
            }
            sx={{ width: 160 }}
          />
        </Box>
      </Box>

      <Divider />

      {/* Availability */}
      <Box>
        <Typography
          fontWeight={700}
          fontSize="0.875rem"
          color="#1D2327"
          sx={{ mb: 1.5 }}
        >
          Availability
        </Typography>
        <FormControlLabel
          control={
            <Switch
              checked={itemForm.isAvailable}
              onChange={(e) =>
                setItemForm((p) => ({
                  ...p,
                  isAvailable: e.target.checked,
                }))
              }
              sx={{
                '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                  backgroundColor: '#00A32A',
                  opacity: 1,
                },
              }}
            />
          }
          label="Available on menu"
        />
      </Box>

      <Divider />

      {/* Dietary Information */}
      <Box>
        <Typography
          fontWeight={700}
          fontSize="0.875rem"
          color="#1D2327"
          sx={{ mb: 2 }}
        >
          Dietary Information
        </Typography>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 1,
            mb: 2,
          }}
        >
          <FormControlLabel
            control={
              <Checkbox
                size="small"
                checked={itemForm.isVegetarian}
                onChange={(e) =>
                  setItemForm((p) => ({
                    ...p,
                    isVegetarian: e.target.checked,
                  }))
                }
                sx={{
                  color: '#CDD0D4',
                  '&.Mui-checked': { color: '#BE5953' },
                }}
              />
            }
            label={
              <Typography fontSize="0.875rem" color="#1D2327">
                Vegetarian
              </Typography>
            }
          />
          <FormControlLabel
            control={
              <Checkbox
                size="small"
                checked={itemForm.isVegan}
                onChange={(e) =>
                  setItemForm((p) => ({ ...p, isVegan: e.target.checked }))
                }
                sx={{
                  color: '#CDD0D4',
                  '&.Mui-checked': { color: '#BE5953' },
                }}
              />
            }
            label={
              <Typography fontSize="0.875rem" color="#1D2327">
                Vegan
              </Typography>
            }
          />
          <FormControlLabel
            control={
              <Checkbox
                size="small"
                checked={itemForm.isGlutenFree}
                onChange={(e) =>
                  setItemForm((p) => ({
                    ...p,
                    isGlutenFree: e.target.checked,
                  }))
                }
                sx={{
                  color: '#CDD0D4',
                  '&.Mui-checked': { color: '#BE5953' },
                }}
              />
            }
            label={
              <Typography fontSize="0.875rem" color="#1D2327">
                Gluten-Free
              </Typography>
            }
          />
          <FormControlLabel
            control={
              <Checkbox
                size="small"
                checked={itemForm.isDairyFree}
                onChange={(e) =>
                  setItemForm((p) => ({
                    ...p,
                    isDairyFree: e.target.checked,
                  }))
                }
                sx={{
                  color: '#CDD0D4',
                  '&.Mui-checked': { color: '#BE5953' },
                }}
              />
            }
            label={
              <Typography fontSize="0.875rem" color="#1D2327">
                Dairy-Free
              </Typography>
            }
          />
        </Box>

        {/* Allergens */}
        <Typography
          fontSize="0.8125rem"
          fontWeight={600}
          color="#1D2327"
          sx={{ mb: 1 }}
        >
          Allergens
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mb: 1 }}>
          {itemForm.allergens.map((a) => (
            <Chip
              key={a}
              label={a}
              size="small"
              onDelete={() => handleRemoveAllergen(a)}
              sx={{
                bgcolor: '#FFF3CD',
                color: '#856404',
                fontSize: '0.75rem',
                height: 24,
              }}
            />
          ))}
        </Box>
        <TextField
          size="small"
          placeholder="Type allergen and press Enter or comma"
          value={allergenInput}
          onChange={(e) => setAllergenInput(e.target.value)}
          onKeyDown={handleAllergenKeyDown}
          fullWidth
          helperText="Press Enter or comma to add"
        />
      </Box>

      <Divider />

      {/* Images */}
      {renderImageUploadZone()}

    </Box>
  );

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={isBusy ? undefined : onClose}
      slotProps={{
        paper: {
          sx: {
            width: 480,
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            bgcolor: '#FFFFFF',
            color: '#1D2327',
          },
        },
      }}
    >
      {/* Header */}
      <Box
        sx={{
          flexShrink: 0,
          bgcolor: '#1D2327',
          px: 3,
          py: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Typography fontWeight={700} fontSize="1rem" color="#fff">
          {getTitle()}
        </Typography>
        <IconButton
          onClick={onClose}
          disabled={isBusy}
          sx={{
            color: '#fff',
            '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' },
          }}
        >
          <CloseIcon />
        </IconButton>
      </Box>

      {/* Body */}
      <Box
        sx={{
          flex: 1,
          overflowY: 'auto',
          p: 3,
          bgcolor: '#FFFFFF',
        }}
      >
        {formError && (
          <Alert
            severity="error"
            onClose={() => setFormError('')}
            sx={{ mb: 2 }}
          >
            {formError}
          </Alert>
        )}

        {formType === 'primaryCategory' && renderPrimaryCategoryForm()}
        {formType === 'category' && renderCategoryForm()}
        {formType === 'item' && renderMenuItemForm()}
      </Box>

      {/* Footer */}
      <Box
        sx={{
          flexShrink: 0,
          px: 3,
          py: 2,
          borderTop: '1px solid #E2E4E7',
          bgcolor: '#FAFAFA',
          display: 'flex',
          justifyContent: 'flex-end',
          gap: 1.5,
        }}
      >
        <Button
          variant="outlined"
          onClick={onClose}
          disabled={isBusy}
          sx={{
            borderRadius: '2px',
            fontWeight: 600,
            px: 3,
            textTransform: 'none',
            borderColor: '#E2E4E7',
            color: '#50575E',
            '&:hover': { borderColor: '#BE5953', color: '#BE5953', bgcolor: 'transparent' },
          }}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSave}
          disabled={isBusy}
          startIcon={
            isBusy ? <CircularProgress size={16} color="inherit" /> : undefined
          }
          sx={{
            bgcolor: '#BE5953',
            color: '#fff',
            fontWeight: 700,
            borderRadius: '2px',
            px: 3,
            textTransform: 'none',
            boxShadow: 'none',
            '&:hover': { bgcolor: '#A84E48', boxShadow: 'none' },
            '&.Mui-disabled': { bgcolor: '#E2A09D', color: '#fff' },
          }}
        >
          {isBusy ? 'Saving...' : 'Save'}
        </Button>
      </Box>
    </Drawer>
  );
};

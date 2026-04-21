import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Button,
  Chip,
  Alert,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Tooltip,
  Tabs,
  Tab,
  LinearProgress,
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  RestartAlt as ResetIcon,
  Image as ImageIcon,
  PhotoCamera as PhotoCameraIcon,
} from '@mui/icons-material';
import { PageHeader } from '../components/common/PageHeader';
import { api, API_BASE_URL } from '../utils/api';
import {
  uploadImages,
  getErrorMessage,
} from '../utils/uploadHelpers';
import logger from '../utils/logger';

// ── Types ─────────────────────────────────────────────────────────────────────

interface SiteImageRow {
  id: string;
  key: string;
  label: string;
  description: string;
  category: string;
  imageUrl: string;
  defaultImageUrl: string;
  updatedAt: string;
}

interface SnackbarState {
  open: boolean;
  message: string;
  severity: 'success' | 'error' | 'warning' | 'info';
}

// ── Category labels & order ───────────────────────────────────────────────────

const CATEGORY_ORDER = [
  'heroes',
  'nav_tiles',
  'home_sections',
  'about',
  'family_meals',
  'gift_cards',
];

const CATEGORY_LABELS: Record<string, string> = {
  heroes: 'Page Heroes',
  nav_tiles: 'Home: Navigation Tiles',
  home_sections: 'Home: Sections & Cards',
  about: 'About Page',
  family_meals: 'Family Meal Cards',
  gift_cards: 'Gift Cards: Occasions',
};

// ── Helper: resolve image src for preview ────────────────────────────────────

function resolvePreview(url: string): string {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  if (url.startsWith('data:')) return url;
  if (url.startsWith('/')) {
    // All relative paths are served from the backend (which also serves the
    // frontend public folder under /restaurant/ in local development).
    return `${API_BASE_URL}${url}`;
  }
  return `${API_BASE_URL}/${url}`;
}

function isCustomised(row: SiteImageRow): boolean {
  return row.imageUrl !== row.defaultImageUrl;
}

// ── Component ─────────────────────────────────────────────────────────────────

const SiteImagesManagement: React.FC = () => {
  const [rows, setRows] = useState<SiteImageRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);

  // Upload dialog state
  const [uploadDialog, setUploadDialog] = useState(false);
  const [uploadTarget, setUploadTarget] = useState<SiteImageRow | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Reset confirm dialog
  const [resetDialog, setResetDialog] = useState(false);
  const [resetTarget, setResetTarget] = useState<SiteImageRow | null>(null);
  const [resetting, setResetting] = useState(false);

  const [snackbar, setSnackbar] = useState<SnackbarState>({
    open: false,
    message: '',
    severity: 'success',
  });

  // ── Load data ────────────────────────────────────────────────────────────────

  const loadRows = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await api.get<SiteImageRow[]>('/site-images/all');
      setRows(data);
    } catch (err) {
      logger.error('Failed to load site images', err);
      showSnackbar('Failed to load site images.', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRows();
  }, [loadRows]);

  // ── Snackbar ─────────────────────────────────────────────────────────────────

  const showSnackbar = (
    message: string,
    severity: SnackbarState['severity'],
  ) => {
    setSnackbar({ open: true, message, severity });
  };

  // ── Upload flow ──────────────────────────────────────────────────────────────

  const openUploadDialog = (row: SiteImageRow) => {
    setUploadTarget(row);
    setSelectedFile(null);
    setPreviewUrl('');
    setUploadDialog(true);
  };

  const closeUploadDialog = () => {
    setUploadDialog(false);
    setUploadTarget(null);
    setSelectedFile(null);
    if (previewUrl.startsWith('blob:')) URL.revokeObjectURL(previewUrl);
    setPreviewUrl('');
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate type
    if (
      !['image/jpeg', 'image/png', 'image/jpg', 'image/webp'].includes(
        file.type,
      )
    ) {
      showSnackbar('Only JPG, PNG, and WebP images are supported.', 'error');
      return;
    }
    // Validate size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      showSnackbar('Image must be smaller than 5 MB.', 'error');
      return;
    }

    if (previewUrl.startsWith('blob:')) URL.revokeObjectURL(previewUrl);
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    // Reset the input so the same file can be re-selected
    e.target.value = '';
  };

  const handleUploadConfirm = async () => {
    if (!selectedFile || !uploadTarget) return;
    setUploading(true);
    try {
      const [uploadedUrl] = await uploadImages([selectedFile], 'site-images');
      await api.patch(`/site-images/${uploadTarget.key}`, {
        imageUrl: uploadedUrl,
      });
      showSnackbar(`"${uploadTarget.label}" updated successfully.`, 'success');
      closeUploadDialog();
      loadRows();
    } catch (err) {
      showSnackbar(getErrorMessage(err), 'error');
    } finally {
      setUploading(false);
    }
  };

  // ── Reset flow ───────────────────────────────────────────────────────────────

  const openResetDialog = (row: SiteImageRow) => {
    setResetTarget(row);
    setResetDialog(true);
  };

  const closeResetDialog = () => {
    setResetDialog(false);
    setResetTarget(null);
  };

  const handleResetConfirm = async () => {
    if (!resetTarget) return;
    setResetting(true);
    try {
      await api.post(`/site-images/${resetTarget.key}/reset`);
      showSnackbar(`"${resetTarget.label}" reset to default.`, 'success');
      closeResetDialog();
      loadRows();
    } catch (err) {
      showSnackbar(getErrorMessage(err), 'error');
    } finally {
      setResetting(false);
    }
  };

  // ── Grouping ─────────────────────────────────────────────────────────────────

  const orderedCategories = CATEGORY_ORDER.filter((cat) =>
    rows.some((r) => r.category === cat),
  );

  const currentCategory = orderedCategories[activeTab] ?? '';
  const visibleRows = rows
    .filter((r) => r.category === currentCategory)
    .sort((a, b) => a.key.localeCompare(b.key));

  const customisedCount = rows.filter(isCustomised).length;

  // ── Render ────────────────────────────────────────────────────────────────────

  return (
    <Box>
      <PageHeader
        title="Site Images"
        subtitle="Manage the default images shown across the public website."
        icon={<PhotoCameraIcon />}
        action={
          customisedCount > 0 ? (
            <Chip
              label={`${customisedCount} customised`}
              color="primary"
              size="small"
              variant="outlined"
            />
          ) : undefined
        }
      />

      {loading && <LinearProgress sx={{ mb: 3 }} />}

      {!loading && rows.length === 0 && (
        <Alert severity="warning">
          No site images found. Make sure the migration has been run.
        </Alert>
      )}

      {!loading && rows.length > 0 && (
        <>
          {/* Category tabs */}
          <Tabs
            value={activeTab}
            onChange={(_, v) => setActiveTab(v)}
            variant="scrollable"
            scrollButtons="auto"
            sx={{ borderBottom: '1px solid #E2E4E7', mb: 3 }}
          >
            {orderedCategories.map((cat) => {
              const count = rows.filter(
                (r) => r.category === cat && isCustomised(r),
              ).length;
              return (
                <Tab
                  key={cat}
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {CATEGORY_LABELS[cat] ?? cat}
                      {count > 0 && (
                        <Chip
                          label={count}
                          size="small"
                          color="primary"
                          sx={{ height: 18, fontSize: 11 }}
                        />
                      )}
                    </Box>
                  }
                />
              );
            })}
          </Tabs>

          {/* Image cards */}
          <Grid container spacing={3}>
            {visibleRows.map((row) => {
              const customised = isCustomised(row);
              return (
                <Grid key={row.key} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                  <Card
                    variant="outlined"
                    sx={{
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      border: customised
                        ? '2px solid #BE5953'
                        : '1px solid #E2E4E7',
                    }}
                  >
                    {/* Image preview */}
                    <Box sx={{ position: 'relative', bgcolor: '#f5f5f5' }}>
                      <CardMedia
                        component="img"
                        height={160}
                        image={resolvePreview(row.imageUrl)}
                        alt={row.label}
                        sx={{ objectFit: 'cover' }}
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src =
                            resolvePreview(row.defaultImageUrl);
                        }}
                      />
                      {customised && (
                        <Chip
                          label="Custom"
                          size="small"
                          color="primary"
                          sx={{
                            position: 'absolute',
                            top: 8,
                            right: 8,
                            fontSize: 11,
                          }}
                        />
                      )}
                    </Box>

                    <CardContent sx={{ flex: 1, py: 1.5, px: 2 }}>
                      <Typography
                        variant="subtitle2"
                        sx={{ fontWeight: 700, lineHeight: 1.3 }}
                      >
                        {row.label}
                      </Typography>
                      {row.description && (
                        <Typography
                          variant="caption"
                          sx={{
                            color: '#787C82',
                            display: 'block',
                            mt: 0.5,
                            lineHeight: 1.4,
                          }}
                        >
                          {row.description}
                        </Typography>
                      )}
                    </CardContent>

                    <CardActions sx={{ px: 2, pb: 1.5, pt: 0, gap: 1 }}>
                      <Button
                        size="small"
                        variant="contained"
                        startIcon={<UploadIcon />}
                        onClick={() => openUploadDialog(row)}
                        sx={{ flex: 1 }}
                      >
                        Replace
                      </Button>
                      {customised && (
                        <Tooltip title="Reset to original default image">
                          <Button
                            size="small"
                            variant="outlined"
                            color="error"
                            startIcon={<ResetIcon />}
                            onClick={() => openResetDialog(row)}
                          >
                            Reset
                          </Button>
                        </Tooltip>
                      )}
                    </CardActions>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        </>
      )}

      {/* ── Upload Dialog ─────────────────────────────────────────────────────── */}
      <Dialog
        open={uploadDialog}
        onClose={closeUploadDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Replace Image
          {uploadTarget && (
            <Typography variant="body2" sx={{ color: '#787C82', mt: 0.5 }}>
              {uploadTarget.label}
            </Typography>
          )}
        </DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {/* Current image */}
            {uploadTarget && (
              <Box>
                <Typography
                  variant="caption"
                  sx={{ color: '#787C82', mb: 1, display: 'block' }}
                >
                  Current image:
                </Typography>
                <Box
                  component="img"
                  src={resolvePreview(uploadTarget.imageUrl)}
                  alt="current"
                  sx={{
                    width: '100%',
                    height: 180,
                    objectFit: 'cover',
                    borderRadius: 1,
                    border: '1px solid #E2E4E7',
                  }}
                />
              </Box>
            )}

            {/* File picker */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              aria-label="Choose image file"
              title="Choose image file"
              className="site-image-file-input"
              onChange={handleFileSelect}
            />
            <Button
              variant="outlined"
              startIcon={<ImageIcon />}
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
            >
              Choose new image
            </Button>

            {/* New image preview */}
            {previewUrl && (
              <Box>
                <Typography
                  variant="caption"
                  sx={{ color: '#787C82', mb: 1, display: 'block' }}
                >
                  New image preview:
                </Typography>
                <Box
                  component="img"
                  src={previewUrl}
                  alt="preview"
                  sx={{
                    width: '100%',
                    height: 180,
                    objectFit: 'cover',
                    borderRadius: 1,
                    border: '2px solid #BE5953',
                  }}
                />
                {selectedFile && (
                  <Typography
                    variant="caption"
                    sx={{ color: '#787C82', display: 'block', mt: 0.5 }}
                  >
                    {selectedFile.name} ({(selectedFile.size / 1024).toFixed(0)}{' '}
                    KB)
                  </Typography>
                )}
              </Box>
            )}

            {uploading && <LinearProgress />}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeUploadDialog} disabled={uploading}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleUploadConfirm}
            disabled={!selectedFile || uploading}
            startIcon={
              uploading ? <CircularProgress size={16} /> : <UploadIcon />
            }
          >
            {uploading ? 'Uploading…' : 'Upload & Save'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Reset Confirm Dialog ──────────────────────────────────────────────── */}
      <Dialog
        open={resetDialog}
        onClose={closeResetDialog}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Reset to Default?</DialogTitle>
        <DialogContent>
          <Typography variant="body2">
            This will replace the custom image for{' '}
            <strong>{resetTarget?.label}</strong> with the original default
            image. This cannot be undone.
          </Typography>
          {resetTarget && (
            <Box sx={{ mt: 2 }}>
              <Typography
                variant="caption"
                sx={{ color: '#787C82', display: 'block', mb: 1 }}
              >
                Default image:
              </Typography>
              <Box
                component="img"
                src={resolvePreview(resetTarget.defaultImageUrl)}
                alt="default"
                sx={{
                  width: '100%',
                  height: 140,
                  objectFit: 'cover',
                  borderRadius: 1,
                  border: '1px solid #E2E4E7',
                }}
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={closeResetDialog} disabled={resetting}>
            Cancel
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleResetConfirm}
            disabled={resetting}
            startIcon={
              resetting ? <CircularProgress size={16} /> : <ResetIcon />
            }
          >
            {resetting ? 'Resetting…' : 'Reset to Default'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Snackbar ──────────────────────────────────────────────────────────── */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default SiteImagesManagement;

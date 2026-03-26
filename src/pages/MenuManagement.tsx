import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Box,
  Typography,
  Breadcrumbs,
  Link as MuiLink,
  LinearProgress,
  Snackbar,
  Alert,
  IconButton,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import { API_BASE_URL } from '../config/env.config';
import ConfirmDialog from '../components/common/ConfirmDialog';
import logger from '../utils/logger';
import {
  getErrorMessage,
  parseBackendError,
} from '../utils/uploadHelpers';
import type {
  PrimaryCategory,
  MenuCategory,
  MenuItem,
  MeasurementType,
  DrawerFormType,
  MenuView,
} from '../components/menu/types';
import { PrimaryCategoriesView } from '../components/menu/PrimaryCategoriesView';
import { CategoriesView } from '../components/menu/CategoriesView';
import { MenuItemsView } from '../components/menu/MenuItemsView';
import { MenuFormDrawer } from '../components/menu/MenuFormDrawer';

const MenuManagement: React.FC = () => {
  // Navigation state
  const [view, setView] = useState<MenuView>('overview');
  const [activePrimaryCategory, setActivePrimaryCategory] =
    useState<PrimaryCategory | null>(null);
  const [activeCategory, setActiveCategory] = useState<MenuCategory | null>(
    null
  );

  // Data state
  const [primaryCategories, setPrimaryCategories] = useState<PrimaryCategory[]>(
    []
  );
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [measurementTypes, setMeasurementTypes] = useState<MeasurementType[]>(
    []
  );

  // UI state
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Drawer state
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerFormType, setDrawerFormType] = useState<DrawerFormType | null>(
    null
  );
  const [drawerEditData, setDrawerEditData] = useState<
    PrimaryCategory | MenuCategory | MenuItem | null
  >(null);

  // Delete confirmation state
  const [deleteTarget, setDeleteTarget] = useState<{
    id: string;
    type: 'primary' | 'category' | 'item';
    label: string;
  } | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Snackbar state
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'warning' | 'info';
  }>({ open: false, message: '', severity: 'success' });

  const showSnackbar = useCallback(
    (
      message: string,
      severity: 'success' | 'error' | 'warning' | 'info' = 'success'
    ) => {
      setSnackbar({ open: true, message, severity });
    },
    []
  );

  // Data loading
  const loadPrimaryCategories = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/menu/primary-categories`, {
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to load primary categories');
      const data = await res.json();
      const items: PrimaryCategory[] = (data.data || data).map(
        (pc: Record<string, unknown>) => ({
          ...pc,
          createdAt: new Date(pc.createdAt as string),
          updatedAt: new Date(pc.updatedAt as string),
        })
      );
      setPrimaryCategories(items);
    } catch (err) {
      logger.error('loadPrimaryCategories error:', err);
      showSnackbar(getErrorMessage(err), 'error');
    }
  }, [showSnackbar]);

  const loadCategories = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/menu/categories`, {
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to load categories');
      const data = await res.json();
      const items: MenuCategory[] = (data.data || data).map(
        (cat: Record<string, unknown>) => ({
          ...cat,
          createdAt: new Date(cat.createdAt as string),
          updatedAt: new Date(cat.updatedAt as string),
        })
      );
      setCategories(items);
    } catch (err) {
      logger.error('loadCategories error:', err);
      showSnackbar(getErrorMessage(err), 'error');
    }
  }, [showSnackbar]);

  const loadMenuItems = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/menu/items`, {
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to load menu items');
      const data = await res.json();
      const raw: Record<string, unknown>[] = data.data || data;
      const items: MenuItem[] = raw.map((item) => {
        const dietaryInfo = (item.dietaryInfo as string[]) || [];
        return {
          id: item.id as string,
          name: item.name as string,
          description: (item.description as string) || '',
          price: Number(item.price ?? 0),
          categoryId: item.categoryId as string,
          categoryName:
            ((item.category as Record<string, unknown>)
              ?.name as string) ||
            (item.categoryName as string) ||
            '',
          preparationTime: item.preparationTime as number | undefined,
          isAvailable: item.isAvailable as boolean,
          isVegetarian:
            (item.isVegetarian as boolean) ||
            dietaryInfo.includes('vegetarian'),
          isVegan:
            (item.isVegan as boolean) || dietaryInfo.includes('vegan'),
          isGlutenFree:
            (item.isGlutenFree as boolean) ||
            dietaryInfo.includes('glutenFree'),
          isDairyFree:
            (item.isDairyFree as boolean) ||
            dietaryInfo.includes('dairyFree'),
          allergens: (item.allergens as string[]) || [],
          imageUrls: (item.imageUrls as string[]) || [],
          sortOrder: (item.sortOrder as number) || 0,
          createdAt: new Date(item.createdAt as string),
          hasMeasurements: item.hasMeasurements as boolean | undefined,
          measurements: item.measurements as MenuItem['measurements'],
        };
      });
      setMenuItems(items);
    } catch (err) {
      logger.error('loadMenuItems error:', err);
      showSnackbar(getErrorMessage(err), 'error');
    }
  }, [showSnackbar]);

  const loadMeasurementTypes = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/measurements`, {
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to load measurement types');
      const data = await res.json();
      setMeasurementTypes(data.data || data);
    } catch (err) {
      logger.error('loadMeasurementTypes error:', err);
    }
  }, []);

  // Load all data on mount
  useEffect(() => {
    const loadAll = async () => {
      setLoading(true);
      try {
        await Promise.all([
          loadPrimaryCategories(),
          loadCategories(),
          loadMenuItems(),
          loadMeasurementTypes(),
        ]);
      } finally {
        setLoading(false);
      }
    };
    loadAll();
  }, [loadPrimaryCategories, loadCategories, loadMenuItems, loadMeasurementTypes]);

  // Navigation handlers
  const handleEnterPrimaryCategory = useCallback(
    (pc: PrimaryCategory) => {
      setActivePrimaryCategory(pc);
      setView('categories');
    },
    []
  );

  const handleEnterCategory = useCallback((cat: MenuCategory) => {
    setActiveCategory(cat);
    setView('items');
  }, []);

  const handleNavigateBack = useCallback(() => {
    if (view === 'items') {
      setView('categories');
      setActiveCategory(null);
    } else {
      setView('overview');
      setActivePrimaryCategory(null);
    }
  }, [view]);

  const handleNavigateToOverview = useCallback(() => {
    setView('overview');
    setActivePrimaryCategory(null);
    setActiveCategory(null);
  }, []);

  const handleNavigateToCategories = useCallback(() => {
    setView('categories');
    setActiveCategory(null);
  }, []);

  // Move handlers
  const handleMovePrimaryCategory = useCallback(
    async (id: string, direction: 'up' | 'down') => {
      try {
        const res = await fetch(
          `${API_BASE_URL}/menu/primary-categories/${id}/move`,
          {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ direction }),
          }
        );
        if (!res.ok) throw new Error('Failed to move primary category');
        await loadPrimaryCategories();
      } catch (err) {
        logger.error('handleMovePrimaryCategory error:', err);
        showSnackbar(getErrorMessage(err), 'error');
      }
    },
    [loadPrimaryCategories, showSnackbar]
  );

  const handleMoveCategory = useCallback(
    async (id: string, direction: 'up' | 'down') => {
      try {
        const res = await fetch(`${API_BASE_URL}/menu/categories/${id}/move`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ direction }),
        });
        if (!res.ok) throw new Error('Failed to move category');
        await loadCategories();
      } catch (err) {
        logger.error('handleMoveCategory error:', err);
        showSnackbar(getErrorMessage(err), 'error');
      }
    },
    [loadCategories, showSnackbar],
  );

  const handleMoveItem = useCallback(
    async (id: string, direction: 'up' | 'down') => {
      try {
        const res = await fetch(`${API_BASE_URL}/menu/items/${id}/move`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ direction }),
        });
        if (!res.ok) throw new Error('Failed to move item');
        await loadMenuItems();
      } catch (err) {
        logger.error('handleMoveItem error:', err);
        showSnackbar(getErrorMessage(err), 'error');
      }
    },
    [loadMenuItems, showSnackbar],
  );

  // Toggle availability
  const handleToggleAvailability = useCallback(
    async (item: MenuItem) => {
      try {
        const res = await fetch(`${API_BASE_URL}/menu/items/${item.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ isAvailable: !item.isAvailable }),
        });
        if (!res.ok) throw new Error('Failed to update availability');
        await loadMenuItems();
        showSnackbar(
          `${item.name} marked as ${
            !item.isAvailable ? 'available' : 'unavailable'
          }.`,
          'success'
        );
      } catch (err) {
        logger.error('handleToggleAvailability error:', err);
        showSnackbar(getErrorMessage(err), 'error');
      }
    },
    [loadMenuItems, showSnackbar]
  );

  // Delete handlers
  const handleConfirmDelete = useCallback(async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      let url = '';
      if (deleteTarget.type === 'primary') {
        url = `${API_BASE_URL}/menu/primary-categories/${deleteTarget.id}`;
      } else if (deleteTarget.type === 'category') {
        url = `${API_BASE_URL}/menu/categories/${deleteTarget.id}`;
      } else {
        url = `${API_BASE_URL}/menu/items/${deleteTarget.id}`;
      }

      const res = await fetch(url, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!res.ok) throw new Error(`Failed to delete ${deleteTarget.type}`);

      if (deleteTarget.type === 'primary') {
        await Promise.all([
          loadPrimaryCategories(),
          loadCategories(),
          loadMenuItems(),
        ]);
      } else if (deleteTarget.type === 'category') {
        await Promise.all([loadCategories(), loadMenuItems()]);
      } else {
        await loadMenuItems();
      }

      showSnackbar(`"${deleteTarget.label}" deleted successfully.`, 'success');
      setDeleteTarget(null);
    } catch (err) {
      logger.error('handleConfirmDelete error:', err);
      showSnackbar(getErrorMessage(err), 'error');
    } finally {
      setDeleting(false);
    }
  }, [
    deleteTarget,
    loadPrimaryCategories,
    loadCategories,
    loadMenuItems,
    showSnackbar,
  ]);

  // Drawer save handler
  const handleDrawerSave = useCallback(
    async (
      type: DrawerFormType,
      editId: string | null,
      payload: Record<string, unknown>,
      imagesToDelete: string[],
    ) => {
      setSaving(true);
      try {
        let url = '';
        let method = 'POST';

        if (type === 'primaryCategory') {
          url = editId
            ? `${API_BASE_URL}/menu/primary-categories/${editId}`
            : `${API_BASE_URL}/menu/primary-categories`;
        } else if (type === 'category') {
          url = editId
            ? `${API_BASE_URL}/menu/categories/${editId}`
            : `${API_BASE_URL}/menu/categories`;
        } else {
          url = editId
            ? `${API_BASE_URL}/menu/items/${editId}`
            : `${API_BASE_URL}/menu/items`;
        }

        if (editId) method = 'PATCH';

        const res = await fetch(url, {
          method,
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
          const errorMsg = await parseBackendError(res);
          throw new Error(errorMsg);
        }

        // Delete old images from storage
        if (imagesToDelete.length > 0) {
          try {
            await fetch(`${API_BASE_URL}/upload/images`, {
              method: 'DELETE',
              headers: { 'Content-Type': 'application/json' },
              credentials: 'include',
              body: JSON.stringify({ urls: imagesToDelete }),
            });
          } catch (imgErr) {
            logger.warn('Failed to delete old images:', imgErr);
          }
        }

        // Reload relevant data
        if (type === 'primaryCategory') {
          await loadPrimaryCategories();
        } else if (type === 'category') {
          await loadCategories();
          if (view === 'categories' || view === 'items') {
            await loadPrimaryCategories();
          }
        } else {
          await loadMenuItems();
          if (view === 'items') {
            await loadCategories();
          }
        }

        setDrawerOpen(false);
        showSnackbar(
          `${
            type === 'primaryCategory'
              ? 'Primary category'
              : type === 'category'
                ? 'Category'
                : 'Menu item'
          } ${editId ? 'updated' : 'created'} successfully.`,
          'success',
        );
      } catch (err) {
        logger.error('handleDrawerSave error:', err);
        showSnackbar(getErrorMessage(err), 'error');
      } finally {
        setSaving(false);
      }
    },
    [view, loadPrimaryCategories, loadCategories, loadMenuItems, showSnackbar],
  );

  // Computed values
  const filteredCategories = useMemo(
    () =>
      categories.filter(
        (c) => c.primaryCategoryId === activePrimaryCategory?.id
      ),
    [categories, activePrimaryCategory]
  );

  const filteredItems = useMemo(
    () => menuItems.filter((i) => i.categoryId === activeCategory?.id),
    [menuItems, activeCategory]
  );

  return (
    <Box sx={{ minHeight: '100vh' }}>
      {/* Loading bar */}
      {(loading || saving) && (
        <LinearProgress
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            zIndex: 9999,
            height: 2,
            bgcolor: '#F5E9E8',
            '& .MuiLinearProgress-bar': { bgcolor: '#BE5953' },
          }}
        />
      )}

      {/* Breadcrumb navigation */}
      {view !== 'overview' && (
        <Box
          sx={{
            mb: 3,
            display: 'flex',
            alignItems: 'center',
            gap: 1,
          }}
        >
          <IconButton
            size="small"
            onClick={handleNavigateBack}
            sx={{
              mr: 0.5,
              color: '#50575E',
              '&:hover': { color: '#BE5953' },
            }}
          >
            <ArrowBackIcon fontSize="small" />
          </IconButton>
          <Breadcrumbs
            separator="›"
            sx={{
              '& .MuiBreadcrumbs-separator': { color: '#A7AAAD' },
            }}
          >
            <MuiLink
              component="button"
              onClick={handleNavigateToOverview}
              underline="hover"
              sx={{
                fontSize: '0.8125rem',
                color: '#0073AA',
                bgcolor: 'transparent',
                border: 'none',
                cursor: 'pointer',
                fontFamily: 'inherit',
              }}
            >
              Menu Management
            </MuiLink>
            {view === 'categories' && (
              <Typography fontSize="0.8125rem" color="#50575E">
                {activePrimaryCategory?.name}
              </Typography>
            )}
            {view === 'items' && [
              <MuiLink
                component="button"
                key="pc"
                onClick={handleNavigateToCategories}
                underline="hover"
                sx={{
                  fontSize: '0.8125rem',
                  color: '#0073AA',
                  bgcolor: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                }}
              >
                {activePrimaryCategory?.name}
              </MuiLink>,
              <Typography key="cat" fontSize="0.8125rem" color="#50575E">
                {activeCategory?.name}
              </Typography>,
            ]}
          </Breadcrumbs>
        </Box>
      )}

      {/* Page header */}
      <Box
        sx={{
          mb: 3,
          pb: 2,
          borderBottom: '1px solid #E2E4E7',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <RestaurantIcon sx={{ color: '#BE5953', fontSize: 24 }} />
          <Box>
            <Typography fontWeight={700} fontSize="1.25rem" color="#1D2327">
              {view === 'overview'
                ? 'Menu Management'
                : view === 'categories'
                  ? activePrimaryCategory?.name
                  : activeCategory?.name}
            </Typography>
            <Typography fontSize="0.8125rem" color="#787C82">
              {view === 'overview'
                ? 'Manage your restaurant menu structure'
                : view === 'categories'
                  ? `Categories in ${activePrimaryCategory?.name}`
                  : `Items in ${activeCategory?.name}`}
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Views */}
      {view === 'overview' && (
        <PrimaryCategoriesView
          primaryCategories={primaryCategories}
          categories={categories}
          menuItems={menuItems}
          loading={loading}
          onEnter={handleEnterPrimaryCategory}
          onEdit={(pc) => {
            setDrawerFormType('primaryCategory');
            setDrawerEditData(pc);
            setDrawerOpen(true);
          }}
          onDelete={(pc) =>
            setDeleteTarget({ id: pc.id, type: 'primary', label: pc.name })
          }
          onMove={handleMovePrimaryCategory}
          onAdd={() => {
            setDrawerFormType('primaryCategory');
            setDrawerEditData(null);
            setDrawerOpen(true);
          }}
        />
      )}

      {view === 'categories' && activePrimaryCategory && (
        <CategoriesView
          primaryCategory={activePrimaryCategory}
          categories={filteredCategories}
          menuItems={menuItems}
          loading={loading}
          onEnter={handleEnterCategory}
          onEdit={(cat) => {
            setDrawerFormType('category');
            setDrawerEditData(cat);
            setDrawerOpen(true);
          }}
          onDelete={(cat) =>
            setDeleteTarget({
              id: cat.id,
              type: 'category',
              label: cat.name,
            })
          }
          onMove={handleMoveCategory}
          onAdd={() => {
            setDrawerFormType('category');
            setDrawerEditData(null);
            setDrawerOpen(true);
          }}
        />
      )}

      {view === 'items' && activeCategory && (
        <MenuItemsView
          category={activeCategory}
          items={filteredItems}
          loading={loading}
          onEdit={(item) => {
            setDrawerFormType('item');
            setDrawerEditData(item);
            setDrawerOpen(true);
          }}
          onDelete={(item) =>
            setDeleteTarget({ id: item.id, type: 'item', label: item.name })
          }
          onMove={handleMoveItem}
          onToggleAvailability={handleToggleAvailability}
          onAdd={() => {
            setDrawerFormType('item');
            setDrawerEditData(null);
            setDrawerOpen(true);
          }}
        />
      )}

      {/* Form Drawer */}
      <MenuFormDrawer
        open={drawerOpen}
        formType={drawerFormType}
        editData={drawerEditData}
        primaryCategories={primaryCategories}
        categories={view === 'items' ? filteredCategories : categories}
        measurementTypes={measurementTypes}
        prefilledPrimaryCategoryId={activePrimaryCategory?.id}
        prefilledCategoryId={activeCategory?.id}
        saving={saving}
        onSave={handleDrawerSave}
        onClose={() => setDrawerOpen(false)}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={!!deleteTarget}
        title={`Delete ${
          deleteTarget?.type === 'primary'
            ? 'Primary Category'
            : deleteTarget?.type === 'category'
              ? 'Category'
              : 'Menu Item'
        }`}
        message={`Are you sure you want to delete "${deleteTarget?.label}"? This action cannot be undone.`}
        confirmText="Delete"
        severity="error"
        loading={deleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          severity={snackbar.severity}
          variant="filled"
          onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default React.memo(MenuManagement);

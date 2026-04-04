import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useWsRefresh, WsEvent } from '../contexts/WebSocketContext';
import {
  Box,
  Typography,
  Button,
  Chip,
  IconButton,
  TextField,
  Dialog,
  DialogContent,
  DialogActions,
  Tooltip,
  LinearProgress,
  Select,
  FormControl,
  InputLabel,
  Grid,
  Divider,
  Switch,
  Collapse,
  InputAdornment,
  MenuItem as MuiMenuItem,
  Paper,
  Stack,
  Badge,
  alpha,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Close as CloseIcon,
  Save as SaveIcon,
  ArrowUpward as ArrowUpIcon,
  ArrowDownward as ArrowDownIcon,
  MenuBook as MenuBookIcon,
  LocalBar as CocktailIcon,
  CelebrationOutlined as PartyIcon,
  CheckCircleOutline as ActiveIcon,
  FiberManualRecord as DotIcon,
  FormatListBulleted as SectionIcon,
  CloudUpload as CloudUploadIcon,
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
import { LoadingState } from '../components/common/LoadingState';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { SummaryStats } from '../components/common/SummaryStats';

// ─── Types ────────────────────────────────────────────────────

type MenuType = 'cocktail' | 'party';
type SectionType = 'fixed' | 'choice' | 'family_style' | 'variety';

interface SectionItem {
  id: string;
  name: string;
  description: string;
  notes: string;
  isAvailable: boolean;
  sortOrder: number;
}

interface PartySection {
  id: string;
  title: string;
  sectionType: SectionType;
  instruction: string;
  sortOrder: number;
  items: SectionItem[];
}

interface PartyMenu {
  id: string;
  name: string;
  menuType: MenuType;
  pricePerPerson: number;
  minimumGuests: number | null;
  maximumGuests: number | null;
  description: string;
  isActive: boolean;
  imageUrls: string[];
  sortOrder: number;
  sections: PartySection[];
  createdAt: string;
  updatedAt: string;
}

// ─── Design tokens ────────────────────────────────────────────

const TOKEN = {
  cocktail: {
    color: '#0073AA',
    bg: '#E5F0F7',
    border: '#B8D8EC',
    light: '#F0F7FC',
  },
  party: {
    color: '#BE5953',
    bg: '#F7E5E4',
    border: '#EDBDBA',
    light: '#FDF5F4',
  },
} as const;

const SECTION_TYPE_META: Record<
  SectionType,
  { label: string; instruction: string; color: string }
> = {
  fixed: {
    label: 'Fixed',
    instruction: 'Included with this menu',
    color: '#2E7D32',
  },
  choice: {
    label: 'Choice',
    instruction: 'Choose one per guest',
    color: '#1565C0',
  },
  family_style: {
    label: 'Family',
    instruction: 'Shared family style',
    color: '#6A1B9A',
  },
  variety: {
    label: 'Variety',
    instruction: 'Includes a variety of',
    color: '#E65100',
  },
};

// ─── Blank templates ─────────────────────────────────────────

const blankItem = (): Omit<SectionItem, 'id'> => ({
  name: '',
  description: '',
  notes: '',
  isAvailable: true,
  sortOrder: 0,
});

const blankSection = (): Omit<PartySection, 'id'> => ({
  title: '',
  sectionType: 'fixed',
  instruction: SECTION_TYPE_META.fixed.instruction,
  sortOrder: 0,
  items: [],
});

const blankMenu = (): Omit<PartyMenu, 'id' | 'createdAt' | 'updatedAt'> => ({
  name: '',
  menuType: 'party',
  pricePerPerson: 0,
  minimumGuests: null,
  maximumGuests: null,
  description: '',
  isActive: true,
  imageUrls: [],
  sortOrder: 0,
  sections: [],
});

function newLocalId(): string {
  return `local_${Date.now()}_${Math.random()}`;
}

// ─── SectionItemEditor ────────────────────────────────────────

interface SectionItemEditorProps {
  item: SectionItem;
  index: number;
  total: number;
  onChange: (item: SectionItem) => void;
  onDelete: () => void;
  onMove: (dir: 'up' | 'down') => void;
}

const SectionItemEditor: React.FC<SectionItemEditorProps> = ({
  item,
  index,
  total,
  onChange,
  onDelete,
  onMove,
}) => {
  const hasError = item.name.trim() === '';
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: '28px 1fr auto',
        gap: 1,
        alignItems: 'flex-start',
        px: 1.25,
        py: 1,
        borderRadius: '4px',
        border: `1px solid ${hasError ? '#D63638' : '#E2E4E7'}`,
        bgcolor: hasError ? '#FFF8F8' : '#FAFAFA',
        mb: 0.75,
        transition: 'border-color 0.15s, background-color 0.15s',
        '&:hover': {
          borderColor: hasError ? '#D63638' : '#CDD0D4',
          bgcolor: '#F6F7F7',
        },
      }}
    >
      {/* Move controls */}
      <Box
        sx={{ display: 'flex', flexDirection: 'column', gap: 0.25, pt: 0.5 }}
      >
        <IconButton
          size="small"
          disabled={index === 0}
          onClick={() => onMove('up')}
          sx={{
            p: 0.25,
            color: '#A7AAAD',
            '&:not(:disabled):hover': { color: '#1D2327' },
          }}
        >
          <ArrowUpIcon sx={{ fontSize: 13 }} />
        </IconButton>
        <IconButton
          size="small"
          disabled={index === total - 1}
          onClick={() => onMove('down')}
          sx={{
            p: 0.25,
            color: '#A7AAAD',
            '&:not(:disabled):hover': { color: '#1D2327' },
          }}
        >
          <ArrowDownIcon sx={{ fontSize: 13 }} />
        </IconButton>
      </Box>

      {/* Fields */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
        <TextField
          size="small"
          placeholder="Item name *"
          value={item.name}
          onChange={(e) => onChange({ ...item, name: e.target.value })}
          error={hasError}
          helperText={hasError ? 'Required' : undefined}
          fullWidth
          sx={{ '& .MuiInputBase-input': { fontSize: '0.813rem' } }}
        />
        <Box sx={{ display: 'flex', gap: 0.75 }}>
          <TextField
            size="small"
            placeholder="Description"
            value={item.description}
            onChange={(e) => onChange({ ...item, description: e.target.value })}
            sx={{ flex: 2, '& .MuiInputBase-input': { fontSize: '0.813rem' } }}
          />
          <TextField
            size="small"
            placeholder="Notes (e.g. +$2.95)"
            value={item.notes}
            onChange={(e) => onChange({ ...item, notes: e.target.value })}
            sx={{
              flex: 1.5,
              '& .MuiInputBase-input': { fontSize: '0.813rem' },
            }}
          />
        </Box>
      </Box>

      {/* Actions */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 0.5,
          pt: 0.25,
        }}
      >
        <Tooltip title={item.isAvailable ? 'Available' : 'Unavailable'}>
          <Switch
            checked={item.isAvailable}
            onChange={(e) =>
              onChange({ ...item, isAvailable: e.target.checked })
            }
            size="small"
            sx={{
              '& .MuiSwitch-switchBase.Mui-checked': { color: '#00A32A' },
              '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                bgcolor: '#00A32A',
              },
            }}
          />
        </Tooltip>
        <Tooltip title="Remove item">
          <IconButton
            size="small"
            onClick={onDelete}
            sx={{
              color: '#D63638',
              p: 0.5,
              '&:hover': { bgcolor: alpha('#D63638', 0.08) },
            }}
          >
            <DeleteIcon sx={{ fontSize: 15 }} />
          </IconButton>
        </Tooltip>
      </Box>
    </Box>
  );
};

// ─── SectionEditor ────────────────────────────────────────────

interface SectionEditorProps {
  section: PartySection;
  index: number;
  total: number;
  onChange: (section: PartySection) => void;
  onDelete: () => void;
  onMove: (dir: 'up' | 'down') => void;
}

const SectionEditor: React.FC<SectionEditorProps> = ({
  section,
  index,
  total,
  onChange,
  onDelete,
  onMove,
}) => {
  const [expanded, setExpanded] = useState(true);
  const typeMeta = SECTION_TYPE_META[section.sectionType];
  const hasError = false;
  const availableItems = section.items.filter((i) => i.isAvailable).length;

  const addItem = () => {
    onChange({
      ...section,
      items: [
        ...section.items,
        { ...blankItem(), id: newLocalId(), sortOrder: section.items.length },
      ],
    });
  };

  const updateItem = (idx: number, updated: SectionItem) =>
    onChange({
      ...section,
      items: section.items.map((it, i) => (i === idx ? updated : it)),
    });

  const deleteItem = (idx: number) =>
    onChange({ ...section, items: section.items.filter((_, i) => i !== idx) });

  const moveItem = (idx: number, dir: 'up' | 'down') => {
    const items = [...section.items];
    const target = dir === 'up' ? idx - 1 : idx + 1;
    if (target < 0 || target >= items.length) return;
    [items[idx], items[target]] = [items[target], items[idx]];
    onChange({
      ...section,
      items: items.map((it, i) => ({ ...it, sortOrder: i })),
    });
  };

  const handleTypeChange = (sectionType: SectionType) => {
    onChange({
      ...section,
      sectionType,
      instruction:
        !section.instruction ||
        Object.values(SECTION_TYPE_META).some(
          (m) => m.instruction === section.instruction,
        )
          ? SECTION_TYPE_META[sectionType].instruction
          : section.instruction,
    });
  };

  return (
    <Box
      sx={{
        borderRadius: '4px',
        border: `1px solid ${hasError ? '#D63638' : '#D0D3D8'}`,
        mb: 1.5,
        overflow: 'hidden',
        bgcolor: '#FFFFFF',
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
      }}
    >
      {/* Section header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 0.75,
          px: 1.25,
          py: 0.875,
          bgcolor: '#F6F7F7',
          borderBottom: expanded ? '1px solid #E2E4E7' : 'none',
          borderLeft: `3px solid ${typeMeta.color}`,
        }}
      >
        {/* Reorder */}
        <Box sx={{ display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
          <IconButton
            size="small"
            disabled={index === 0}
            onClick={() => onMove('up')}
            sx={{
              p: 0.2,
              color: '#A7AAAD',
              '&:not(:disabled):hover': { color: '#1D2327' },
            }}
          >
            <ArrowUpIcon sx={{ fontSize: 12 }} />
          </IconButton>
          <IconButton
            size="small"
            disabled={index === total - 1}
            onClick={() => onMove('down')}
            sx={{
              p: 0.2,
              color: '#A7AAAD',
              '&:not(:disabled):hover': { color: '#1D2327' },
            }}
          >
            <ArrowDownIcon sx={{ fontSize: 12 }} />
          </IconButton>
        </Box>

        {/* Section number badge */}
        <Box
          sx={{
            width: 20,
            height: 20,
            borderRadius: '50%',
            bgcolor: typeMeta.color,
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '0.625rem',
            fontWeight: 700,
            flexShrink: 0,
          }}
        >
          {index + 1}
        </Box>

        {/* Title field */}
        <TextField
          size="small"
          placeholder="Section title (optional)"
          value={section.title}
          onChange={(e) => onChange({ ...section, title: e.target.value })}
          sx={{
            flex: 1,
            '& .MuiInputBase-root': {
              bgcolor: '#FFFFFF',
              fontSize: '0.813rem',
              fontWeight: 600,
            },
          }}
        />

        {/* Type select */}
        <FormControl size="small" sx={{ minWidth: 130 }}>
          <Select
            value={section.sectionType}
            onChange={(e) => handleTypeChange(e.target.value as SectionType)}
            sx={{
              fontSize: '0.75rem',
              bgcolor: alpha(typeMeta.color, 0.06),
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: alpha(typeMeta.color, 0.3),
              },
              color: typeMeta.color,
              fontWeight: 600,
            }}
          >
            {(
              Object.entries(SECTION_TYPE_META) as [
                SectionType,
                (typeof SECTION_TYPE_META)[SectionType],
              ][]
            ).map(([val, meta]) => (
              <MuiMenuItem key={val} value={val} sx={{ fontSize: '0.8rem' }}>
                {meta.label}
              </MuiMenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Item count badge */}
        {section.items.length > 0 && (
          <Tooltip
            title={`${availableItems} of ${section.items.length} items available`}
          >
            <Chip
              label={`${section.items.length} item${section.items.length !== 1 ? 's' : ''}`}
              size="small"
              sx={{
                height: 20,
                fontSize: '0.625rem',
                fontWeight: 700,
                bgcolor: alpha(typeMeta.color, 0.1),
                color: typeMeta.color,
                cursor: 'default',
              }}
            />
          </Tooltip>
        )}

        {/* Collapse toggle */}
        <IconButton
          size="small"
          onClick={() => setExpanded((p) => !p)}
          sx={{ color: '#787C82', '&:hover': { color: '#1D2327' } }}
        >
          {expanded ? (
            <ExpandLessIcon sx={{ fontSize: 18 }} />
          ) : (
            <ExpandMoreIcon sx={{ fontSize: 18 }} />
          )}
        </IconButton>

        {/* Delete */}
        <Tooltip title="Remove section">
          <IconButton
            size="small"
            onClick={onDelete}
            sx={{
              color: '#D63638',
              '&:hover': { bgcolor: alpha('#D63638', 0.08) },
            }}
          >
            <DeleteIcon sx={{ fontSize: 16 }} />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Section body */}
      <Collapse in={expanded}>
        <Box sx={{ p: 1.5 }}>
          <TextField
            size="small"
            placeholder="Customer-facing instruction (e.g. 'Choose one entrée per guest')"
            value={section.instruction}
            onChange={(e) =>
              onChange({ ...section, instruction: e.target.value })
            }
            fullWidth
            sx={{
              mb: 1.25,
              '& .MuiInputBase-input': {
                fontSize: '0.813rem',
                color: '#50575E',
              },
            }}
          />

          {section.items.length === 0 ? (
            <Box
              sx={{
                textAlign: 'center',
                py: 2,
                color: '#A7AAAD',
                border: '1px dashed #E2E4E7',
                borderRadius: '4px',
                mb: 1,
              }}
            >
              <Typography sx={{ fontSize: '0.75rem' }}>
                No items yet — click below to add the first one.
              </Typography>
            </Box>
          ) : (
            section.items.map((item, idx) => (
              <SectionItemEditor
                key={item.id}
                item={item}
                index={idx}
                total={section.items.length}
                onChange={(updated) => updateItem(idx, updated)}
                onDelete={() => deleteItem(idx)}
                onMove={(dir) => moveItem(idx, dir)}
              />
            ))
          )}

          <Button
            size="small"
            startIcon={<AddIcon sx={{ fontSize: 14 }} />}
            onClick={addItem}
            sx={{
              mt: 0.5,
              fontSize: '0.75rem',
              fontWeight: 600,
              color: typeMeta.color,
              textTransform: 'none',
              '&:hover': { bgcolor: alpha(typeMeta.color, 0.06) },
            }}
          >
            Add item
          </Button>
        </Box>
      </Collapse>
    </Box>
  );
};

// ─── MenuCard ─────────────────────────────────────────────────

interface MenuCardProps {
  menu: PartyMenu;
  onEdit: (menu: PartyMenu) => void;
  onDelete: (menu: PartyMenu) => void;
  onToggleActive: (menu: PartyMenu) => void;
  onMove: (id: string, dir: 'up' | 'down') => void;
  isFirst: boolean;
  isLast: boolean;
}

const MenuCard: React.FC<MenuCardProps> = ({
  menu,
  onEdit,
  onDelete,
  onToggleActive,
  onMove,
  isFirst,
  isLast,
}) => {
  const [sectionsOpen, setSectionsOpen] = useState(true);
  const tok = TOKEN[menu.menuType];
  // Use colours from the printed menu PDFs
  const titleColor = menu.menuType === 'cocktail' ? '#0D3B6E' : '#8B2020';
  const sortedSections = [...menu.sections].sort(
    (a, b) => a.sortOrder - b.sortOrder,
  );

  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: '4px',
        overflow: 'hidden',
        border: `1px solid ${menu.isActive ? tok.border : '#D0D3D8'}`,
        opacity: menu.isActive ? 1 : 0.72,
        transition: 'all 0.2s',
        '&:hover': { boxShadow: '0 4px 16px rgba(0,0,0,0.10)' },
      }}
    >
      {/* ── Printed menu card preview ──────────────────────────── */}
      <Box
        sx={{
          bgcolor: '#FFFEF5',
          backgroundImage: 'linear-gradient(135deg, #FAF8E8 0%, #FFFEF5 65%)',
          px: 2.5,
          pt: 2.25,
          pb: 1.75,
          borderBottom: '1px solid #DDD9C4',
          position: 'relative',
        }}
      >
        {/* Inactive badge */}
        {!menu.isActive && (
          <Box sx={{ position: 'absolute', top: 8, right: 8, zIndex: 2 }}>
            <Chip
              label="INACTIVE"
              size="small"
              sx={{
                bgcolor: '#787C82',
                color: '#fff',
                fontWeight: 700,
                fontSize: '0.6rem',
                height: 18,
              }}
            />
          </Box>
        )}

        {/* ── Title + Price — exact layout from PDF ── */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            mb: 0.75,
            gap: 1,
          }}
        >
          <Typography
            sx={{
              fontWeight: 900,
              fontSize: '1.05rem',
              lineHeight: 1.15,
              color: titleColor,
              textTransform: 'uppercase',
              fontStyle: 'italic',
              letterSpacing: '0.015em',
              flex: 1,
            }}
          >
            {menu.name}
          </Typography>
          <Box sx={{ textAlign: 'right', flexShrink: 0 }}>
            <Typography
              sx={{
                fontWeight: 900,
                fontSize: '1.5rem',
                color: titleColor,
                lineHeight: 1,
              }}
            >
              ${Number(menu.pricePerPerson).toFixed(2)}
            </Typography>
            <Typography
              sx={{
                fontSize: '0.62rem',
                color: '#8A7F6A',
                lineHeight: 1.3,
                mt: 0.25,
              }}
            >
              per person
            </Typography>
          </Box>
        </Box>

        {/* Horizontal rule — matches the PDF divider under title */}
        <Divider sx={{ borderColor: '#B8B09A', mb: 1 }} />

        {/* Guest count — e.g. "15-20 GUESTS MIN" from PDF */}
        {(menu.minimumGuests || menu.maximumGuests) && (
          <Typography
            sx={{
              fontSize: '0.68rem',
              color: '#5C5345',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              mb: 0.75,
            }}
          >
            {menu.minimumGuests && menu.maximumGuests
              ? `${menu.minimumGuests}–${menu.maximumGuests} guests min`
              : menu.minimumGuests
                ? `${menu.minimumGuests} guests min`
                : `Up to ${menu.maximumGuests} guests`}
          </Typography>
        )}

        {/* Description */}
        {menu.description && (
          <Typography
            sx={{
              fontSize: '0.72rem',
              color: '#6B5F4E',
              fontStyle: 'italic',
              mb: 1,
              lineHeight: 1.4,
            }}
          >
            {menu.description}
          </Typography>
        )}

        {/* Images */}
        {menu.imageUrls && menu.imageUrls.length > 0 && (
          <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap', mb: 1 }}>
            {menu.imageUrls.map((url) => (
              <Box
                key={url}
                component="img"
                src={getImageUrl(url)}
                alt=""
                sx={{
                  width: 56,
                  height: 56,
                  objectFit: 'cover',
                  borderRadius: '3px',
                  border: '1px solid #DDD9C4',
                }}
              />
            ))}
          </Box>
        )}

        {/* ── Sections ── */}
        {sortedSections.length === 0 ? (
          <Typography
            sx={{
              fontSize: '0.72rem',
              color: '#A7AAAD',
              fontStyle: 'italic',
              py: 0.5,
            }}
          >
            No sections yet.
          </Typography>
        ) : (
          <>
            <Button
              size="small"
              endIcon={
                sectionsOpen ? (
                  <ExpandLessIcon sx={{ fontSize: 13 }} />
                ) : (
                  <ExpandMoreIcon sx={{ fontSize: 13 }} />
                )
              }
              onClick={() => setSectionsOpen((p) => !p)}
              sx={{
                textTransform: 'none',
                color: '#8A7F6A',
                fontSize: '0.67rem',
                fontWeight: 600,
                p: '1px 5px',
                minHeight: 0,
                mb: 0.5,
                '&:hover': { color: titleColor, bgcolor: 'transparent' },
              }}
            >
              {sectionsOpen
                ? 'Collapse'
                : `Show ${sortedSections.length} section${sortedSections.length !== 1 ? 's' : ''}`}
            </Button>

            <Collapse in={sectionsOpen}>
              {sortedSections.map((sec, sIdx) => {
                const allItems = [...sec.items].sort(
                  (a, b) => a.sortOrder - b.sortOrder,
                );
                const availItems = allItems.filter((i) => i.isAvailable);
                const hiddenCount = allItems.length - availItems.length;
                return (
                  <Box
                    key={sec.id}
                    sx={{ mb: sIdx < sortedSections.length - 1 ? 1.25 : 0.25 }}
                  >
                    {/* Section heading — uppercase underlined, matches PDF */}
                    {sec.title && (
                      <Typography
                        sx={{
                          fontSize: '0.7rem',
                          fontWeight: 900,
                          color: titleColor,
                          textTransform: 'uppercase',
                          letterSpacing: '0.06em',
                          textDecoration: 'underline',
                          textUnderlineOffset: '2px',
                          lineHeight: 1.4,
                        }}
                      >
                        {sec.title}
                      </Typography>
                    )}

                    {/* Instruction line — e.g. "CHOOSE ONE PER GUEST" */}
                    {sec.instruction && (
                      <Typography
                        sx={{
                          fontSize: '0.63rem',
                          color: '#5C5345',
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          letterSpacing: '0.04em',
                          lineHeight: 1.4,
                          mb: 0.25,
                        }}
                      >
                        {sec.instruction}
                      </Typography>
                    )}

                    {/* Items — dash-prefixed exactly like the PDF */}
                    {availItems.length === 0 && (
                      <Typography
                        sx={{
                          fontSize: '0.68rem',
                          color: '#A7AAAD',
                          fontStyle: 'italic',
                          pl: 0.5,
                        }}
                      >
                        No items
                      </Typography>
                    )}
                    {availItems.map((item) => (
                      <Box
                        key={item.id}
                        sx={{ display: 'flex', gap: 0.5, pl: 0.5, alignItems: 'center' }}
                      >
                        <Typography
                          sx={{
                            fontSize: '0.72rem',
                            color: '#2C2118',
                            flexShrink: 0,
                            lineHeight: 1.55,
                          }}
                        >
                          -
                        </Typography>
                        <Box>
                          <Typography
                            component="span"
                            sx={{
                              fontSize: '0.72rem',
                              color: '#2C2118',
                              lineHeight: 1.55,
                            }}
                          >
                            {item.name}
                          </Typography>
                          {item.notes && (
                            <Typography
                              component="span"
                              sx={{
                                fontSize: '0.65rem',
                                color: '#8A7F6A',
                                fontStyle: 'italic',
                                ml: 0.5,
                              }}
                            >
                              ({item.notes})
                            </Typography>
                          )}
                          {item.description && (
                            <Typography
                              sx={{
                                fontSize: '0.65rem',
                                color: '#6B5F4E',
                                fontStyle: 'italic',
                                lineHeight: 1.3,
                              }}
                            >
                              {item.description}
                            </Typography>
                          )}
                        </Box>
                      </Box>
                    ))}

                    {hiddenCount > 0 && (
                      <Typography
                        sx={{
                          fontSize: '0.62rem',
                          color: '#A7AAAD',
                          fontStyle: 'italic',
                          pl: 0.5,
                          mt: 0.25,
                        }}
                      >
                        +{hiddenCount} hidden item{hiddenCount !== 1 ? 's' : ''}
                      </Typography>
                    )}
                  </Box>
                );
              })}
            </Collapse>
          </>
        )}
      </Box>

      {/* ── Admin action strip ─────────────────────────────────── */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          px: 1.5,
          py: 0.75,
          bgcolor: '#F6F7F7',
          borderTop: '1px solid #E2E4E7',
          gap: 0.5,
        }}
      >
        <Tooltip title="Move up">
          <span>
            <IconButton
              size="small"
              disabled={isFirst}
              onClick={() => onMove(menu.id, 'up')}
              sx={{
                p: 0.4,
                color: '#A7AAAD',
                '&:not(:disabled):hover': { color: '#1D2327' },
              }}
            >
              <ArrowUpIcon sx={{ fontSize: 13 }} />
            </IconButton>
          </span>
        </Tooltip>
        <Tooltip title="Move down">
          <span>
            <IconButton
              size="small"
              disabled={isLast}
              onClick={() => onMove(menu.id, 'down')}
              sx={{
                p: 0.4,
                color: '#A7AAAD',
                '&:not(:disabled):hover': { color: '#1D2327' },
              }}
            >
              <ArrowDownIcon sx={{ fontSize: 13 }} />
            </IconButton>
          </span>
        </Tooltip>

        <Switch
          checked={menu.isActive}
          onChange={() => onToggleActive(menu)}
          size="small"
          sx={{
            '& .MuiSwitch-switchBase.Mui-checked': { color: '#00A32A' },
            '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
              bgcolor: '#00A32A',
            },
          }}
        />
        <Typography
          sx={{
            fontSize: '0.7rem',
            fontWeight: 600,
            color: menu.isActive ? '#00A32A' : '#787C82',
          }}
        >
          {menu.isActive ? 'Active' : 'Inactive'}
        </Typography>

        <Box sx={{ flex: 1 }} />

        <Tooltip title="Edit package">
          <Button
            size="small"
            variant="outlined"
            startIcon={<EditIcon sx={{ fontSize: 13 }} />}
            onClick={() => onEdit(menu)}
            sx={{
              fontSize: '0.7rem',
              fontWeight: 600,
              textTransform: 'none',
              borderColor: '#D0D3D8',
              color: '#50575E',
              py: 0.4,
              px: 1,
              '&:hover': {
                borderColor: tok.color,
                color: tok.color,
                bgcolor: tok.light,
              },
            }}
          >
            Edit
          </Button>
        </Tooltip>
        <Tooltip title="Delete package">
          <IconButton
            size="small"
            onClick={() => onDelete(menu)}
            sx={{
              color: '#D63638',
              border: '1px solid #E2E4E7',
              borderRadius: '3px',
              p: 0.5,
              '&:hover': {
                bgcolor: alpha('#D63638', 0.08),
                borderColor: '#D63638',
              },
            }}
          >
            <DeleteIcon sx={{ fontSize: 14 }} />
          </IconButton>
        </Tooltip>
      </Box>
    </Paper>
  );
};

// ─── Main Page ───────────────────────────────────────────────

const PartyMenuManagement: React.FC = () => {
  const { showToast } = useGlobalToast();
  const [menus, setMenus] = useState<PartyMenu[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingMenu, setEditingMenu] = useState<PartyMenu | null>(null);
  const [formData, setFormData] =
    useState<Omit<PartyMenu, 'id' | 'createdAt' | 'updatedAt'>>(blankMenu());

  const [deleteTarget, setDeleteTarget] = useState<PartyMenu | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [filterType, setFilterType] = useState<MenuType | 'all'>('all');

  // ─── Image upload state ───────────────────────────────────────
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [imagesToDelete, setImagesToDelete] = useState<string[]>([]);
  const [newImageFiles, setNewImageFiles] = useState<File[]>([]);
  const [newImagePreviews, setNewImagePreviews] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const MAX_IMAGES = 5;

  // ─── Data loading ─────────────────────────────────────────────

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get<PartyMenu[]>('/party-menu');
      const data: PartyMenu[] = Array.isArray(res.data)
        ? res.data
        : (res.data as { data: PartyMenu[] }).data;
      setMenus([...data].sort((a, b) => a.sortOrder - b.sortOrder));
    } catch (err) {
      logger.error('loadPartyMenus', err);
      showToast(getErrorMessage(err), 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    void load();
  }, [load]);

  // Real-time updates via WebSocket
  useWsRefresh(WsEvent.PARTY_MENU_UPDATED, load);

  // ─── Dialog helpers ───────────────────────────────────────────

  const openCreate = () => {
    setEditingMenu(null);
    setFormData(blankMenu());
    setExistingImages([]);
    setImagesToDelete([]);
    setNewImageFiles([]);
    setNewImagePreviews([]);
    setDialogOpen(true);
  };

  const openEdit = (menu: PartyMenu) => {
    setEditingMenu(menu);
    setExistingImages(menu.imageUrls ? [...menu.imageUrls] : []);
    setImagesToDelete([]);
    setNewImageFiles([]);
    setNewImagePreviews([]);
    setFormData({
      name: menu.name,
      menuType: menu.menuType,
      pricePerPerson: menu.pricePerPerson,
      minimumGuests: menu.minimumGuests,
      maximumGuests: menu.maximumGuests,
      description: menu.description ?? '',
      isActive: menu.isActive,
      imageUrls: menu.imageUrls ?? [],
      sortOrder: menu.sortOrder,
      sections: menu.sections.map((sec) => ({
        ...sec,
        instruction: sec.instruction ?? '',
        items: sec.items.map((it) => ({
          ...it,
          description: it.description ?? '',
          notes: it.notes ?? '',
        })),
      })),
    });
    setDialogOpen(true);
  };

  const closeDialog = () => {
    if (!saving && !uploading) {
      newImagePreviews.forEach((p) => URL.revokeObjectURL(p));
      setNewImageFiles([]);
      setNewImagePreviews([]);
      setExistingImages([]);
      setImagesToDelete([]);
      setDialogOpen(false);
      setEditingMenu(null);
    }
  };

  // ─── Image handlers ───────────────────────────────────────────

  const currentImageCount =
    existingImages.filter((u) => !imagesToDelete.includes(u)).length +
    newImageFiles.length;

  const handleImageFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const maxSizeBytes = 1 * 1024 * 1024; // 1 MB
    const newFilesArr: File[] = [];
    const newPreviewsArr: string[] = [];
    let count = currentImageCount;

    for (let i = 0; i < files.length; i++) {
      if (count >= MAX_IMAGES) {
        showToast(`Maximum ${MAX_IMAGES} images allowed.`, 'error');
        break;
      }
      const file = files[i];
      if (!validTypes.includes(file.type)) {
        showToast('Only JPEG, PNG, and WebP images are allowed.', 'error');
        continue;
      }
      if (file.size > maxSizeBytes) {
        showToast(`"${file.name}" exceeds the 1 MB size limit.`, 'error');
        continue;
      }
      newFilesArr.push(file);
      newPreviewsArr.push(URL.createObjectURL(file));
      count++;
    }

    setNewImageFiles((prev) => [...prev, ...newFilesArr]);
    setNewImagePreviews((prev) => [...prev, ...newPreviewsArr]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleRemoveExistingImage = (url: string) => {
    setImagesToDelete((prev) => [...prev, url]);
  };

  const handleRemoveNewImage = (index: number) => {
    URL.revokeObjectURL(newImagePreviews[index]);
    setNewImageFiles((prev) => prev.filter((_, i) => i !== index));
    setNewImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  // ─── Section helpers ──────────────────────────────────────────

  const addSection = () => {
    const section: PartySection = {
      ...blankSection(),
      id: newLocalId(),
      sortOrder: formData.sections.length,
    };
    setFormData((p) => ({ ...p, sections: [...p.sections, section] }));
  };

  const updateSection = (idx: number, updated: PartySection) =>
    setFormData((p) => ({
      ...p,
      sections: p.sections.map((s, i) => (i === idx ? updated : s)),
    }));

  const deleteSection = (idx: number) =>
    setFormData((p) => ({
      ...p,
      sections: p.sections.filter((_, i) => i !== idx),
    }));

  const moveSection = (idx: number, dir: 'up' | 'down') => {
    const sections = [...formData.sections];
    const target = dir === 'up' ? idx - 1 : idx + 1;
    if (target < 0 || target >= sections.length) return;
    [sections[idx], sections[target]] = [sections[target], sections[idx]];
    setFormData((p) => ({
      ...p,
      sections: sections.map((s, i) => ({ ...s, sortOrder: i })),
    }));
  };

  // ─── Validation ───────────────────────────────────────────────

  const validate = (): string | null => {
    if (!formData.name.trim()) return 'Package name is required';
    if (formData.pricePerPerson <= 0)
      return 'Price per person must be greater than 0';
    if (
      formData.minimumGuests !== null &&
      formData.maximumGuests !== null &&
      formData.minimumGuests > formData.maximumGuests
    )
      return 'Minimum guests cannot be greater than maximum guests';
    for (let si = 0; si < formData.sections.length; si++) {
      const sec = formData.sections[si];

      for (let ii = 0; ii < sec.items.length; ii++)
        if (!sec.items[ii].name.trim())
          return `Item ${ii + 1} in section ${si + 1} must have a name`;
    }
    return null;
  };

  // ─── Save ─────────────────────────────────────────────────────

  const handleSave = async () => {
    const err = validate();
    if (err) {
      showToast(err, 'error');
      return;
    }

    // ── Upload new images, delete removed ones ──────────────────
    let finalImageUrls = existingImages.filter(
      (u) => !imagesToDelete.includes(u),
    );

    if (newImageFiles.length > 0) {
      setUploading(true);
      try {
        const uploaded = await uploadImages(newImageFiles, 'party-menu');
        finalImageUrls = [...finalImageUrls, ...uploaded];
      } catch (e) {
        showToast(`Image upload failed: ${getErrorMessage(e)}`, 'error');
        setUploading(false);
        return;
      } finally {
        setUploading(false);
      }
    }

    if (imagesToDelete.length > 0) {
      try {
        await api.delete('/upload/images', { data: { urls: imagesToDelete } });
      } catch {
        // non-blocking — old files may already be gone
      }
    }

    const payload = {
      name: formData.name.trim(),
      menuType: formData.menuType,
      pricePerPerson: Number(formData.pricePerPerson),
      minimumGuests: formData.minimumGuests
        ? Number(formData.minimumGuests)
        : undefined,
      maximumGuests: formData.maximumGuests
        ? Number(formData.maximumGuests)
        : undefined,
      description: formData.description.trim(),
      isActive: formData.isActive,
      imageUrls: finalImageUrls,
      sortOrder: formData.sortOrder,
    };

    setSaving(true);
    try {
      if (editingMenu) {
        await api.patch(`/party-menu/${editingMenu.id}`, payload);

        const originalSectionIds = new Set(
          editingMenu.sections.map((s) => s.id),
        );
        const currentSectionIds = new Set(
          formData.sections
            .filter((s) => !s.id.startsWith('local_'))
            .map((s) => s.id),
        );

        for (const origId of originalSectionIds)
          if (!currentSectionIds.has(origId))
            await api.delete(`/party-menu/sections/${origId}`);

        for (let si = 0; si < formData.sections.length; si++) {
          const sec = formData.sections[si];
          const secPayload = {
            title: sec.title,
            sectionType: sec.sectionType,
            instruction: sec.instruction,
            sortOrder: si,
          };

          let savedSectionId: string;
          if (sec.id.startsWith('local_')) {
            const beforeRes = await api.get<PartyMenu>(
              `/party-menu/${editingMenu.id}`,
            );
            const existingIds = new Set(
              (beforeRes.data as PartyMenu).sections.map((s) => s.id),
            );
            await api.post(
              `/party-menu/${editingMenu.id}/sections`,
              secPayload,
            );
            const afterRes = await api.get<PartyMenu>(
              `/party-menu/${editingMenu.id}`,
            );
            const newSection = (afterRes.data as PartyMenu).sections.find(
              (s) => !existingIds.has(s.id),
            );
            if (!newSection)
              throw new Error('Failed to identify newly created section');
            savedSectionId = newSection.id;
          } else {
            await api.patch(`/party-menu/sections/${sec.id}`, secPayload);
            savedSectionId = sec.id;
          }

          const originalSection = editingMenu.sections.find(
            (s) => s.id === sec.id,
          );
          const originalItemIds = new Set(
            originalSection?.items.map((it) => it.id) ?? [],
          );
          const currentItemIds = new Set(
            sec.items
              .filter((it) => !it.id.startsWith('local_'))
              .map((it) => it.id),
          );

          for (const origId of originalItemIds)
            if (!currentItemIds.has(origId))
              await api.delete(`/party-menu/items/${origId}`);

          for (let ii = 0; ii < sec.items.length; ii++) {
            const item = sec.items[ii];
            const itemPayload = {
              name: item.name,
              description: item.description,
              notes: item.notes,
              isAvailable: item.isAvailable,
              sortOrder: ii,
            };
            if (item.id.startsWith('local_'))
              await api.post(
                `/party-menu/sections/${savedSectionId}/items`,
                itemPayload,
              );
            else await api.patch(`/party-menu/items/${item.id}`, itemPayload);
          }
        }
        showToast('Party menu updated', 'success');
      } else {
        await api.post('/party-menu', {
          ...payload,
          sections: formData.sections.map((sec, si) => ({
            title: sec.title,
            sectionType: sec.sectionType,
            instruction: sec.instruction,
            sortOrder: si,
            items: sec.items.map((item, ii) => ({
              name: item.name,
              description: item.description,
              notes: item.notes,
              isAvailable: item.isAvailable,
              sortOrder: ii,
            })),
          })),
        });
        showToast('Party menu created', 'success');
      }

      closeDialog();
      await load();
    } catch (e) {
      logger.error('savePartyMenu', e);
      showToast(getErrorMessage(e), 'error');
    } finally {
      setSaving(false);
    }
  };;

  // ─── Toggle / Delete / Reorder ────────────────────────────────

  const handleToggleActive = async (menu: PartyMenu) => {
    try {
      await api.patch(`/party-menu/${menu.id}`, { isActive: !menu.isActive });
      await load();
    } catch (e) {
      showToast(getErrorMessage(e), 'error');
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.delete(`/party-menu/${deleteTarget.id}`);
      showToast('Party menu deleted', 'success');
      setDeleteTarget(null);
      await load();
    } catch (e) {
      showToast(getErrorMessage(e), 'error');
    } finally {
      setDeleting(false);
    }
  };

  const handleMove = async (id: string, dir: 'up' | 'down') => {
    const sorted = [...menus].sort((a, b) => a.sortOrder - b.sortOrder);
    const idx = sorted.findIndex((m) => m.id === id);
    const target = dir === 'up' ? idx - 1 : idx + 1;
    if (target < 0 || target >= sorted.length) return;
    try {
      await Promise.all([
        api.patch(`/party-menu/${sorted[idx].id}/reorder`, {
          sortOrder: target,
        }),
        api.patch(`/party-menu/${sorted[target].id}/reorder`, {
          sortOrder: idx,
        }),
      ]);
      await load();
    } catch (e) {
      showToast(getErrorMessage(e), 'error');
    }
  };

  // ─── Derived state ────────────────────────────────────────────

  const sorted = [...menus].sort((a, b) => a.sortOrder - b.sortOrder);
  const displayed = sorted.filter(
    (m) => filterType === 'all' || m.menuType === filterType,
  );
  const cocktailCount = menus.filter((m) => m.menuType === 'cocktail').length;
  const partyCount = menus.filter((m) => m.menuType === 'party').length;
  const activeCount = menus.filter((m) => m.isActive).length;

  const formTok = TOKEN[formData.menuType];

  // ─── Render ───────────────────────────────────────────────────

  return (
    <Box sx={{ p: { xs: 2, sm: 3 } }}>
      <PageHeader
        title="Party Menus"
        subtitle="Manage cocktail and party package menus with sections and items"
        breadcrumbs={[
          { label: 'Dashboard', href: '/' },
          { label: 'Party Menus' },
        ]}
        icon={<MenuBookIcon />}
        action={
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={openCreate}
            sx={{
              bgcolor: '#BE5953',
              fontWeight: 600,
              textTransform: 'none',
              borderRadius: '3px',
              boxShadow: 'none',
              '&:hover': { boxShadow: 'none', bgcolor: '#a84842' },
            }}
          >
            Add Package
          </Button>
        }
      />

      {/* Stats */}
      <SummaryStats
        stats={[
          {
            label: 'Total Packages',
            value: menus.length,
            icon: <MenuBookIcon />,
            color: '#BE5953',
          },
          {
            label: 'Cocktail Menus',
            value: cocktailCount,
            icon: <CocktailIcon />,
            color: '#0073AA',
          },
          {
            label: 'Party Menus',
            value: partyCount,
            icon: <PartyIcon />,
            color: '#BE5953',
          },
          {
            label: 'Active',
            value: activeCount,
            icon: <ActiveIcon />,
            color: '#00A32A',
            trendValue:
              menus.length > 0
                ? `${Math.round((activeCount / menus.length) * 100)}% active`
                : undefined,
            trend:
              activeCount === menus.length
                ? 'up'
                : activeCount === 0
                  ? 'down'
                  : 'neutral',
          },
        ]}
        columns={4}
      />

      {/* Filter bar */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          mb: 2.5,
          p: '10px 14px',
          bgcolor: '#FFFFFF',
          border: '1px solid #E2E4E7',
          borderRadius: '3px',
        }}
      >
        <Typography
          sx={{
            fontSize: '0.75rem',
            fontWeight: 700,
            color: '#787C82',
            mr: 0.5,
          }}
        >
          Filter:
        </Typography>
        {(
          [
            { key: 'all', label: 'All', count: menus.length, color: '#BE5953' },
            {
              key: 'cocktail',
              label: 'Cocktail',
              count: cocktailCount,
              color: '#0073AA',
            },
            {
              key: 'party',
              label: 'Party',
              count: partyCount,
              color: '#BE5953',
            },
          ] as const
        ).map(({ key, label, count, color }) => {
          const active = filterType === key;
          return (
            <Badge
              key={key}
              badgeContent={count}
              color="default"
              sx={{
                '& .MuiBadge-badge': {
                  fontSize: '0.6rem',
                  minWidth: 16,
                  height: 16,
                  bgcolor: active ? color : '#E2E4E7',
                  color: active ? '#fff' : '#787C82',
                },
              }}
            >
              <Chip
                label={label}
                size="small"
                onClick={() => setFilterType(key)}
                sx={{
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  borderRadius: '3px',
                  height: 28,
                  bgcolor: active ? color : 'transparent',
                  color: active ? '#fff' : '#50575E',
                  border: `1px solid ${active ? color : '#D0D3D8'}`,
                  '&:hover': {
                    bgcolor: active ? color : alpha(color, 0.06),
                    borderColor: color,
                  },
                }}
              />
            </Badge>
          );
        })}
        <Box sx={{ flex: 1 }} />
        {filterType !== 'all' && (
          <Button
            size="small"
            onClick={() => setFilterType('all')}
            sx={{
              fontSize: '0.7rem',
              color: '#787C82',
              textTransform: 'none',
              '&:hover': { color: '#BE5953' },
            }}
          >
            Clear filter
          </Button>
        )}
      </Box>

      {/* Content */}
      {loading ? (
        <LoadingState message="Loading party menus…" variant="linear" />
      ) : displayed.length === 0 ? (
        <EmptyState
          icon={<MenuBookIcon />}
          title={
            filterType === 'all'
              ? 'No party menus yet'
              : `No ${filterType} menus`
          }
          description={
            filterType === 'all'
              ? 'Create your first cocktail or party package with sections and items.'
              : `No ${filterType} menus match the current filter.`
          }
          action={
            filterType === 'all'
              ? { label: 'Add Package', onClick: openCreate, icon: <AddIcon /> }
              : undefined
          }
        />
      ) : (
        <Grid container spacing={2.5}>
          {displayed.map((menu) => {
            const fullIdx = sorted.findIndex((m) => m.id === menu.id);
            return (
              <Grid size={{ xs: 12, md: 6 }} key={menu.id}>
                <MenuCard
                  menu={menu}
                  isFirst={fullIdx === 0}
                  isLast={fullIdx === sorted.length - 1}
                  onEdit={openEdit}
                  onDelete={setDeleteTarget}
                  onToggleActive={handleToggleActive}
                  onMove={handleMove}
                />
              </Grid>
            );
          })}
        </Grid>
      )}

      {/* ─── Create / Edit Dialog ──────────────────────────────── */}
      <Dialog
        open={dialogOpen}
        onClose={closeDialog}
        maxWidth="md"
        fullWidth
        slotProps={{
          paper: {
            sx: { maxHeight: '92vh', borderRadius: '4px', overflow: 'hidden' },
          },
        }}
      >
        {/* Dialog header */}
        <Box
          sx={{
            bgcolor: '#1D2327',
            color: '#FFFFFF',
            px: 3,
            py: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: `3px solid ${formTok.color}`,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box
              sx={{
                width: 32,
                height: 32,
                borderRadius: '4px',
                bgcolor: formTok.color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {formData.menuType === 'cocktail' ? (
                <CocktailIcon sx={{ fontSize: 18, color: '#fff' }} />
              ) : (
                <PartyIcon sx={{ fontSize: 18, color: '#fff' }} />
              )}
            </Box>
            <Box>
              <Typography
                sx={{ fontWeight: 700, fontSize: '1rem', lineHeight: 1.2 }}
              >
                {editingMenu
                  ? `Edit: ${editingMenu.name}`
                  : 'Create New Package'}
              </Typography>
              <Typography sx={{ fontSize: '0.75rem', color: '#A7AAAD' }}>
                {editingMenu
                  ? 'Update package details and sections'
                  : 'Fill in the details below to add a new menu package'}
              </Typography>
            </Box>
          </Box>
          <IconButton
            onClick={closeDialog}
            disabled={saving || uploading}
            sx={{
              color: '#FFFFFF',
              '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' },
            }}
          >
            <CloseIcon />
          </IconButton>
        </Box>

        {(saving || uploading) && (
          <LinearProgress
            sx={{
              height: 2,
              '& .MuiLinearProgress-bar': { bgcolor: formTok.color },
              bgcolor: alpha(formTok.color, 0.15),
            }}
          />
        )}

        <DialogContent sx={{ p: 0, overflowX: 'hidden' }}>
          {/* ── Section 1: Package Details ─────────────────────── */}
          <Box sx={{ px: 3, pt: 2.5, pb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <Box
                sx={{
                  width: 4,
                  height: 18,
                  borderRadius: '2px',
                  bgcolor: formTok.color,
                }}
              />
              <Typography
                sx={{ fontWeight: 700, fontSize: '0.875rem', color: '#1D2327' }}
              >
                Package Details
              </Typography>
            </Box>

            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="Package name *"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, name: e.target.value }))
                  }
                  error={formData.name.trim() === ''}
                  helperText={
                    formData.name.trim() === '' ? 'Required' : undefined
                  }
                  fullWidth
                  size="small"
                />
              </Grid>
              <Grid size={{ xs: 6, sm: 3 }}>
                <FormControl fullWidth size="small">
                  <InputLabel>Type</InputLabel>
                  <Select
                    label="Type"
                    value={formData.menuType}
                    onChange={(e) =>
                      setFormData((p) => ({
                        ...p,
                        menuType: e.target.value as MenuType,
                      }))
                    }
                    sx={{
                      bgcolor: alpha(formTok.color, 0.04),
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: alpha(formTok.color, 0.3),
                      },
                    }}
                  >
                    <MuiMenuItem value="cocktail">
                      <Box
                        sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                      >
                        <CocktailIcon
                          sx={{ fontSize: 16, color: TOKEN.cocktail.color }}
                        />
                        Cocktail
                      </Box>
                    </MuiMenuItem>
                    <MuiMenuItem value="party">
                      <Box
                        sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                      >
                        <PartyIcon
                          sx={{ fontSize: 16, color: TOKEN.party.color }}
                        />
                        Party
                      </Box>
                    </MuiMenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 6, sm: 3 }}>
                <TextField
                  label="Price / person *"
                  type="number"
                  value={formData.pricePerPerson}
                  onChange={(e) =>
                    setFormData((p) => ({
                      ...p,
                      pricePerPerson: parseFloat(e.target.value) || 0,
                    }))
                  }
                  error={formData.pricePerPerson <= 0}
                  helperText={
                    formData.pricePerPerson <= 0 ? 'Must be > 0' : undefined
                  }
                  fullWidth
                  size="small"
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">$</InputAdornment>
                      ),
                    },
                    htmlInput: { min: 0, step: 0.05 },
                  }}
                />
              </Grid>
              <Grid size={{ xs: 6, sm: 3 }}>
                <TextField
                  label="Min guests"
                  type="number"
                  slotProps={{ htmlInput: { min: 1 } }}
                  value={formData.minimumGuests ?? ''}
                  onChange={(e) =>
                    setFormData((p) => ({
                      ...p,
                      minimumGuests: e.target.value
                        ? parseInt(e.target.value, 10)
                        : null,
                    }))
                  }
                  error={
                    formData.minimumGuests !== null &&
                    formData.maximumGuests !== null &&
                    formData.minimumGuests > formData.maximumGuests
                  }
                  fullWidth
                  size="small"
                />
              </Grid>
              <Grid size={{ xs: 6, sm: 3 }}>
                <TextField
                  label="Max guests"
                  type="number"
                  slotProps={{ htmlInput: { min: 1 } }}
                  value={formData.maximumGuests ?? ''}
                  onChange={(e) =>
                    setFormData((p) => ({
                      ...p,
                      maximumGuests: e.target.value
                        ? parseInt(e.target.value, 10)
                        : null,
                    }))
                  }
                  error={
                    formData.minimumGuests !== null &&
                    formData.maximumGuests !== null &&
                    formData.minimumGuests > formData.maximumGuests
                  }
                  helperText={
                    formData.minimumGuests !== null &&
                    formData.maximumGuests !== null &&
                    formData.minimumGuests > formData.maximumGuests
                      ? 'Max must be ≥ min'
                      : undefined
                  }
                  fullWidth
                  size="small"
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="Description (optional)"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, description: e.target.value }))
                  }
                  fullWidth
                  size="small"
                  multiline
                  rows={2}
                />
              </Grid>
              <Grid
                size={{ xs: 12, sm: 6 }}
                sx={{ display: 'flex', alignItems: 'center' }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5,
                    px: 2,
                    py: 1.25,
                    border: '1px solid #E2E4E7',
                    borderRadius: '4px',
                    bgcolor: formData.isActive ? '#F0FBF0' : '#F6F7F7',
                    width: '100%',
                    borderColor: formData.isActive ? '#B3DFBB' : '#E2E4E7',
                  }}
                >
                  <Switch
                    checked={formData.isActive}
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, isActive: e.target.checked }))
                    }
                    sx={{
                      '& .MuiSwitch-switchBase.Mui-checked': {
                        color: '#00A32A',
                      },
                      '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track':
                        { bgcolor: '#00A32A' },
                    }}
                  />
                  <Box>
                    <Typography
                      sx={{
                        fontSize: '0.813rem',
                        fontWeight: 700,
                        color: formData.isActive ? '#00A32A' : '#787C82',
                      }}
                    >
                      {formData.isActive ? 'Active' : 'Inactive'}
                    </Typography>
                    <Typography sx={{ fontSize: '0.7rem', color: '#A7AAAD' }}>
                      {formData.isActive
                        ? 'Visible on website'
                        : 'Hidden from website'}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </Box>

          <Divider />

          {/* ── Images ──────────────────────────────────────────── */}
          <Box sx={{ px: 3, pt: 2.5, pb: 2 }}>
            <Box
              sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}
            >
              <Box
                sx={{
                  width: 4,
                  height: 18,
                  borderRadius: '2px',
                  bgcolor: formTok.color,
                }}
              />
              <Typography
                sx={{ fontWeight: 700, fontSize: '0.875rem', color: '#1D2327' }}
              >
                Images
              </Typography>
              <Typography sx={{ fontSize: '0.75rem', color: '#787C82' }}>
                (up to {MAX_IMAGES}, max 1 MB each)
              </Typography>
            </Box>

            <Box
              sx={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 1,
                mb: currentImageCount < MAX_IMAGES ? 1.5 : 0,
              }}
            >
              {existingImages
                .filter((u) => !imagesToDelete.includes(u))
                .map((url) => (
                  <Box
                    key={url}
                    sx={{
                      position: 'relative',
                      width: 88,
                      height: 88,
                      borderRadius: '4px',
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
                      onClick={() => handleRemoveExistingImage(url)}
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

              {newImagePreviews.map((preview, idx) => (
                <Box
                  key={idx}
                  sx={{
                    position: 'relative',
                    width: 88,
                    height: 88,
                    borderRadius: '4px',
                    overflow: 'hidden',
                    border: `1px solid ${formTok.color}`,
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
                    onClick={() => handleRemoveNewImage(idx)}
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

            {currentImageCount < MAX_IMAGES && (
              <Box
                onClick={() => fileInputRef.current?.click()}
                sx={{
                  border: '2px dashed #CDD0D4',
                  borderRadius: '4px',
                  p: 2.5,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 0.75,
                  cursor: 'pointer',
                  bgcolor: '#FAFAFA',
                  transition: 'border-color 0.15s, background-color 0.15s',
                  '&:hover': {
                    borderColor: formTok.color,
                    bgcolor: alpha(formTok.color, 0.04),
                  },
                }}
              >
                <CloudUploadIcon sx={{ fontSize: 28, color: '#CDD0D4' }} />
                <Typography
                  fontSize="0.8125rem"
                  color="#50575E"
                  fontWeight={500}
                >
                  Click to upload images
                </Typography>
                <Typography fontSize="0.75rem" color="#A7AAAD">
                  JPEG, PNG, WebP · max 1 MB · {MAX_IMAGES - currentImageCount}{' '}
                  remaining
                </Typography>
              </Box>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              multiple
              title="Upload party menu images"
              aria-label="Upload party menu images"
              onChange={handleImageFileSelect}
              hidden
            />
          </Box>

          <Divider />

          {/* ── Section 2: Sections ─────────────────────────────── */}
          <Box sx={{ px: 3, pt: 2, pb: 2.5 }}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                mb: 2,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box
                  sx={{
                    width: 4,
                    height: 18,
                    borderRadius: '2px',
                    bgcolor: formTok.color,
                  }}
                />
                <Typography
                  sx={{
                    fontWeight: 700,
                    fontSize: '0.875rem',
                    color: '#1D2327',
                  }}
                >
                  Sections
                </Typography>
                {formData.sections.length > 0 && (
                  <Chip
                    label={formData.sections.length}
                    size="small"
                    sx={{
                      height: 18,
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      bgcolor: alpha(formTok.color, 0.1),
                      color: formTok.color,
                    }}
                  />
                )}
              </Box>
              <Button
                size="small"
                startIcon={<AddIcon sx={{ fontSize: 14 }} />}
                onClick={addSection}
                variant="outlined"
                sx={{
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  textTransform: 'none',
                  borderColor: formTok.color,
                  color: formTok.color,
                  '&:hover': { bgcolor: alpha(formTok.color, 0.06) },
                }}
              >
                Add Section
              </Button>
            </Box>

            {formData.sections.length === 0 ? (
              <Box
                sx={{
                  textAlign: 'center',
                  py: 4,
                  border: '2px dashed #E2E4E7',
                  borderRadius: '6px',
                  bgcolor: '#FAFAFA',
                }}
              >
                <SectionIcon sx={{ fontSize: 32, color: '#CDD0D4', mb: 1 }} />
                <Typography
                  sx={{
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    color: '#50575E',
                    mb: 0.5,
                  }}
                >
                  No sections yet
                </Typography>
                <Typography
                  sx={{ fontSize: '0.8rem', color: '#A7AAAD', mb: 2 }}
                >
                  Add sections like "Appetizers", "Mains", or "Dessert" to build
                  your menu.
                </Typography>
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<AddIcon />}
                  onClick={addSection}
                  sx={{
                    textTransform: 'none',
                    fontWeight: 600,
                    fontSize: '0.8rem',
                    borderColor: formTok.color,
                    color: formTok.color,
                    '&:hover': { bgcolor: alpha(formTok.color, 0.06) },
                  }}
                >
                  Add First Section
                </Button>
              </Box>
            ) : (
              formData.sections.map((sec, idx) => (
                <SectionEditor
                  key={sec.id}
                  section={sec}
                  index={idx}
                  total={formData.sections.length}
                  onChange={(updated) => updateSection(idx, updated)}
                  onDelete={() => deleteSection(idx)}
                  onMove={(dir) => moveSection(idx, dir)}
                />
              ))
            )}
          </Box>
        </DialogContent>

        <DialogActions
          sx={{
            px: 3,
            py: 1.5,
            gap: 1,
            bgcolor: '#F6F7F7',
            borderTop: '1px solid #E2E4E7',
          }}
        >
          <Stack
            direction="row"
            spacing={1}
            alignItems="center"
            sx={{ flex: 1 }}
          >
            {formData.sections.length > 0 && (
              <Typography sx={{ fontSize: '0.75rem', color: '#787C82' }}>
                <DotIcon sx={{ fontSize: 8, color: formTok.color, mr: 0.5 }} />
                {formData.sections.length} section
                {formData.sections.length !== 1 ? 's' : ''} ·{' '}
                {formData.sections.reduce((a, s) => a + s.items.length, 0)}{' '}
                items
              </Typography>
            )}
          </Stack>
          <Button
            onClick={closeDialog}
            disabled={saving || uploading}
            sx={{ textTransform: 'none', fontWeight: 600, color: '#50575E' }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            startIcon={
              saving || uploading ? undefined : (
                <SaveIcon sx={{ fontSize: 16 }} />
              )
            }
            onClick={handleSave}
            disabled={saving || uploading}
            sx={{
              bgcolor: formTok.color,
              fontWeight: 600,
              textTransform: 'none',
              borderRadius: '3px',
              boxShadow: 'none',
              minWidth: 130,
              '&:hover': {
                boxShadow: 'none',
                bgcolor:
                  formData.menuType === 'cocktail' ? '#005F8C' : '#a84842',
              },
            }}
          >
            {uploading
              ? 'Uploading…'
              : saving
                ? 'Saving…'
                : editingMenu
                  ? 'Save Changes'
                  : 'Create Package'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ─── Delete Confirmation ────────────────────────────────── */}
      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Party Menu"
        message={
          <>
            Are you sure you want to delete{' '}
            <strong>{deleteTarget?.name}</strong>? All sections and items will
            be permanently removed and cannot be recovered.
          </>
        }
        confirmText="Delete Package"
        severity="error"
        loading={deleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          if (!deleting) setDeleteTarget(null);
        }}
      />
    </Box>
  );
};

export default PartyMenuManagement;

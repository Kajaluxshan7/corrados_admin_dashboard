import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Box,
  Typography,
  Button,
  Chip,
  IconButton,
  TextField,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip,
  LinearProgress,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Fade,
} from '@mui/material';
import {
  Campaign as CampaignIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Send as SendIcon,
  Search as SearchIcon,
  Refresh as RefreshIcon,
  Drafts as DraftsIcon,
  CheckCircle as SentIcon,
  Group as GroupIcon,
  Close as CloseIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import moment from 'moment-timezone';
import { api } from '../utils/api';
import logger from '../utils/logger';
import { useGlobalToast } from '../contexts/ToastContext';
import { getErrorMessage } from '../utils/uploadHelpers';
import { PageHeader } from '../components/common/PageHeader';
import { SummaryStats } from '../components/common/SummaryStats';
import type { StatItem } from '../components/common/SummaryStats';

// ─── Types ────────────────────────────────────────────────────

type AnnouncementType = 'general' | 'promotion' | 'closure' | 'menu_update' | 'community' | 'holiday';
type AnnouncementPriority = 'low' | 'normal' | 'high' | 'urgent';
type AnnouncementStatus = 'draft' | 'sending' | 'sent' | 'failed';

interface Announcement {
  id: string;
  title: string;
  content: string;
  type: AnnouncementType;
  priority: AnnouncementPriority;
  status: AnnouncementStatus;
  recipientCount: number;
  sentAt: string | null;
  ctaText: string | null;
  ctaUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

interface AnnouncementStats {
  total: number;
  sent: number;
  drafts: number;
  totalRecipients: number;
}

interface FormData {
  title: string;
  content: string;
  type: AnnouncementType;
  priority: AnnouncementPriority;
  ctaText: string;
  ctaUrl: string;
}

// ─── Constants ────────────────────────────────────────────────

const TYPE_META: Record<AnnouncementType, { label: string; emoji: string; color: string; description: string }> = {
  general:     { label: 'General',       emoji: '📢', color: '#BE5953', description: 'General announcements' },
  promotion:   { label: 'Promotion',     emoji: '🎁', color: '#DBA617', description: 'Deals & promotions'   },
  closure:     { label: 'Closure',       emoji: '⚠️', color: '#D63638', description: 'Closures & rescheduling' },
  menu_update: { label: 'Menu Update',   emoji: '🍽️', color: '#00A32A', description: 'Menu changes'         },
  community:   { label: 'Community',     emoji: '🤝', color: '#0073AA', description: 'Community events'     },
  holiday:     { label: 'Holiday',       emoji: '🎄', color: '#787C82', description: 'Holiday notices'      },
};

const PRIORITY_META: Record<AnnouncementPriority, { label: string; color: string }> = {
  low:    { label: 'Low',    color: '#787C82' },
  normal: { label: 'Normal', color: '#00A32A' },
  high:   { label: 'High',   color: '#DBA617' },
  urgent: { label: 'Urgent', color: '#BE5953' },
};

const STATUS_META: Record<AnnouncementStatus, { label: string; color: string; bg: string }> = {
  draft:   { label: 'Draft',     color: '#787C82', bg: 'rgba(155,139,128,0.1)' },
  sending: { label: 'Sending…',  color: '#0073AA', bg: 'rgba(0,115,170,0.08)'  },
  sent:    { label: 'Sent',      color: '#00A32A', bg: 'rgba(0,163,42,0.08)'   },
  failed:  { label: 'Failed',    color: '#BE5953', bg: 'rgba(190,89,83,0.08)'  },
};

const INITIAL_FORM: FormData = {
  title: '', content: '', type: 'general', priority: 'normal', ctaText: '', ctaUrl: '',
};

// ─── Shared field style ────────────────────────────────────────
const fieldSx = {
  '& .MuiOutlinedInput-root': {
    borderRadius: '2px',
    '& fieldset': { borderColor: '#E2E4E7' },
    '&:hover fieldset': { borderColor: '#BE5953' },
    '&.Mui-focused fieldset': { borderColor: '#BE5953' },
  },
  '& .MuiInputLabel-root.Mui-focused': { color: '#BE5953' },
};

// ─── Component ────────────────────────────────────────────────

const AnnouncementsManagement: React.FC = () => {
  const { showToast } = useGlobalToast();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [stats, setStats] = useState<AnnouncementStats>({ total: 0, sent: 0, drafts: 0, totalRecipients: 0 });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | AnnouncementStatus>('all');

  const [formOpen, setFormOpen] = useState(false);
  const [formData, setFormData] = useState<FormData>(INITIAL_FORM);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [sendDialogOpen, setSendDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);
  const [sending, setSending] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [annRes, statsRes] = await Promise.all([
        api.get<Announcement[]>('/announcements'),
        api.get<AnnouncementStats>('/announcements/stats'),
      ]);
      setAnnouncements(annRes.data);
      setStats(statsRes.data);
    } catch (error) {
      logger.error('Failed to fetch announcements:', error);
      showToast(getErrorMessage(error), 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const filtered = useMemo(() => announcements.filter((a) => {
    const matchesSearch = a.title.toLowerCase().includes(searchTerm.toLowerCase()) || a.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || a.status === filterStatus;
    return matchesSearch && matchesFilter;
  }), [announcements, searchTerm, filterStatus]);

  const openCreate = () => { setFormData(INITIAL_FORM); setEditingId(null); setFormOpen(true); };
  const openEdit = (a: Announcement) => {
    setFormData({ title: a.title, content: a.content, type: a.type, priority: a.priority, ctaText: a.ctaText || '', ctaUrl: a.ctaUrl || '' });
    setEditingId(a.id);
    setFormOpen(true);
  };

  const handleSave = async () => {
    if (!formData.title.trim() || !formData.content.trim()) { showToast('Title and content are required', 'error'); return; }
    setSaving(true);
    try {
      const payload = { ...formData, ctaText: formData.ctaText || undefined, ctaUrl: formData.ctaUrl || undefined };
      if (editingId) { await api.put(`/announcements/${editingId}`, payload); showToast('Announcement updated', 'success'); }
      else            { await api.post('/announcements', payload);            showToast('Saved as draft', 'success'); }
      setFormOpen(false);
      fetchData();
    } catch (error) {
      logger.error('Save error:', error);
      showToast(getErrorMessage(error), 'error');
    } finally { setSaving(false); }
  };

  const handleSend = async () => {
    if (!selectedAnnouncement) return;
    setSending(true);
    try {
      await api.post(`/announcements/${selectedAnnouncement.id}/send`);
      showToast('Announcement sent!', 'success');
      setSendDialogOpen(false);
      setSelectedAnnouncement(null);
      fetchData();
    } catch (error) { showToast(getErrorMessage(error), 'error'); }
    finally { setSending(false); }
  };

  const handleDelete = async () => {
    if (!selectedAnnouncement) return;
    try {
      await api.delete(`/announcements/${selectedAnnouncement.id}`);
      showToast('Deleted', 'success');
      setDeleteDialogOpen(false);
      setSelectedAnnouncement(null);
      fetchData();
    } catch (error) { showToast(getErrorMessage(error), 'error'); }
  };

  const summaryStats: StatItem[] = [
    { label: 'Total',      value: stats.total,           icon: <CampaignIcon />, color: '#BE5953' },
    { label: 'Sent',       value: stats.sent,            icon: <SentIcon />,     color: '#00A32A' },
    { label: 'Drafts',     value: stats.drafts,          icon: <DraftsIcon />,   color: '#DBA617' },
    { label: 'Recipients', value: stats.totalRecipients, icon: <GroupIcon />,    color: '#0073AA' },
  ];

  const statusFilters: Array<'all' | AnnouncementStatus> = ['all', 'draft', 'sent', 'failed'];

  return (
    <Box>
      <PageHeader
        title="Announcements"
        subtitle="Create and send announcements to your newsletter subscribers"
        icon={<CampaignIcon />}
        action={
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="contained"
              startIcon={<AddIcon sx={{ fontSize: '14px !important' }} />}
              onClick={openCreate}
              sx={{
                bgcolor: '#1D2327',
                '&:hover': { bgcolor: '#BE5953' },
                borderRadius: '2px',
                fontWeight: 700,
                textTransform: 'none',
                fontSize: '0.845rem',
                boxShadow: 'none',
              }}
            >
              New Announcement
            </Button>
            <Tooltip title="Refresh">
              <IconButton onClick={fetchData} sx={{ color: '#BE5953', border: '1px solid #E2E4E7', borderRadius: '2px' }}>
                <RefreshIcon sx={{ fontSize: 18 }} />
              </IconButton>
            </Tooltip>
          </Box>
        }
      />

      {loading && <LinearProgress sx={{ mb: 2, height: 2, bgcolor: '#F0F0F1', '& .MuiLinearProgress-bar': { bgcolor: '#BE5953' } }} />}

      <SummaryStats stats={summaryStats} columns={4} />

      {/* Toolbar */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 2,
          mb: 2,
          flexWrap: 'wrap',
          bgcolor: '#FFFFFF',
          border: '1px solid #E2E4E7',
          borderRadius: '2px',
          px: 2,
          py: 1.25,
        }}
      >
        <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap' }}>
          {statusFilters.map((s) => (
            <Button
              key={s}
              size="small"
              variant={filterStatus === s ? 'contained' : 'text'}
              onClick={() => setFilterStatus(s)}
              sx={{
                borderRadius: '2px',
                fontWeight: 600,
                fontSize: '0.78rem',
                textTransform: 'none',
                px: 1.5,
                py: 0.375,
                minHeight: 0,
                ...(filterStatus === s
                  ? { bgcolor: '#BE5953', color: '#fff', '&:hover': { bgcolor: '#A84E48' }, boxShadow: 'none' }
                  : { color: '#50575E', '&:hover': { bgcolor: '#F5F0EB' } }),
              }}
            >
              {s === 'all' ? 'All' : STATUS_META[s].label}
              {s !== 'all' && (
                <Box component="span" sx={{ ml: 0.75, fontSize: '0.7rem', opacity: 0.75 }}>
                  ({announcements.filter((a) => a.status === s).length})
                </Box>
              )}
            </Button>
          ))}
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <TextField
            size="small"
            placeholder="Search announcements…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            slotProps={{ input: { startAdornment: <InputAdornment position="start"><SearchIcon sx={{ fontSize: 16, color: '#787C82' }} /></InputAdornment> } }}
            sx={{ width: 240, ...fieldSx, '& .MuiOutlinedInput-root': { borderRadius: '2px', fontSize: '0.845rem' } }}
          />
          <Typography sx={{ fontSize: '0.78rem', color: '#787C82', whiteSpace: 'nowrap' }}>
            {filtered.length} of {announcements.length}
          </Typography>
        </Box>
      </Box>

      {/* Table */}
      <Box sx={{ bgcolor: '#FFFFFF', border: '1px solid #E2E4E7', borderRadius: '2px', overflow: 'hidden' }}>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: '#F6F7F7' }}>
                {['Title', 'Type', 'Priority', 'Status', 'Created', 'Actions'].map((h) => (
                  <TableCell
                    key={h}
                    sx={{
                      fontWeight: 700,
                      fontSize: '0.72rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.06em',
                      color: '#787C82',
                      borderBottom: '2px solid #E2E4E7',
                      py: 1.25,
                      px: 2,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {h}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} sx={{ textAlign: 'center', py: 6, color: '#787C82', fontSize: '0.875rem' }}>
                    {searchTerm || filterStatus !== 'all' ? 'No matching announcements' : 'No announcements yet — create your first one.'}
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((a) => {
                  const type = TYPE_META[a.type];
                  const status = STATUS_META[a.status];
                  const priority = PRIORITY_META[a.priority];
                  return (
                    <TableRow
                      key={a.id}
                      sx={{
                        borderLeft: `3px solid ${type.color}`,
                        '&:hover': { bgcolor: '#F6F7F7' },
                        '&:last-child td': { borderBottom: 'none' },
                      }}
                    >
                      <TableCell sx={{ px: 2, py: 1.5, maxWidth: 300 }}>
                        <Typography sx={{ fontWeight: 600, fontSize: '0.845rem', color: '#1D2327', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {a.title}
                        </Typography>
                        <Typography sx={{ fontSize: '0.75rem', color: '#787C82', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 280 }}>
                          {a.content}
                        </Typography>
                        {a.sentAt && (
                          <Typography sx={{ fontSize: '0.68rem', color: '#787C82', mt: 0.25 }}>
                            Sent {moment(a.sentAt).tz('America/Toronto').format('MMM D [at] h:mm A')} · {a.recipientCount} recipients
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell sx={{ px: 2, py: 1.5, whiteSpace: 'nowrap' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                          <Box component="span" sx={{ fontSize: '0.9rem' }}>{type.emoji}</Box>
                          <Typography sx={{ fontSize: '0.8rem', color: '#50575E' }}>{type.label}</Typography>
                        </Box>
                      </TableCell>
                      <TableCell sx={{ px: 2, py: 1.5 }}>
                        <Chip
                          label={priority.label}
                          size="small"
                          sx={{
                            height: 20,
                            fontSize: '0.68rem',
                            fontWeight: 700,
                            borderRadius: '2px',
                            bgcolor: `${priority.color}12`,
                            color: priority.color,
                            border: `1px solid ${priority.color}25`,
                          }}
                        />
                      </TableCell>
                      <TableCell sx={{ px: 2, py: 1.5 }}>
                        <Chip
                          label={status.label}
                          size="small"
                          sx={{
                            height: 20,
                            fontSize: '0.68rem',
                            fontWeight: 700,
                            borderRadius: '2px',
                            bgcolor: status.bg,
                            color: status.color,
                            border: `1px solid ${status.color}25`,
                          }}
                        />
                      </TableCell>
                      <TableCell sx={{ px: 2, py: 1.5, whiteSpace: 'nowrap' }}>
                        <Typography sx={{ fontSize: '0.78rem', color: '#787C82' }}>
                          {moment(a.createdAt).tz('America/Toronto').format('MMM D, YYYY')}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ px: 2, py: 1.5 }}>
                        <Box sx={{ display: 'flex', gap: 0.5 }}>
                          {a.status === 'draft' && (
                            <>
                              <Tooltip title="Edit">
                                <IconButton size="small" onClick={() => openEdit(a)} sx={{ color: '#787C82', '&:hover': { color: '#BE5953', bgcolor: 'rgba(190,89,83,0.08)' } }}>
                                  <EditIcon sx={{ fontSize: 15 }} />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Send to subscribers">
                                <IconButton size="small" onClick={() => { setSelectedAnnouncement(a); setSendDialogOpen(true); }} sx={{ color: '#787C82', '&:hover': { color: '#00A32A', bgcolor: 'rgba(0,163,42,0.08)' } }}>
                                  <SendIcon sx={{ fontSize: 15 }} />
                                </IconButton>
                              </Tooltip>
                            </>
                          )}
                          <Tooltip title="Delete">
                            <IconButton size="small" onClick={() => { setSelectedAnnouncement(a); setDeleteDialogOpen(true); }} sx={{ color: '#787C82', '&:hover': { color: '#D63638', bgcolor: 'rgba(239,68,68,0.08)' } }}>
                              <DeleteIcon sx={{ fontSize: 15 }} />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      {/* ── Create / Edit Dialog ─────────────────────────── */}
      <Dialog
        open={formOpen}
        onClose={() => setFormOpen(false)}
        maxWidth="md"
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: '2px', border: '1px solid #E2E4E7' } } }}
      >
        <DialogTitle
          sx={{
            fontWeight: 700,
            fontSize: '1rem',
            color: '#1D2327',
            borderBottom: '1px solid #F0F0F1',
            pb: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          {editingId ? 'Edit Announcement' : 'New Announcement'}
          <IconButton size="small" onClick={() => setFormOpen(false)} sx={{ color: '#787C82' }}>
            <CloseIcon sx={{ fontSize: 17 }} />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ pt: '16px !important' }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            {/* Type selector */}
            <Box>
              <Typography sx={{ fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#787C82', mb: 1.25 }}>
                Announcement Type
              </Typography>
              <Grid container spacing={1}>
                {(Object.entries(TYPE_META) as [AnnouncementType, typeof TYPE_META[AnnouncementType]][]).map(([key, meta]) => (
                  <Grid size={{ xs: 6, sm: 4 }} key={key}>
                    <Box
                      onClick={() => setFormData((p) => ({ ...p, type: key }))}
                      sx={{
                        cursor: 'pointer',
                        p: 1.5,
                        borderRadius: '2px',
                        border: `2px solid ${formData.type === key ? meta.color : '#E2E4E7'}`,
                        bgcolor: formData.type === key ? `${meta.color}08` : 'transparent',
                        transition: 'all 0.15s',
                        '&:hover': { borderColor: meta.color },
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                      }}
                    >
                      <Box sx={{ fontSize: '1.2rem' }}>{meta.emoji}</Box>
                      <Box>
                        <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: '#1D2327' }}>{meta.label}</Typography>
                        <Typography sx={{ fontSize: '0.68rem', color: '#787C82' }}>{meta.description}</Typography>
                      </Box>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </Box>

            <TextField label="Title" fullWidth size="small" value={formData.title} onChange={(e) => setFormData((p) => ({ ...p, title: e.target.value }))} inputProps={{ maxLength: 200 }} helperText={`${formData.title.length}/200`} sx={fieldSx} />
            <TextField label="Content" fullWidth size="small" multiline rows={5} value={formData.content} onChange={(e) => setFormData((p) => ({ ...p, content: e.target.value }))} placeholder="Write the announcement content…" sx={fieldSx} />

            <FormControl size="small" sx={{ maxWidth: 180 }}>
              <InputLabel sx={{ '&.Mui-focused': { color: '#BE5953' } }}>Priority</InputLabel>
              <Select value={formData.priority} label="Priority" onChange={(e) => setFormData((p) => ({ ...p, priority: e.target.value as AnnouncementPriority }))} sx={{ borderRadius: '2px' }}>
                {(Object.entries(PRIORITY_META) as [AnnouncementPriority, typeof PRIORITY_META[AnnouncementPriority]][]).map(([k, v]) => (
                  <MenuItem key={k} value={k}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: v.color }} />
                      {v.label}
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Box>
              <Typography sx={{ fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#787C82', mb: 1.25 }}>
                Call to Action (Optional)
              </Typography>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField size="small" label="Button Text" value={formData.ctaText} onChange={(e) => setFormData((p) => ({ ...p, ctaText: e.target.value }))} placeholder="e.g., Learn More" inputProps={{ maxLength: 50 }} sx={{ flex: 1, ...fieldSx }} />
                <TextField size="small" label="Button URL" value={formData.ctaUrl} onChange={(e) => setFormData((p) => ({ ...p, ctaUrl: e.target.value }))} placeholder="https://…" sx={{ flex: 2, ...fieldSx }} />
              </Box>
            </Box>
          </Box>
        </DialogContent>

        <DialogActions sx={{ px: 2.5, pb: 2.5, gap: 1, borderTop: '1px solid #F0F0F1', pt: 2 }}>
          <Button onClick={() => setFormOpen(false)} variant="outlined" sx={{ borderColor: '#E2E4E7', color: '#50575E', borderRadius: '2px', fontWeight: 600, textTransform: 'none', '&:hover': { borderColor: '#BE5953', color: '#BE5953', bgcolor: 'transparent' } }}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            variant="contained"
            disabled={saving || !formData.title.trim() || !formData.content.trim()}
            sx={{ bgcolor: '#BE5953', '&:hover': { bgcolor: '#A84E48' }, borderRadius: '2px', fontWeight: 700, textTransform: 'none', boxShadow: 'none' }}
          >
            {saving ? 'Saving…' : editingId ? 'Update' : 'Save as Draft'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Send Dialog ──────────────────────────────────── */}
      <Dialog
        open={sendDialogOpen}
        onClose={() => !sending && setSendDialogOpen(false)}
        slotProps={{ paper: { sx: { borderRadius: '2px', border: '1px solid #E2E4E7', maxWidth: 480 } } }}
      >
        <DialogTitle sx={{ fontWeight: 700, fontSize: '1rem', color: '#1D2327', borderBottom: '1px solid #F0F0F1', pb: 2, display: 'flex', alignItems: 'center', gap: 1.25 }}>
          <Box sx={{ width: 30, height: 30, borderRadius: '2px', bgcolor: 'rgba(0,163,42,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <SendIcon sx={{ fontSize: 15, color: '#00A32A' }} />
          </Box>
          Send Announcement
        </DialogTitle>
        <DialogContent sx={{ pt: '16px !important' }}>
          {selectedAnnouncement && (
            <Box>
              <Typography sx={{ fontSize: '0.875rem', color: '#50575E', mb: 2 }}>
                Send this announcement to <strong>all active subscribers</strong>?
              </Typography>
              <Box sx={{ p: 2, bgcolor: '#F6F7F7', border: '1px solid #E2E4E7', borderRadius: '2px' }}>
                <Typography sx={{ fontWeight: 700, fontSize: '0.875rem', color: '#1D2327' }}>
                  {TYPE_META[selectedAnnouncement.type].emoji} {selectedAnnouncement.title}
                </Typography>
                <Typography sx={{ fontSize: '0.8rem', color: '#787C82', mt: 0.5 }}>
                  {TYPE_META[selectedAnnouncement.type].label} · Priority: {PRIORITY_META[selectedAnnouncement.priority].label}
                </Typography>
              </Box>
              {(selectedAnnouncement.priority === 'high' || selectedAnnouncement.priority === 'urgent') && (
                <Fade in>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 2, p: 1.5, bgcolor: 'rgba(201,169,110,0.08)', border: '1px solid rgba(219,166,23,0.25)', borderRadius: '2px' }}>
                    <WarningIcon sx={{ fontSize: 16, color: '#DBA617', flexShrink: 0 }} />
                    <Typography sx={{ fontSize: '0.8rem', color: '#50575E' }}>
                      This is a <strong>{selectedAnnouncement.priority} priority</strong> announcement and will be prominently highlighted.
                    </Typography>
                  </Box>
                </Fade>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 2.5, pb: 2.5, gap: 1, borderTop: '1px solid #F0F0F1', pt: 2 }}>
          <Button onClick={() => setSendDialogOpen(false)} disabled={sending} variant="outlined" sx={{ borderColor: '#E2E4E7', color: '#50575E', borderRadius: '2px', fontWeight: 600, textTransform: 'none', '&:hover': { borderColor: '#BE5953', color: '#BE5953', bgcolor: 'transparent' } }}>
            Cancel
          </Button>
          <Button
            onClick={handleSend}
            variant="contained"
            disabled={sending}
            startIcon={<SendIcon sx={{ fontSize: '15px !important' }} />}
            sx={{ bgcolor: '#00A32A', '&:hover': { bgcolor: '#224027' }, borderRadius: '2px', fontWeight: 700, textTransform: 'none', boxShadow: 'none' }}
          >
            {sending ? 'Sending…' : 'Send Now'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Delete Dialog ────────────────────────────────── */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        slotProps={{ paper: { sx: { borderRadius: '2px', border: '1px solid #E2E4E7', maxWidth: 420 } } }}
      >
        <DialogTitle sx={{ fontWeight: 700, fontSize: '1rem', color: '#1D2327', borderBottom: '1px solid #F0F0F1', pb: 2, display: 'flex', alignItems: 'center', gap: 1.25 }}>
          <Box sx={{ width: 30, height: 30, borderRadius: '2px', bgcolor: 'rgba(239,68,68,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <DeleteIcon sx={{ fontSize: 15, color: '#D63638' }} />
          </Box>
          Delete Announcement
        </DialogTitle>
        <DialogContent sx={{ pt: '16px !important' }}>
          <Typography sx={{ fontSize: '0.875rem', color: '#50575E' }}>
            Are you sure you want to permanently delete <strong>"{selectedAnnouncement?.title}"</strong>? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 2.5, pb: 2.5, gap: 1, borderTop: '1px solid #F0F0F1', pt: 2 }}>
          <Button onClick={() => setDeleteDialogOpen(false)} variant="outlined" sx={{ borderColor: '#E2E4E7', color: '#50575E', borderRadius: '2px', fontWeight: 600, textTransform: 'none', '&:hover': { borderColor: '#BE5953', color: '#BE5953', bgcolor: 'transparent' } }}>
            Cancel
          </Button>
          <Button onClick={handleDelete} variant="contained" sx={{ bgcolor: '#D63638', '&:hover': { bgcolor: '#A62527' }, borderRadius: '2px', fontWeight: 700, textTransform: 'none', boxShadow: 'none' }}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AnnouncementsManagement;

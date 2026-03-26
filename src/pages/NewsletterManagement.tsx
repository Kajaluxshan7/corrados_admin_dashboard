import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Box,
  Typography,
  Button,
  IconButton,
  TextField,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip,
  LinearProgress,
  CircularProgress,
  TablePagination,
  Checkbox,
  FormControlLabel,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Email as EmailIcon,
  Search as SearchIcon,
  PersonOff as UnsubscribedIcon,
  Group as GroupIcon,
  HourglassEmpty as PendingPromoIcon,
  Refresh as RefreshIcon,
  ContentCopy as CopyIcon,
  LocalOffer as PromoIcon,
  CheckCircleOutline as SentPromoIcon,
  TaskAlt as ClaimedIcon,
  Print as PrintIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Send as SendIcon,
} from '@mui/icons-material';
import { FaFacebookF } from 'react-icons/fa';
import { FaInstagram, FaTiktok } from 'react-icons/fa6';
import moment from 'moment-timezone';
import { api } from '../utils/api';
import logger from '../utils/logger';
import { useGlobalToast } from '../contexts/ToastContext';
import { getErrorMessage } from '../utils/uploadHelpers';
import { PageHeader } from '../components/common/PageHeader';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Subscriber {
  id: string;
  email: string;
  isActive: boolean;
  unsubscribeToken: string;
  subscribedAt: string;
  unsubscribedAt: string | null;
  updatedAt: string;
  promoCode: string | null;
  promoCodeSent: boolean;
  promoSentAt: string | null;
  promoClaimed: boolean;
  promoClaimedAt: string | null;
}

interface PaginatedSubscribersResponse {
  data: Subscriber[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface NewsletterStats {
  total: number;
  active: number;
  unsubscribed: number;
  promoSent: number;
  promoPending: number;
}

type FilterStatus =
  | 'all'
  | 'active'
  | 'unsubscribed'
  | 'promo_pending'
  | 'promo_sent'
  | 'promo_claimed';

// ─── Shared styles ────────────────────────────────────────────────────────────

const thSx = {
  fontSize: '0.7rem',
  fontWeight: 700,
  letterSpacing: '0.06em',
  textTransform: 'uppercase' as const,
  color: '#9B8B80',
  bgcolor: '#FDFAF8',
  borderBottom: '2px solid #E8E0D8',
  py: 1.25,
  px: 2,
  whiteSpace: 'nowrap' as const,
};

const tdSx = {
  fontSize: '0.82rem',
  color: '#1C1917',
  borderBottom: '1px solid #F0EBE4',
  py: 1.25,
  px: 2,
};

// ─── Main Component ───────────────────────────────────────────────────────────

const NewsletterManagement: React.FC = () => {
  const { showToast } = useGlobalToast();

  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [stats, setStats] = useState<NewsletterStats>({
    total: 0, active: 0, unsubscribed: 0, promoSent: 0, promoPending: 0,
  });
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [subscriberToDelete, setSubscriberToDelete] = useState<Subscriber | null>(null);
  const [sendingPromo, setSendingPromo] = useState<Record<string, boolean>>({});
  const [claimingPromo, setClaimingPromo] = useState<Record<string, boolean>>({});
  const [selectedSubscribers, setSelectedSubscribers] = useState<Map<string, Subscriber>>(new Map());

  // ─── Debounce ─────────────────────────────────────────────────────────────

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setDebouncedSearch(value);
      setPage(0);
      setSelectedSubscribers(new Map());
    }, 350);
  };

  // ─── Data fetching ────────────────────────────────────────────────────────

  const fetchSubscribers = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string | number> = {
        page: page + 1,
        limit: rowsPerPage,
        status: filterStatus,
      };
      if (debouncedSearch) params.search = debouncedSearch;
      const res = await api.get<PaginatedSubscribersResponse>('/newsletter/subscribers', { params });
      setSubscribers(res.data.data);
      setTotal(res.data.total);
    } catch (error) {
      logger.error('Failed to fetch subscribers:', error);
      showToast(getErrorMessage(error), 'error');
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, filterStatus, debouncedSearch, showToast]);

  const fetchStats = useCallback(async () => {
    try {
      const res = await api.get<NewsletterStats>('/newsletter/stats');
      setStats(res.data);
    } catch (error) {
      logger.error('Failed to fetch stats:', error);
    }
  }, []);

  const fetchAll = useCallback(() => {
    void fetchSubscribers();
    void fetchStats();
  }, [fetchSubscribers, fetchStats]);

  useEffect(() => { void fetchSubscribers(); }, [fetchSubscribers]);
  useEffect(() => { void fetchStats(); }, [fetchStats]);

  // ─── Pagination ───────────────────────────────────────────────────────────

  const handlePageChange = (_: unknown, newPage: number) => setPage(newPage);
  const handleRowsPerPageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(e.target.value, 10));
    setPage(0);
  };
  const handleFilterChange = (value: FilterStatus) => {
    setFilterStatus(value);
    setPage(0);
    setSelectedSubscribers(new Map());
  };

  // ─── Actions ──────────────────────────────────────────────────────────────

  const handleDelete = async () => {
    if (!subscriberToDelete) return;
    try {
      await api.delete(`/newsletter/subscribers/${subscriberToDelete.id}`);
      showToast('Subscriber removed successfully', 'success');
      setDeleteDialogOpen(false);
      setSubscriberToDelete(null);
      fetchAll();
    } catch (error) {
      logger.error('Failed to delete subscriber:', error);
      showToast(getErrorMessage(error), 'error');
    }
  };

  const handleSendPromo = async (subscriber: Subscriber) => {
    if (subscriber.promoCodeSent || sendingPromo[subscriber.id]) return;
    setSendingPromo((prev) => ({ ...prev, [subscriber.id]: true }));
    try {
      const res = await api.post<{ message: string; promoCode: string }>(
        `/newsletter/subscribers/${subscriber.id}/send-promo`,
      );
      setSubscribers((prev) =>
        prev.map((s) =>
          s.id === subscriber.id
            ? { ...s, promoCodeSent: true, promoCode: res.data.promoCode, promoSentAt: new Date().toISOString() }
            : s,
        ),
      );
      setStats((prev) => ({
        ...prev,
        promoSent: prev.promoSent + 1,
        promoPending: Math.max(0, prev.promoPending - 1),
      }));
      showToast(`Promo code sent to ${subscriber.email}`, 'success');
    } catch (error) {
      logger.error('Failed to send promo code:', error);
      showToast(getErrorMessage(error), 'error');
    } finally {
      setSendingPromo((prev) => ({ ...prev, [subscriber.id]: false }));
    }
  };

  const handleMarkClaimed = async (subscriber: Subscriber) => {
    if (!subscriber.promoCodeSent || subscriber.promoClaimed || claimingPromo[subscriber.id]) return;
    setClaimingPromo((prev) => ({ ...prev, [subscriber.id]: true }));
    try {
      await api.patch(`/newsletter/subscribers/${subscriber.id}/claim-promo`);
      setSubscribers((prev) =>
        prev.map((s) =>
          s.id === subscriber.id
            ? { ...s, promoClaimed: true, promoClaimedAt: new Date().toISOString() }
            : s,
        ),
      );
      showToast(`Promo marked as claimed for ${subscriber.email}`, 'success');
    } catch (error) {
      logger.error('Failed to mark promo as claimed:', error);
      showToast(getErrorMessage(error), 'error');
    } finally {
      setClaimingPromo((prev) => ({ ...prev, [subscriber.id]: false }));
    }
  };

  const handleCopyEmails = async () => {
    try {
      const res = await api.get<PaginatedSubscribersResponse>('/newsletter/subscribers', {
        params: { page: 1, limit: 1000, status: 'active' },
      });
      const emails = res.data.data.map((s) => s.email).join(', ');
      await navigator.clipboard.writeText(emails);
      showToast(`Copied ${res.data.total} active emails`, 'success');
    } catch (error) {
      showToast(getErrorMessage(error), 'error');
    }
  };

  // ─── Selection ────────────────────────────────────────────────────────────

  const handleToggleSelect = (subscriber: Subscriber) => {
    setSelectedSubscribers((prev) => {
      const next = new Map(prev);
      if (next.has(subscriber.id)) next.delete(subscriber.id);
      else next.set(subscriber.id, subscriber);
      return next;
    });
  };

  const allOnPageSelected = subscribers.length > 0 && subscribers.every((s) => selectedSubscribers.has(s.id));
  const someOnPageSelected = subscribers.some((s) => selectedSubscribers.has(s.id)) && !allOnPageSelected;

  const handleSelectAllPage = () => {
    if (allOnPageSelected) {
      setSelectedSubscribers((prev) => {
        const next = new Map(prev);
        subscribers.forEach((s) => next.delete(s.id));
        return next;
      });
    } else {
      setSelectedSubscribers((prev) => {
        const next = new Map(prev);
        subscribers.forEach((s) => next.set(s.id, s));
        return next;
      });
    }
  };

  const handlePrintSelected = () => {
    const toPrint = Array.from(selectedSubscribers.values());
    if (toPrint.length === 0) return;

    const formatDate = (iso: string | null, includeTime = false) => {
      if (!iso) return '-';
      const fmt = includeTime ? 'MMM D, YYYY h:mm A' : 'MMM D, YYYY';
      return moment(iso).tz('America/Toronto').format(fmt);
    };

    const logoUrl = `${window.location.origin}/corrados-logo.png`;
    const rows = toPrint.map((s, i) => `
      <tr class="${i % 2 === 0 ? 'even' : 'odd'}">
        <td class="num">${i + 1}</td>
        <td class="email">${s.email}</td>
        <td><span class="badge ${s.isActive ? 'active' : 'inactive'}">${s.isActive ? 'Active' : 'Unsub'}</span></td>
        <td>${formatDate(s.subscribedAt)}</td>
        <td class="mono">${s.promoCode ?? '-'}</td>
        <td><span class="badge ${s.promoClaimed ? 'claimed' : s.promoCodeSent ? 'sent' : 'pending'}">${s.promoClaimed ? 'Claimed' : s.promoCodeSent ? 'Sent' : 'Pending'}</span></td>
        <td>${s.promoSentAt ? formatDate(s.promoSentAt) : '-'}</td>
        <td>${s.promoClaimedAt ? formatDate(s.promoClaimedAt) : '-'}</td>
      </tr>`).join('');

    const filterLabel = filterOptions.find((f) => f.value === filterStatus)?.label ?? 'All';
    const printedAt = moment().tz('America/Toronto').format('MMMM D, YYYY [at] h:mm A');

    const html = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"/><title>Newsletter Subscribers - Corrado's Restaurant</title>
<style>
*{box-sizing:border-box;margin:0;padding:0}html,body{height:100%}body{font-family:'Segoe UI',Arial,sans-serif;font-size:10px;color:#1a1a1a;padding:96px 0 48px 0}
@page{size:letter portrait;margin:0.45in;@top-left{content:''}@top-center{content:''}@top-right{content:''}@bottom-left{content:''}@bottom-center{content:''}@bottom-right{content:''}}
.page-header{position:fixed;top:0;left:0;right:0;background:#fff;padding:14px 0 10px 0;border-bottom:2.5px solid #BE5953;z-index:100}
.header-inner{display:flex;align-items:center;justify-content:space-between;gap:16px;max-width:100%}
.brand{display:flex;align-items:center;gap:12px}.brand-logo{width:60px;height:60px;object-fit:contain;border-radius:5px;flex-shrink:0}
.brand-text h1{font-size:15px;font-weight:800;color:#BE5953;letter-spacing:-0.3px}.brand-text .tagline{font-size:9.5px;color:#999;margin-top:1px}
.brand-text .report-badge{display:inline-block;margin-top:4px;font-size:9px;font-weight:700;color:#fff;background:#BE5953;padding:2px 8px;border-radius:9px;letter-spacing:0.3px}
.meta{text-align:right;flex-shrink:0}.meta p{font-size:9px;color:#666;line-height:1.7}.meta strong{color:#1a1a1a}
.page-footer{position:fixed;bottom:0;left:0;right:0;background:#fff;border-top:1.5px solid #e0c9b0;padding:7px 0 5px 0;display:flex;justify-content:space-between;align-items:center;z-index:100}
.page-footer p{font-size:8.5px;color:#bbb}.content{width:100%}
.summary{display:flex;gap:0;margin-bottom:14px;border:1px solid #e8d5c0;border-radius:7px;overflow:hidden}
.summary-item{flex:1;text-align:center;padding:9px 4px;border-right:1px solid #e8d5c0}.summary-item:last-child{border-right:none}
.summary-item .val{font-size:18px;font-weight:800;color:#BE5953;line-height:1}.summary-item .lbl{font-size:8px;color:#999;text-transform:uppercase;letter-spacing:0.5px;margin-top:2px}
table{width:100%;border-collapse:collapse;font-size:9.5px}thead tr{background:#BE5953}
thead th{padding:7px 8px;text-align:left;font-weight:700;font-size:8.5px;text-transform:uppercase;letter-spacing:0.5px;color:#fff;white-space:nowrap}
thead th.num{width:24px;text-align:center}tbody tr.even{background:#fff}tbody tr.odd{background:#fdf8f4}
td{padding:6px 8px;vertical-align:middle;border-bottom:1px solid #f0e8df}td.num{text-align:center;color:#bbb;font-size:8.5px}
td.email{font-weight:600;color:#111;word-break:break-all;max-width:180px}td.mono{font-family:'Courier New',monospace;font-weight:700;color:#1565c0;font-size:9px;letter-spacing:1px}
.badge{display:inline-block;padding:2px 6px;border-radius:8px;font-size:8px;font-weight:700;text-transform:uppercase;letter-spacing:0.3px;white-space:nowrap}
.badge.active{background:#e8f5e9;color:#2e7d32}.badge.inactive{background:#fff3e0;color:#bf360c}
.badge.sent{background:#e3f2fd;color:#1565c0}.badge.claimed{background:#e8f5e9;color:#2e7d32}.badge.pending{background:#F5EDE4;color:#757575}
@media print{body{padding:96px 0 48px 0}}
</style></head><body>
<div class="page-header"><div class="header-inner">
<div class="brand"><img class="brand-logo" src="${logoUrl}" alt="Corrado's"/>
<div class="brand-text"><h1>Corrado's Restaurant</h1><div class="tagline">Newsletter Management System</div><span class="report-badge">Subscriber Report</span></div></div>
<div class="meta"><p><strong>Printed:</strong> ${printedAt}</p><p><strong>Filter:</strong> ${filterLabel}${debouncedSearch ? ` &middot; &ldquo;${debouncedSearch}&rdquo;` : ''}</p>
<p><strong>Selected:</strong> ${toPrint.length} subscriber${toPrint.length !== 1 ? 's' : ''}</p><p><strong>Total in DB:</strong> ${total}</p></div>
</div></div>
<div class="content">
<div class="summary">
<div class="summary-item"><div class="val">${toPrint.length}</div><div class="lbl">Printed</div></div>
<div class="summary-item"><div class="val">${toPrint.filter((s) => s.isActive).length}</div><div class="lbl">Active</div></div>
<div class="summary-item"><div class="val">${toPrint.filter((s) => !s.isActive).length}</div><div class="lbl">Unsubscribed</div></div>
<div class="summary-item"><div class="val">${toPrint.filter((s) => s.promoCodeSent).length}</div><div class="lbl">Promo Sent</div></div>
<div class="summary-item"><div class="val">${toPrint.filter((s) => s.promoClaimed).length}</div><div class="lbl">Claimed</div></div>
<div class="summary-item"><div class="val">${toPrint.filter((s) => s.isActive && !s.promoCodeSent).length}</div><div class="lbl">Need Promo</div></div>
</div>
<table><thead><tr><th class="num">#</th><th>Email Address</th><th>Sub Status</th><th>Subscribed On</th><th>Promo Code</th><th>Promo Status</th><th>Promo Sent</th><th>Promo Claimed</th></tr></thead>
<tbody>${rows}</tbody></table></div>
<div class="page-footer"><p>Corrado's Restaurant &mdash; Confidential, for internal use only</p><p>Generated ${printedAt}</p></div>
<script>var img=document.querySelector('.brand-logo');if(img){img.onload=function(){window.print()};img.onerror=function(){window.print()}}else{window.print()}</script>
</body></html>`;

    const blob = new Blob([html], { type: 'text/html' });
    const blobUrl = URL.createObjectURL(blob);
    const win = window.open(blobUrl, '_blank', 'width=900,height=750');
    if (win) win.addEventListener('load', () => URL.revokeObjectURL(blobUrl), { once: true });
  };

  // ─── Derived ──────────────────────────────────────────────────────────────

  const filterOptions: { value: FilterStatus; label: string; count?: number }[] = [
    { value: 'all', label: 'All', count: stats.total },
    { value: 'active', label: 'Active', count: stats.active },
    { value: 'unsubscribed', label: 'Unsubscribed', count: stats.unsubscribed },
    { value: 'promo_pending', label: 'Need Promo', count: stats.promoPending },
    { value: 'promo_sent', label: 'Promo Sent', count: stats.promoSent },
    { value: 'promo_claimed', label: 'Claimed' },
  ];

  const statCards = [
    { label: 'Total Subscribers', value: stats.total, color: '#BE5953', icon: <GroupIcon sx={{ fontSize: 18 }} /> },
    { label: 'Active', value: stats.active, color: '#2C5530', icon: <CheckCircleIcon sx={{ fontSize: 18 }} /> },
    { label: 'Unsubscribed', value: stats.unsubscribed, color: '#757575', icon: <CancelIcon sx={{ fontSize: 18 }} /> },
    { label: 'Promo Sent', value: stats.promoSent, color: '#243A7D', icon: <SentPromoIcon sx={{ fontSize: 18 }} /> },
    { label: 'Pending Promo', value: stats.promoPending, color: '#C9A96E', icon: <PendingPromoIcon sx={{ fontSize: 18 }} /> },
  ];

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <PageHeader
        title="Newsletter"
        subtitle="Manage subscribers and send promo codes"
        icon={<EmailIcon sx={{ fontSize: 20, color: '#BE5953' }} />}
        action={
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            {selectedSubscribers.size > 0 && (
              <Button
                variant="contained"
                size="small"
                startIcon={<PrintIcon sx={{ fontSize: '15px !important' }} />}
                onClick={handlePrintSelected}
                sx={{ bgcolor: '#1D1917', '&:hover': { bgcolor: '#BE5953' }, borderRadius: '5px', textTransform: 'none', fontWeight: 600, fontSize: '0.8rem', boxShadow: 'none' }}
              >
                Print ({selectedSubscribers.size})
              </Button>
            )}
            <Button
              variant="outlined"
              size="small"
              startIcon={<CopyIcon sx={{ fontSize: '15px !important' }} />}
              onClick={handleCopyEmails}
              disabled={stats.active === 0}
              sx={{ borderColor: '#E8E0D8', color: '#6B5C52', '&:hover': { borderColor: '#BE5953', color: '#BE5953', bgcolor: 'rgba(190,89,83,0.04)' }, borderRadius: '5px', textTransform: 'none', fontWeight: 600, fontSize: '0.8rem' }}
            >
              Copy Emails
            </Button>
            <Tooltip title="Refresh">
              <IconButton onClick={fetchAll} size="small" sx={{ border: '1px solid #E8E0D8', borderRadius: '5px', color: '#9B8B80', '&:hover': { color: '#BE5953', borderColor: '#BE5953' } }}>
                <RefreshIcon sx={{ fontSize: 17 }} />
              </IconButton>
            </Tooltip>
          </Box>
        }
      />

      {/* Stat cards */}
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 2, mb: 3 }}>
        {statCards.map((s) => (
          <Box key={s.label} sx={{ bgcolor: '#FFFFFF', border: '1px solid #E8E0D8', borderLeft: `4px solid ${s.color}`, borderRadius: '6px', p: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
              <Typography sx={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#9B8B80' }}>{s.label}</Typography>
              <Box sx={{ color: s.color, opacity: 0.7 }}>{s.icon}</Box>
            </Box>
            <Typography sx={{ fontSize: '1.625rem', fontWeight: 800, color: '#1C1917', letterSpacing: '-0.03em', lineHeight: 1 }}>{s.value}</Typography>
          </Box>
        ))}
      </Box>

      {/* Social footer info */}
      <Box sx={{ bgcolor: '#FFFFFF', border: '1px solid #E8E0D8', borderRadius: '6px', px: 2.5, py: 1.5, mb: 2.5, display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#9B8B80', mr: 0.5 }}>Email footer links:</Typography>
        {[
          { href: 'https://www.facebook.com/corradosrestaurant', bg: '#1877F2', icon: <FaFacebookF size={12} />, title: 'Facebook' },
          { href: 'https://www.instagram.com/corradosrestaurantngrill/', bg: '#E1306C', icon: <FaInstagram size={13} />, title: 'Instagram' },
          { href: 'https://www.tiktok.com/@corradosrestaurantngrill', bg: '#010101', icon: <FaTiktok size={13} />, title: 'TikTok' },
        ].map(({ href, bg, icon, title }) => (
          <Tooltip key={title} title={title}>
            <Box component="a" href={href} target="_blank" rel="noopener noreferrer"
              sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 26, height: 26, borderRadius: '5px', bgcolor: bg, color: '#fff', textDecoration: 'none', '&:hover': { opacity: 0.8 } }}>
              {icon}
            </Box>
          </Tooltip>
        ))}
        <Typography sx={{ fontSize: '0.72rem', color: '#9B8B80', ml: 0.5 }}>These links appear in every newsletter email sent to subscribers.</Typography>
      </Box>

      {/* Table panel */}
      <Box sx={{ bgcolor: '#FFFFFF', border: '1px solid #E8E0D8', borderRadius: '6px', overflow: 'hidden' }}>
        {/* Toolbar */}
        <Box sx={{ px: 2.5, py: 2, borderBottom: '1px solid #F0EBE4', display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap', bgcolor: '#FDFAF8' }}>
          <FormControlLabel
            control={
              <Checkbox
                checked={allOnPageSelected}
                indeterminate={someOnPageSelected}
                onChange={handleSelectAllPage}
                disabled={subscribers.length === 0}
                size="small"
                sx={{ color: 'rgba(190,89,83,0.4)', '&.Mui-checked, &.MuiCheckbox-indeterminate': { color: '#BE5953' }, p: 0.5 }}
              />
            }
            label={<Typography sx={{ fontSize: '0.75rem', color: '#9B8B80', fontWeight: 600 }}>{selectedSubscribers.size > 0 ? `${selectedSubscribers.size} selected` : 'Select page'}</Typography>}
            sx={{ m: 0 }}
          />
          <TextField
            size="small"
            placeholder="Search by email..."
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
            slotProps={{ input: { startAdornment: <InputAdornment position="start"><SearchIcon sx={{ fontSize: 16, color: '#9B8B80' }} /></InputAdornment> } }}
            sx={{ width: 240, '& .MuiOutlinedInput-root': { bgcolor: '#FFFFFF', borderRadius: '5px', fontSize: '0.82rem', '& fieldset': { borderColor: '#E8E0D8' }, '&:hover fieldset': { borderColor: '#BE5953' }, '&.Mui-focused fieldset': { borderColor: '#BE5953' } } }}
          />
          <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap' }}>
            {filterOptions.map(({ value, label, count }) => (
              <Box
                key={value}
                onClick={() => handleFilterChange(value)}
                sx={{
                  display: 'inline-flex', alignItems: 'center', gap: 0.5,
                  px: 1.5, py: 0.5, borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600,
                  border: '1px solid',
                  ...(filterStatus === value
                    ? { bgcolor: '#1D1917', color: '#FFFFFF', borderColor: '#1D1917' }
                    : { bgcolor: 'transparent', color: '#6B5C52', borderColor: '#E8E0D8', '&:hover': { borderColor: '#BE5953', color: '#BE5953' } }),
                }}
              >
                {label}
                {count !== undefined && (
                  <Box component="span" sx={{ fontSize: '0.68rem', fontWeight: 700, opacity: filterStatus === value ? 0.75 : 0.6 }}>({count})</Box>
                )}
              </Box>
            ))}
          </Box>
          <Typography sx={{ fontSize: '0.78rem', color: '#9B8B80', ml: 'auto' }}>
            {total > 0 ? `${total} subscriber${total !== 1 ? 's' : ''}` : 'No results'}
          </Typography>
        </Box>

        {loading && <LinearProgress sx={{ height: 2, '& .MuiLinearProgress-bar': { bgcolor: '#BE5953' } }} />}

        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ ...thSx, width: 40 }} padding="checkbox" />
                <TableCell sx={thSx}>Subscriber</TableCell>
                <TableCell sx={thSx}>Status</TableCell>
                <TableCell sx={thSx}>Promo Code</TableCell>
                <TableCell sx={thSx}>Promo Status</TableCell>
                <TableCell sx={thSx}>Subscribed</TableCell>
                <TableCell sx={{ ...thSx, textAlign: 'right' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {!loading && subscribers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} sx={{ py: 6, textAlign: 'center', border: 0 }}>
                    <Box sx={{ width: 48, height: 48, borderRadius: '6px', bgcolor: 'rgba(190,89,83,0.08)', border: '1px solid rgba(190,89,83,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 1.5 }}>
                      <EmailIcon sx={{ fontSize: 22, color: '#BE5953' }} />
                    </Box>
                    <Typography sx={{ fontWeight: 600, fontSize: '0.9rem', color: '#1C1917', mb: 0.5 }}>
                      {debouncedSearch || filterStatus !== 'all' ? 'No matching subscribers' : 'No subscribers yet'}
                    </Typography>
                    <Typography sx={{ fontSize: '0.8rem', color: '#9B8B80' }}>
                      {debouncedSearch || filterStatus !== 'all' ? 'Try adjusting your search or filter' : 'Subscribers will appear here when users sign up via the website'}
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                subscribers.map((subscriber) => {
                  const canSendPromo = subscriber.isActive && !subscriber.promoCodeSent;
                  const canMarkClaimed = subscriber.promoCodeSent && !subscriber.promoClaimed;
                  const isSelected = selectedSubscribers.has(subscriber.id);

                  let promoChip = null;
                  if (subscriber.promoClaimed) {
                    promoChip = { label: 'Claimed', color: '#2C5530', bg: 'rgba(44,85,48,0.08)', border: 'rgba(44,85,48,0.2)' };
                  } else if (subscriber.promoCodeSent) {
                    promoChip = { label: 'Sent', color: '#243A7D', bg: 'rgba(36,58,125,0.08)', border: 'rgba(36,58,125,0.2)' };
                  } else if (subscriber.isActive) {
                    promoChip = { label: 'Pending', color: '#C9A96E', bg: 'rgba(201,169,110,0.1)', border: 'rgba(201,169,110,0.25)' };
                  }

                  return (
                    <TableRow
                      key={subscriber.id}
                      sx={{
                        bgcolor: isSelected ? 'rgba(190,89,83,0.04)' : '#FFFFFF',
                        opacity: subscriber.isActive ? 1 : 0.65,
                        '&:hover': { bgcolor: isSelected ? 'rgba(190,89,83,0.06)' : '#FDFAF8' },
                      }}
                    >
                      <TableCell sx={{ ...tdSx, width: 40 }} padding="checkbox">
                        <Checkbox
                          checked={isSelected}
                          onChange={() => handleToggleSelect(subscriber)}
                          size="small"
                          sx={{ color: 'rgba(190,89,83,0.4)', '&.Mui-checked': { color: '#BE5953' }, p: 0.5 }}
                        />
                      </TableCell>
                      <TableCell sx={tdSx}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                          <Box sx={{ width: 32, height: 32, borderRadius: '50%', bgcolor: subscriber.isActive ? 'rgba(44,85,48,0.1)' : 'rgba(117,117,117,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            {subscriber.isActive
                              ? <EmailIcon sx={{ fontSize: 15, color: '#2C5530' }} />
                              : <UnsubscribedIcon sx={{ fontSize: 15, color: '#757575' }} />}
                          </Box>
                          <Box>
                            <Typography sx={{ fontSize: '0.82rem', fontWeight: 600, color: '#1C1917' }}>{subscriber.email}</Typography>
                            {subscriber.promoCodeSent && subscriber.promoCode && (
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.25 }}>
                                <PromoIcon sx={{ fontSize: 11, color: '#243A7D' }} />
                                <Typography sx={{ fontSize: '0.7rem', color: '#243A7D', fontFamily: 'monospace', fontWeight: 700 }}>{subscriber.promoCode}</Typography>
                              </Box>
                            )}
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell sx={tdSx}>
                        <Box sx={{
                          display: 'inline-flex', alignItems: 'center', gap: 0.5,
                          px: '6px', height: 22, borderRadius: '4px', fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.02em',
                          border: '1px solid',
                          ...(subscriber.isActive
                            ? { color: '#2C5530', bgcolor: 'rgba(44,85,48,0.08)', borderColor: 'rgba(44,85,48,0.2)' }
                            : { color: '#757575', bgcolor: 'rgba(117,117,117,0.08)', borderColor: 'rgba(117,117,117,0.2)' }),
                        }}>
                          {subscriber.isActive ? <CheckCircleIcon sx={{ fontSize: '0.85rem' }} /> : <CancelIcon sx={{ fontSize: '0.85rem' }} />}
                          {subscriber.isActive ? 'Active' : 'Unsubscribed'}
                        </Box>
                      </TableCell>
                      <TableCell sx={tdSx}>
                        {subscriber.promoCode
                          ? <Typography sx={{ fontSize: '0.78rem', fontFamily: 'monospace', fontWeight: 700, color: '#243A7D', letterSpacing: '0.05em' }}>{subscriber.promoCode}</Typography>
                          : <Typography sx={{ fontSize: '0.78rem', color: '#9B8B80' }}>—</Typography>}
                      </TableCell>
                      <TableCell sx={tdSx}>
                        {promoChip && (
                          <Box sx={{ display: 'inline-flex', alignItems: 'center', px: '6px', height: 22, borderRadius: '4px', fontSize: '0.72rem', fontWeight: 600, border: '1px solid', color: promoChip.color, bgcolor: promoChip.bg, borderColor: promoChip.border }}>
                            {promoChip.label}
                          </Box>
                        )}
                      </TableCell>
                      <TableCell sx={tdSx}>
                        <Typography sx={{ fontSize: '0.78rem', color: '#6B5C52' }}>
                          {moment(subscriber.subscribedAt).tz('America/Toronto').format('MMM D, YYYY')}
                        </Typography>
                        {subscriber.unsubscribedAt && !subscriber.isActive && (
                          <Typography sx={{ fontSize: '0.72rem', color: '#9B8B80' }}>
                            Unsub {moment(subscriber.unsubscribedAt).tz('America/Toronto').format('MMM D, YYYY')}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell sx={{ ...tdSx, textAlign: 'right' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 0.75 }}>
                          {canSendPromo && (
                            <Tooltip title="Send promo code">
                              <Button
                                size="small"
                                variant="outlined"
                                onClick={() => handleSendPromo(subscriber)}
                                disabled={sendingPromo[subscriber.id]}
                                startIcon={sendingPromo[subscriber.id] ? <CircularProgress size={11} color="inherit" /> : <SendIcon sx={{ fontSize: '13px !important' }} />}
                                sx={{ fontSize: '0.72rem', fontWeight: 600, borderRadius: '4px', textTransform: 'none', borderColor: '#E8E0D8', color: '#6B5C52', '&:hover': { borderColor: '#243A7D', color: '#243A7D', bgcolor: 'rgba(36,58,125,0.04)' }, minWidth: 0, px: 1.25, py: 0.25 }}
                              >
                                Send Promo
                              </Button>
                            </Tooltip>
                          )}
                          {canMarkClaimed && (
                            <Tooltip title="Mark promo as claimed">
                              <Button
                                size="small"
                                variant="outlined"
                                onClick={() => handleMarkClaimed(subscriber)}
                                disabled={claimingPromo[subscriber.id]}
                                startIcon={claimingPromo[subscriber.id] ? <CircularProgress size={11} color="inherit" /> : <ClaimedIcon sx={{ fontSize: '13px !important' }} />}
                                sx={{ fontSize: '0.72rem', fontWeight: 600, borderRadius: '4px', textTransform: 'none', borderColor: '#E8E0D8', color: '#6B5C52', '&:hover': { borderColor: '#2C5530', color: '#2C5530', bgcolor: 'rgba(44,85,48,0.04)' }, minWidth: 0, px: 1.25, py: 0.25 }}
                              >
                                Claimed
                              </Button>
                            </Tooltip>
                          )}
                          <Tooltip title="Remove subscriber">
                            <IconButton
                              size="small"
                              onClick={() => { setSubscriberToDelete(subscriber); setDeleteDialogOpen(true); }}
                              sx={{ color: '#9B8B80', '&:hover': { color: '#BE5953', bgcolor: 'rgba(190,89,83,0.08)' }, borderRadius: '4px' }}
                            >
                              <DeleteIcon sx={{ fontSize: 16 }} />
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

        {total > 0 && (
          <Box sx={{ borderTop: '1px solid #F0EBE4', display: 'flex', justifyContent: 'flex-end' }}>
            <TablePagination
              component="div"
              count={total}
              page={page}
              onPageChange={handlePageChange}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={handleRowsPerPageChange}
              rowsPerPageOptions={[10, 20, 50, 100]}
              labelRowsPerPage="Per page:"
              sx={{
                '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': { color: '#9B8B80', fontSize: '0.78rem' },
                '& .MuiTablePagination-select': { color: '#BE5953', fontWeight: 600 },
                '& .MuiIconButton-root': { color: '#BE5953' },
                '& .MuiIconButton-root.Mui-disabled': { color: 'rgba(0,0,0,0.26)' },
              }}
            />
          </Box>
        )}
      </Box>

      {/* Delete dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        slotProps={{ paper: { sx: { borderRadius: '8px', maxWidth: 420, width: '100%' } } }}
      >
        <DialogTitle sx={{ p: 0 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, px: 3, py: 2.5, borderBottom: '1px solid #F0EBE4', bgcolor: '#FDFAF8' }}>
            <Box sx={{ width: 36, height: 36, borderRadius: '6px', bgcolor: 'rgba(190,89,83,0.1)', border: '1px solid rgba(190,89,83,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <DeleteIcon sx={{ fontSize: 17, color: '#BE5953' }} />
            </Box>
            <Box>
              <Typography sx={{ fontWeight: 700, fontSize: '0.95rem', color: '#1C1917', lineHeight: 1.2 }}>Remove Subscriber</Typography>
              <Typography sx={{ fontSize: '0.75rem', color: '#9B8B80' }}>This action cannot be undone</Typography>
            </Box>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ px: 3, pt: 2.5, pb: 1 }}>
          <Typography sx={{ fontSize: '0.875rem', color: '#6B5C52' }}>
            Are you sure you want to permanently remove <strong style={{ color: '#1C1917' }}>{subscriberToDelete?.email}</strong> from the newsletter?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <Button onClick={() => setDeleteDialogOpen(false)} variant="outlined" sx={{ borderColor: '#E8E0D8', color: '#6B5C52', '&:hover': { borderColor: '#9B8B80' }, borderRadius: '5px', textTransform: 'none', fontWeight: 600, fontSize: '0.82rem' }}>
            Cancel
          </Button>
          <Button onClick={handleDelete} variant="contained" sx={{ bgcolor: '#BE5953', '&:hover': { bgcolor: '#A84E48' }, borderRadius: '5px', textTransform: 'none', fontWeight: 700, fontSize: '0.82rem', boxShadow: 'none' }}>
            Remove
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default NewsletterManagement;

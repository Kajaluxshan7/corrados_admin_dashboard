import React, { useState, useEffect, useCallback } from "react";
import { API_BASE_URL } from '../config/env.config';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Switch,
  FormControlLabel,
  Alert,
  Snackbar,
  Chip,
  Skeleton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Divider,
  IconButton,
} from '@mui/material';
import {
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  FiberManualRecord as DotIcon,
  Schedule as ScheduleIcon,
  EventBusy as ClosedIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import moment from 'moment-timezone';
import { useAuth } from '../contexts/AuthContext';
import { PageHeader } from '../components/common/PageHeader';
import { getErrorMessage } from '../utils/uploadHelpers';
import logger from '../utils/logger';
import { StatusChip } from '../components/common/StatusChip';

const TIMEZONE = 'America/Toronto';

type DayOfWeekValue =
  | 'monday'
  | 'tuesday'
  | 'wednesday'
  | 'thursday'
  | 'friday'
  | 'saturday'
  | 'sunday';

const DayOfWeek = {
  MONDAY: 'monday' as DayOfWeekValue,
  TUESDAY: 'tuesday' as DayOfWeekValue,
  WEDNESDAY: 'wednesday' as DayOfWeekValue,
  THURSDAY: 'thursday' as DayOfWeekValue,
  FRIDAY: 'friday' as DayOfWeekValue,
  SATURDAY: 'saturday' as DayOfWeekValue,
  SUNDAY: 'sunday' as DayOfWeekValue,
};

interface OpeningHoursData {
  id?: number;
  dayOfWeek: DayOfWeekValue;
  openTime: string;
  closeTime: string;
  isActive: boolean;
  isOpen: boolean;
  isClosedNextDay?: boolean;
  specialNote?: string;
}

interface EditFormData {
  openTime: string;
  closeTime: string;
  isActive: boolean;
  isOpen: boolean;
  isClosedNextDay: boolean;
  specialNote: string;
}

interface NotificationState {
  open: boolean;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
}

const OpeningHours: React.FC = () => {
  const { user } = useAuth();
  const [openingHours, setOpeningHours] = useState<OpeningHoursData[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingDay, setEditingDay] = useState<DayOfWeekValue | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editForm, setEditForm] = useState<EditFormData>({
    openTime: '',
    closeTime: '',
    isActive: true,
    isOpen: true,
    isClosedNextDay: false,
    specialNote: '',
  });
  const [notification, setNotification] = useState<NotificationState>({
    open: false,
    message: '',
    type: 'info',
  });

  const getDayDisplayName = (day: DayOfWeekValue): string =>
    day.charAt(0).toUpperCase() + day.slice(1);

  const isCurrentDay = (day: DayOfWeekValue): boolean =>
    moment().tz(TIMEZONE).format('dddd').toLowerCase() === day;

  const formatTimeRange = (
    openTime: string,
    closeTime: string,
    isClosedNextDay?: boolean,
  ): string => {
    const openMoment = moment(openTime, 'HH:mm');
    const closeMoment = moment(closeTime, 'HH:mm');
    if (isClosedNextDay || closeMoment.isBefore(openMoment)) {
      return `${openMoment.format('h:mm A')} – ${closeMoment.format('h:mm A')} (+1 day)`;
    }
    return `${openMoment.format('h:mm A')} – ${closeMoment.format('h:mm A')}`;
  };

  const showNotification = (
    message: string,
    type: NotificationState['type'] = 'info',
  ) => setNotification({ open: true, message, type });

  const initializeDefaultHours = () => {
    setOpeningHours(
      Object.values(DayOfWeek).map((day) => ({
        dayOfWeek: day,
        openTime: '11:00',
        closeTime: '23:00',
        isActive: true,
        isOpen: true,
        isClosedNextDay: false,
        specialNote: '',
      })),
    );
  };

  const fetchOpeningHours = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/opening-hours`, {
        credentials: 'include',
      });
      if (response.ok) {
        setOpeningHours(await response.json());
      } else {
        initializeDefaultHours();
      }
    } catch (error) {
      logger.error('Error fetching opening hours:', error);
      initializeDefaultHours();
    } finally {
      setLoading(false);
    }
  }, []);

  const saveOpeningHours = async (
    dayOfWeek: DayOfWeekValue,
    hoursData: EditFormData,
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      setSaving(true);
      const existingHours = openingHours.find((oh) => oh.dayOfWeek === dayOfWeek);
      const payload = {
        dayOfWeek,
        openTime: hoursData.isOpen ? hoursData.openTime : '',
        closeTime: hoursData.isOpen ? hoursData.closeTime : '',
        isActive: hoursData.isActive,
        isOpen: hoursData.isOpen,
        isClosedNextDay: hoursData.isClosedNextDay,
        specialNote: hoursData.specialNote,
      };
      const url = existingHours?.id
        ? `${API_BASE_URL}/opening-hours/${existingHours.id}`
        : `${API_BASE_URL}/opening-hours`;
      const method = existingHours?.id ? 'PATCH' : 'POST';
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      if (existingHours) {
        setOpeningHours((prev) =>
          prev.map((oh) =>
            oh.dayOfWeek === dayOfWeek
              ? { ...oh, ...payload, id: result.id || oh.id }
              : oh,
          ),
        );
      } else {
        setOpeningHours((prev) => [...prev, { ...payload, id: result.id }]);
      }
      return { success: true };
    } catch (error) {
      logger.error('Error saving opening hours:', error);
      return { success: false, error: getErrorMessage(error) };
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (day: DayOfWeekValue) => {
    const dayHours = openingHours.find((oh) => oh.dayOfWeek === day);
    setEditForm({
      openTime: dayHours?.openTime || '11:00',
      closeTime: dayHours?.closeTime || '23:00',
      isActive: dayHours?.isActive ?? true,
      isOpen: dayHours?.isOpen ?? true,
      isClosedNextDay: dayHours?.isClosedNextDay || false,
      specialNote: dayHours?.specialNote || '',
    });
    setEditingDay(day);
    setEditDialogOpen(true);
  };

  const handleSave = async () => {
    if (!editingDay) return;
    if (editForm.isOpen && (!editForm.openTime || !editForm.closeTime)) {
      showNotification('Please set both open and close times when marked as open', 'warning');
      return;
    }
    const result = await saveOpeningHours(editingDay, editForm);
    if (result.success) {
      showNotification(`${getDayDisplayName(editingDay)} hours updated successfully`, 'success');
      setEditDialogOpen(false);
      setEditingDay(null);
    } else {
      showNotification(result.error || 'Failed to save opening hours.', 'error');
    }
  };

  const handleCancel = () => {
    setEditDialogOpen(false);
    setEditingDay(null);
  };

  const getCurrentOpenStatus = () => {
    const now = moment().tz(TIMEZONE);
    const currentDay = now.format('dddd').toLowerCase() as DayOfWeekValue;
    const currentTime = now.format('HH:mm');
    const todayHours = openingHours.find((oh) => oh.dayOfWeek === currentDay);
    if (todayHours?.isActive && todayHours.isOpen && todayHours.openTime && todayHours.closeTime) {
      const { openTime, closeTime } = todayHours;
      if (closeTime < openTime) {
        if (currentTime >= openTime || currentTime <= closeTime) {
          return { isOpen: true, message: `Open until ${moment(closeTime, 'HH:mm').format('h:mm A')} (overnight)`, day: currentDay };
        }
      } else if (currentTime >= openTime && currentTime <= closeTime) {
        return { isOpen: true, message: `Open until ${moment(closeTime, 'HH:mm').format('h:mm A')}`, day: currentDay };
      }
    }
    const previousDay = now.clone().subtract(1, 'day');
    const previousDayName = previousDay.format('dddd').toLowerCase() as DayOfWeekValue;
    const previousDayHours = openingHours.find((oh) => oh.dayOfWeek === previousDayName);
    if (
      previousDayHours?.isActive && previousDayHours.isOpen &&
      previousDayHours.openTime && previousDayHours.closeTime &&
      previousDayHours.closeTime < previousDayHours.openTime &&
      currentTime <= previousDayHours.closeTime
    ) {
      return {
        isOpen: true,
        message: `Open until ${moment(previousDayHours.closeTime, 'HH:mm').format('h:mm A')} (from ${getDayDisplayName(previousDayName)})`,
        day: previousDayName,
      };
    }
    const nextOpen = findNextOpenDay(now);
    return {
      isOpen: false,
      message: nextOpen
        ? `Next open: ${getDayDisplayName(nextOpen.day)} at ${moment(nextOpen.openTime, 'HH:mm').format('h:mm A')}`
        : 'Opening hours not available',
      day: currentDay,
    };
  };

  const findNextOpenDay = (now: moment.Moment) => {
    for (let i = 0; i < 7; i++) {
      const dayName = now.clone().add(i, 'days').format('dddd').toLowerCase() as DayOfWeekValue;
      const dayHours = openingHours.find((oh) => oh.dayOfWeek === dayName);
      if (dayHours?.isActive && dayHours.isOpen && dayHours.openTime) {
        if (i === 0 && now.format('HH:mm') >= dayHours.openTime) continue;
        return { day: dayName, openTime: dayHours.openTime };
      }
    }
    return null;
  };

  const timeToHours = (t: string) => {
    const [h, m] = t.split(':').map(Number);
    return h + m / 60;
  };

  const status = getCurrentOpenStatus();

  useEffect(() => {
    if (user) fetchOpeningHours();
  }, [fetchOpeningHours, user]);

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Skeleton variant="text" width={320} height={44} />
        <Skeleton variant="text" width={480} height={24} sx={{ mt: 1, mb: 3 }} />
        <Skeleton variant="rounded" height={80} sx={{ mb: 3, borderRadius: '2px' }} />
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', lg: 'repeat(4, 1fr)' }, gap: 2 }}>
          {[...Array(7)].map((_, i) => (
            <Skeleton key={i} variant="rounded" height={140} sx={{ borderRadius: '2px' }} />
          ))}
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, background: '#F6F7F7', minHeight: '100vh' }}>
      {/* Page Header */}
      <PageHeader
        title="Opening Hours"
        subtitle="Manage your pub's operating hours for each day of the week"
        statusChip={
          <StatusChip
            status={status.isOpen ? 'open' : 'closed'}
            label={status.isOpen ? 'Currently Open' : 'Currently Closed'}
          />
        }
      />

      {/* Live Status Banner */}
      <Box
        sx={{
          mb: 3,
          p: 2.5,
          borderRadius: '2px',
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          background: status.isOpen ? 'rgba(0,163,42,0.06)' : 'rgba(214,54,56,0.06)',
          border: `1px solid ${status.isOpen ? 'rgba(0,163,42,0.2)' : 'rgba(214,54,56,0.18)'}`,
          boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
        }}
      >
        <Box sx={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <DotIcon sx={{ fontSize: 16, color: status.isOpen ? '#00A32A' : '#D63638' }} />
          <Box sx={{
            position: 'absolute',
            width: 26, height: 26, borderRadius: '50%',
            background: status.isOpen ? 'rgba(0,163,42,0.2)' : 'rgba(214,54,56,0.2)',
            animation: 'pulse 2s infinite',
            '@keyframes pulse': {
              '0%': { transform: 'scale(0.8)', opacity: 1 },
              '70%': { transform: 'scale(1.4)', opacity: 0 },
              '100%': { transform: 'scale(0.8)', opacity: 0 },
            },
          }} />
        </Box>
        <Box>
          <Typography sx={{ fontWeight: 700, fontSize: '0.938rem', color: status.isOpen ? '#007A1F' : '#991B1B', lineHeight: 1.2 }}>
            {status.isOpen ? 'We are open right now' : 'Currently closed'}
          </Typography>
          <Typography sx={{ fontSize: '0.82rem', color: status.isOpen ? '#00A32A' : '#B91C1C', mt: 0.25 }}>
            {status.message}
          </Typography>
        </Box>
      </Box>

      {/* Day Cards Grid */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', lg: 'repeat(4, 1fr)' },
          gap: 2,
        }}
      >
        {Object.values(DayOfWeek).map((day) => {
          const dayHours = openingHours.find((oh) => oh.dayOfWeek === day);
          const isToday = isCurrentDay(day);
          const displayData = dayHours || {
            dayOfWeek: day, openTime: '', closeTime: '',
            isActive: true, isOpen: false, isClosedNextDay: false, specialNote: '',
          };

          const hasTimeBar = displayData.isOpen && displayData.openTime && displayData.closeTime;
          const openH = hasTimeBar ? timeToHours(displayData.openTime) : 0;
          const closeH = hasTimeBar ? timeToHours(displayData.closeTime) : 0;
          const isOvernight = hasTimeBar && closeH < openH;
          const barLeft = hasTimeBar ? `${(openH / 24) * 100}%` : '0%';
          const barWidth = hasTimeBar
            ? isOvernight
              ? `${((24 - openH) / 24) * 100}%`
              : `${((closeH - openH) / 24) * 100}%`
            : '0%';

          return (
            <Card
              key={day}
              elevation={0}
              sx={{
                border: isToday ? '2px solid #BE5953' : '1px solid rgba(190,89,83,0.1)',
                borderRadius: '2px',
                background: isToday ? 'rgba(190,89,83,0.02)' : '#FFFFFF',
                position: 'relative',
                overflow: 'hidden',
                boxShadow: isToday ? '0 4px 20px rgba(190,89,83,0.1)' : '0 2px 8px rgba(0,0,0,0.04)',
                transition: 'box-shadow 0.2s ease',
                '&:hover': { boxShadow: '0 6px 20px rgba(0,0,0,0.08)' },
              }}
            >
              {/* Today accent stripe */}
              {isToday && (
                <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, bgcolor: '#BE5953' }} />
              )}

              <CardContent sx={{ p: 2.5, pt: isToday ? 3 : 2.5, '&:last-child': { pb: 2.5 } }}>
                {/* Day name row */}
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{
                      width: 36, height: 36, borderRadius: '2px', flexShrink: 0,
                      background: isToday ? 'rgba(190,89,83,0.12)' : '#F0F0F1',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: isToday ? '#BE5953' : '#7A6358',
                    }}>
                      {displayData.isOpen
                        ? <ScheduleIcon sx={{ fontSize: '1.1rem' }} />
                        : <ClosedIcon sx={{ fontSize: '1.1rem' }} />}
                    </Box>
                    <Box>
                      <Typography sx={{ fontWeight: 800, fontSize: '0.95rem', color: isToday ? '#BE5953' : '#1D2327', lineHeight: 1.1 }}>
                        {getDayDisplayName(day)}
                      </Typography>
                      {isToday && (
                        <Typography sx={{ fontSize: '0.68rem', color: '#BE5953', fontWeight: 600, mt: 0.1 }}>Today</Typography>
                      )}
                    </Box>
                  </Box>

                  {/* Status chip */}
                  <Chip
                    label={!displayData.isActive ? 'Inactive' : displayData.isOpen ? 'Open' : 'Closed'}
                    size="small"
                    sx={{
                      height: 22,
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      borderRadius: '2px',
                      bgcolor: !displayData.isActive
                        ? '#F0F0F1'
                        : displayData.isOpen
                        ? 'rgba(0,163,42,0.1)'
                        : 'rgba(214,54,56,0.1)',
                      color: !displayData.isActive
                        ? '#787C82'
                        : displayData.isOpen
                        ? '#007A1F'
                        : '#B91C1C',
                      border: `1px solid ${
                        !displayData.isActive
                          ? '#CDD0D4'
                          : displayData.isOpen
                          ? 'rgba(0,163,42,0.25)'
                          : 'rgba(214,54,56,0.25)'
                      }`,
                    }}
                  />
                </Box>

                <Divider sx={{ borderColor: 'rgba(190,89,83,0.08)', mb: 1.5 }} />

                {/* Time display */}
                <Typography
                  sx={{
                    fontSize: '1rem',
                    fontWeight: 700,
                    color: displayData.isOpen && displayData.isActive ? '#1D2327' : '#A7AAAD',
                    mb: 0.5,
                    letterSpacing: '-0.01em',
                  }}
                >
                  {!displayData.isOpen
                    ? '— Closed —'
                    : displayData.openTime && displayData.closeTime
                    ? formatTimeRange(displayData.openTime, displayData.closeTime, displayData.isClosedNextDay)
                    : 'Hours not set'}
                </Typography>

                {/* Time bar */}
                <Box sx={{ mb: 1.5 }}>
                  <Box sx={{ position: 'relative', height: 5, borderRadius: '3px', bgcolor: 'rgba(0,0,0,0.07)', overflow: 'hidden' }}>
                    {hasTimeBar && (
                      <Box sx={{
                        position: 'absolute', top: 0, bottom: 0, borderRadius: '3px',
                        left: barLeft, width: barWidth,
                        background: displayData.isActive
                          ? 'linear-gradient(90deg, #BE5953, #DDA15E)'
                          : 'rgba(158,158,158,0.4)',
                      }} />
                    )}
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.4 }}>
                    {['12am', '6am', '12pm', '6pm', '12am'].map((t) => (
                      <Typography key={t} sx={{ fontSize: '0.58rem', color: 'rgba(0,0,0,0.28)', fontWeight: 500 }}>{t}</Typography>
                    ))}
                  </Box>
                </Box>

                {/* Special note */}
                {displayData.specialNote && (
                  <Typography sx={{ fontSize: '0.75rem', color: '#50575E', fontStyle: 'italic', mb: 1 }}>
                    ✦ {displayData.specialNote}
                  </Typography>
                )}

                {/* Edit button */}
                <Button
                  size="small"
                  variant={isToday ? 'contained' : 'outlined'}
                  startIcon={<EditIcon sx={{ fontSize: '0.85rem !important' }} />}
                  onClick={() => handleEdit(day)}
                  fullWidth
                  sx={{
                    borderRadius: '2px',
                    fontWeight: 600,
                    fontSize: '0.78rem',
                    py: 0.6,
                    textTransform: 'none',
                    boxShadow: 'none',
                    ...(isToday
                      ? { bgcolor: '#BE5953', '&:hover': { bgcolor: '#A84E48', boxShadow: 'none' } }
                      : { borderColor: 'rgba(190,89,83,0.3)', color: '#BE5953', '&:hover': { borderColor: '#BE5953', bgcolor: 'rgba(190,89,83,0.04)' } }),
                  }}
                >
                  Edit Hours
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </Box>

      {/* Edit Dialog */}
      <Dialog
        open={editDialogOpen}
        onClose={handleCancel}
        maxWidth="sm"
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: '2px' } } }}
      >
        <DialogTitle
          sx={{
            fontWeight: 700,
            fontSize: '1rem',
            color: '#FFFFFF',
            bgcolor: '#1D2327',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <ScheduleIcon sx={{ fontSize: '1.1rem', opacity: 0.8 }} />
            {editingDay ? `Edit ${getDayDisplayName(editingDay)} Hours` : 'Edit Hours'}
          </Box>
          <IconButton
            size="small"
            onClick={handleCancel}
            sx={{ color: 'rgba(255,255,255,0.6)', '&:hover': { color: '#FFFFFF' } }}
          >
            <CloseIcon sx={{ fontSize: 17 }} />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ p: 3 }}>
          <Grid container spacing={2.5} sx={{ mt: 0.5 }}>
            {/* Active + Day is Open toggles */}
            <Grid size={{ xs: 12 }}>
              <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={editForm.isActive}
                      onChange={(e) => setEditForm({ ...editForm, isActive: e.target.checked })}
                      sx={{ '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: '#00A32A', opacity: 1 } }}
                    />
                  }
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography sx={{ fontWeight: 500, fontSize: '0.875rem' }}>Active</Typography>
                      <Chip
                        label={editForm.isActive ? 'Visible' : 'Hidden'}
                        size="small"
                        sx={{
                          height: 20, fontSize: '0.7rem', borderRadius: '2px',
                          bgcolor: editForm.isActive ? '#EEF7EE' : '#F0F0F1',
                          color: editForm.isActive ? '#00A32A' : '#787C82',
                          border: `1px solid ${editForm.isActive ? '#B3DFBB' : '#CDD0D4'}`,
                        }}
                      />
                    </Box>
                  }
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={editForm.isOpen}
                      onChange={(e) => setEditForm({ ...editForm, isOpen: e.target.checked })}
                      sx={{ '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: '#00A32A', opacity: 1 } }}
                    />
                  }
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography sx={{ fontWeight: 500, fontSize: '0.875rem' }}>Day is Open</Typography>
                      <Chip
                        label={editForm.isOpen ? 'Open' : 'Closed'}
                        size="small"
                        sx={{
                          height: 20, fontSize: '0.7rem', borderRadius: '2px',
                          bgcolor: editForm.isOpen ? '#EEF7EE' : 'rgba(214,54,56,0.08)',
                          color: editForm.isOpen ? '#00A32A' : '#B91C1C',
                          border: `1px solid ${editForm.isOpen ? '#B3DFBB' : 'rgba(214,54,56,0.25)'}`,
                        }}
                      />
                    </Box>
                  }
                />
              </Box>
            </Grid>

            {/* Time fields — only shown when open */}
            {editForm.isOpen && (
              <>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    label="Open Time"
                    type="time"
                    value={editForm.openTime}
                    onChange={(e) => setEditForm({ ...editForm, openTime: e.target.value })}
                    slotProps={{ inputLabel: { shrink: true } }}
                    fullWidth
                    helperText="Opening time"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        backgroundColor: 'white',
                        '&:hover fieldset': { borderColor: '#BE5953' },
                        '&.Mui-focused fieldset': { borderColor: '#BE5953' },
                      },
                      '& .MuiInputLabel-root.Mui-focused': { color: '#BE5953' },
                    }}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    label="Close Time"
                    type="time"
                    value={editForm.closeTime}
                    onChange={(e) => setEditForm({ ...editForm, closeTime: e.target.value })}
                    slotProps={{ inputLabel: { shrink: true } }}
                    fullWidth
                    helperText="Closing time"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        backgroundColor: 'white',
                        '&:hover fieldset': { borderColor: '#BE5953' },
                        '&.Mui-focused fieldset': { borderColor: '#BE5953' },
                      },
                      '& .MuiInputLabel-root.Mui-focused': { color: '#BE5953' },
                    }}
                  />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <FormControlLabel
                    control={
                      <Switch
                        size="small"
                        checked={editForm.isClosedNextDay}
                        onChange={(e) => setEditForm({ ...editForm, isClosedNextDay: e.target.checked })}
                        sx={{ '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: '#DBA617', opacity: 1 } }}
                      />
                    }
                    label={
                      <Typography sx={{ fontSize: '0.875rem', fontWeight: 500 }}>
                        Closes next day (overnight hours)
                      </Typography>
                    }
                  />
                </Grid>
              </>
            )}

            {/* Special note */}
            <Grid size={{ xs: 12 }}>
              <TextField
                label="Special Note"
                value={editForm.specialNote}
                onChange={(e) => setEditForm({ ...editForm, specialNote: e.target.value })}
                fullWidth
                placeholder="e.g., Live Music Night, Happy Hour 5–7 PM"
                helperText="Optional note displayed on this day's card"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: 'white',
                    '&:hover fieldset': { borderColor: '#BE5953' },
                    '&.Mui-focused fieldset': { borderColor: '#BE5953' },
                  },
                  '& .MuiInputLabel-root.Mui-focused': { color: '#BE5953' },
                  '& .MuiFormHelperText-root': { color: '#50575E' },
                }}
              />
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions sx={{ p: 3, pt: 0, gap: 1 }}>
          <Button
            onClick={handleCancel}
            disabled={saving}
            startIcon={<CancelIcon />}
            sx={{ color: '#8d6e63', borderRadius: '2px', textTransform: 'none', fontWeight: 600 }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={saving}
            startIcon={<SaveIcon />}
            sx={{
              bgcolor: '#BE5953',
              fontWeight: 700,
              textTransform: 'none',
              boxShadow: 'none',
              borderRadius: '2px',
              '&:hover': { bgcolor: '#A84E48', boxShadow: 'none' },
            }}
          >
            {saving ? 'Saving…' : 'Save Changes'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={notification.open}
        autoHideDuration={4000}
        onClose={() => setNotification({ ...notification, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        sx={{ zIndex: 99999, position: 'fixed' }}
      >
        <Alert
          onClose={() => setNotification({ ...notification, open: false })}
          severity={notification.type}
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default OpeningHours;

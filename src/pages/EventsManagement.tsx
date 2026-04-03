import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { API_BASE_URL } from '../config/env.config';
import { useWsRefresh, WsEvent } from '../contexts/WebSocketContext';
import {
  Box,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  Chip,
  Grid,
  Card,
  CardContent,
  CardActions,
  Avatar,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  Alert,
  Snackbar,
} from '@mui/material';
import { PageHeader } from '../components/common/PageHeader';
import { SummaryStats } from '../components/common/SummaryStats';
import type { StatItem } from '../components/common/SummaryStats';
import logger from '../utils/logger';
import {
  uploadImages,
  getErrorMessage,
  getImageUrl,
} from '../utils/uploadHelpers';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Event as EventIcon,
  Schedule as ScheduleIcon,
  MusicNote as MusicIcon,
  SportsFootball as SportsIcon,
  EmojiEvents as TriviaIcon,
  Cake as PartyIcon,
  Mic as KaraokeIcon,
  Stars as SpecialIcon,
  CloudUpload as UploadIcon,
  Close as CloseIcon,
  Image as ImageIcon,
  Upcoming as UpcomingIcon,
  PlayCircle as OngoingIcon,
  History as PastIcon,
  CheckCircle as ActiveIcon,
  Link as LinkIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment';
import moment from 'moment-timezone';
import { EVENT_TYPE_COLORS } from '../utils/standardColors';

const TIMEZONE = 'America/Toronto';

const EventType = {
  LIVE_MUSIC: 'live_music',
  SPORTS_VIEWING: 'sports_viewing',
  TRIVIA_NIGHT: 'trivia_night',
  PRIVATE_PARTY: 'private_party',
  SPECIAL_EVENT: 'special_event',
  KARAOKE: 'karaoke',
} as const;

type EventTypeValue = (typeof EventType)[keyof typeof EventType];

interface Event {
  id: string;
  title: string;
  description: string;
  type: EventTypeValue;
  displayStartDate: Date;
  displayEndDate: Date;
  eventStartDate: Date;
  eventEndDate: Date;
  imageUrls: string[];
  isActive: boolean;
  ticketLink?: string;
  createdAt: Date;
}

const EventsManagement: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error',
  });

  const [eventForm, setEventForm] = useState<{
    title: string;
    description: string;
    type: EventTypeValue;
    displayStartDate: moment.Moment | null;
    displayEndDate: moment.Moment | null;
    eventStartDate: moment.Moment | null;
    eventEndDate: moment.Moment | null;
    imageUrls: string[];
    isActive: boolean;
    ticketLink: string;
  }>({
    title: '',
    description: '',
    type: EventType.SPECIAL_EVENT,
    displayStartDate: null,
    displayEndDate: null,
    eventStartDate: null,
    eventEndDate: null,
    imageUrls: [],
    isActive: true,
    ticketLink: '',
  });
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [imagesToDelete, setImagesToDelete] = useState<string[]>([]);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const showSnackbar = (message: string, severity: 'success' | 'error') => {
    setSnackbar({ open: true, message, severity });
  };

  const loadEvents = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/events`, {
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setEvents(data);
      } else {
        logger.error('Failed to load events');
        setEvents([]);
      }
    } catch (error) {
      logger.error('Error loading events:', error);
      setEvents([]);
    }
  }, []);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  // Real-time updates via WebSocket
  useWsRefresh(WsEvent.EVENT_CREATED, loadEvents);
  useWsRefresh(WsEvent.EVENT_UPDATED, loadEvents);
  useWsRefresh(WsEvent.EVENT_DELETED, loadEvents);

  const handleCreate = () => {
    setSelectedEvent(null);
    setEventForm({
      title: '',
      description: '',
      type: EventType.SPECIAL_EVENT,
      displayStartDate: null,
      displayEndDate: null,
      eventStartDate: null,
      eventEndDate: null,
      imageUrls: [],
      isActive: true,
      ticketLink: '',
    });
    setDialogOpen(true);
    setSelectedFiles([]);
    setImagePreviews([]);
    setImagesToDelete([]);
  };
  const handleEdit = (event: Event) => {
    setSelectedEvent(event);
    setEventForm({
      title: event.title,
      description: event.description,
      type: event.type,
      displayStartDate: moment.tz(event.displayStartDate, TIMEZONE),
      displayEndDate: moment.tz(event.displayEndDate, TIMEZONE),
      eventStartDate: moment.tz(event.eventStartDate, TIMEZONE),
      eventEndDate: moment.tz(event.eventEndDate, TIMEZONE),
      imageUrls: event.imageUrls || [],
      isActive: event.isActive,
      ticketLink: event.ticketLink || '',
    });
    setSelectedFiles([]);
    setImagePreviews([]);
    setImagesToDelete([]);
    setDialogOpen(true);
  };

  const handleImageUpload = (files: FileList) => {
    const maxImages = 5;
    const maxSize = 1024 * 1024; // 1MB

    const totalImages =
      eventForm.imageUrls.length + imagePreviews.length + files.length;

    if (totalImages > maxImages) {
      showSnackbar(`Maximum ${maxImages} images allowed`, 'error');
      return;
    }

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.size > maxSize) {
        showSnackbar('Image size must be less than 1MB', 'error');
        return;
      }
      if (!file.type.startsWith('image/')) {
        showSnackbar('Only image files are allowed', 'error');
        return;
      }
    }

    // Add to local selectedFiles and create previews
    const fileArray = Array.from(files);
    setSelectedFiles((prev) => [...prev, ...fileArray]);
    fileArray.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreviews((prev) => [...prev, e.target?.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemoveImage = (index: number) => {
    const totalExistingImages = eventForm.imageUrls.length;

    if (index < totalExistingImages) {
      const imageToRemove = eventForm.imageUrls[index];
      setImagesToDelete((prev) => [...prev, imageToRemove]);

      setEventForm((prev) => ({
        ...prev,
        imageUrls: prev.imageUrls.filter((_, i) => i !== index),
      }));

      showSnackbar('Image will be deleted when you save changes', 'success');
    } else {
      const previewIndex = index - totalExistingImages;
      setImagePreviews((prev) => prev.filter((_, i) => i !== previewIndex));
      setSelectedFiles((prev) => prev.filter((_, i) => i !== previewIndex));
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      // Upload new images to storage if any
      let finalImageUrls = [...eventForm.imageUrls];

      if (selectedFiles.length > 0) {
        try {
          const uploadedUrls = await uploadImages(selectedFiles, 'events');
          finalImageUrls = [...finalImageUrls, ...uploadedUrls];
          showSnackbar(
            `${selectedFiles.length} image(s) uploaded successfully`,
            'success',
          );
        } catch (uploadError) {
          showSnackbar(getErrorMessage(uploadError), 'error');
          return;
        }
      }

      const eventData = {
        title: eventForm.title,
        description: eventForm.description,
        type: eventForm.type,
        displayStartDate: eventForm.displayStartDate?.utc().toISOString(),
        displayEndDate: eventForm.displayEndDate?.utc().toISOString(),
        eventStartDate: eventForm.eventStartDate?.utc().toISOString(),
        eventEndDate: eventForm.eventEndDate?.utc().toISOString(),
        imageUrls: finalImageUrls,
        isActive: eventForm.isActive,
        ticketLink: eventForm.ticketLink || null,
      };

      const url = selectedEvent
        ? `${API_BASE_URL}/events/${selectedEvent.id}`
        : `${API_BASE_URL}/events`;

      const method = selectedEvent ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(eventData),
      });

      if (response.ok) {
        // Delete marked images from storage after successful save
        if (imagesToDelete.length > 0) {
          try {
            await fetch(`${API_BASE_URL}/upload/images`, {
              method: 'DELETE',
              headers: { 'Content-Type': 'application/json' },
              credentials: 'include',
              body: JSON.stringify({ urls: imagesToDelete }),
            });
            setImagesToDelete([]);
          } catch (err) {
            logger.error('Error deleting event images from storage:', err);
          }
        }
        loadEvents();
        setSelectedFiles([]);
        setImagePreviews([]);
        setDialogOpen(false);
        showSnackbar(
          selectedEvent
            ? 'Event updated successfully'
            : 'Event created successfully',
          'success',
        );
      } else {
        const errorData = await response.json().catch(() => ({}));
        showSnackbar(errorData.message || 'Failed to save event', 'error');
      }
    } catch (error) {
      logger.error('Error saving event:', error);
      showSnackbar(getErrorMessage(error), 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/events/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (response.ok) {
        loadEvents();
        showSnackbar('Event deleted successfully', 'success');
      } else {
        const errorData = await response.json().catch(() => ({}));
        showSnackbar(errorData.message || 'Failed to delete event', 'error');
      }
    } catch (error) {
      logger.error('Error deleting event:', error);
      showSnackbar(getErrorMessage(error), 'error');
    } finally {
      setDeleteConfirmId(null);
    }
  };

  const getEventTypeIcon = (type: string) => {
    switch (type) {
      case EventType.LIVE_MUSIC:
        return <MusicIcon />;
      case EventType.SPORTS_VIEWING:
        return <SportsIcon />;
      case EventType.TRIVIA_NIGHT:
        return <TriviaIcon />;
      case EventType.PRIVATE_PARTY:
        return <PartyIcon />;
      case EventType.KARAOKE:
        return <KaraokeIcon />;
      case EventType.SPECIAL_EVENT:
        return <SpecialIcon />;
      default:
        return <EventIcon />;
    }
  };

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case EventType.LIVE_MUSIC:
        return EVENT_TYPE_COLORS.LIVE_MUSIC; // Blue - Info
      case EventType.SPORTS_VIEWING:
        return EVENT_TYPE_COLORS.SPORTS_VIEWING; // Green - Success
      case EventType.TRIVIA_NIGHT:
        return EVENT_TYPE_COLORS.TRIVIA_NIGHT; // Orange - Warning
      case EventType.PRIVATE_PARTY:
        return EVENT_TYPE_COLORS.PRIVATE_PARTY; // Terracotta - Brand
      case EventType.KARAOKE:
        return EVENT_TYPE_COLORS.KARAOKE; // Purple
      case EventType.SPECIAL_EVENT:
        return EVENT_TYPE_COLORS.SPECIAL_EVENT; // Blue - Info
      default:
        return EVENT_TYPE_COLORS.LIVE_MUSIC; // Default blue
    }
  };

  const getEventStatus = (event: Event): 'upcoming' | 'ongoing' | 'past' => {
    const now = moment().tz(TIMEZONE);
    const startDate = moment.tz(event.eventStartDate, TIMEZONE);
    const endDate = moment.tz(event.eventEndDate, TIMEZONE);

    if (now.isBefore(startDate)) {
      return 'upcoming';
    } else if (now.isBetween(startDate, endDate, null, '[]')) {
      return 'ongoing';
    } else {
      return 'past';
    }
  };

  // Calculate event stats
  const eventStats = useMemo(() => {
    const stats = {
      total: events.length,
      active: events.filter((e) => e.isActive).length,
      upcoming: 0,
      ongoing: 0,
      past: 0,
    };
    events.forEach((event) => {
      const status = getEventStatus(event);
      stats[status]++;
    });
    return stats;
  }, [events]);

  return (
    <LocalizationProvider dateAdapter={AdapterMoment}>
      <Box>
        <PageHeader
          title="Events Management"
          subtitle="Manage your pub events and special occasions"
          action={
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleCreate}
              sx={{
                bgcolor: '#BE5953',
                fontWeight: 700,
                textTransform: 'none',
                boxShadow: 'none',
                '&:hover': { bgcolor: '#A84E48' },
              }}
            >
              Add Event
            </Button>
          }
        />

        {/* Summary Statistics */}
        <SummaryStats
          stats={
            [
              {
                label: 'Total Events',
                value: eventStats.total,
                icon: <EventIcon fontSize="small" />,
                color: '#BE5953',
              },
              {
                label: 'Upcoming',
                value: eventStats.upcoming,
                icon: <UpcomingIcon fontSize="small" />,
                color: '#00A32A',
              },
              {
                label: 'Ongoing',
                value: eventStats.ongoing,
                icon: <OngoingIcon fontSize="small" />,
                color: '#0073AA',
              },
              {
                label: 'Past Events',
                value: eventStats.past,
                icon: <PastIcon fontSize="small" />,
                color: '#A7AAAD',
              },
              {
                label: 'Active',
                value: eventStats.active,
                icon: <ActiveIcon fontSize="small" />,
                color: '#43A047',
              },
            ] as StatItem[]
          }
          variant="compact"
          columns={5}
        />

        {/* Events Grid */}
        <Grid container spacing={3}>
          {events.map((event) => (
            <Grid size={{ xs: 12, md: 6, lg: 4 }} key={event.id}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  position: 'relative',
                  borderRadius: '2px',
                  background: '#FFFFFF',
                  boxShadow: '0 4px 16px rgba(0, 0, 0, 0.04)',
                  border: `1px solid ${
                    getEventStatus(event) === 'upcoming'
                      ? `${getEventTypeColor(event.type)}30`
                      : 'rgba(190, 89, 83, 0.1)'
                  }`,
                  transition: 'all 0.2s ease',
                  overflow: 'hidden',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.06)',
                  },
                }}
              >
                <Box
                  sx={{ position: 'absolute', top: 12, right: 12, zIndex: 1 }}
                >
                  <Chip
                    label={
                      getEventStatus(event) === 'upcoming'
                        ? 'Upcoming'
                        : getEventStatus(event) === 'ongoing'
                          ? 'Ongoing'
                          : 'Past'
                    }
                    color={
                      getEventStatus(event) === 'upcoming'
                        ? 'success'
                        : getEventStatus(event) === 'ongoing'
                          ? 'primary'
                          : 'default'
                    }
                    size="small"
                    sx={{
                      fontWeight: 600,
                      backgroundColor:
                        getEventStatus(event) === 'upcoming'
                          ? '#00A32A'
                          : getEventStatus(event) === 'ongoing'
                            ? '#0073AA'
                            : '#50575E',
                      color: 'white',
                    }}
                  />
                </Box>

                {/* Event Images */}
                {event.imageUrls && event.imageUrls.length > 0 && (
                  <Box
                    sx={{
                      width: '100%',
                      borderRadius: '2px 2px 0 0',
                      overflow: 'hidden',
                      cursor: 'pointer',
                      backgroundColor: '#F6F7F7',
                    }}
                    onClick={() =>
                      setPreviewImage(getImageUrl(event.imageUrls[0]))
                    }
                  >
                    <Box
                      component="img"
                      src={getImageUrl(event.imageUrls[0])}
                      alt={event.title}
                      sx={{
                        width: '100%',
                        maxWidth: '100%',
                        height: 'auto',
                        maxHeight: 180,
                        display: 'block',
                        objectFit: 'contain',
                        mx: 'auto',
                      }}
                    />
                  </Box>
                )}

                <CardContent sx={{ flexGrow: 1, p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar
                      sx={{
                        bgcolor: getEventTypeColor(event.type),
                        mr: 2,
                        width: 48,
                        height: 48,
                      }}
                    >
                      {getEventTypeIcon(event.type)}
                    </Avatar>
                    <Box>
                      <Typography
                        variant="h6"
                        component="div"
                        sx={{ fontWeight: 700, color: '#1D2327' }}
                      >
                        {event.title}
                      </Typography>
                      <Chip
                        label={event.type.replace('_', ' ').toUpperCase()}
                        size="small"
                        sx={{
                          backgroundColor: getEventTypeColor(event.type),
                          color: 'white',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          mt: 0.5,
                        }}
                      />
                    </Box>
                  </Box>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 2, color: '#50575E', lineHeight: 1.6 }}
                  >
                    {event.description}
                  </Typography>

                  <Divider sx={{ my: 2, backgroundColor: '#E8DDD0' }} />

                  <List dense sx={{ p: 0 }}>
                    <ListItem sx={{ px: 0 }}>
                      <ListItemIcon sx={{ minWidth: 32 }}>
                        <ScheduleIcon
                          fontSize="small"
                          sx={{ color: '#BE5953' }}
                        />
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Typography
                            variant="body2"
                            sx={{ fontWeight: 600, color: '#1D2327' }}
                          >
                            Display Period
                          </Typography>
                        }
                        secondary={
                          <Typography
                            variant="caption"
                            sx={{ color: '#50575E' }}
                          >
                            {moment
                              .tz(event.displayStartDate, TIMEZONE)
                              .format('MMM D, YYYY')}{' '}
                            -{' '}
                            {moment
                              .tz(event.displayEndDate, TIMEZONE)
                              .format('MMM D, YYYY')}
                          </Typography>
                        }
                      />
                    </ListItem>

                    <ListItem sx={{ px: 0 }}>
                      <ListItemIcon sx={{ minWidth: 32 }}>
                        <EventIcon fontSize="small" sx={{ color: '#BE5953' }} />
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Typography
                            variant="body2"
                            sx={{ fontWeight: 600, color: '#1D2327' }}
                          >
                            Event Time
                          </Typography>
                        }
                        secondary={
                          <Typography
                            variant="caption"
                            sx={{ color: '#50575E' }}
                          >
                            {moment
                              .tz(event.eventStartDate, TIMEZONE)
                              .format('MMM D, h:mm A')}{' '}
                            -{' '}
                            {moment
                              .tz(event.eventEndDate, TIMEZONE)
                              .format('MMM D, h:mm A')}
                          </Typography>
                        }
                      />
                    </ListItem>

                    {event.imageUrls && event.imageUrls.length > 1 && (
                      <ListItem sx={{ px: 0 }}>
                        <ListItemIcon sx={{ minWidth: 32 }}>
                          <ImageIcon
                            fontSize="small"
                            sx={{ color: '#BE5953' }}
                          />
                        </ListItemIcon>
                        <ListItemText
                          primary={
                            <Typography
                              variant="caption"
                              sx={{ color: '#50575E' }}
                            >
                              {event.imageUrls.length} images
                            </Typography>
                          }
                        />
                      </ListItem>
                    )}
                  </List>
                </CardContent>

                <CardActions sx={{ p: 2, pt: 0 }}>
                  <Button
                    size="small"
                    onClick={() => handleEdit(event)}
                    sx={{
                      color: '#BE5953',
                      fontWeight: 600,
                      '&:hover': { backgroundColor: '#F0F0F1' },
                    }}
                  >
                    <EditIcon sx={{ fontSize: 16, mr: 0.5 }} />
                    Edit
                  </Button>
                  <Button
                    size="small"
                    onClick={() => setDeleteConfirmId(event.id)}
                    sx={{
                      color: '#D63638',
                      fontWeight: 600,
                      '&:hover': { backgroundColor: 'rgba(214,54,56,0.08)' },
                    }}
                  >
                    <DeleteIcon sx={{ fontSize: 16, mr: 0.5 }} />
                    Delete
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Create/Edit Dialog */}
        <Dialog
          open={dialogOpen}
          onClose={() => {
            setDialogOpen(false);
            setSelectedFiles([]);
            setImagePreviews([]);
            setImagesToDelete([]);
          }}
          maxWidth="md"
          fullWidth
          slotProps={{ paper: { sx: { borderRadius: '2px' } } }}
        >
          <DialogTitle
            sx={{
              fontWeight: 700,
              fontSize: '1rem',
              color: '#FFFFFF',
              bgcolor: '#1D2327',
            }}
          >
            {selectedEvent ? 'Edit Event' : 'Create Event'}
          </DialogTitle>
          <DialogContent sx={{ p: 3 }}>
            <Grid container spacing={3} sx={{ mt: 1 }}>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="Event Title"
                  value={eventForm.title}
                  onChange={(e) =>
                    setEventForm({ ...eventForm, title: e.target.value })
                  }
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
              <Grid size={{ xs: 12, md: 6 }}>
                <FormControl fullWidth>
                  <InputLabel sx={{ '&.Mui-focused': { color: '#BE5953' } }}>
                    Event Type
                  </InputLabel>
                  <Select
                    value={eventForm.type}
                    label="Event Type"
                    onChange={(e) =>
                      setEventForm({
                        ...eventForm,
                        type: e.target.value as EventTypeValue,
                      })
                    }
                    sx={{
                      backgroundColor: 'white',
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#BE5953',
                      },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#BE5953',
                      },
                    }}
                  >
                    <MenuItem value={EventType.LIVE_MUSIC}>Live Music</MenuItem>
                    <MenuItem value={EventType.SPORTS_VIEWING}>
                      Sports Viewing
                    </MenuItem>
                    <MenuItem value={EventType.TRIVIA_NIGHT}>
                      Trivia Night
                    </MenuItem>
                    <MenuItem value={EventType.PRIVATE_PARTY}>
                      Private Party
                    </MenuItem>
                    <MenuItem value={EventType.SPECIAL_EVENT}>
                      Special Event
                    </MenuItem>
                    <MenuItem value={EventType.KARAOKE}>Karaoke</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  label="Description"
                  multiline
                  rows={3}
                  value={eventForm.description}
                  onChange={(e) =>
                    setEventForm({ ...eventForm, description: e.target.value })
                  }
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

              {/* Display Period */}
              <Grid size={{ xs: 12 }}>
                <Typography
                  variant="h6"
                  sx={{ color: '#BE5953', fontWeight: 600, mb: 2 }}
                >
                  Display Period
                </Typography>
              </Grid>
              <Grid size={{ xs: 6 }}>
                <DateTimePicker
                  label="Display Start Date"
                  value={eventForm.displayStartDate}
                  onChange={(newValue) =>
                    setEventForm({ ...eventForm, displayStartDate: newValue })
                  }
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      sx: {
                        '& .MuiOutlinedInput-root': {
                          backgroundColor: 'white',
                          '&:hover fieldset': { borderColor: '#BE5953' },
                          '&.Mui-focused fieldset': { borderColor: '#BE5953' },
                        },
                        '& .MuiInputLabel-root.Mui-focused': {
                          color: '#BE5953',
                        },
                      },
                    },
                  }}
                />
              </Grid>
              <Grid size={{ xs: 6 }}>
                <DateTimePicker
                  label="Display End Date"
                  value={eventForm.displayEndDate}
                  onChange={(newValue) =>
                    setEventForm({ ...eventForm, displayEndDate: newValue })
                  }
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      sx: {
                        '& .MuiOutlinedInput-root': {
                          backgroundColor: 'white',
                          '&:hover fieldset': { borderColor: '#BE5953' },
                          '&.Mui-focused fieldset': { borderColor: '#BE5953' },
                        },
                        '& .MuiInputLabel-root.Mui-focused': {
                          color: '#BE5953',
                        },
                      },
                    },
                  }}
                />
              </Grid>

              {/* Event Period */}
              <Grid size={{ xs: 12 }}>
                <Typography
                  variant="h6"
                  sx={{ color: '#BE5953', fontWeight: 600, mb: 2 }}
                >
                  Event Period
                </Typography>
              </Grid>
              <Grid size={{ xs: 6 }}>
                <DateTimePicker
                  label="Event Start Date & Time"
                  value={eventForm.eventStartDate}
                  onChange={(newValue) =>
                    setEventForm({ ...eventForm, eventStartDate: newValue })
                  }
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      sx: {
                        '& .MuiOutlinedInput-root': {
                          backgroundColor: 'white',
                          '&:hover fieldset': { borderColor: '#BE5953' },
                          '&.Mui-focused fieldset': { borderColor: '#BE5953' },
                        },
                        '& .MuiInputLabel-root.Mui-focused': {
                          color: '#BE5953',
                        },
                      },
                    },
                  }}
                />
              </Grid>
              <Grid size={{ xs: 6 }}>
                <DateTimePicker
                  label="Event End Date & Time"
                  value={eventForm.eventEndDate}
                  onChange={(newValue) =>
                    setEventForm({ ...eventForm, eventEndDate: newValue })
                  }
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      sx: {
                        '& .MuiOutlinedInput-root': {
                          backgroundColor: 'white',
                          '&:hover fieldset': { borderColor: '#BE5953' },
                          '&.Mui-focused fieldset': { borderColor: '#BE5953' },
                        },
                        '& .MuiInputLabel-root.Mui-focused': {
                          color: '#BE5953',
                        },
                      },
                    },
                  }}
                />
              </Grid>

              {/* Image Upload Section */}
              <Grid size={{ xs: 12 }}>
                <Typography
                  variant="h6"
                  sx={{ color: '#BE5953', fontWeight: 600, mb: 2 }}
                >
                  Event Images (Max 5, 1MB each)
                </Typography>
                <Box sx={{ mb: 2 }}>
                  <Button
                    variant="outlined"
                    component="label"
                    startIcon={<UploadIcon />}
                    disabled={loading || eventForm.imageUrls.length >= 5}
                    sx={{
                      borderColor: '#BE5953',
                      color: '#BE5953',
                      '&:hover': {
                        borderColor: '#A84E48',
                        bgcolor: 'rgba(190,89,83,0.06)',
                      },
                    }}
                  >
                    Upload Images
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      hidden
                      onChange={(e) =>
                        e.target.files && handleImageUpload(e.target.files)
                      }
                    />
                  </Button>
                </Box>

                {/* Display uploaded images */}
                {eventForm.imageUrls.length > 0 && (
                  <Grid container spacing={2}>
                    {eventForm.imageUrls.map((url, index) => (
                      <Grid size={{ xs: 6, md: 4 }} key={index}>
                        <Box
                          sx={{
                            position: 'relative',
                            borderRadius: '2px',
                            overflow: 'hidden',
                            backgroundColor: 'white',
                            border: '1px solid rgba(190, 89, 83, 0.1)',
                          }}
                        >
                          <Box
                            component="img"
                            src={getImageUrl(url)}
                            alt={`Event ${index + 1}`}
                            sx={{
                              width: '100%',
                              height: 'auto',
                              display: 'block',
                              objectFit: 'contain',
                            }}
                          />
                          <IconButton
                            size="small"
                            onClick={() => handleRemoveImage(index)}
                            sx={{
                              position: 'absolute',
                              top: 4,
                              right: 4,
                              backgroundColor: 'rgba(0,0,0,0.6)',
                              color: 'white',
                              '&:hover': { backgroundColor: 'rgba(0,0,0,0.8)' },
                            }}
                          >
                            <CloseIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                )}
                {/* Display new previews */}
                {imagePreviews.length > 0 && (
                  <Grid container spacing={2} sx={{ mt: 1 }}>
                    {imagePreviews.map((preview, index) => (
                      <Grid size={{ xs: 6, md: 4 }} key={`preview-${index}`}>
                        <Box
                          sx={{
                            position: 'relative',
                            borderRadius: '2px',
                            overflow: 'hidden',
                            backgroundColor: 'white',
                            border: '2px dashed rgba(190,89,83,0.3)',
                          }}
                        >
                          <Box
                            component="img"
                            src={preview}
                            alt={`Preview ${index + 1}`}
                            sx={{
                              width: '100%',
                              height: 'auto',
                              display: 'block',
                              objectFit: 'contain',
                            }}
                          />
                          <IconButton
                            size="small"
                            onClick={() =>
                              handleRemoveImage(
                                eventForm.imageUrls.length + index,
                              )
                            }
                            sx={{
                              position: 'absolute',
                              top: 4,
                              right: 4,
                              backgroundColor: 'rgba(0,0,0,0.6)',
                              color: 'white',
                              '&:hover': { backgroundColor: 'rgba(0,0,0,0.8)' },
                            }}
                          >
                            <CloseIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                )}
              </Grid>

              {/* Ticket Link Section */}
              <Grid size={{ xs: 12 }}>
                <Typography
                  variant="h6"
                  sx={{ color: '#BE5953', fontWeight: 600, mb: 2 }}
                >
                  Ticket Link (Optional)
                </Typography>
                <TextField
                  fullWidth
                  label="Ticket Purchase URL"
                  placeholder="https://example.com/tickets"
                  value={eventForm.ticketLink}
                  onChange={(e) =>
                    setEventForm({ ...eventForm, ticketLink: e.target.value })
                  }
                  slotProps={{
                    input: {
                      startAdornment: (
                        <LinkIcon sx={{ color: '#BE5953', mr: 1 }} />
                      ),
                    },
                  }}
                  helperText="If provided, a 'Get Your Ticket' button will appear on the frontend"
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

              <Grid size={{ xs: 12 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={eventForm.isActive}
                      onChange={(e) =>
                        setEventForm({
                          ...eventForm,
                          isActive: e.target.checked,
                        })
                      }
                      sx={{
                        '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track':
                          { backgroundColor: '#00A32A', opacity: 1 },
                      }}
                    />
                  }
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography sx={{ fontWeight: 500 }}>Active</Typography>
                      <Chip
                        label={eventForm.isActive ? 'Visible' : 'Hidden'}
                        size="small"
                        sx={{
                          height: 20,
                          fontSize: '0.7rem',
                          borderRadius: '2px',
                          bgcolor: eventForm.isActive ? '#EEF7EE' : '#F0F0F1',
                          color: eventForm.isActive ? '#00A32A' : '#787C82',
                          border: `1px solid ${eventForm.isActive ? '#B3DFBB' : '#CDD0D4'}`,
                        }}
                      />
                    </Box>
                  }
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button
              onClick={() => setDialogOpen(false)}
              sx={{ color: '#8d6e63' }}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={handleSave}
              disabled={loading}
              sx={{
                bgcolor: '#BE5953',
                fontWeight: 700,
                textTransform: 'none',
                boxShadow: 'none',
                '&:hover': { bgcolor: '#A84E48' },
              }}
            >
              {loading ? 'Saving...' : selectedEvent ? 'Update' : 'Create'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog
          open={deleteConfirmId !== null}
          onClose={() => setDeleteConfirmId(null)}
          maxWidth="xs"
          fullWidth
        >
          <DialogTitle
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              fontWeight: 700,
              fontSize: '1rem',
              color: '#FFFFFF',
              bgcolor: '#1D2327',
            }}
          >
            <WarningIcon
              sx={{ fontSize: 16, color: 'rgba(255,255,255,0.7)' }}
            />
            Delete Event
          </DialogTitle>
          <DialogContent sx={{ px: 3, py: 3 }}>
            <Typography
              sx={{ color: '#50575E', fontSize: '0.938rem', lineHeight: 1.6 }}
            >
              Are you sure you want to delete this event? This action cannot be
              undone.
            </Typography>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 3, gap: 1.5 }}>
            <Button
              onClick={() => setDeleteConfirmId(null)}
              variant="outlined"
              sx={{
                borderRadius: '2px',
                fontWeight: 600,
                px: 3,
                borderColor: '#E2E4E7',
                color: '#50575E',
                textTransform: 'none',
                '&:hover': {
                  borderColor: '#BE5953',
                  color: '#BE5953',
                  bgcolor: 'transparent',
                },
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={() =>
                deleteConfirmId !== null && handleDelete(deleteConfirmId)
              }
              variant="contained"
              sx={{
                borderRadius: '2px',
                fontWeight: 600,
                px: 3,
                bgcolor: '#D63638',
                '&:hover': { bgcolor: '#A62527' },
              }}
            >
              Delete
            </Button>
          </DialogActions>
        </Dialog>

        {/* Snackbar for notifications */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
          sx={{ zIndex: 99999, position: 'fixed' }}
        >
          <Alert
            onClose={() => setSnackbar({ ...snackbar, open: false })}
            severity={snackbar.severity}
            sx={{ width: '100%' }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
        {/* Image preview dialog */}
        <Dialog
          open={!!previewImage}
          onClose={() => setPreviewImage(null)}
          maxWidth="lg"
          slotProps={{
            paper: {
              sx: {
                backgroundColor: 'transparent',
                boxShadow: 'none',
                overflow: 'visible',
              },
            },
          }}
        >
          <Box sx={{ position: 'relative' }}>
            <IconButton
              onClick={() => setPreviewImage(null)}
              sx={{
                position: 'absolute',
                top: -48,
                right: 0,
                color: 'white',
                bgcolor: 'rgba(0,0,0,0.5)',
                '&:hover': { bgcolor: 'rgba(0,0,0,0.7)' },
              }}
            >
              <CloseIcon />
            </IconButton>
            {previewImage && (
              <Box
                component="img"
                src={previewImage}
                alt="Preview"
                sx={{
                  maxWidth: '90vw',
                  maxHeight: '80vh',
                  borderRadius: '2px',
                  boxShadow: '0 16px 64px rgba(0, 0, 0, 0.3)',
                }}
              />
            )}
          </Box>
        </Dialog>
      </Box>
    </LocalizationProvider>
  );
};

export default EventsManagement;

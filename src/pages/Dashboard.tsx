import React, { useEffect, useState, useCallback } from 'react';
import { api } from '../utils/api';
import {
  Box,
  Grid,
  Typography,
  Button,
  List,
  ListItem,
  ListItemText,
  LinearProgress,
  Skeleton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem as SelectMenuItem,
  Checkbox,
  Divider,
  IconButton,
  Chip,
} from '@mui/material';
import {
  Restaurant as RestaurantIcon,
  Category as CategoryIcon,
  People as PeopleIcon,
  Event as EventIcon,
  Star as SpecialsIcon,
  Add as AddIcon,
  CheckCircle as CheckCircleIcon,
  RadioButtonUnchecked as UncheckedIcon,
  Schedule as ScheduleIcon,
  Warning as WarningIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CalendarToday as CalendarIcon,
  Notifications as NotificationsIcon,
} from '@mui/icons-material';
import moment from 'moment-timezone';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useGlobalToast } from '../contexts/ToastContext';
import { PageHeader } from '../components/common/PageHeader';
import logger from '../utils/logger';
import { getErrorMessage } from '../utils/uploadHelpers';

interface DashboardStats {
  menuItems: number;
  activeMenuItems: number;
  users: number;
  activeUsers: number;
  events: number;
  specials: number;
  todos: number;
  completedTodos: number;
}

interface RecentActivity {
  id: string;
  type: string;
  message: string;
  timestamp: Date;
}

interface MenuItem {
  id: string;
  name: string;
  createdAt: string;
  isAvailable: boolean;
}

interface Special {
  id: string;
  title: string;
  createdAt: string;
}

interface Todo {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  dueDate?: Date;
  createdAt: Date;
}

const PRIORITY_CONFIG = {
  urgent: { color: '#BE5953', bg: 'rgba(190,89,83,0.08)', label: 'Urgent' },
  high:   { color: '#B07A2A', bg: 'rgba(219,166,23,0.1)',  label: 'High'   },
  medium: { color: '#0073AA', bg: 'rgba(0,115,170,0.08)',  label: 'Medium' },
  low:    { color: '#00A32A', bg: 'rgba(0,163,42,0.08)',   label: 'Low'    },
};

const ACTIVITY_ICONS: Record<string, { icon: React.ElementType; color: string }> = {
  menu:    { icon: RestaurantIcon,    color: '#BE5953' },
  user:    { icon: PeopleIcon,        color: '#DBA617' },
  event:   { icon: EventIcon,         color: '#0073AA' },
  special: { icon: SpecialsIcon,      color: '#00A32A' },
  system:  { icon: CheckCircleIcon,   color: '#787C82' },
};

const getGreeting = () => {
  const h = moment().tz('America/Toronto').hour();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
};

// ─── Shared panel header ─────────────────────────────────────────
const PanelHeader: React.FC<{
  title: string;
  accent?: string;
  action?: React.ReactNode;
}> = ({ title, accent = '#BE5953', action }) => (
  <Box
    sx={{
      px: 2.5,
      py: 1.75,
      borderBottom: '1px solid #F0F0F1',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      bgcolor: '#F6F7F7',
    }}
  >
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
      <Box sx={{ width: 3, height: 16, bgcolor: accent, borderRadius: '2px', flexShrink: 0 }} />
      <Typography sx={{ fontWeight: 700, fontSize: '0.875rem', color: '#1D2327' }}>
        {title}
      </Typography>
    </Box>
    {action}
  </Box>
);

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useGlobalToast();

  const [stats, setStats] = useState<DashboardStats>({
    menuItems: 0, activeMenuItems: 0,
    users: 0, activeUsers: 0,
    events: 0, specials: 0,
    todos: 0, completedTodos: 0,
  });
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
  const [menuCategoryData, setMenuCategoryData] = useState<
    Array<{ name: string; value: number; color: string }>
  >([]);
  const [loading, setLoading] = useState(true);
  const [todos, setTodos] = useState<Todo[]>([]);
  const [todoDialog, setTodoDialog] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [selectedTodo, setSelectedTodo] = useState<Todo | null>(null);
  const [todoForm, setTodoForm] = useState({
    title: '',
    description: '',
    priority: 'medium' as Todo['priority'],
    status: 'pending' as Todo['status'],
    dueDate: '',
  });

  const loadDashboardData = useCallback(async () => {
    try {
      const summaryResponse = await api.get('/dashboard/summary');
      if (summaryResponse.status === 200) {
        const s = summaryResponse.data;
        setStats({
          menuItems: s.menu.total,
          activeMenuItems: s.menu.active,
          users: s.users.total,
          activeUsers: s.users.active,
          events: s.events.upcoming,
          specials: s.specials.total,
          todos: s.todos.total,
          completedTodos: s.todos.completed,
        });
        const catColors = ['#BE5953', '#DBA617', '#00A32A', '#0073AA'];
        setMenuCategoryData(
          s.menu.categories.map((c: { name: string; itemCount: number }, i: number) => ({
            name: c.name,
            value: c.itemCount,
            color: catColors[i % catColors.length],
          })),
        );
        const acts: RecentActivity[] = [];
        if (s.recent.menuItems?.length)  acts.push({ id: 'menu-1',    type: 'menu',    message: `Menu item "${s.recent.menuItems[0].name}" was added`,              timestamp: new Date(s.recent.menuItems[0].createdAt) });
        if (s.recent.specials?.length)   acts.push({ id: 'special-1', type: 'special', message: `Special "${s.recent.specials[0].title}" was created`,              timestamp: new Date(s.recent.specials[0].createdAt) });
        if (s.recent.events?.length)     acts.push({ id: 'event-1',   type: 'event',   message: `Event "${s.recent.events[0].title}" was scheduled`,                timestamp: new Date(s.recent.events[0].startDateTime) });
        if (s.recent.users?.length)      acts.push({ id: 'user-1',    type: 'user',    message: `User "${s.recent.users[0].firstName} ${s.recent.users[0].lastName}" joined`, timestamp: new Date(s.recent.users[0].createdAt) });
        if (!acts.length) acts.push({ id: '1', type: 'system', message: 'Dashboard loaded successfully', timestamp: new Date() });
        setRecentActivities(acts);
      } else {
        await loadFallback();
      }
    } catch (error) {
      logger.error('Error loading dashboard data:', error);
      await loadFallback();
    } finally {
      setLoading(false);
    }
  }, []);

  const loadFallback = async () => {
    try {
      let menuItems: MenuItem[] = [];
      try { const r = await api.get('/menu/items'); menuItems = r.status === 200 ? r.data : []; } catch { menuItems = []; }
      const specialsRes = await api.get('/specials');
      const specials: Special[] = specialsRes.status === 200 ? specialsRes.data : [];
      const usersRes = await api.get('/users');
      const allUsers = usersRes.status === 200 ? usersRes.data : [];
      const users = user?.role === 'super_admin' ? allUsers : allUsers.filter((u: any) => u.role !== 'super_admin');
      const eventsRes = await api.get('/events');
      const events = eventsRes.status === 200 ? eventsRes.data : [];
      const todosRes = await api.get('/todos');
      const todosData = todosRes.status === 200 ? todosRes.data : [];
      setStats({
        menuItems: menuItems.length,
        activeMenuItems: menuItems.filter((i: MenuItem) => i.isAvailable).length,
        users: users.length,
        activeUsers: users.filter((u: { isActive: boolean }) => u.isActive).length,
        events: events.length,
        specials: specials.length,
        todos: todosData.length,
        completedTodos: todosData.filter((t: { status: string }) => t.status === 'completed').length,
      });
      const catRes = await api.get('/menu/categories');
      const cats = catRes.status === 200 ? catRes.data : [];
      const catColors = ['#BE5953', '#DBA617', '#00A32A', '#0073AA'];
      setMenuCategoryData(cats.map((c: { name: string; menuItems: MenuItem[] }, i: number) => ({ name: c.name, value: c.menuItems?.length || 0, color: catColors[i % catColors.length] })));
      const acts: RecentActivity[] = [];
      if (menuItems.length) {
        const latest = [...menuItems].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
        acts.push({ id: '1', type: 'menu', message: `Menu item "${latest.name}" was added`, timestamp: new Date(latest.createdAt) });
      }
      if (specials.length) {
        const latest = [...specials].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
        acts.push({ id: '2', type: 'special', message: `Special "${latest.title}" was created`, timestamp: new Date(latest.createdAt) });
      }
      if (!acts.length) acts.push({ id: '1', type: 'system', message: 'Dashboard loaded successfully', timestamp: new Date() });
      setRecentActivities(acts);
    } catch (error) {
      logger.error('Fallback error:', error);
    }
  };

  const loadTodos = async () => {
    try {
      const r = await api.get('/todos');
      if (r.status === 200) setTodos(r.data || []);
    } catch (error) {
      logger.error('Error loading todos:', error);
    }
  };

  useEffect(() => {
    loadDashboardData();
    loadTodos();
  }, [loadDashboardData]);

  const handleSaveTodo = async () => {
    try {
      const payload = { ...todoForm, dueDate: todoForm.dueDate ? new Date(todoForm.dueDate).toISOString() : null };
      const r = selectedTodo
        ? await api.patch(`/todos/${selectedTodo.id}`, payload)
        : await api.post('/todos', payload);
      if (r.status === 200 || r.status === 201) {
        setTodoDialog(false);
        await Promise.all([loadTodos(), loadDashboardData()]);
      } else {
        showToast('Failed to save task.', 'error');
      }
    } catch (error) {
      showToast(`Failed: ${getErrorMessage(error)}`, 'error');
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteConfirmId) return;
    try {
      const r = await api.delete(`/todos/${deleteConfirmId}`);
      if (r.status === 200) {
        setDeleteConfirmId(null);
        await Promise.all([loadTodos(), loadDashboardData()]);
      }
    } catch (error) {
      showToast(`Failed: ${getErrorMessage(error)}`, 'error');
    }
  };

  const handleToggle = async (todo: Todo) => {
    try {
      const r = await api.patch(`/todos/${todo.id}/toggle-complete`);
      if (r.status === 200) await Promise.all([loadTodos(), loadDashboardData()]);
    } catch (error) {
      logger.error('Toggle error:', error);
    }
  };

  const openCreate = () => {
    setSelectedTodo(null);
    setTodoForm({ title: '', description: '', priority: 'medium', status: 'pending', dueDate: '' });
    setTodoDialog(true);
  };

  const openEdit = (todo: Todo) => {
    setSelectedTodo(todo);
    setTodoForm({
      title: todo.title,
      description: todo.description,
      priority: todo.priority,
      status: todo.status,
      dueDate: todo.dueDate ? moment(todo.dueDate).format('YYYY-MM-DD') : '',
    });
    setTodoDialog(true);
  };

  const statsCards = [
    { title: 'Menu Items',     value: stats.activeMenuItems, total: stats.menuItems, icon: RestaurantIcon, color: '#BE5953', path: '/menu'     },
    { title: 'Categories',     value: menuCategoryData.length, total: menuCategoryData.length, icon: CategoryIcon, color: '#DBA617', path: '/menu' },
    { title: 'Upcoming Events',value: stats.events,           total: stats.events,    icon: EventIcon,      color: '#0073AA', path: '/events'   },
    { title: 'Active Specials', value: stats.specials,        total: stats.specials,  icon: SpecialsIcon,   color: '#00A32A', path: '/specials' },
    { title: 'Active Users',   value: stats.activeUsers,      total: stats.users,     icon: PeopleIcon,     color: '#787C82', path: '/users'    },
  ];

  const quickLinks = [
    { label: 'Add Menu Item',  icon: RestaurantIcon, path: '/menu',       color: '#BE5953' },
    { label: 'Add Event',      icon: EventIcon,      path: '/events',     color: '#0073AA' },
    { label: 'Add Special',    icon: SpecialsIcon,   path: '/specials',   color: '#00A32A' },
    { label: 'Manage Users',   icon: PeopleIcon,     path: '/users',      color: '#DBA617' },
    { label: 'Newsletter',     icon: NotificationsIcon, path: '/newsletter', color: '#787C82' },
  ];

  const todoPct = stats.todos > 0 ? Math.round((stats.completedTodos / stats.todos) * 100) : 0;

  if (loading) {
    return (
      <Box>
        <Skeleton variant="rounded" height={80} sx={{ mb: 3, borderRadius: '2px' }} />
        <Grid container spacing={2} sx={{ mb: 3 }}>
          {[...Array(5)].map((_, i) => (
            <Grid size={{ xs: 6, sm: 4, md: 2.4 }} key={i}>
              <Skeleton variant="rounded" height={90} sx={{ borderRadius: '2px' }} />
            </Grid>
          ))}
        </Grid>
        <Grid container spacing={2}>
          {[0, 1].map((i) => (
            <Grid size={{ xs: 12, lg: 6 }} key={i}>
              <Skeleton variant="rounded" height={360} sx={{ borderRadius: '2px' }} />
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }

  return (
    <Box>
      {/* ── Page Header ─────────────────────────────────────── */}
      <PageHeader
        title="Dashboard"
        subtitle="Welcome back — here's what's happening at Corrado's"
        icon={<CalendarIcon />}
        action={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography sx={{ fontSize: '0.8rem', color: '#787C82' }}>
              {moment().tz('America/Toronto').format('dddd, MMMM D, YYYY')}
            </Typography>
            <Chip
              label={`${getGreeting()}, ${user?.firstName}`}
              size="small"
              sx={{
                bgcolor: 'rgba(190,89,83,0.08)',
                color: '#BE5953',
                border: '1px solid rgba(190,89,83,0.2)',
                borderRadius: '2px',
                fontWeight: 600,
                fontSize: '0.72rem',
                height: 22,
              }}
            />
          </Box>
        }
      />

      {/* ── Stats Row ───────────────────────────────────────── */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {statsCards.map((card) => {
          const Icon = card.icon;
          const progress = card.total > 0 ? (card.value / card.total) * 100 : 100;
          return (
            <Grid size={{ xs: 6, sm: 4, md: 2.4 }} key={card.title}>
              <Box
                onClick={() => navigate(card.path)}
                sx={{
                  bgcolor: '#FFFFFF',
                  border: '1px solid #E2E4E7',
                  borderLeft: `4px solid ${card.color}`,
                  borderRadius: '2px',
                  p: 2,
                  cursor: 'pointer',
                  transition: 'box-shadow 0.15s',
                  '&:hover': { boxShadow: '0 4px 16px rgba(0,0,0,0.08)' },
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 1 }}>
                  <Typography sx={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#787C82' }}>
                    {card.title}
                  </Typography>
                  <Box sx={{ width: 28, height: 28, borderRadius: '2px', bgcolor: `${card.color}12`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Icon sx={{ fontSize: 14, color: card.color }} />
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.75 }}>
                  <Typography sx={{ fontSize: '1.75rem', fontWeight: 800, color: '#1D2327', lineHeight: 1, letterSpacing: '-0.03em' }}>
                    {card.value.toLocaleString()}
                  </Typography>
                  {card.value !== card.total && card.total > 0 && (
                    <Typography sx={{ fontSize: '0.75rem', color: '#787C82' }}>/ {card.total}</Typography>
                  )}
                </Box>
                {progress < 100 && (
                  <LinearProgress
                    variant="determinate"
                    value={progress}
                    sx={{
                      mt: 1.25,
                      height: 3,
                      borderRadius: '2px',
                      bgcolor: `${card.color}18`,
                      '& .MuiLinearProgress-bar': { bgcolor: card.color, borderRadius: '2px' },
                    }}
                  />
                )}
              </Box>
            </Grid>
          );
        })}
      </Grid>

      {/* ── Quick Links ─────────────────────────────────────── */}
      <Box
        sx={{
          mb: 3,
          bgcolor: '#FFFFFF',
          border: '1px solid #E2E4E7',
          borderRadius: '2px',
          overflow: 'hidden',
        }}
      >
        <PanelHeader title="Quick Actions" />
        <Box sx={{ p: 2, display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
          {quickLinks.map(({ label, icon: Icon, path, color }) => (
            <Button
              key={label}
              variant="outlined"
              startIcon={<Icon sx={{ fontSize: '15px !important' }} />}
              onClick={() => navigate(path)}
              sx={{
                borderColor: '#E2E4E7',
                color: '#50575E',
                fontSize: '0.8rem',
                fontWeight: 600,
                textTransform: 'none',
                borderRadius: '2px',
                px: 2,
                py: 0.75,
                '&:hover': { borderColor: color, color, bgcolor: `${color}08` },
              }}
            >
              {label}
            </Button>
          ))}
        </Box>
      </Box>

      {/* ── Content Panels ──────────────────────────────────── */}
      <Grid container spacing={2.5}>

        {/* Recent Activity + Menu Breakdown */}
        <Grid size={{ xs: 12, lg: 6 }}>
          <Box sx={{ bgcolor: '#FFFFFF', border: '1px solid #E2E4E7', borderRadius: '2px', overflow: 'hidden', height: '100%' }}>
            <PanelHeader title="Recent Activity" accent="#BE5953" />
            <Box sx={{ p: 2.5 }}>
              {recentActivities.length > 0 ? (
                <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                  {recentActivities.map((act, i) => {
                    const cfg = ACTIVITY_ICONS[act.type] ?? ACTIVITY_ICONS.system;
                    const Icon = cfg.icon;
                    const isLast = i === recentActivities.length - 1;
                    return (
                      <Box key={act.id} sx={{ display: 'flex', gap: 1.5, position: 'relative' }}>
                        {/* Vertical connector line — sits behind the icon */}
                        {!isLast && (
                          <Box sx={{
                            position: 'absolute',
                            left: 15,
                            top: 32,
                            bottom: 0,
                            width: 2,
                            bgcolor: '#E2E4E7',
                          }} />
                        )}
                        {/* Icon badge — square WP style */}
                        <Box
                          sx={{
                            width: 32, height: 32,
                            borderRadius: '2px',
                            bgcolor: '#F6F7F7',
                            border: '1px solid #E2E4E7',
                            borderLeft: `3px solid ${cfg.color}`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            flexShrink: 0, zIndex: 1,
                          }}
                        >
                          <Icon sx={{ fontSize: 14, color: cfg.color }} />
                        </Box>
                        {/* Content */}
                        <Box sx={{ flex: 1, pb: isLast ? 0 : 2.5, pt: 0.25 }}>
                          <Typography sx={{ fontSize: '0.845rem', fontWeight: 500, color: '#1D2327', lineHeight: 1.4 }}>
                            {act.message}
                          </Typography>
                          <Typography sx={{ fontSize: '0.72rem', color: '#787C82', mt: 0.375 }}>
                            {moment(act.timestamp).fromNow()}
                          </Typography>
                        </Box>
                      </Box>
                    );
                  })}
                </Box>
              ) : (
                <Box sx={{ py: 4, textAlign: 'center' }}>
                  <Typography sx={{ color: '#787C82', fontSize: '0.845rem' }}>
                    No recent activity
                  </Typography>
                </Box>
              )}
            </Box>

            {menuCategoryData.length > 0 && (
              <>
                <Divider sx={{ borderColor: '#F0F0F1' }} />
                <PanelHeader title="Menu Breakdown" accent="#DBA617" />
                <Box sx={{ p: 2.5, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  {menuCategoryData.map((cat) => {
                    const total = menuCategoryData.reduce((s, c) => s + c.value, 0);
                    const pct = total > 0 ? Math.round((cat.value / total) * 100) : 0;
                    return (
                      <Box key={cat.name}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                          <Typography sx={{ fontSize: '0.82rem', fontWeight: 600, color: '#1D2327' }}>{cat.name}</Typography>
                          <Typography sx={{ fontSize: '0.78rem', fontWeight: 700, color: cat.color }}>
                            {cat.value} items
                          </Typography>
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={pct}
                          sx={{
                            height: 5,
                            borderRadius: '2px',
                            bgcolor: `${cat.color}15`,
                            '& .MuiLinearProgress-bar': { bgcolor: cat.color, borderRadius: '2px' },
                          }}
                        />
                      </Box>
                    );
                  })}
                </Box>
              </>
            )}
          </Box>
        </Grid>

        {/* Tasks */}
        <Grid size={{ xs: 12, lg: 6 }}>
          <Box sx={{ bgcolor: '#FFFFFF', border: '1px solid #E2E4E7', borderRadius: '2px', overflow: 'hidden', height: '100%' }}>
            <PanelHeader
              title="Tasks"
              accent="#00A32A"
              action={
                <Button
                  size="small"
                  startIcon={<AddIcon sx={{ fontSize: '13px !important' }} />}
                  onClick={openCreate}
                  variant="contained"
                  sx={{
                    bgcolor: '#1D2327',
                    '&:hover': { bgcolor: '#BE5953' },
                    borderRadius: '2px',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    textTransform: 'none',
                    px: 1.5,
                    py: 0.5,
                    boxShadow: 'none',
                  }}
                >
                  Add Task
                </Button>
              }
            />

            {/* Progress bar */}
            <Box sx={{ px: 2.5, pt: 2, pb: 1.5 }}>
              <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                {[
                  { label: 'Total',   value: stats.todos,                          color: '#1D2327', bg: '#F5F0EB' },
                  { label: 'Done',    value: stats.completedTodos,                 color: '#00A32A', bg: 'rgba(0,163,42,0.08)' },
                  { label: 'Pending', value: stats.todos - stats.completedTodos,   color: '#B07A2A', bg: 'rgba(219,166,23,0.1)' },
                ].map(({ label, value, color, bg }) => (
                  <Box key={label} sx={{ flex: 1, p: 1.5, borderRadius: '2px', bgcolor: bg, border: '1px solid #E2E4E7', textAlign: 'center' }}>
                    <Typography sx={{ fontSize: '1.4rem', fontWeight: 800, color, lineHeight: 1, letterSpacing: '-0.03em' }}>{value}</Typography>
                    <Typography sx={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color, opacity: 0.7, mt: 0.25 }}>{label}</Typography>
                  </Box>
                ))}
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: '#787C82', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Completion
                </Typography>
                <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: '#BE5953' }}>
                  {todoPct}%
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={todoPct}
                sx={{
                  height: 4,
                  borderRadius: '2px',
                  bgcolor: 'rgba(190,89,83,0.1)',
                  '& .MuiLinearProgress-bar': { bgcolor: '#BE5953', borderRadius: '2px' },
                }}
              />
            </Box>

            <Divider sx={{ borderColor: '#F0F0F1' }} />

            <List disablePadding sx={{ maxHeight: 340, overflow: 'auto', px: 2, py: 1.5 }}>
              {todos.length > 0 ? (
                todos
                  .filter((t) => t.status !== 'completed')
                  .slice(0, 6)
                  .map((todo) => {
                    const pri = PRIORITY_CONFIG[todo.priority];
                    return (
                      <ListItem
                        key={todo.id}
                        disablePadding
                        sx={{
                          mb: 0.75,
                          borderRadius: '2px',
                          border: '1px solid #E2E4E7',
                          bgcolor: '#F6F7F7',
                          px: 1.25,
                          py: 0.75,
                          '&:hover': { borderColor: 'rgba(190,89,83,0.25)', bgcolor: '#F0F0F1' },
                          '&:last-child': { mb: 0 },
                        }}
                      >
                        <Checkbox
                          edge="start"
                          checked={todo.status === 'completed'}
                          onChange={() => handleToggle(todo)}
                          icon={<UncheckedIcon sx={{ fontSize: 17 }} />}
                          checkedIcon={<CheckCircleIcon sx={{ fontSize: 17 }} />}
                          sx={{ p: 0.5, mr: 0.5, color: '#D4C4B8', '&.Mui-checked': { color: '#BE5953' } }}
                        />
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.875 }}>
                              <Typography sx={{ fontSize: '0.83rem', fontWeight: 600, color: '#1D2327' }}>
                                {todo.title}
                              </Typography>
                              <Box sx={{ px: 0.625, py: 0.125, borderRadius: '2px', bgcolor: pri.bg }}>
                                <Typography sx={{ fontSize: '0.6rem', fontWeight: 700, color: pri.color, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                                  {pri.label}
                                </Typography>
                              </Box>
                            </Box>
                          }
                          secondary={
                            todo.dueDate ? (
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.25 }}>
                                <ScheduleIcon sx={{ fontSize: 10, color: '#787C82' }} />
                                <Typography sx={{ fontSize: '0.7rem', color: '#787C82' }}>
                                  {moment(todo.dueDate).format('MMM D, YYYY')}
                                </Typography>
                              </Box>
                            ) : null
                          }
                        />
                        <Box sx={{ display: 'flex', gap: 0.25, ml: 0.5 }}>
                          <IconButton size="small" onClick={() => openEdit(todo)} sx={{ p: 0.375, color: '#D4C4B8', '&:hover': { color: '#BE5953' } }}>
                            <EditIcon sx={{ fontSize: 13 }} />
                          </IconButton>
                          <IconButton size="small" onClick={() => setDeleteConfirmId(todo.id)} sx={{ p: 0.375, color: '#D4C4B8', '&:hover': { color: '#D63638' } }}>
                            <DeleteIcon sx={{ fontSize: 13 }} />
                          </IconButton>
                        </Box>
                      </ListItem>
                    );
                  })
              ) : (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography sx={{ color: '#787C82', fontSize: '0.845rem' }}>
                    No tasks yet — create your first task above.
                  </Typography>
                </Box>
              )}
            </List>
          </Box>
        </Grid>
      </Grid>

      {/* ── Delete Dialog ────────────────────────────────────── */}
      <Dialog
        open={Boolean(deleteConfirmId)}
        onClose={() => setDeleteConfirmId(null)}
        maxWidth="xs"
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: '2px', border: '1px solid #E2E4E7' } } }}
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1.5, fontSize: '0.95rem', fontWeight: 700, color: '#FFFFFF', bgcolor: '#1D2327' }}>
          <WarningIcon sx={{ fontSize: 16, color: 'rgba(255,255,255,0.7)' }} />
          Delete Task
        </DialogTitle>
        <DialogContent sx={{ pb: 1 }}>
          <Typography sx={{ fontSize: '0.875rem', color: '#50575E' }}>
            Are you sure you want to delete this task? This cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 2.5, pb: 2.5, gap: 1 }}>
          <Button onClick={() => setDeleteConfirmId(null)} variant="outlined" sx={{ borderColor: '#E2E4E7', color: '#50575E', borderRadius: '2px', fontWeight: 600, textTransform: 'none', fontSize: '0.845rem', '&:hover': { borderColor: '#BE5953', color: '#BE5953', bgcolor: 'transparent' } }}>
            Cancel
          </Button>
          <Button variant="contained" onClick={handleConfirmDelete} sx={{ bgcolor: '#D63638', '&:hover': { bgcolor: '#A62527' }, borderRadius: '2px', fontWeight: 700, textTransform: 'none', fontSize: '0.845rem', boxShadow: 'none' }}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Todo Dialog ──────────────────────────────────────── */}
      <Dialog
        open={todoDialog}
        onClose={() => setTodoDialog(false)}
        maxWidth="sm"
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: '2px', border: '1px solid #E2E4E7' } } }}
      >
        <DialogTitle sx={{ fontWeight: 700, fontSize: '1rem', color: '#FFFFFF', bgcolor: '#1D2327' }}>
          {selectedTodo ? 'Edit Task' : 'Create New Task'}
        </DialogTitle>
        <DialogContent sx={{ pt: '16px !important' }}>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Title"
                size="small"
                value={todoForm.title}
                onChange={(e) => setTodoForm({ ...todoForm, title: e.target.value })}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Description"
                size="small"
                multiline
                rows={3}
                value={todoForm.description}
                onChange={(e) => setTodoForm({ ...todoForm, description: e.target.value })}
              />
            </Grid>
            <Grid size={{ xs: 6 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Priority</InputLabel>
                <Select
                  value={todoForm.priority}
                  label="Priority"
                  onChange={(e) => setTodoForm({ ...todoForm, priority: e.target.value as Todo['priority'] })}
                >
                  <SelectMenuItem value="low">Low</SelectMenuItem>
                  <SelectMenuItem value="medium">Medium</SelectMenuItem>
                  <SelectMenuItem value="high">High</SelectMenuItem>
                  <SelectMenuItem value="urgent">Urgent</SelectMenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 6 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Status</InputLabel>
                <Select
                  value={todoForm.status}
                  label="Status"
                  onChange={(e) => setTodoForm({ ...todoForm, status: e.target.value as Todo['status'] })}
                >
                  <SelectMenuItem value="pending">Pending</SelectMenuItem>
                  <SelectMenuItem value="in_progress">In Progress</SelectMenuItem>
                  <SelectMenuItem value="completed">Completed</SelectMenuItem>
                  <SelectMenuItem value="cancelled">Cancelled</SelectMenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 6 }}>
              <TextField
                fullWidth
                size="small"
                label="Due Date"
                type="date"
                value={todoForm.dueDate}
                onChange={(e) => setTodoForm({ ...todoForm, dueDate: e.target.value })}
                slotProps={{ inputLabel: { shrink: true } }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 2.5, pb: 2.5, gap: 1, borderTop: '1px solid #F0F0F1', pt: 2 }}>
          <Button
            onClick={() => setTodoDialog(false)}
            variant="outlined"
            sx={{ borderColor: '#E2E4E7', color: '#50575E', borderRadius: '2px', fontWeight: 600, textTransform: 'none', fontSize: '0.845rem', '&:hover': { borderColor: '#BE5953', color: '#BE5953', bgcolor: 'transparent' } }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSaveTodo}
            sx={{ bgcolor: '#BE5953', '&:hover': { bgcolor: '#A84E48' }, borderRadius: '2px', fontWeight: 700, textTransform: 'none', fontSize: '0.845rem', boxShadow: 'none' }}
          >
            {selectedTodo ? 'Update' : 'Create Task'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Dashboard;

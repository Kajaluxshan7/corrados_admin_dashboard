import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Avatar,
  Menu,
  MenuItem,
  Tooltip,
  Chip,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  Restaurant as RestaurantIcon,
  People as PeopleIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
  Star as SpecialsIcon,
  Event as EventIcon,
  Schedule as ScheduleIcon,
  AccessTime as AccessTimeIcon,
  PhotoLibrary as StoriesIcon,
  Category as MeasurementsIcon,
  Email as NewsletterIcon,
  Campaign as AnnouncementsIcon,
  NotificationsActive as NotificationsIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  KeyboardArrowDown as ArrowDownIcon,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import moment from 'moment-timezone';

const SIDEBAR_WIDTH = 248;
const SIDEBAR_COLLAPSED = 64;

// ─── Design tokens ─────────────────────────────────────────────
const S = {
  bg: '#1D1917',
  bgHover: 'rgba(255,255,255,0.05)',
  bgActive: 'rgba(190,89,83,0.18)',
  borderActive: '#BE5953',
  textDefault: '#A89080',
  textActive: '#FFFFFF',
  textMuted: '#5C4A40',
  divider: 'rgba(255,255,255,0.06)',
  groupLabel: '#6B5047',
};

const navigationGroups = [
  {
    label: 'Overview',
    items: [{ name: 'Dashboard', path: '/', icon: DashboardIcon }],
  },
  {
    label: 'Content',
    items: [
      { name: 'Menu', path: '/menu', icon: RestaurantIcon },
      { name: 'Measurements', path: '/measurements', icon: MeasurementsIcon },
      { name: 'Specials', path: '/specials', icon: SpecialsIcon },
      { name: 'Events', path: '/events', icon: EventIcon },
      { name: 'Stories', path: '/stories', icon: StoriesIcon },
      { name: 'Opening Hours', path: '/hours', icon: ScheduleIcon },
    ],
  },
  {
    label: 'Communication',
    items: [
      { name: 'Newsletter', path: '/newsletter', icon: NewsletterIcon },
      { name: 'Announcements', path: '/announcements', icon: AnnouncementsIcon },
      { name: 'Notifications', path: '/notifications', icon: NotificationsIcon },
    ],
  },
  {
    label: 'System',
    items: [
      { name: 'Users', path: '/users', icon: PeopleIcon },
      { name: 'Settings', path: '/settings', icon: SettingsIcon },
    ],
  },
];

const allNavItems = navigationGroups.flatMap((g) => g.items);

const DashboardLayout: React.FC = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [currentTime, setCurrentTime] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  useEffect(() => {
    const update = () =>
      setCurrentTime(moment().tz('America/Toronto').format('h:mm A · ddd MMM D'));
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, []);

  const currentPage = allNavItems.find((i) => i.path === location.pathname);
  const drawerWidth = collapsed ? SIDEBAR_COLLAPSED : SIDEBAR_WIDTH;

  const getInitials = () =>
    `${user?.firstName?.charAt(0) ?? ''}${user?.lastName?.charAt(0) ?? ''}`;

  // ─── Sidebar content ─────────────────────────────────────────
  const sidebarContent = (isMobile = false) => (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: S.bg }}>

      {/* Logo row */}
      <Box
        sx={{
          height: 60,
          display: 'flex',
          alignItems: 'center',
          px: collapsed && !isMobile ? 0 : 2,
          justifyContent: collapsed && !isMobile ? 'center' : 'space-between',
          borderBottom: `1px solid ${S.divider}`,
          flexShrink: 0,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, overflow: 'hidden' }}>
          <Box
            sx={{
              width: 34,
              height: 34,
              borderRadius: '8px',
              bgcolor: 'rgba(190,89,83,0.2)',
              border: '1px solid rgba(190,89,83,0.35)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              overflow: 'hidden',
            }}
          >
            <Box
              component="img"
              src="/corrados-logo.png"
              alt="C"
              sx={{ height: 24, width: 'auto', objectFit: 'contain' }}
            />
          </Box>
          {(!collapsed || isMobile) && (
            <Box>
              <Typography
                sx={{
                  fontFamily: '"Playfair Display", Georgia, serif',
                  fontWeight: 700,
                  fontSize: '0.95rem',
                  color: '#F5EDE4',
                  lineHeight: 1.15,
                  letterSpacing: '-0.01em',
                }}
              >
                Corrado's
              </Typography>
              <Typography
                sx={{
                  fontSize: '0.58rem',
                  fontWeight: 700,
                  letterSpacing: '0.16em',
                  textTransform: 'uppercase',
                  color: S.groupLabel,
                  lineHeight: 1,
                }}
              >
                Admin Portal
              </Typography>
            </Box>
          )}
        </Box>
        {(!collapsed || isMobile) && !isMobile && (
          <IconButton
            onClick={() => setCollapsed(true)}
            size="small"
            sx={{ color: S.textMuted, '&:hover': { color: S.textDefault, bgcolor: S.bgHover } }}
          >
            <ChevronLeftIcon sx={{ fontSize: 17 }} />
          </IconButton>
        )}
      </Box>

      {/* Navigation */}
      <Box sx={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', py: 1.5, px: collapsed && !isMobile ? 0.75 : 1 }}>
        {navigationGroups.map((group, gi) => (
          <Box key={group.label} sx={{ mb: 0.5 }}>
            {(!collapsed || isMobile) ? (
              <Typography
                sx={{
                  px: 1.25,
                  pt: gi > 0 ? 1.75 : 0.5,
                  pb: 0.5,
                  fontSize: '0.6rem',
                  fontWeight: 800,
                  letterSpacing: '0.15em',
                  textTransform: 'uppercase',
                  color: S.groupLabel,
                  display: 'block',
                }}
              >
                {group.label}
              </Typography>
            ) : (
              gi > 0 && <Divider sx={{ my: 1, borderColor: S.divider }} />
            )}
            <List disablePadding>
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;

                const btn = (
                  <ListItemButton
                    selected={isActive}
                    onClick={() => { navigate(item.path); setMobileOpen(false); }}
                    sx={{
                      borderRadius: '6px',
                      minHeight: 36,
                      px: collapsed && !isMobile ? 0 : 1.25,
                      py: 0.625,
                      mb: 0.125,
                      justifyContent: collapsed && !isMobile ? 'center' : 'flex-start',
                      position: 'relative',
                      transition: 'background 0.15s',
                      '&.Mui-selected': {
                        bgcolor: S.bgActive,
                        '&::before': {
                          content: '""',
                          position: 'absolute',
                          left: 0,
                          top: '15%',
                          bottom: '15%',
                          width: 3,
                          borderRadius: '0 3px 3px 0',
                          bgcolor: S.borderActive,
                        },
                        '& .MuiListItemIcon-root': { color: '#F5EDE4' },
                        '& .MuiListItemText-primary': { color: '#FFFFFF', fontWeight: 700 },
                        '&:hover': { bgcolor: 'rgba(190,89,83,0.24)' },
                      },
                      '&:hover:not(.Mui-selected)': { bgcolor: S.bgHover },
                    }}
                  >
                    <ListItemIcon
                      sx={{
                        minWidth: collapsed && !isMobile ? 0 : 30,
                        color: isActive ? '#F5EDE4' : S.textDefault,
                        justifyContent: 'center',
                      }}
                    >
                      <Icon sx={{ fontSize: 17 }} />
                    </ListItemIcon>
                    {(!collapsed || isMobile) && (
                      <ListItemText
                        primary={item.name}
                        slotProps={{
                          primary: {
                            fontSize: '0.845rem',
                            fontWeight: isActive ? 700 : 500,
                            color: isActive ? '#FFFFFF' : S.textDefault,
                            letterSpacing: '-0.005em',
                          },
                        }}
                      />
                    )}
                  </ListItemButton>
                );

                return (
                  <ListItem key={item.name} disablePadding>
                    {collapsed && !isMobile ? (
                      <Tooltip title={item.name} placement="right" arrow>{btn}</Tooltip>
                    ) : btn}
                  </ListItem>
                );
              })}
            </List>
          </Box>
        ))}
      </Box>

      {/* Expand toggle when collapsed */}
      {collapsed && !isMobile && (
        <Box sx={{ px: 0.75, pb: 0.5 }}>
          <Tooltip title="Expand sidebar" placement="right">
            <IconButton
              onClick={() => setCollapsed(false)}
              size="small"
              sx={{
                width: '100%',
                borderRadius: '6px',
                py: 0.75,
                color: S.textMuted,
                '&:hover': { color: S.textDefault, bgcolor: S.bgHover },
              }}
            >
              <ChevronRightIcon sx={{ fontSize: 17 }} />
            </IconButton>
          </Tooltip>
        </Box>
      )}

      {/* User footer */}
      <Box
        sx={{
          px: collapsed && !isMobile ? 0.75 : 1.5,
          py: 1.5,
          borderTop: `1px solid ${S.divider}`,
          display: 'flex',
          alignItems: 'center',
          gap: 1.25,
          justifyContent: collapsed && !isMobile ? 'center' : 'flex-start',
          flexShrink: 0,
          bgcolor: 'rgba(0,0,0,0.15)',
        }}
      >
        {collapsed && !isMobile ? (
          <Tooltip title={`${user?.firstName} ${user?.lastName} — Sign out`} placement="right">
            <Avatar
              onClick={logout}
              sx={{
                width: 30, height: 30, bgcolor: '#BE5953',
                fontSize: '0.7rem', fontWeight: 700,
                cursor: 'pointer', '&:hover': { opacity: 0.85 },
              }}
            >
              {getInitials()}
            </Avatar>
          </Tooltip>
        ) : (
          <>
            <Avatar
              sx={{ width: 30, height: 30, bgcolor: '#BE5953', fontSize: '0.7rem', fontWeight: 700, flexShrink: 0 }}
            >
              {getInitials()}
            </Avatar>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography
                noWrap
                sx={{ fontSize: '0.8rem', fontWeight: 700, color: '#D4C4B8', lineHeight: 1.3 }}
              >
                {user?.firstName} {user?.lastName}
              </Typography>
              <Typography
                noWrap
                sx={{ fontSize: '0.68rem', color: S.groupLabel, display: 'block' }}
              >
                {user?.role === 'super_admin' ? 'Super Admin' : 'Admin'}
              </Typography>
            </Box>
            <Tooltip title="Sign out">
              <IconButton
                size="small"
                onClick={logout}
                sx={{ color: S.textMuted, '&:hover': { color: '#EF4444', bgcolor: 'rgba(239,68,68,0.1)' } }}
              >
                <LogoutIcon sx={{ fontSize: 15 }} />
              </IconButton>
            </Tooltip>
          </>
        )}
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#F0EBE4' }}>

      {/* ── Top bar ─────────────────────────────────────────── */}
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          left: { xs: 0, sm: `${drawerWidth}px` },
          width: { xs: '100%', sm: `calc(100% - ${drawerWidth}px)` },
          bgcolor: '#FFFFFF',
          color: '#1C1917',
          borderBottom: '1px solid #E8E0D8',
          boxShadow: 'none',
          transition: 'left 0.2s ease, width 0.2s ease',
          zIndex: (t) => t.zIndex.drawer - 1,
        }}
      >
        <Toolbar sx={{ minHeight: { xs: 56, sm: 60 }, px: { xs: 2, sm: 2.5 }, gap: 1 }}>
          {/* Mobile hamburger */}
          <IconButton
            edge="start"
            onClick={() => setMobileOpen(!mobileOpen)}
            sx={{ display: { sm: 'none' }, color: '#BE5953', mr: 0.5 }}
          >
            <MenuIcon />
          </IconButton>

          {/* Page title */}
          {currentPage && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
              <Box
                sx={{
                  width: 28, height: 28, borderRadius: '6px',
                  bgcolor: 'rgba(190,89,83,0.1)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#BE5953',
                }}
              >
                <currentPage.icon sx={{ fontSize: 15 }} />
              </Box>
              <Box>
                <Typography
                  sx={{ fontWeight: 700, fontSize: '0.9rem', color: '#1C1917', lineHeight: 1.2 }}
                >
                  {currentPage.name}
                </Typography>
                <Typography sx={{ fontSize: '0.67rem', color: '#9B8B80', lineHeight: 1 }}>
                  Corrado's Admin Dashboard
                </Typography>
              </Box>
            </Box>
          )}

          <Box sx={{ flexGrow: 1 }} />

          {/* Right actions */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            {/* Clock */}
            <Box
              sx={{
                display: { xs: 'none', md: 'flex' },
                alignItems: 'center', gap: 0.75,
                px: 1.25, py: 0.5,
                borderRadius: '5px',
                border: '1px solid #EDE0D8',
                bgcolor: '#FDFAF8',
              }}
            >
              <AccessTimeIcon sx={{ fontSize: 12, color: '#BE5953' }} />
              <Typography sx={{ fontSize: '0.775rem', fontWeight: 600, color: '#5C524D', letterSpacing: '0.02em' }}>
                {currentTime}
              </Typography>
            </Box>

            {/* Role badge */}
            {user?.role && (
              <Chip
                label={user.role === 'super_admin' ? 'Super Admin' : 'Admin'}
                size="small"
                sx={{
                  display: { xs: 'none', lg: 'flex' },
                  height: 22,
                  fontSize: '0.65rem',
                  fontWeight: 700,
                  letterSpacing: '0.05em',
                  bgcolor: user.role === 'super_admin' ? 'rgba(36,58,125,0.08)' : 'rgba(190,89,83,0.08)',
                  color: user.role === 'super_admin' ? '#243A7D' : '#8E3830',
                  border: `1px solid ${user.role === 'super_admin' ? 'rgba(36,58,125,0.2)' : 'rgba(190,89,83,0.2)'}`,
                  borderRadius: '4px',
                }}
              />
            )}

            {/* Profile button */}
            <Box
              onClick={(e) => setAnchorEl(e.currentTarget)}
              sx={{
                display: 'flex', alignItems: 'center', gap: 0.75,
                px: 0.75, py: 0.5,
                borderRadius: '7px',
                border: '1px solid #EDE0D8',
                cursor: 'pointer',
                transition: 'all 0.15s',
                '&:hover': { bgcolor: '#FDF8F4', borderColor: '#D4C4B8' },
              }}
            >
              <Avatar
                sx={{
                  width: 28, height: 28, bgcolor: '#1D1917',
                  fontSize: '0.7rem', fontWeight: 700,
                }}
              >
                {getInitials()}
              </Avatar>
              <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: '#1C1917', display: { xs: 'none', sm: 'block' } }}>
                {user?.firstName}
              </Typography>
              <ArrowDownIcon sx={{ fontSize: 15, color: '#9B8B80', display: { xs: 'none', sm: 'block' } }} />
            </Box>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Profile dropdown */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
        onClick={() => setAnchorEl(null)}
        slotProps={{
          paper: {
            elevation: 0,
            sx: {
              mt: 1,
              borderRadius: '8px',
              minWidth: 220,
              border: '1px solid #EDE0D8',
              boxShadow: '0 4px 24px rgba(0,0,0,0.1)',
              bgcolor: '#FFFFFF',
            },
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <Box sx={{ px: 2, py: 1.5, borderBottom: '1px solid #F0EBE4' }}>
          <Typography sx={{ fontWeight: 700, fontSize: '0.875rem', color: '#1C1917' }}>
            {user?.firstName} {user?.lastName}
          </Typography>
          <Typography sx={{ fontSize: '0.75rem', color: '#9B8B80' }}>{user?.email}</Typography>
        </Box>
        <Box sx={{ py: 0.5 }}>
          <MenuItem
            onClick={() => navigate('/settings')}
            sx={{ px: 2, py: 0.875, fontSize: '0.845rem', color: '#5C524D', '&:hover': { bgcolor: '#FDF8F4', color: '#BE5953' } }}
          >
            <SettingsIcon sx={{ mr: 1.5, fontSize: 16, color: '#BE5953' }} />
            Profile & Settings
          </MenuItem>
          <Divider sx={{ borderColor: '#F0EBE4', my: 0.5 }} />
          <MenuItem
            onClick={logout}
            sx={{ px: 2, py: 0.875, fontSize: '0.845rem', color: '#EF4444', '&:hover': { bgcolor: 'rgba(239,68,68,0.06)' } }}
          >
            <LogoutIcon sx={{ mr: 1.5, fontSize: 16 }} />
            Sign Out
          </MenuItem>
        </Box>
      </Menu>

      {/* ── Sidebar ─────────────────────────────────────────── */}
      <Box component="nav" sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 }, transition: 'width 0.2s ease' }}>
        {/* Mobile */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': {
              width: SIDEBAR_WIDTH,
              bgcolor: S.bg,
              borderRight: 'none',
              boxShadow: '4px 0 32px rgba(0,0,0,0.3)',
            },
          }}
        >
          {sidebarContent(true)}
        </Drawer>

        {/* Desktop */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': {
              width: drawerWidth,
              bgcolor: S.bg,
              borderRight: 'none',
              boxShadow: '2px 0 16px rgba(0,0,0,0.2)',
              overflow: 'hidden',
              transition: 'width 0.2s ease',
            },
          }}
          open
        >
          {sidebarContent(false)}
        </Drawer>
      </Box>

      {/* ── Main content ─────────────────────────────────────── */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          minHeight: '100vh',
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          transition: 'width 0.2s ease',
          display: 'flex',
          flexDirection: 'column',
          bgcolor: '#F0EBE4',
        }}
      >
        <Toolbar sx={{ minHeight: { xs: 56, sm: 60 }, flexShrink: 0 }} />

        <Box sx={{ flexGrow: 1, p: { xs: 2, sm: 2.5, md: 3 } }}>
          <Outlet />
        </Box>

        <Box
          sx={{
            px: 3,
            py: 1.5,
            borderTop: '1px solid #E8E0D8',
            bgcolor: 'rgba(255,255,255,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Typography sx={{ fontSize: '0.7rem', color: '#B0A8A2' }}>
            © {new Date().getFullYear()} Corrado's Restaurant &amp; Bar · Whitby, ON
          </Typography>
          <Typography sx={{ fontSize: '0.7rem', color: '#B0A8A2' }}>
            Admin v1.0
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default DashboardLayout;

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
  PhotoLibrary as StoriesIcon,
  Category as MeasurementsIcon,
  Email as NewsletterIcon,
  Campaign as AnnouncementsIcon,
  NotificationsActive as NotificationsIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  KeyboardArrowDown as ArrowDownIcon,
  Celebration as PartyMenuIcon,
  Wallpaper as SiteImagesIcon,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import moment from 'moment-timezone';

const SIDEBAR_WIDTH = 220;
const SIDEBAR_COLLAPSED = 36;

const navigationGroups = [
  {
    label: 'Overview',
    items: [{ name: 'Dashboard', path: '/', icon: DashboardIcon }],
  },
  {
    label: 'Content',
    items: [
      { name: 'Menu', path: '/menu', icon: RestaurantIcon },
      { name: 'Party Menus', path: '/party-menu', icon: PartyMenuIcon },
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
      {
        name: 'Announcements',
        path: '/announcements',
        icon: AnnouncementsIcon,
      },
      {
        name: 'Notifications',
        path: '/notifications',
        icon: NotificationsIcon,
      },
    ],
  },
  {
    label: 'System',
    items: [
      { name: 'Site Images', path: '/site-images', icon: SiteImagesIcon },
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
      setCurrentTime(moment().tz('America/Toronto').format('h:mm A'));
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, []);

  const currentPage = allNavItems.find((i) => i.path === location.pathname);
  const drawerWidth = collapsed ? SIDEBAR_COLLAPSED : SIDEBAR_WIDTH;

  const getInitials = () =>
    `${user?.firstName?.charAt(0) ?? ''}${user?.lastName?.charAt(0) ?? ''}`;

  // Build breadcrumb
  const breadcrumb = currentPage ? `Dashboard › ${currentPage.name}` : 'Dashboard';

  const sidebarContent = (isMobile = false) => (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: '#1D2327' }}>

      {/* Logo row */}
      <Box
        sx={{
          height: 46,
          display: 'flex',
          alignItems: 'center',
          px: collapsed && !isMobile ? 0 : '12px',
          justifyContent: collapsed && !isMobile ? 'center' : 'space-between',
          flexShrink: 0,
        }}
      >
        {(!collapsed || isMobile) && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, overflow: 'hidden' }}>
            <Box
              component="img"
              src="/corrados-logo.png"
              alt="C"
              sx={{ height: 22, width: 'auto', objectFit: 'contain' }}
              onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                e.currentTarget.style.display = 'none';
              }}
            />
            <Box>
              <Typography
                sx={{
                  fontFamily: '"Inter", sans-serif',
                  fontWeight: 700,
                  fontSize: '0.9375rem',
                  color: '#FFFFFF',
                  lineHeight: 1.2,
                }}
              >
                Corrado's
              </Typography>
              <Typography
                sx={{
                  fontSize: '0.625rem',
                  fontWeight: 600,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  color: '#72777C',
                  lineHeight: 1,
                }}
              >
                Admin Portal
              </Typography>
            </Box>
          </Box>
        )}
        {(!collapsed || isMobile) && !isMobile && (
          <IconButton
            onClick={() => setCollapsed(true)}
            size="small"
            sx={{ color: '#72777C', '&:hover': { color: '#FFFFFF', bgcolor: 'rgba(255,255,255,0.07)' }, borderRadius: '2px' }}
          >
            <ChevronLeftIcon sx={{ fontSize: 16 }} />
          </IconButton>
        )}
      </Box>

      {/* Navigation */}
      <Box sx={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', py: '6px', px: collapsed && !isMobile ? '0' : '0' }}>
        {navigationGroups.map((group, gi) => (
          <Box key={group.label}>
            {(!collapsed || isMobile) ? (
              <Typography
                sx={{
                  px: '12px',
                  pt: gi > 0 ? '16px' : '8px',
                  pb: '4px',
                  fontSize: '0.6875rem',
                  fontWeight: 600,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  color: '#72777C',
                  display: 'block',
                }}
              >
                {group.label}
              </Typography>
            ) : (
              gi > 0 && <Divider sx={{ my: '8px', borderColor: 'rgba(255,255,255,0.06)' }} />
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
                      borderRadius: '0',
                      minHeight: 36,
                      px: collapsed && !isMobile ? 0 : '12px',
                      py: 0,
                      justifyContent: collapsed && !isMobile ? 'center' : 'flex-start',
                      transition: 'background-color 100ms ease',
                      '&.Mui-selected': {
                        bgcolor: '#BE5953',
                        '& .MuiListItemIcon-root': { color: '#FFFFFF' },
                        '& .MuiListItemText-primary': { color: '#FFFFFF', fontWeight: 700 },
                        '&:hover': { bgcolor: '#9A413C' },
                      },
                      '&:hover:not(.Mui-selected)': { bgcolor: 'rgba(255,255,255,0.07)', '& .MuiListItemText-primary': { color: '#FFFFFF' } },
                    }}
                  >
                    <ListItemIcon
                      sx={{
                        minWidth: collapsed && !isMobile ? 0 : 28,
                        color: isActive ? '#FFFFFF' : '#72777C',
                        justifyContent: 'center',
                      }}
                    >
                      <Icon sx={{ fontSize: 18 }} />
                    </ListItemIcon>
                    {(!collapsed || isMobile) && (
                      <ListItemText
                        primary={item.name}
                        slotProps={{
                          primary: {
                            sx: {
                              fontSize: '0.8125rem',
                              fontWeight: isActive ? 600 : 500,
                              color: isActive ? '#FFFFFF' : '#A7AAAD',
                            },
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
        <Box sx={{ pb: '4px' }}>
          <Tooltip title="Expand sidebar" placement="right">
            <IconButton
              onClick={() => setCollapsed(false)}
              size="small"
              sx={{
                width: '100%',
                borderRadius: '0',
                py: '8px',
                color: '#72777C',
                '&:hover': { color: '#FFFFFF', bgcolor: 'rgba(255,255,255,0.07)' },
              }}
            >
              <ChevronRightIcon sx={{ fontSize: 16 }} />
            </IconButton>
          </Tooltip>
        </Box>
      )}

      {/* User footer */}
      <Box
        sx={{
          px: collapsed && !isMobile ? 0 : '12px',
          py: '12px',
          borderTop: '1px solid rgba(255,255,255,0.06)',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          justifyContent: collapsed && !isMobile ? 'center' : 'flex-start',
          flexShrink: 0,
        }}
      >
        {collapsed && !isMobile ? (
          <Tooltip title={`${user?.firstName} ${user?.lastName} — Sign out`} placement="right">
            <Avatar
              onClick={logout}
              sx={{
                width: 28, height: 28, bgcolor: '#BE5953', borderRadius: '2px',
                fontSize: '0.6875rem', fontWeight: 700,
                cursor: 'pointer', '&:hover': { opacity: 0.85 },
              }}
            >
              {getInitials()}
            </Avatar>
          </Tooltip>
        ) : (
          <>
            <Avatar
              sx={{ width: 28, height: 28, bgcolor: '#BE5953', borderRadius: '2px', fontSize: '0.6875rem', fontWeight: 700, flexShrink: 0 }}
            >
              {getInitials()}
            </Avatar>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography
                noWrap
                sx={{ fontSize: '0.8125rem', fontWeight: 500, color: '#CDCFD2', lineHeight: 1.3 }}
              >
                {user?.firstName} {user?.lastName}
              </Typography>
              <Typography
                noWrap
                sx={{ fontSize: '0.6875rem', color: '#72777C', display: 'block' }}
              >
                {user?.role === 'super_admin' ? 'Super Admin' : 'Admin'}
              </Typography>
            </Box>
            <Tooltip title="Sign out">
              <IconButton
                size="small"
                onClick={logout}
                sx={{ color: '#72777C', borderRadius: '2px', '&:hover': { color: '#D63638', bgcolor: 'rgba(214,54,56,0.1)' } }}
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
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#F0F0F1' }}>

      {/* ── Top bar ─────────────────────────────────────────── */}
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          left: { xs: 0, sm: `${drawerWidth}px` },
          width: { xs: '100%', sm: `calc(100% - ${drawerWidth}px)` },
          bgcolor: '#1D2327',
          color: '#FFFFFF',
          borderBottom: 'none',
          boxShadow: 'none',
          height: 46,
          transition: 'left 0.2s ease, width 0.2s ease',
          zIndex: (t) => t.zIndex.drawer - 1,
        }}
      >
        <Toolbar
          sx={{
            minHeight: '46px !important',
            height: 46,
            px: { xs: '16px', sm: '20px' },
            gap: '8px',
          }}
        >
          {/* Mobile hamburger */}
          <IconButton
            edge="start"
            onClick={() => setMobileOpen(!mobileOpen)}
            sx={{ display: { sm: 'none' }, color: '#FFFFFF', mr: '4px', borderRadius: '2px' }}
          >
            <MenuIcon sx={{ fontSize: 20 }} />
          </IconButton>

          {/* Breadcrumb */}
          <Typography
            sx={{ fontSize: '0.8125rem', color: '#A7AAAD', display: { xs: 'none', sm: 'block' } }}
          >
            {breadcrumb}
          </Typography>

          <Box sx={{ flexGrow: 1 }} />

          {/* Right actions */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {/* Clock */}
            <Typography
              sx={{
                display: { xs: 'none', md: 'block' },
                fontSize: '0.75rem',
                color: '#72777C',
              }}
            >
              {currentTime}
            </Typography>

            {/* Profile button */}
            <Box
              onClick={(e) => setAnchorEl(e.currentTarget)}
              sx={{
                display: 'flex', alignItems: 'center', gap: '6px',
                px: '6px', py: '4px',
                borderRadius: '2px',
                cursor: 'pointer',
                transition: 'background-color 100ms ease',
                '&:hover': { bgcolor: 'rgba(255,255,255,0.07)' },
              }}
            >
              <Avatar
                sx={{
                  width: 26, height: 26, bgcolor: '#BE5953', borderRadius: '2px',
                  fontSize: '0.6875rem', fontWeight: 700,
                }}
              >
                {getInitials()}
              </Avatar>
              <Typography sx={{ fontSize: '0.8125rem', fontWeight: 500, color: '#CDCFD2', display: { xs: 'none', sm: 'block' } }}>
                {user?.firstName}
              </Typography>
              <ArrowDownIcon sx={{ fontSize: 14, color: '#72777C', display: { xs: 'none', sm: 'block' } }} />
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
              mt: '4px',
              borderRadius: '2px',
              minWidth: 220,
              border: '1px solid #E2E4E7',
              boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
              bgcolor: '#FFFFFF',
            },
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <Box sx={{ px: '16px', py: '12px', borderBottom: '1px solid #E2E4E7' }}>
          <Typography sx={{ fontWeight: 600, fontSize: '0.875rem', color: '#1D2327' }}>
            {user?.firstName} {user?.lastName}
          </Typography>
          <Typography sx={{ fontSize: '0.75rem', color: '#787C82' }}>{user?.email}</Typography>
        </Box>
        <Box sx={{ py: '4px' }}>
          <MenuItem
            onClick={() => navigate('/settings')}
            sx={{ px: '16px', py: '8px', fontSize: '0.875rem', color: '#1D2327', '&:hover': { bgcolor: '#F6F7F7' } }}
          >
            <SettingsIcon sx={{ mr: '12px', fontSize: 16, color: '#787C82' }} />
            Profile & Settings
          </MenuItem>
          <Divider sx={{ borderColor: '#E2E4E7', my: '4px' }} />
          <MenuItem
            onClick={logout}
            sx={{ px: '16px', py: '8px', fontSize: '0.875rem', color: '#D63638', '&:hover': { bgcolor: 'rgba(214,54,56,0.06)' } }}
          >
            <LogoutIcon sx={{ mr: '12px', fontSize: 16 }} />
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
              bgcolor: '#1D2327',
              borderRight: 'none',
              boxShadow: '4px 0 24px rgba(0,0,0,0.3)',
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
              bgcolor: '#1D2327',
              borderRight: 'none',
              boxShadow: 'none',
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
          bgcolor: '#F0F0F1',
        }}
      >
        {/* Spacer for fixed AppBar */}
        <Box sx={{ height: 46, flexShrink: 0 }} />

        <Box sx={{ flexGrow: 1, p: { xs: '16px', sm: '20px', md: '24px' } }}>
          <Outlet />
        </Box>

        <Box
          sx={{
            px: '24px',
            py: '12px',
            borderTop: '1px solid #E2E4E7',
            bgcolor: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Typography sx={{ fontSize: '0.6875rem', color: '#A7AAAD' }}>
            © {new Date().getFullYear()} Corrado's Restaurant &amp; Bar · Whitby, ON
          </Typography>
          <Typography sx={{ fontSize: '0.6875rem', color: '#A7AAAD' }}>
            Admin v1.0
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default DashboardLayout;

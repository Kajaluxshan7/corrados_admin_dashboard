import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { API_BASE_URL } from '../config/env.config';
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
  Avatar,
  IconButton,
  Menu,
  MenuList,
  MenuItem as MenuListItem,
  Divider,
  Tooltip,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  MoreVert as MoreVertIcon,
  Person as PersonIcon,
  AdminPanelSettings as AdminIcon,
  SupervisorAccount as SuperAdminIcon,
  Email as EmailIcon,
  Group as GroupIcon,
  CheckCircle as ActiveIcon,
  Cancel as InactiveIcon,
  VerifiedUser as VerifiedIcon,
  Warning as WarningIcon,
  Search as SearchIcon,
  Refresh as RefreshIcon,
  Block as BlockIcon,
  CheckCircleOutline as CheckCircleOutlineIcon,
} from '@mui/icons-material';
import moment from 'moment-timezone';
import { useAuth } from '../contexts/AuthContext';
import logger from '../utils/logger';
import { useGlobalToast } from '../contexts/ToastContext';
import { getErrorMessage } from '../utils/uploadHelpers';
import { PageHeader } from '../components/common/PageHeader';
import { SummaryStats } from '../components/common/SummaryStats';
import type { StatItem } from '../components/common/SummaryStats';
import { StatusChip } from '../components/common/StatusChip';

const UserRole = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
} as const;

type UserRoleValue = (typeof UserRole)[keyof typeof UserRole];

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: UserRoleValue;
  isActive: boolean;
  isEmailVerified?: boolean;
  lastLogin?: Date;
  createdAt: Date;
}

const ROLE_CONFIG: Record<UserRoleValue, { label: string; color: string; bg: string; icon: React.ReactElement }> = {
  super_admin: {
    label: 'Super Admin',
    color: '#BE5953',
    bg: 'rgba(190,89,83,0.1)',
    icon: <SuperAdminIcon sx={{ fontSize: 13 }} />,
  },
  admin: {
    label: 'Admin',
    color: '#DBA617',
    bg: 'rgba(219,166,23,0.1)',
    icon: <AdminIcon sx={{ fontSize: 13 }} />,
  },
};

const UserManagement: React.FC = () => {
  const { user: currentUser } = useAuth();
  const { showToast } = useGlobalToast();
  const [users, setUsers] = useState<User[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [menuUserId, setMenuUserId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [userForm, setUserForm] = useState<{
    email: string;
    firstName: string;
    lastName: string;
    phone: string;
    role: UserRoleValue;
    isActive: boolean;
    password: string;
    confirmPassword: string;
  }>({
    email: '',
    firstName: '',
    lastName: '',
    phone: '',
    role: UserRole.ADMIN,
    isActive: true,
    password: '',
    confirmPassword: '',
  });

  const loadUsers = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/users`, { credentials: 'include' });
      if (response.ok) {
        const data = await response.json();
        let filtered = data;
        if (currentUser?.role === UserRole.ADMIN) {
          filtered = data.filter((u: User) => u.role === UserRole.ADMIN);
        }
        setUsers(filtered);
      } else {
        setUsers([]);
      }
    } catch (error) {
      logger.error('Error loading users:', error);
      setUsers([]);
    }
  }, [currentUser]);

  useEffect(() => { loadUsers(); }, [loadUsers]);

  const handleCreate = () => {
    setSelectedUser(null);
    setUserForm({ email: '', firstName: '', lastName: '', phone: '', role: UserRole.ADMIN, isActive: true, password: '', confirmPassword: '' });
    setDialogOpen(true);
  };

  const handleEdit = (user: User) => {
    if (currentUser?.role === UserRole.ADMIN && user.role === UserRole.SUPER_ADMIN) {
      showToast('You do not have permission to edit Super Admin users', 'error');
      return;
    }
    setSelectedUser(user);
    setUserForm({ email: user.email, firstName: user.firstName, lastName: user.lastName, phone: user.phone || '', role: user.role, isActive: user.isActive, password: '', confirmPassword: '' });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    try {
      if (!userForm.email.trim()) { showToast('Email is required', 'error'); return; }
      if (!userForm.firstName.trim()) { showToast('First name is required', 'error'); return; }
      if (!userForm.lastName.trim()) { showToast('Last name is required', 'error'); return; }
      if (currentUser?.role === UserRole.ADMIN && userForm.role === UserRole.SUPER_ADMIN) {
        showToast('You do not have permission to create Super Admin users', 'error'); return;
      }
      if (!selectedUser) {
        if (!userForm.password) { showToast('Password is required', 'error'); return; }
        if (userForm.password.length < 8) { showToast('Password must be at least 8 characters', 'error'); return; }
        if (userForm.password !== userForm.confirmPassword) { showToast('Passwords do not match', 'error'); return; }
      }
      const url = selectedUser ? `${API_BASE_URL}/users/${selectedUser.id}` : `${API_BASE_URL}/auth/register`;
      const method = selectedUser ? 'PUT' : 'POST';
      const { confirmPassword, ...userData } = userForm;
      const response = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify(userData) });
      if (response.ok) {
        loadUsers();
        setDialogOpen(false);
        showToast(selectedUser ? 'User updated successfully' : 'Admin created. Verification email sent.', 'success');
      } else {
        const err = await response.json();
        showToast(`Failed: ${err.message || 'Unknown error'}`, 'error');
      }
    } catch (error) {
      showToast(getErrorMessage(error), 'error');
    }
  };

  const handleDelete = async (id: string) => {
    if (currentUser?.id === id) { showToast('You cannot delete your own account', 'error'); return; }
    const userToDelete = users.find((u) => u.id === id);
    if (currentUser?.role === UserRole.ADMIN && userToDelete?.role === UserRole.SUPER_ADMIN) {
      showToast('You do not have permission to delete Super Admin users', 'error'); return;
    }
    try {
      const response = await fetch(`${API_BASE_URL}/users/${id}`, { method: 'DELETE', credentials: 'include' });
      if (response.ok) { loadUsers(); showToast('User deleted successfully', 'success'); }
      else { const err = await response.json(); showToast(err.message || 'Failed to delete user', 'error'); }
    } catch (error) { showToast(getErrorMessage(error), 'error'); }
    finally { setDeleteConfirmId(null); }
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, userId: string) => {
    setAnchorEl(event.currentTarget); setMenuUserId(userId);
  };
  const handleMenuClose = () => { setAnchorEl(null); setMenuUserId(null); };

  const handleResendVerification = async (userId: string) => {
    const userToVerify = users.find((u) => u.id === userId);
    if (currentUser?.role === UserRole.ADMIN && userToVerify?.role === UserRole.SUPER_ADMIN) {
      showToast('No permission to manage Super Admin users', 'error'); handleMenuClose(); return;
    }
    try {
      const response = await fetch(`${API_BASE_URL}/auth/resend-verification/${userId}`, { method: 'POST', credentials: 'include' });
      if (response.ok) { const data = await response.json(); showToast(data.message || 'Verification email sent', 'success'); }
      else { const err = await response.json(); showToast(err.message || 'Failed to resend', 'error'); }
    } catch (error) { showToast(getErrorMessage(error), 'error'); }
    handleMenuClose();
  };

  const handleToggleStatus = async (userId: string) => {
    if (currentUser?.id === userId) { showToast('You cannot change your own account status', 'error'); handleMenuClose(); return; }
    const userToModify = users.find((u) => u.id === userId);
    if (currentUser?.role === UserRole.ADMIN && userToModify?.role === UserRole.SUPER_ADMIN) {
      showToast('No permission to modify Super Admin users', 'error'); handleMenuClose(); return;
    }
    try {
      const response = await fetch(`${API_BASE_URL}/users/${userId}/toggle-status`, { method: 'PATCH', credentials: 'include' });
      if (response.ok) { loadUsers(); showToast('User status updated', 'success'); }
      else { const err = await response.json(); showToast(err.message || 'Failed to toggle status', 'error'); }
    } catch (error) { showToast(getErrorMessage(error), 'error'); }
    handleMenuClose();
  };

  const getInitials = (firstName: string, lastName: string) =>
    `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();

  const userStats = useMemo(() => ({
    total: users.length,
    active: users.filter((u) => u.isActive).length,
    inactive: users.filter((u) => !u.isActive).length,
    superAdmins: users.filter((u) => u.role === 'super_admin').length,
    admins: users.filter((u) => u.role === 'admin').length,
    verified: users.filter((u) => u.isEmailVerified).length,
  }), [users]);

  const filteredUsers = useMemo(() => {
    if (!searchTerm.trim()) return users;
    const q = searchTerm.toLowerCase();
    return users.filter((u) =>
      `${u.firstName} ${u.lastName}`.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.role.toLowerCase().includes(q)
    );
  }, [users, searchTerm]);

  const summaryStats: StatItem[] = [
    { label: 'Total Users', value: userStats.total, icon: <GroupIcon fontSize="small" />, color: '#BE5953' },
    { label: 'Active', value: userStats.active, icon: <ActiveIcon fontSize="small" />, color: '#00A32A' },
    { label: 'Inactive', value: userStats.inactive, icon: <InactiveIcon fontSize="small" />, color: '#787C82' },
    { label: 'Super Admins', value: userStats.superAdmins, icon: <SuperAdminIcon fontSize="small" />, color: '#BE5953' },
    { label: 'Admins', value: userStats.admins, icon: <AdminIcon fontSize="small" />, color: '#DBA617' },
    { label: 'Verified', value: userStats.verified, icon: <VerifiedIcon fontSize="small" />, color: '#0073AA' },
  ];

  return (
    <Box sx={{ p: 3 }}>
      <PageHeader
        title="User Management"
        subtitle="Manage admin users and their access permissions"
        action={
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleCreate}
            sx={{ bgcolor: '#BE5953', '&:hover': { bgcolor: '#A84E48' }, fontWeight: 700 }}
          >
            Add User
          </Button>
        }
      />

      <SummaryStats stats={summaryStats} variant="compact" columns={6} />

      {/* Toolbar */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2, mb: 2, flexWrap: 'wrap' }}>
        <Box
          sx={{
            display: 'flex', alignItems: 'center', gap: 1.5, flex: 1, minWidth: 240, maxWidth: 400,
            px: 2, height: 42, borderRadius: '2px', border: '1.5px solid #E2E4E7', backgroundColor: '#FFFFFF',
            '&:focus-within': { borderColor: '#BE5953', borderWidth: '2px' },
          }}
        >
          <SearchIcon sx={{ color: '#787C82', fontSize: 20, flexShrink: 0 }} />
          <Box
            component="input"
            value={searchTerm}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
            placeholder="Search users…"
            sx={{
              flex: 1, border: 'none', outline: 'none',
              fontSize: '0.875rem', color: '#1D2327',
              backgroundColor: 'transparent', fontFamily: 'inherit',
            }}
          />
        </Box>
        <Tooltip title="Refresh">
          <IconButton onClick={loadUsers} sx={{ color: '#BE5953', '&:hover': { bgcolor: 'rgba(190,89,83,0.08)' } }}>
            <RefreshIcon />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Table */}
      <Box sx={{ borderRadius: '2px', border: '1px solid #E2E4E7', overflow: 'hidden', backgroundColor: '#FFFFFF', boxShadow: '0 1px 6px rgba(0,0,0,0.04)' }}>
        {/* Table header */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: '2fr 1fr 2fr 100px 90px 130px 100px',
            px: 2.5, py: 1.5,
            backgroundColor: '#F6F7F7',
            borderBottom: '1px solid #E2E4E7',
          }}
        >
          {['User', 'Role', 'Email', 'Status', 'Verified', 'Last Login', 'Actions'].map((h) => (
            <Typography key={h} sx={{ fontSize: '0.68rem', fontWeight: 700, color: '#787C82', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              {h}
            </Typography>
          ))}
        </Box>

        {filteredUsers.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <GroupIcon sx={{ fontSize: 48, color: 'rgba(190,89,83,0.25)', mb: 1.5 }} />
            <Typography sx={{ fontWeight: 700, color: '#1D2327', mb: 0.5 }}>
              {searchTerm ? 'No users match your search' : 'No users yet'}
            </Typography>
            <Typography sx={{ color: '#50575E', fontSize: '0.875rem' }}>
              {searchTerm ? 'Try a different search term' : 'Add your first admin user to get started'}
            </Typography>
          </Box>
        ) : (
          filteredUsers.map((user, idx) => {
            const roleCfg = ROLE_CONFIG[user.role];
            return (
              <Box
                key={user.id}
                sx={{
                  display: 'grid',
                  gridTemplateColumns: '2fr 1fr 2fr 100px 90px 130px 100px',
                  alignItems: 'center',
                  px: 2.5,
                  py: 1.75,
                  borderBottom: idx < filteredUsers.length - 1 ? '1px solid rgba(0,0,0,0.04)' : 'none',
                  opacity: user.isActive ? 1 : 0.65,
                  transition: 'background-color 0.15s ease',
                  '&:hover': { backgroundColor: '#F6F7F7' },
                }}
              >
                {/* User */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, minWidth: 0 }}>
                  <Avatar
                    sx={{
                      width: 38, height: 38, flexShrink: 0,
                      backgroundColor: roleCfg.bg,
                      color: roleCfg.color,
                      fontSize: '0.875rem',
                      fontWeight: 700,
                      border: `1.5px solid ${roleCfg.color}30`,
                    }}
                  >
                    {getInitials(user.firstName, user.lastName)}
                  </Avatar>
                  <Box sx={{ minWidth: 0 }}>
                    <Typography sx={{ fontWeight: 600, color: '#1D2327', fontSize: '0.875rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {user.firstName} {user.lastName}
                      {currentUser?.id === user.id && (
                        <Box component="span" sx={{ ml: 1, fontSize: '0.65rem', fontWeight: 700, color: '#BE5953', bgcolor: 'rgba(190,89,83,0.1)', px: 0.75, py: 0.2, borderRadius: '2px' }}>
                          You
                        </Box>
                      )}
                    </Typography>
                    <Typography sx={{ fontSize: '0.72rem', color: '#787C82' }}>
                      Joined {moment(user.createdAt).format('MMM YYYY')}
                    </Typography>
                  </Box>
                </Box>

                {/* Role */}
                <Box>
                  <Chip
                    icon={roleCfg.icon}
                    label={roleCfg.label}
                    size="small"
                    sx={{
                      height: 22, fontSize: '0.68rem', fontWeight: 700,
                      backgroundColor: roleCfg.bg, color: roleCfg.color,
                      border: `1px solid ${roleCfg.color}30`,
                      '& .MuiChip-icon': { color: roleCfg.color, ml: '6px' },
                      '& .MuiChip-label': { px: '6px' },
                    }}
                  />
                </Box>

                {/* Email */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, minWidth: 0 }}>
                  <EmailIcon sx={{ fontSize: 14, color: '#787C82', flexShrink: 0 }} />
                  <Typography sx={{ fontSize: '0.8rem', color: '#50575E', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {user.email}
                  </Typography>
                </Box>

                {/* Status */}
                <Box>
                  <StatusChip
                    status={user.isActive ? 'active' : 'inactive'}
                    label={user.isActive ? 'Active' : 'Inactive'}
                    size="small"
                  />
                </Box>

                {/* Verified */}
                <Box>
                  <Chip
                    label={user.isEmailVerified ? 'Verified' : 'Pending'}
                    size="small"
                    sx={{
                      height: 22, fontSize: '0.68rem', fontWeight: 700,
                      backgroundColor: user.isEmailVerified ? 'rgba(0,163,42,0.1)' : 'rgba(219,166,23,0.1)',
                      color: user.isEmailVerified ? '#00A32A' : '#996800',
                      border: `1px solid ${user.isEmailVerified ? 'rgba(0,163,42,0.2)' : 'rgba(201,169,110,0.3)'}`,
                    }}
                  />
                </Box>

                {/* Last Login */}
                <Typography sx={{ fontSize: '0.78rem', color: '#787C82' }}>
                  {user.lastLogin
                    ? moment(user.lastLogin).tz('America/Toronto').fromNow()
                    : 'Never'}
                </Typography>

                {/* Actions */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Tooltip title="Edit">
                    <IconButton
                      size="small"
                      onClick={() => handleEdit(user)}
                      sx={{ color: '#BE5953', '&:hover': { bgcolor: 'rgba(190,89,83,0.08)' } }}
                    >
                      <EditIcon sx={{ fontSize: 16 }} />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="More options">
                    <IconButton
                      size="small"
                      onClick={(e) => handleMenuOpen(e, user.id)}
                      sx={{ color: '#787C82', '&:hover': { bgcolor: 'rgba(0,0,0,0.05)', color: '#50575E' } }}
                    >
                      <MoreVertIcon sx={{ fontSize: 16 }} />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Box>
            );
          })
        )}
      </Box>

      {filteredUsers.length > 0 && (
        <Typography sx={{ mt: 1.5, fontSize: '0.78rem', color: '#787C82', textAlign: 'right' }}>
          {filteredUsers.length} of {users.length} user{users.length !== 1 ? 's' : ''}
        </Typography>
      )}

      {/* Context Menu */}
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose} slotProps={{ paper: { sx: { borderRadius: '2px', border: '1px solid #E2E4E7', boxShadow: '0 8px 24px rgba(0,0,0,0.08)', minWidth: 180 } } }}>
        <MenuList dense sx={{ py: 0.5 }}>
          <MenuListItem onClick={() => { const u = users.find((x) => x.id === menuUserId); if (u) handleEdit(u); handleMenuClose(); }}
            sx={{ py: 1, px: 2, gap: 1.5, fontSize: '0.875rem', '&:hover': { bgcolor: 'rgba(0,0,0,0.04)' } }}>
            <EditIcon sx={{ fontSize: 16, color: '#BE5953' }} /> Edit User
          </MenuListItem>
          <MenuListItem onClick={() => { if (menuUserId) handleToggleStatus(menuUserId); }}
            sx={{ py: 1, px: 2, gap: 1.5, fontSize: '0.875rem', color: users.find((u) => u.id === menuUserId)?.isActive ? '#787C82' : '#00A32A', '&:hover': { bgcolor: 'rgba(0,0,0,0.04)' } }}>
            {users.find((u) => u.id === menuUserId)?.isActive
              ? <BlockIcon sx={{ fontSize: 16 }} />
              : <CheckCircleOutlineIcon sx={{ fontSize: 16 }} />}
            {users.find((u) => u.id === menuUserId)?.isActive ? 'Deactivate User' : 'Activate User'}
          </MenuListItem>
          {!users.find((u) => u.id === menuUserId)?.isEmailVerified && (
            <MenuListItem onClick={() => { if (menuUserId) handleResendVerification(menuUserId); }}
              sx={{ py: 1, px: 2, gap: 1.5, fontSize: '0.875rem', '&:hover': { bgcolor: 'rgba(0,0,0,0.04)' } }}>
              <EmailIcon sx={{ fontSize: 16, color: '#0073AA' }} /> Resend Verification
            </MenuListItem>
          )}
          <Divider sx={{ my: 0.5, borderColor: '#E2E4E7' }} />
          <MenuListItem
            onClick={() => { if (menuUserId) setDeleteConfirmId(menuUserId); handleMenuClose(); }}
            disabled={users.find((u) => u.id === menuUserId)?.role === UserRole.SUPER_ADMIN}
            sx={{ py: 1, px: 2, gap: 1.5, fontSize: '0.875rem', color: '#BE5953', '&:hover': { bgcolor: 'rgba(0,0,0,0.04)' } }}
          >
            <DeleteIcon sx={{ fontSize: 16 }} /> Delete User
          </MenuListItem>
        </MenuList>
      </Menu>

      {/* Delete Dialog */}
      <Dialog open={deleteConfirmId !== null} onClose={() => setDeleteConfirmId(null)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1.5, px: 3, py: 2.5, borderBottom: '1px solid #E2E4E7' }}>
          <Box sx={{ width: 36, height: 36, borderRadius: '2px', background: 'rgba(239,68,68,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#D63638' }}>
            <WarningIcon fontSize="small" />
          </Box>
          <Typography sx={{ fontWeight: 700, fontSize: '1.05rem', color: '#1D2327' }}>Delete User</Typography>
        </DialogTitle>
        <DialogContent sx={{ px: 3, py: 3 }}>
          <Typography sx={{ color: '#50575E', fontSize: '0.938rem', lineHeight: 1.6 }}>
            Are you sure you want to delete this user? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
          <Button onClick={() => setDeleteConfirmId(null)} variant="outlined" sx={{ borderRadius: '2px', px: 2.5, fontWeight: 600 }}>Cancel</Button>
          <Button onClick={() => deleteConfirmId && handleDelete(deleteConfirmId)} variant="contained"
            sx={{ borderRadius: '2px', px: 2.5, fontWeight: 700, bgcolor: '#D63638', '&:hover': { bgcolor: '#A62527' } }}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Create / Edit Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1.5, px: 3, py: 2.5, borderBottom: '1px solid #E2E4E7' }}>
          <Box sx={{ width: 36, height: 36, borderRadius: '2px', background: 'rgba(190,89,83,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#BE5953' }}>
            <PersonIcon fontSize="small" />
          </Box>
          <Typography sx={{ fontWeight: 700, fontSize: '1.05rem', color: '#1D2327' }}>
            {selectedUser ? 'Edit User' : 'Create Admin User'}
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ px: 3, pt: '20px !important' }}>
          <Grid container spacing={2}>
            <Grid size={{ xs: 6 }}>
              <TextField fullWidth label="First Name" value={userForm.firstName} onChange={(e) => setUserForm({ ...userForm, firstName: e.target.value })} />
            </Grid>
            <Grid size={{ xs: 6 }}>
              <TextField fullWidth label="Last Name" value={userForm.lastName} onChange={(e) => setUserForm({ ...userForm, lastName: e.target.value })} />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField fullWidth label="Email" type="email" value={userForm.email} onChange={(e) => setUserForm({ ...userForm, email: e.target.value })} />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField fullWidth label="Phone" value={userForm.phone} onChange={(e) => setUserForm({ ...userForm, phone: e.target.value })} />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <FormControl fullWidth>
                <InputLabel>Role</InputLabel>
                <Select value={userForm.role} label="Role" onChange={(e) => setUserForm({ ...userForm, role: e.target.value as UserRoleValue })}>
                  <MenuItem value={UserRole.ADMIN}>Admin</MenuItem>
                  {currentUser?.role === UserRole.SUPER_ADMIN && (
                    <MenuItem value={UserRole.SUPER_ADMIN}>Super Admin</MenuItem>
                  )}
                </Select>
              </FormControl>
            </Grid>
            {!selectedUser && (
              <>
                <Grid size={{ xs: 6 }}>
                  <TextField fullWidth label="Password" type="password" value={userForm.password}
                    onChange={(e) => setUserForm({ ...userForm, password: e.target.value })} helperText="Min 8 characters" />
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <TextField fullWidth label="Confirm Password" type="password" value={userForm.confirmPassword}
                    onChange={(e) => setUserForm({ ...userForm, confirmPassword: e.target.value })}
                    error={!!userForm.confirmPassword && userForm.password !== userForm.confirmPassword}
                    helperText={!!userForm.confirmPassword && userForm.password !== userForm.confirmPassword ? 'Does not match' : ''} />
                </Grid>
              </>
            )}
            <Grid size={{ xs: 12 }}>
              <FormControlLabel
                control={<Switch checked={userForm.isActive} onChange={(e) => setUserForm({ ...userForm, isActive: e.target.checked })} sx={{ '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: '#00A32A', opacity: 1 } }} />}
                label={<Typography sx={{ fontSize: '0.875rem' }}>Account Active</Typography>}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, pt: 2, gap: 1 }}>
          <Button onClick={() => setDialogOpen(false)} variant="outlined" sx={{ borderRadius: '2px', px: 2.5, fontWeight: 600 }}>Cancel</Button>
          <Button onClick={handleSave} variant="contained"
            sx={{ borderRadius: '2px', px: 2.5, fontWeight: 700, bgcolor: '#BE5953', '&:hover': { bgcolor: '#A84E48' } }}>
            {selectedUser ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UserManagement;

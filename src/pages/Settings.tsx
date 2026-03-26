import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Alert,
  Snackbar,
  Autocomplete,
  InputAdornment,
  Avatar,
  Tab,
  Tabs,
  Divider,
} from '@mui/material';
import {
  Save as SaveIcon,
  Person as PersonIcon,
  Phone as PhoneIcon,
  Lock as LockIcon,
  Edit as EditIcon,
  Cancel as CancelIcon,
  AdminPanelSettings as RoleIcon,
  Email as EmailIcon,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../utils/api';
import { getErrorMessage } from '../utils/uploadHelpers';
import { PageHeader } from '../components/common/PageHeader';
import logger from '../utils/logger';

// Country codes list
const COUNTRY_CODES = [
  { code: '+1', country: 'United States', flag: '🇺🇸', shortName: 'US' },
  { code: '+1', country: 'Canada', flag: '🇨🇦', shortName: 'CA' },
  { code: '+44', country: 'United Kingdom', flag: '🇬🇧', shortName: 'UK' },
  { code: '+91', country: 'India', flag: '🇮🇳', shortName: 'IN' },
  { code: '+86', country: 'China', flag: '🇨🇳', shortName: 'CN' },
  { code: '+81', country: 'Japan', flag: '🇯🇵', shortName: 'JP' },
  { code: '+49', country: 'Germany', flag: '🇩🇪', shortName: 'DE' },
  { code: '+33', country: 'France', flag: '🇫🇷', shortName: 'FR' },
  { code: '+39', country: 'Italy', flag: '🇮🇹', shortName: 'IT' },
  { code: '+34', country: 'Spain', flag: '🇪🇸', shortName: 'ES' },
  { code: '+61', country: 'Australia', flag: '🇦🇺', shortName: 'AU' },
  { code: '+55', country: 'Brazil', flag: '🇧🇷', shortName: 'BR' },
  { code: '+7', country: 'Russia', flag: '🇷🇺', shortName: 'RU' },
  { code: '+82', country: 'South Korea', flag: '🇰🇷', shortName: 'KR' },
  { code: '+31', country: 'Netherlands', flag: '🇳🇱', shortName: 'NL' },
  { code: '+46', country: 'Sweden', flag: '🇸🇪', shortName: 'SE' },
  { code: '+47', country: 'Norway', flag: '🇳🇴', shortName: 'NO' },
  { code: '+45', country: 'Denmark', flag: '🇩🇰', shortName: 'DK' },
  { code: '+41', country: 'Switzerland', flag: '🇨🇭', shortName: 'CH' },
  { code: '+43', country: 'Austria', flag: '🇦🇹', shortName: 'AT' },
  { code: '+32', country: 'Belgium', flag: '🇧🇪', shortName: 'BE' },
  { code: '+351', country: 'Portugal', flag: '🇵🇹', shortName: 'PT' },
  { code: '+30', country: 'Greece', flag: '🇬🇷', shortName: 'GR' },
  { code: '+48', country: 'Poland', flag: '🇵🇱', shortName: 'PL' },
  { code: '+52', country: 'Mexico', flag: '🇲🇽', shortName: 'MX' },
  { code: '+54', country: 'Argentina', flag: '🇦🇷', shortName: 'AR' },
  { code: '+57', country: 'Colombia', flag: '🇨🇴', shortName: 'CO' },
  { code: '+20', country: 'Egypt', flag: '🇪🇬', shortName: 'EG' },
  { code: '+27', country: 'South Africa', flag: '🇿🇦', shortName: 'ZA' },
  { code: '+234', country: 'Nigeria', flag: '🇳🇬', shortName: 'NG' },
  { code: '+254', country: 'Kenya', flag: '🇰🇪', shortName: 'KE' },
  { code: '+66', country: 'Thailand', flag: '🇹🇭', shortName: 'TH' },
  { code: '+65', country: 'Singapore', flag: '🇸🇬', shortName: 'SG' },
  { code: '+60', country: 'Malaysia', flag: '🇲🇾', shortName: 'MY' },
  { code: '+92', country: 'Pakistan', flag: '🇵🇰', shortName: 'PK' },
  { code: '+971', country: 'UAE', flag: '🇦🇪', shortName: 'AE' },
  { code: '+966', country: 'Saudi Arabia', flag: '🇸🇦', shortName: 'SA' },
  { code: '+90', country: 'Turkey', flag: '🇹🇷', shortName: 'TR' },
  { code: '+380', country: 'Ukraine', flag: '🇺🇦', shortName: 'UA' },
  { code: '+7', country: 'Kazakhstan', flag: '🇰🇿', shortName: 'KZ' },
  { code: '+852', country: 'Hong Kong', flag: '🇭🇰', shortName: 'HK' },
  { code: '+886', country: 'Taiwan', flag: '🇹🇼', shortName: 'TW' },
];

const getInitials = (firstName: string, lastName: string) =>
  `${(firstName || '').charAt(0)}${(lastName || '').charAt(0)}`.toUpperCase() || '?';

const getRoleLabel = (role?: string) => {
  if (!role) return 'Admin';
  return role === 'super_admin' ? 'Super Admin' : 'Admin';
};

// ── Section heading inside a card ──────────────────────────────
const SectionHeading = ({ icon, title }: { icon: React.ReactNode; title: string }) => (
  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3, pb: 2, borderBottom: '1px solid #E2E4E7' }}>
    <Box sx={{ width: 32, height: 32, borderRadius: '2px', backgroundColor: 'rgba(190,89,83,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#BE5953', flexShrink: 0 }}>
      {icon}
    </Box>
    <Typography sx={{ fontFamily: '"Inter", sans-serif', fontWeight: 700, fontSize: '1rem', color: '#1D2327', letterSpacing: '-0.01em' }}>
      {title}
    </Typography>
  </Box>
);

const Settings: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [notification, setNotification] = useState({ open: false, message: '', type: 'success' as 'success' | 'error' });

  const [originalProfileForm, setOriginalProfileForm] = useState({ firstName: '', lastName: '', email: '', countryCode: '+1', phoneNumber: '' });
  const [profileForm, setProfileForm] = useState({ firstName: '', lastName: '', email: '', countryCode: '+1', phoneNumber: '' });
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });

  const parsePhoneNumber = (phone: string) => {
    if (!phone || !phone.startsWith('+')) return { countryCode: '+1', phoneNumber: '' };
    const sorted = COUNTRY_CODES.map((c) => c.code).sort((a, b) => b.length - a.length);
    for (const code of sorted) {
      if (phone.startsWith(code)) return { countryCode: code, phoneNumber: phone.substring(code.length).trim() };
    }
    return { countryCode: '+1', phoneNumber: phone.substring(1) };
  };

  useEffect(() => {
    if (user) {
      const { countryCode, phoneNumber } = user.phone ? parsePhoneNumber(user.phone) : { countryCode: '+1', phoneNumber: '' };
      const data = { firstName: user.firstName || '', lastName: user.lastName || '', email: user.email || '', countryCode, phoneNumber };
      setProfileForm(data);
      setOriginalProfileForm(data);
    }
  }, [user]);

  const showNotification = (message: string, type: 'success' | 'error' = 'success') =>
    setNotification({ open: true, message, type });

  const hasProfileChanges = () =>
    profileForm.firstName !== originalProfileForm.firstName ||
    profileForm.lastName !== originalProfileForm.lastName ||
    profileForm.countryCode !== originalProfileForm.countryCode ||
    profileForm.phoneNumber !== originalProfileForm.phoneNumber;

  const handleCancelEdit = () => { setProfileForm(originalProfileForm); setIsEditingProfile(false); };

  const handleSaveProfile = async () => {
    try {
      setLoading(true);
      const phone = profileForm.phoneNumber ? `${profileForm.countryCode}${profileForm.phoneNumber}` : '';
      const response = await api.patch('/auth/profile', { firstName: profileForm.firstName, lastName: profileForm.lastName, phone });
      if (response.status === 200) {
        showNotification('Profile updated successfully!');
        setOriginalProfileForm(profileForm);
        setIsEditingProfile(false);
      } else {
        showNotification(response.data?.message || 'Failed to update profile', 'error');
      }
    } catch (error) {
      logger.error('Error updating profile:', error);
      showNotification(getErrorMessage(error), 'error');
    } finally { setLoading(false); }
  };

  const handleChangePassword = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      showNotification('Passwords do not match', 'error'); return;
    }
    try {
      setPasswordLoading(true);
      const response = await api.post('/auth/change-password', { currentPassword: passwordForm.currentPassword, newPassword: passwordForm.newPassword });
      if (response.status === 200 || response.status === 201) {
        showNotification('Password changed successfully!');
        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        showNotification(response.data?.message || 'Failed to change password', 'error');
      }
    } catch (error) {
      logger.error('Error changing password:', error);
      showNotification(getErrorMessage(error), 'error');
    } finally { setPasswordLoading(false); }
  };

  const passwordStrength = (() => {
    const p = passwordForm.newPassword;
    if (!p) return 0;
    let score = 0;
    if (p.length >= 8) score++;
    if (p.length >= 12) score++;
    if (/[A-Z]/.test(p)) score++;
    if (/[0-9]/.test(p)) score++;
    if (/[^A-Za-z0-9]/.test(p)) score++;
    return score;
  })();

  const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong', 'Very Strong'][passwordStrength];
  const strengthColor = ['', '#D63638', '#DBA617', '#0073AA', '#00A32A', '#00A32A'][passwordStrength];

  return (
    <Box sx={{ p: 3, maxWidth: 780, mx: 'auto' }}>
      <PageHeader
        title="Settings"
        subtitle="Manage your profile and account security"
        icon={<PersonIcon />}
      />

      {/* Profile Identity Banner */}
      <Box
        sx={{
          mb: 3, p: 2.5,
          borderRadius: '2px',
          background: '#FFFFFF',
          border: '1px solid #E2E4E7',
          display: 'flex', alignItems: 'center', gap: 2,
        }}
      >
        <Avatar
          sx={{
            width: 64, height: 64, flexShrink: 0,
            backgroundColor: '#1D2327',
            color: '#FFFFFF',
            fontSize: '1.375rem',
            fontWeight: 700,
            borderRadius: '2px',
          }}
        >
          {getInitials(profileForm.firstName, profileForm.lastName)}
        </Avatar>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography sx={{ fontFamily: '"Inter", sans-serif', fontWeight: 700, fontSize: '1.15rem', color: '#1D2327', lineHeight: 1.2 }}>
            {profileForm.firstName} {profileForm.lastName}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mt: 0.5, flexWrap: 'wrap' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <EmailIcon sx={{ fontSize: 13, color: '#787C82' }} />
              <Typography sx={{ fontSize: '0.8rem', color: '#50575E' }}>{profileForm.email}</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <RoleIcon sx={{ fontSize: 13, color: '#787C82' }} />
              <Typography sx={{ fontSize: '0.8rem', color: '#50575E' }}>{getRoleLabel(user?.role)}</Typography>
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Tab Navigation */}
      <Box sx={{ borderRadius: '2px', border: '1px solid #E2E4E7', overflow: 'hidden', backgroundColor: '#FFFFFF', boxShadow: '0 1px 6px rgba(0,0,0,0.04)' }}>
        <Tabs
          value={activeTab}
          onChange={(_, v) => setActiveTab(v)}
          sx={{
            px: 2, pt: 1,
            borderBottom: '1px solid #E2E4E7',
            '& .MuiTab-root': {
              minHeight: 44, fontWeight: 600, fontSize: '0.875rem', textTransform: 'none',
              color: '#50575E', px: 2,
              '&.Mui-selected': { color: '#BE5953' },
            },
            '& .MuiTabs-indicator': { backgroundColor: '#BE5953', height: 2, borderRadius: '2px' },
          }}
        >
          <Tab icon={<PersonIcon sx={{ fontSize: 16 }} />} iconPosition="start" label="Profile" />
          <Tab icon={<LockIcon sx={{ fontSize: 16 }} />} iconPosition="start" label="Security" />
        </Tabs>

        {/* ── Profile Tab ── */}
        {activeTab === 0 && (
          <Box sx={{ p: 3 }}>
            <SectionHeading icon={<PersonIcon sx={{ fontSize: 16 }} />} title="Profile Information" />

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              {/* Name row */}
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
                <TextField
                  fullWidth label="First Name" value={profileForm.firstName}
                  disabled={!isEditingProfile}
                  onChange={(e) => { setProfileForm({ ...profileForm, firstName: e.target.value }); if (!isEditingProfile) setIsEditingProfile(true); }}
                />
                <TextField
                  fullWidth label="Last Name" value={profileForm.lastName}
                  disabled={!isEditingProfile}
                  onChange={(e) => { setProfileForm({ ...profileForm, lastName: e.target.value }); if (!isEditingProfile) setIsEditingProfile(true); }}
                />
              </Box>

              {/* Email (read-only) */}
              <TextField
                fullWidth label="Email Address" value={profileForm.email} disabled
                helperText="Email address cannot be changed"
                slotProps={{ input: { startAdornment: <InputAdornment position="start"><EmailIcon sx={{ fontSize: 18, color: '#787C82' }} /></InputAdornment> } }}
              />

              {/* Phone */}
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '200px 1fr' }, gap: 2 }}>
                <Autocomplete
                  options={COUNTRY_CODES}
                  getOptionLabel={(o) => `${o.flag} ${o.code} ${o.shortName}`}
                  value={COUNTRY_CODES.find((c) => c.code === profileForm.countryCode) || null}
                  disabled={!isEditingProfile}
                  onChange={(_, v) => { setProfileForm({ ...profileForm, countryCode: v ? v.code : '+1' }); if (!isEditingProfile) setIsEditingProfile(true); }}
                  renderOption={(props, option) => {
                    const { key, ...rest } = props;
                    return (
                      <Box component="li" key={key} {...rest} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box sx={{ fontSize: '1.1em' }}>{option.flag}</Box>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>{option.code}</Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1 }}>{option.country}</Typography>
                        </Box>
                      </Box>
                    );
                  }}
                  renderInput={(params) => <TextField {...params} label="Country Code" />}
                />
                <TextField
                  fullWidth label="Phone Number" value={profileForm.phoneNumber} disabled={!isEditingProfile}
                  placeholder="Enter phone number"
                  helperText="Without country code"
                  onChange={(e) => { const v = e.target.value.replace(/[^\d\s\-()]/g, ''); setProfileForm({ ...profileForm, phoneNumber: v }); if (!isEditingProfile) setIsEditingProfile(true); }}
                  slotProps={{ input: { startAdornment: <InputAdornment position="start"><PhoneIcon sx={{ fontSize: 18, color: '#787C82' }} /></InputAdornment> } }}
                />
              </Box>
            </Box>

            <Divider sx={{ my: 3, borderColor: '#E2E4E7' }} />

            {/* Actions */}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1.5 }}>
              {!isEditingProfile ? (
                <Button variant="outlined" startIcon={<EditIcon />} onClick={() => setIsEditingProfile(true)}
                  sx={{ borderRadius: '2px', px: 3, fontWeight: 600 }}>
                  Edit Profile
                </Button>
              ) : (
                <>
                  <Button variant="outlined" startIcon={<CancelIcon />} onClick={handleCancelEdit}
                    sx={{ borderRadius: '2px', px: 2.5, fontWeight: 600, borderColor: '#E2E4E7', color: '#50575E', '&:hover': { borderColor: '#BE5953', color: '#BE5953' } }}>
                    Cancel
                  </Button>
                  <Button variant="contained" startIcon={<SaveIcon />} onClick={handleSaveProfile}
                    disabled={loading || !hasProfileChanges()}
                    sx={{ borderRadius: '2px', px: 3, fontWeight: 700, backgroundColor: '#BE5953', '&:hover': { backgroundColor: '#9A413C' } }}>
                    {loading ? 'Saving…' : 'Save Changes'}
                  </Button>
                </>
              )}
            </Box>
          </Box>
        )}

        {/* ── Security Tab ── */}
        {activeTab === 1 && (
          <Box sx={{ p: 3 }}>
            <SectionHeading icon={<LockIcon sx={{ fontSize: 16 }} />} title="Change Password" />

            <Alert
              severity="info"
              sx={{ mb: 3, borderRadius: '2px', backgroundColor: 'rgba(36,58,125,0.06)', color: '#0073AA', '& .MuiAlert-icon': { color: '#0073AA' } }}
            >
              Use a strong password with at least 8 characters including uppercase, numbers, and symbols.
            </Alert>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              <TextField fullWidth label="Current Password" type="password" value={passwordForm.currentPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })} />
              <TextField fullWidth label="New Password" type="password" value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })} />

              {/* Password strength bar */}
              {passwordForm.newPassword && (
                <Box>
                  <Box sx={{ display: 'flex', gap: 0.5, mb: 0.75 }}>
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Box key={i} sx={{ flex: 1, height: 4, borderRadius: '2px', backgroundColor: i <= passwordStrength ? strengthColor : '#E2E4E7', transition: 'background-color 0.2s ease' }} />
                    ))}
                  </Box>
                  <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: strengthColor }}>
                    {strengthLabel}
                  </Typography>
                </Box>
              )}

              <TextField fullWidth label="Confirm New Password" type="password" value={passwordForm.confirmPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                error={!!passwordForm.confirmPassword && passwordForm.newPassword !== passwordForm.confirmPassword}
                helperText={!!passwordForm.confirmPassword && passwordForm.newPassword !== passwordForm.confirmPassword ? 'Passwords do not match' : ''} />
            </Box>

            <Divider sx={{ my: 3, borderColor: '#E2E4E7' }} />

            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                variant="contained"
                startIcon={<LockIcon />}
                onClick={handleChangePassword}
                disabled={passwordLoading || !passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword}
                sx={{ borderRadius: '2px', px: 3, fontWeight: 700 }}
              >
                {passwordLoading ? 'Changing…' : 'Change Password'}
              </Button>
            </Box>
          </Box>
        )}
      </Box>

      <Snackbar open={notification.open} autoHideDuration={4000}
        onClose={() => setNotification({ ...notification, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        sx={{ zIndex: 99999 }}>
        <Alert onClose={() => setNotification({ ...notification, open: false })} severity={notification.type}
          sx={{ borderRadius: '2px', boxShadow: '0 4px 16px rgba(0,0,0,0.12)' }}>
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Settings;

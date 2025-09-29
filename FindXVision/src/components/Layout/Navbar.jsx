import React from 'react';
import { AppBar, Toolbar, Typography, Box, IconButton, Menu, MenuItem, Divider } from '@mui/material';
import {
  Person,
  Home,
  Menu as MenuIcon,
  AdminPanelSettings,
  Login,
  Logout,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../store/slices/authSlice';
import PrimaryButton from '../Common/PrimaryButton';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [accountAnchorEl, setAccountAnchorEl] = React.useState(null);
  const dispatch = useDispatch();
  const { user, isAuthenticated } = useSelector((state) => state.auth);

  const isAdmin = user?.roleKey === 'ADMIN';

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleAccountMenuOpen = (event) => {
    setAccountAnchorEl(event.currentTarget);
  };

  const handleAccountMenuClose = () => {
    setAccountAnchorEl(null);
  };

  const handleLogout = async () => {
    handleAccountMenuClose();
    await dispatch(logout());
    navigate('/');
  };

  const navigationItems = React.useMemo(() => {
    const baseItems = [
      { label: 'Home', path: '/', icon: <Home /> },
      { label: 'Report Missing Person', path: '/report', icon: <Person />, protected: true },
      { label: 'Missing Persons', path: '/missing-persons', icon: <Person /> },
    ];

    if (!isAdmin) {
      return baseItems;
    }

    return [
      ...baseItems,
      {
        label: 'Admin Reports',
        path: '/admin/missing-persons',
        icon: <AdminPanelSettings />,
      },
    ];
  }, [isAdmin]);

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <AppBar
      position="static"
      elevation={4}
      sx={{
        backgroundColor: 'rgba(26, 26, 26, 0.8)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderTop: 'none',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
      }}
    >
      <Toolbar>
        <Typography
          variant="h6"
          component="div"
          sx={{
            flexGrow: 1,
            cursor: 'pointer',
            color: 'var(--fx-accent)',
            fontWeight: 700,
            letterSpacing: 2,
            textTransform: 'uppercase',
          }}
          onClick={() => navigate('/')}
        >
          FindXVision
        </Typography>

        {/* Desktop Navigation */}
        <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center' }}>
          {navigationItems.map((item) => (
            <PrimaryButton
              key={item.path}
              startIcon={item.icon}
              onClick={() => navigate(item.path)}
              sx={{
                mx: 1,
                color: isActive(item.path) ? '#121212' : 'var(--fx-text-primary)',
                backgroundColor: isActive(item.path) ? 'var(--fx-accent)' : 'transparent',
                borderColor: isActive(item.path) ? 'var(--fx-accent)' : 'rgba(255, 152, 0, 0.25)',
                '&:hover': {
                  backgroundColor: isActive(item.path)
                    ? '#ffab33'
                    : 'rgba(255, 152, 0, 0.12)',
                  color: '#121212',
                },
              }}
            >
              {item.label}
            </PrimaryButton>
          ))}
          {isAuthenticated ? (
            <PrimaryButton
              onClick={handleAccountMenuOpen}
              sx={{
                ml: 1,
                color: 'var(--fx-text-primary)',
                borderColor: 'rgba(255, 152, 0, 0.25)',
                '&:hover': {
                  backgroundColor: 'rgba(255, 152, 0, 0.12)',
                  color: '#121212',
                },
              }}
            >
              {user?.firstName ? `Hi, ${user.firstName}` : 'Account'}
            </PrimaryButton>
          ) : (
            <PrimaryButton
              startIcon={<Login />}
              onClick={() => navigate('/login')}
              sx={{
                ml: 1,
                color: 'var(--fx-text-primary)',
                borderColor: 'rgba(255, 152, 0, 0.25)',
                '&:hover': {
                  backgroundColor: 'rgba(255, 152, 0, 0.12)',
                  color: '#121212',
                },
              }}
            >
              Sign In
            </PrimaryButton>
          )}
        </Box>

        {/* Mobile Navigation */}
        <Box sx={{ display: { xs: 'flex', md: 'none' } }}>
          <IconButton
            size="large"
            edge="start"
            color="inherit"
            aria-label="menu"
            onClick={handleMenuOpen}
          >
            <MenuIcon />
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
          >
            {navigationItems.map((item) => (
              <MenuItem
                key={item.path}
                onClick={() => {
                  navigate(item.path);
                  handleMenuClose();
                }}
                selected={isActive(item.path)}
              >
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  {React.cloneElement(item.icon, { sx: { mr: 1 } })}
                  {item.label}
                </Box>
              </MenuItem>
            ))}
            <Divider sx={{ my: 1 }} />
            {isAuthenticated ? (
              <MenuItem
                onClick={() => {
                  handleMenuClose();
                  handleLogout();
                }}
              >
                <Logout fontSize="small" sx={{ mr: 1 }} />
                Sign Out
              </MenuItem>
            ) : (
              <MenuItem
                onClick={() => {
                  handleMenuClose();
                  navigate('/login');
                }}
              >
                <Login fontSize="small" sx={{ mr: 1 }} />
                Sign In
              </MenuItem>
            )}
          </Menu>
        </Box>

        <Menu
          anchorEl={accountAnchorEl}
          open={Boolean(accountAnchorEl)}
          onClose={handleAccountMenuClose}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <MenuItem disabled>{user?.email || 'Signed in user'}</MenuItem>
          <Divider sx={{ my: 1 }} />
          <MenuItem
            onClick={() => {
              navigate('/missing-persons');
              handleAccountMenuClose();
            }}
          >
            <Person fontSize="small" sx={{ mr: 1 }} />
            Missing Persons
          </MenuItem>
          {isAdmin && (
            <MenuItem
              onClick={() => {
                navigate('/admin/missing-persons');
                handleAccountMenuClose();
              }}
            >
              <AdminPanelSettings fontSize="small" sx={{ mr: 1 }} />
              Admin Reports
            </MenuItem>
          )}
          <Divider sx={{ my: 1 }} />
          <MenuItem onClick={handleLogout}>
            <Logout fontSize="small" sx={{ mr: 1 }} />
            Sign Out
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
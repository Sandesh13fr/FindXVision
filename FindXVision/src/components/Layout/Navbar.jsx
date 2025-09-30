import React from 'react';
import { AppBar, Toolbar, Typography, Box, IconButton, Menu, MenuItem, Divider, Button, Avatar, Chip } from '@mui/material';
import {
  Person,
  Home,
  Menu as MenuIcon,
  AdminPanelSettings,
  Login,
  Logout,
  AccountCircle,
  KeyboardArrowDown,
  Shield,
  FaceRetouchingNatural,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../store/slices/authSlice';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [accountAnchorEl, setAccountAnchorEl] = React.useState(null);
  const [scrolled, setScrolled] = React.useState(false);
  const dispatch = useDispatch();
  const { user, isAuthenticated } = useSelector((state) => state.auth);

  const isAdmin = user?.roleKey === 'ADMIN';

  React.useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
      {
        label: 'Face Recognition',
        path: '/admin/face-recognition',
        icon: <FaceRetouchingNatural />,
      },
    ];
  }, [isAdmin]);

  const isActive = (path) => location.pathname === path;

  const getInitials = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    }
    if (user?.firstName) {
      return user.firstName[0].toUpperCase();
    }
    return 'U';
  };

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        top: 0,
        backgroundColor: scrolled 
          ? 'rgba(10, 10, 15, 0.25)' 
          : 'rgba(15, 15, 18, 0.25)',
        borderBottom: scrolled 
          ? '1px solid rgba(255, 152, 0, 0.15)' 
          : '1px solid rgba(255, 255, 255, 0.08)',
        backdropFilter: 'blur(32px) saturate(180%)',
        WebkitBackdropFilter: 'blur(32px) saturate(180%)',
        boxShadow: scrolled 
          ? '0 8px 32px rgba(0, 0, 0, 0.5), 0 0 80px rgba(255, 152, 0, 0.08)' 
          : '0 4px 24px rgba(0, 0, 0, 0.3)',
        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '1px',
          background: 'linear-gradient(90deg, transparent, rgba(255, 152, 0, 0.3), transparent)',
          opacity: scrolled ? 1 : 0,
          transition: 'opacity 0.4s ease',
        },
      }}
    >
      <Toolbar
        disableGutters
        sx={{
          px: { xs: 2.5, sm: 3.5, md: 5, lg: 8 },
          py: { xs: 1.5, sm: 1.75, md: 2 },
          minHeight: { xs: 64, md: 72 },
        }}
      >
        <Box
          sx={{
            width: '100%',
            display: 'grid',
            gridTemplateColumns: { xs: 'auto auto', md: 'auto 1fr auto' },
            alignItems: 'center',
            columnGap: { xs: 2, md: 4, lg: 6 },
          }}
        >
          {/* Logo */}
          <Box
            onClick={() => navigate('/')}
            sx={{
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              position: 'relative',
              '&:hover .logo-glow': {
                opacity: 1,
              },
            }}
          >
            <Box
              className="logo-glow"
              sx={{
                position: 'absolute',
                inset: -8,
                background: 'radial-gradient(circle, rgba(255, 152, 0, 0.15), transparent 70%)',
                borderRadius: '50%',
                opacity: 0,
                transition: 'opacity 0.3s ease',
                pointerEvents: 'none',
              }}
            />
            <Box
                sx={{
                  width: 90,
                  height: 50,
                  // borderRadius: '12px',
                  // background: 'linear-gradient(135deg, #ff9800 0%, #ff6f00 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  // boxShadow: '0 8px 24px rgba(255, 152, 0, 0.3)',
                  position: 'relative',
                  overflow: 'hidden',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    inset: 0,
                    // background: 'linear-gradient(135deg, rgba(255,255,255,0.3), transparent)',
                    opacity: 0.8,
                  },
                }}
              >
                <img
                  src="/logo.png"
                  alt="Logo"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    backgroundColor: 'none',
                    // borderRadius: '12px',
                  }}
                />
              </Box>
            <Typography
              variant="h6"
              component="div"
              sx={{
                color: '#fff',
                fontWeight: 800,
                letterSpacing: '0.5px',
                fontSize: { xs: '1.2rem', md: '1.35rem' },
                background: 'linear-gradient(135deg, #fff 0%, rgba(255, 152, 0, 0.9) 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              FindxVision
            </Typography>
          </Box>

          {/* Desktop Navigation */}
          <Box
            component="nav"
            sx={{
              display: { xs: 'none', md: 'flex' },
              justifySelf: 'center',
              alignItems: 'center',
              gap: 1.5,
              position: 'relative',
            }}
          >
            {navigationItems.map((item) => {
              const active = isActive(item.path);
              return (
                <Button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  disableRipple
                  sx={{
                    px: 2.5,
                    py: 1.1,
                    borderRadius: '12px',
                    fontWeight: 600,
                    letterSpacing: '0.3px',
                    fontSize: '0.95rem',
                    color: active ? '#000' : 'rgba(255, 255, 255, 0.85)',
                    backgroundColor: active ? '#ff9800' : 'transparent',
                    textTransform: 'none',
                    position: 'relative',
                    overflow: 'hidden',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    boxShadow: active ? '0 8px 24px rgba(255, 152, 0, 0.35), inset 0 1px 0 rgba(255,255,255,0.2)' : 'none',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      inset: 0,
                      background: 'rgba(255, 255, 255, 0.1)',
                      opacity: 0,
                      transition: 'opacity 0.3s ease',
                      borderRadius: '12px',
                    },
                    '&:hover::before': {
                      opacity: active ? 0 : 1,
                    },
                    '&:hover': {
                      backgroundColor: active ? '#ffad33' : 'transparent',
                      color: active ? '#000' : '#fff',
                      transform: 'translateY(-2px)',
                      boxShadow: active 
                        ? '0 12px 28px rgba(255, 152, 0, 0.4)' 
                        : '0 4px 12px rgba(255, 255, 255, 0.1)',
                    },
                  }}
                >
                  <Box component="span" sx={{ display: 'flex', alignItems: 'center', gap: 1, position: 'relative', zIndex: 1 }}>
                    {React.cloneElement(item.icon, {
                      sx: {
                        fontSize: '1.1rem',
                        color: active ? '#000' : 'rgba(255, 255, 255, 0.7)',
                        transition: 'color 0.3s ease',
                      },
                    })}
                    {item.label}
                  </Box>
                </Button>
              );
            })}
          </Box>

          {/* Desktop Auth Section */}
          <Box
            sx={{
              display: { xs: 'none', md: 'flex' },
              justifySelf: 'end',
              alignItems: 'center',
              gap: 2,
            }}
          >
            {isAuthenticated ? (
              <Button
                onClick={handleAccountMenuOpen}
                disableRipple
                endIcon={<KeyboardArrowDown sx={{ ml: -0.5 }} />}
                sx={{
                  px: 2,
                  py: 1,
                  borderRadius: '12px',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  backgroundColor: 'rgba(255, 255, 255, 0.08)',
                  color: '#fff',
                  fontWeight: 600,
                  textTransform: 'none',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 152, 0, 0.15)',
                    borderColor: 'rgba(255, 152, 0, 0.3)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 8px 20px rgba(255, 152, 0, 0.2)',
                  },
                }}
              >
                <Avatar
                  sx={{
                    width: 32,
                    height: 32,
                    fontSize: '0.875rem',
                    fontWeight: 700,
                    bgcolor: 'linear-gradient(135deg, #ff9800, #ff6f00)',
                    background: 'linear-gradient(135deg, #ff9800, #ff6f00)',
                    mr: 1.5,
                    border: '2px solid rgba(255, 255, 255, 0.2)',
                  }}
                >
                  {getInitials()}
                </Avatar>
                <Box sx={{ textAlign: 'left' }}>
                  <Typography variant="body2" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
                    {user?.firstName || 'User'}
                  </Typography>
                  {isAdmin && (
                    <Chip
                      label="Admin"
                      size="small"
                      icon={<Shield sx={{ fontSize: '0.75rem' }} />}
                      sx={{
                        height: 18,
                        fontSize: '0.65rem',
                        fontWeight: 700,
                        mt: 0.3,
                        background: 'linear-gradient(135deg, #ff9800, #ff6f00)',
                        color: '#000',
                        '& .MuiChip-icon': { color: '#000', ml: 0.5 },
                      }}
                    />
                  )}
                </Box>
              </Button>
            ) : (
              <Button
                onClick={() => navigate('/login')}
                disableRipple
                startIcon={<Login />}
                sx={{
                  px: 3,
                  py: 1.25,
                  borderRadius: '12px',
                  fontWeight: 700,
                  letterSpacing: '0.5px',
                  textTransform: 'none',
                  background: 'linear-gradient(135deg, #ff9800 0%, #ff6f00 100%)',
                  color: '#000',
                  position: 'relative',
                  overflow: 'hidden',
                  boxShadow: '0 8px 24px rgba(255, 152, 0, 0.3), inset 0 1px 0 rgba(255,255,255,0.3)',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    inset: 0,
                    background: 'linear-gradient(135deg, rgba(255,255,255,0.2), transparent)',
                    opacity: 0,
                    transition: 'opacity 0.3s ease',
                  },
                  '&:hover::before': {
                    opacity: 1,
                  },
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 12px 32px rgba(255, 152, 0, 0.45)',
                  },
                }}
              >
                Sign In
              </Button>
            )}
          </Box>

          {/* Mobile Menu Button */}
          <Box sx={{ display: { xs: 'flex', md: 'none' }, justifyContent: 'flex-end' }}>
            <IconButton
              size="large"
              edge="end"
              onClick={handleMenuOpen}
              sx={{
                color: '#fff',
                backgroundColor: 'rgba(255, 255, 255, 0.08)',
                borderRadius: '12px',
                '&:hover': {
                  backgroundColor: 'rgba(255, 152, 0, 0.15)',
                },
              }}
            >
              <MenuIcon />
            </IconButton>
          </Box>
        </Box>

        {/* Mobile Menu */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          transformOrigin={{ vertical: 'top', horizontal: 'right' }}
          PaperProps={{
            sx: {
              mt: 1,
              borderRadius: '16px',
              backgroundColor: 'rgba(20, 20, 25, 0.95)',
              backdropFilter: 'blur(24px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
              minWidth: 240,
            },
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
              sx={{
                py: 1.5,
                px: 2.5,
                color: isActive(item.path) ? '#ff9800' : 'rgba(255, 255, 255, 0.85)',
                fontWeight: isActive(item.path) ? 700 : 500,
                '&.Mui-selected': {
                  backgroundColor: 'rgba(255, 152, 0, 0.12)',
                },
                '&:hover': {
                  backgroundColor: 'rgba(255, 152, 0, 0.08)',
                },
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                {React.cloneElement(item.icon, { 
                  fontSize: 'small',
                  sx: { color: isActive(item.path) ? '#ff9800' : 'rgba(255, 255, 255, 0.6)' }
                })}
                {item.label}
              </Box>
            </MenuItem>
          ))}
          <Divider sx={{ my: 1, borderColor: 'rgba(255, 255, 255, 0.08)' }} />
          {isAuthenticated ? (
            <MenuItem
              onClick={() => {
                handleMenuClose();
                handleLogout();
              }}
              sx={{
                py: 1.5,
                px: 2.5,
                color: 'rgba(255, 255, 255, 0.85)',
                '&:hover': {
                  backgroundColor: 'rgba(255, 152, 0, 0.08)',
                },
              }}
            >
              <Logout fontSize="small" sx={{ mr: 1.5, color: 'rgba(255, 255, 255, 0.6)' }} />
              Sign Out
            </MenuItem>
          ) : (
            <MenuItem
              onClick={() => {
                handleMenuClose();
                navigate('/login');
              }}
              sx={{
                py: 1.5,
                px: 2.5,
                color: '#ff9800',
                fontWeight: 600,
                '&:hover': {
                  backgroundColor: 'rgba(255, 152, 0, 0.12)',
                },
              }}
            >
              <Login fontSize="small" sx={{ mr: 1.5 }} />
              Sign In
            </MenuItem>
          )}
        </Menu>

        {/* Account Menu */}
        <Menu
          anchorEl={accountAnchorEl}
          open={Boolean(accountAnchorEl)}
          onClose={handleAccountMenuClose}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          transformOrigin={{ vertical: 'top', horizontal: 'right' }}
          PaperProps={{
            sx: {
              mt: 1,
              borderRadius: '16px',
              backgroundColor: 'rgba(20, 20, 25, 0.95)',
              backdropFilter: 'blur(24px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
              minWidth: 260,
            },
          }}
        >
          <Box sx={{ px: 2.5, py: 2 }}>
            <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '0.75rem', mb: 0.5 }}>
              Signed in as
            </Typography>
            <Typography variant="body1" sx={{ color: '#fff', fontWeight: 600 }}>
              {user?.email || 'User'}
            </Typography>
          </Box>
          <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.08)' }} />
          <MenuItem
            onClick={() => {
              navigate('/profile');
              handleAccountMenuClose();
            }}
            sx={{
              py: 1.5,
              px: 2.5,
              color: 'rgba(255, 255, 255, 0.85)',
              '&:hover': {
                backgroundColor: 'rgba(255, 152, 0, 0.08)',
              },
            }}
          >
            <AccountCircle fontSize="small" sx={{ mr: 1.5, color: 'rgba(255, 255, 255, 0.6)' }} />
            My Profile
          </MenuItem>
          <MenuItem
            onClick={() => {
              navigate('/missing-persons');
              handleAccountMenuClose();
            }}
            sx={{
              py: 1.5,
              px: 2.5,
              color: 'rgba(255, 255, 255, 0.85)',
              '&:hover': {
                backgroundColor: 'rgba(255, 152, 0, 0.08)',
              },
            }}
          >
            <Person fontSize="small" sx={{ mr: 1.5, color: 'rgba(255, 255, 255, 0.6)' }} />
            Missing Persons
          </MenuItem>
          {isAdmin && (
            <MenuItem
              onClick={() => {
                navigate('/admin/missing-persons');
                handleAccountMenuClose();
              }}
              sx={{
                py: 1.5,
                px: 2.5,
                color: 'rgba(255, 255, 255, 0.85)',
                '&:hover': {
                  backgroundColor: 'rgba(255, 152, 0, 0.08)',
                },
              }}
            >
              <AdminPanelSettings fontSize="small" sx={{ mr: 1.5, color: 'rgba(255, 255, 255, 0.6)' }} />
              Admin Reports
            </MenuItem>
          )}
          <Divider sx={{ my: 1, borderColor: 'rgba(255, 255, 255, 0.08)' }} />
          <MenuItem
            onClick={handleLogout}
            sx={{
              py: 1.5,
              px: 2.5,
              color: '#ff5252',
              '&:hover': {
                backgroundColor: 'rgba(255, 82, 82, 0.08)',
              },
            }}
          >
            <Logout fontSize="small" sx={{ mr: 1.5 }} />
            Sign Out
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
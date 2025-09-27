import React, { useState } from 'react';
import  { Box, Paper, TextField, Typography, Alert, Container, IconButton, InputAdornment, CircularProgress, Stack, Link as MuiLink }  from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { login as loginThunk, clearError } from '../../store/slices/authSlice';

import PrimaryButton from '../../components/Common/PrimaryButton';
import LoginComponent from '../../components/Auth/Tailwind/LoginComponent';

const LoginPage = () => {
  return (
    <LoginComponent />
  );
};

export default LoginPage;


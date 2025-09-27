import React from 'react';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import styled from 'styled-components';

const StyledButton = styled(Button)`
  --fx-main-color: ${({ $accentColor }) => $accentColor};
  --fx-main-bg-color: ${({ $accentColor }) => `${$accentColor}40`};
  --fx-pattern-color: ${({ $accentColor }) => `${$accentColor}1f`};

  &.MuiButton-root {
    position: relative;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.75rem;
    cursor: pointer;
    text-transform: uppercase;
    letter-spacing: 0.35rem;
    background: radial-gradient(circle, var(--fx-main-bg-color) 0%, rgba(0, 0, 0, 0) 95%),
      linear-gradient(var(--fx-pattern-color) 1px, transparent 1px),
      linear-gradient(to right, var(--fx-pattern-color) 1px, transparent 1px);
    background-size: cover, 15px 15px, 15px 15px;
    background-position: center center;
    border-image: radial-gradient(circle, var(--fx-main-color) 0%, rgba(0, 0, 0, 0) 100%) 1;
    border-width: 1px 0 1px 0;
    border-style: solid;
    color: var(--fx-main-color);
    padding: ${({ $sizeVariant }) => {
      switch ($sizeVariant) {
        case 'small':
          return '0.6rem 1.75rem';
        case 'large':
          return '1.1rem 3.5rem';
        default:
          return '0.9rem 2.75rem';
      }
    }};
    font-weight: 700;
    font-size: ${({ $sizeVariant }) => {
      switch ($sizeVariant) {
        case 'small':
          return '0.9rem';
        case 'large':
          return '1.2rem';
        default:
          return '1rem';
      }
    }};
    line-height: 1;
    transition: background-size 0.2s ease-in-out, filter 0.2s ease-in-out, transform 0.2s ease-in-out,
      opacity 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
    width: ${({ fullWidth }) => (fullWidth ? '100%' : 'auto')};
    border-radius: 999px;
    background-color: rgba(0, 0, 0, 0.25);
    box-shadow: 0 18px 32px rgba(0, 0, 0, 0.35);

    &:hover {
      background-size: cover, 10px 10px, 10px 10px;
      transform: translateY(-2px);
      box-shadow: 0 22px 38px rgba(0, 0, 0, 0.4);
    }

    &:active {
      filter: invert(1);
      transform: translateY(1px);
    }

    &.Mui-disabled {
      opacity: 0.45;
      cursor: not-allowed;
      filter: grayscale(0.4);
      transform: none;
      box-shadow: none;
    }

    &.MuiButton-outlined {
      background-color: transparent;
      border-width: 1px;
      border-color: var(--fx-main-color);
    }

    &.MuiButton-text {
      background: none;
      box-shadow: none;
      border: none;
      padding: ${({ $sizeVariant }) => {
        switch ($sizeVariant) {
          case 'small':
            return '0.4rem 0.75rem';
          case 'large':
            return '0.9rem 1.25rem';
          default:
            return '0.7rem 1rem';
        }
      }};
      letter-spacing: 0.25rem;
    }

    .MuiButton-startIcon,
    .MuiButton-endIcon {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-size: 1.4rem;
    }

    .MuiButton-loadingIndicator {
      position: absolute;
      right: 1rem;
    }
  }
`;

const ACCENT_MAP = {
  primary: '#ff9800',
  secondary: '#ff5722',
  success: '#4caf50',
  error: '#f44336',
  warning: '#ff9800',
  info: '#03a9f4',
};

const PrimaryButton = ({
  children,
  startIcon,
  endIcon,
  fullWidth = false,
  variant = 'contained',
  color = 'primary',
  size = 'medium',
  loading = false,
  disabled,
  ...rest
}) => {
  const accentColor = ACCENT_MAP[color] || ACCENT_MAP.primary;

  return (
    <StyledButton
      disableElevation
      disableRipple
      startIcon={startIcon}
      endIcon={endIcon}
      fullWidth={fullWidth}
      variant={variant}
      color={color}
      $accentColor={accentColor}
      $sizeVariant={size}
      disabled={disabled || loading}
      size={size}
      {...rest}
    >
      {loading && (
        <CircularProgress
          size={22}
          thickness={5}
          color="inherit"
          style={{ position: 'absolute', right: '1rem' }}
        />
      )}
      {children}
    </StyledButton>
  );
};

export default PrimaryButton;

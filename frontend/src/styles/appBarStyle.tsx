import { Box, styled, Typography } from '@mui/material';

// Define the style of the AppBar
export const Logo = styled('img')({
  width: 'auto',
  objectFit: 'contain',
  cursor: 'pointer'
});

export const PopoverList = styled(Box)({
  width: 312,
  height: 53,
  display: 'flex',
  alignItems: 'center',
  cursor: 'pointer',
  padding: '0 20px',
  fontSize: '1.1rem',
  fontWeight: 'bolder',
  '&:hover': {
    backgroundColor: '#F7F7F7'
  }
});

export const BottomBarIcon = styled(Box)({
  flex: 1,
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  color: 'rgb(113, 113, 113)',
});

export const BottomBarIconBox = styled(Box)({
  cursor: 'pointer',
  height: 30,
  width: 30,
  borderRadius: '50%',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  '&:hover': {
    backgroundColor: '#DDDDDD',
  }
});

export const BottomBarTypography = styled(Typography)({
  fontSize: 10,
});

import { styled, Typography, Grid } from '@mui/material';

// Define style for login and register page
export const Logo = styled('img')({
  minWidth: 150,
  height: 'auto',
  cursor: 'pointer'
});

export const Title = styled(Typography)({
  maxWidth: 700,
  textAlign: 'center'
});

export const OuterGridContainer = styled(Grid)({
  height: '100vh',
  alignItems: 'center',
  justifyContent: 'center',
});

export const FormControlGridItem = styled(Grid)(({ theme }) => ({
  padding: theme.spacing(1),
}));

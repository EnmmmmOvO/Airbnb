import { createTheme } from '@mui/material';

// Create new breakpoints for the theme
declare module '@mui/material/styles' {
  interface BreakpointOverrides {
    csm: true;
    xxl: true;
    xxxl: true;
  }
}

const theme = createTheme({
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 960,
      lg: 1280,
      xl: 1920,
      csm: 743,
      xxl: 2160,
      xxxl: 2444,
    },
  },
});

export default theme;

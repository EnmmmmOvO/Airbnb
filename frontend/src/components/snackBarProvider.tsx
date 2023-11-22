import React, { useCallback, useState } from 'react';
import { SnackbarContext, useWindowSizeContext } from '../context';
import { SnackbarStatus } from '../types/types';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert, { AlertProps } from '@mui/material/Alert';
import { childrenTypes } from '../interfaces/interface';

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  (props, ref) => {
    return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
  });

Alert.displayName = 'Alert';

const SnackBarProvider: React.FC<childrenTypes> = ({ children }) => {
  const { width } = useWindowSizeContext();
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    status: SnackbarStatus;
  }>({
    open: false,
    message: '',
    status: 'info'
  });

  // show notification, status can define the color of the notification
  const showSnackbar = useCallback((message: string, status: SnackbarStatus = 'info') => {
    setSnackbar({ open: true, message, status });
  }, []);

  // close notification
  const closeSnackbar = useCallback(() => {
    setSnackbar({ open: false, message: '', status: 'info' });
  }, []);

  return (
    <SnackbarContext.Provider value={{ ...snackbar, showSnackbar, closeSnackbar }}>
      {children}
      <Snackbar open={snackbar.open} autoHideDuration={ width > 743 ? 3000 : 700 } onClose={closeSnackbar}>
        <Alert onClose={closeSnackbar} severity={snackbar.status} sx={{ width: width > 743 ? '100%' : '70%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </SnackbarContext.Provider>
  )
}

export default SnackBarProvider;

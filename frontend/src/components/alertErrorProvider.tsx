import React, { useCallback, useState } from 'react';
import { AlertErrorContext } from '../context';
import { Modal, Box, Typography } from '@mui/material';
import { childrenTypes } from '../interfaces/interface';

const AlertErrorProvider: React.FC<childrenTypes> = ({ children }) => {
  // Create state for error, control open/close of modal
  const [error, setError] = useState<{
    title: string;
    message: string;
    open: boolean;
  }>({
    title: '',
    message: '',
    open: false
  });

  // show error modal with title and message
  const showAlertError = useCallback((title: string, message: string) => {
    setError({ open: true, title, message });
  }, []);

  // close error modal
  const closeAlertError = useCallback(() => {
    setError({ open: false, title: '', message: '' });
  }, []);

  return (
    <AlertErrorContext.Provider value={{ ...error, showAlertError, closeAlertError }}>
      {children}
      <Modal
        open={error.open}
        onClose={closeAlertError}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <Box sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          minWidth: 350,
          width: '30%',
          bgcolor: 'white',
          boxShadow: 24,
          borderRadius: 3,
          p: 4,
        }}>
          <Typography id="modal-modal-title" variant="h5" component="h2">
            {error.title}
          </Typography>
          <Typography id="modal-modal-description" sx={{ mt: 4, mb: 1 }}>
            {error.message}
          </Typography>
        </Box>
      </Modal>
    </AlertErrorContext.Provider>
  )
}

export default AlertErrorProvider;

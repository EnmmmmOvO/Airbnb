import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useHostedIdContext } from '../context';
import AppTopBar from '../components/appTopBar';
import { Box } from '@mui/material';
import TextareaHosting from '../components/textareaHosting';

const EditHostingPage: React.FC = () => {
  const { HostedId } = useParams();
  const { setHostId } = useHostedIdContext();

  // Set Edit Hosting Page, need hostId, need to fetch data
  useEffect(() => {
    setHostId(Number(HostedId));
  }, []);

  return (
    <Box sx={{ width: '100%', height: '100%' }}>
        <AppTopBar>
          <TextareaHosting />
        </AppTopBar>
     </Box>
  )
}

export default EditHostingPage;

import React from 'react';
import AppTopBar from '../components/appTopBar';
import { Box } from '@mui/material';
import { useHostedIdContext, usePageContext } from '../context';
import TextareaHosting from '../components/textareaHosting';

const CreateHostingPage : React.FC = () => {
  const { setPage } = usePageContext();
  const { setHostId } = useHostedIdContext();

  // Set Create Hosting Page, no hostId, don't need to fetch data
  React.useEffect(() : void => {
    setPage(2);
    setHostId(null);
  }, [])

  return (
    <Box sx={{ width: '100%', height: '100%' }} >
      <AppTopBar>
        <TextareaHosting />
      </AppTopBar>
    </Box>
  )
}

export default CreateHostingPage;

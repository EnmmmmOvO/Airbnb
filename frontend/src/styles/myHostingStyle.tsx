import { Box, styled } from '@mui/material';

// Define style for my hosting page
export const InputImg = styled('input')({
  display: 'none',
});

export const PreviewImg = styled('img')({
  width: '100%',
  height: '100%',
  objectFit: 'cover',
  objectPosition: 'center'
})

export const ShowListing = styled('img')({
  width: '100%',
  height: '100%',
  borderRadius: 20,
  objectFit: 'cover',
  objectPosition: 'center'
})

export const ClickIcon = styled(Box)({
  cursor: 'pointer',
  height: '36px',
  width: '36px',
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  '&:hover': {
    background: '#dddddd',
  }
})

export const Logo = styled('img')({
  width: '25px',
  height: '25px',
  marginRight: '10px'
})

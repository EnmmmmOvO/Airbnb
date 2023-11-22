import { Box, styled } from '@mui/material';

// Define style for listing page
export const ShowListing = styled('img')({
  width: '100%',
  height: '100%',
  borderRadius: 20,
  objectFit: 'cover',
  objectPosition: 'center',
  cursor: 'pointer',
})

export const DialogImg = styled('img')(({ width, height }) => ({
  maxWidth: width,
  maxHeight: height,
  width: 'auto',
  height: 'auto',
  objectFit: 'contain'
}));

export const List = styled('li')({
  padding: 0,
})

export const SearchIcon = styled(Box)({
  padding: '0 30px',
  borderRadius: '50px',
  height: '100%',
  display: 'flex',
  alignItems: 'center',
  cursor: 'pointer'
})

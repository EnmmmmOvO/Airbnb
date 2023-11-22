import React, { useEffect, useState } from 'react';
import { listingFilterTypes } from '../interfaces/interface';
import { Box, Grid, Typography } from '@mui/material';
import { propertyType } from '../types/types';
import { Bathtub, Bed, Star } from '@mui/icons-material';
import { formatNumber } from '../helper';
import { ShowListing } from '../styles/myHostingStyle';
import { useWindowSizeContext } from '../context';
import { useNavigate } from 'react-router-dom';

const ListingBox: React.FC<{ data: listingFilterTypes }> = (props: { data: listingFilterTypes }) => {
  const boxRef = React.useRef<HTMLDivElement>(null);
  const { width } = useWindowSizeContext();
  const [boxHeight, setBoxHeight] = useState(0);
  const navigate = useNavigate();

  // set thumbnail box height same as width
  useEffect(() => {
    if (boxRef.current) {
      const style = window.getComputedStyle(boxRef.current);
      setBoxHeight(boxRef.current.clientWidth - parseFloat(style.paddingLeft));
    }
  }, [width]);

  // click listing body to go to listing page
  const clickListing = (id: number) : void => {
    navigate(`/listing/${id}`);
  }

  return (
    <Grid item xs={12} csm={6} md={4} lg={3} xxl={2.4} xxxl={2}
          ref={boxRef}
          sx={{ width: '100%', mb: 5, mt: 2, cursor: 'pointer' }}>
      {/* default thumbnail */}
      <Box sx={{ width: '100%', height: boxHeight }} data-testid="listing-img" onClick={() => clickListing(props.data.id)} >
        <ShowListing src={props.data.thumbnail} alt={props.data.title}/>
      </Box>
      <Grid container sx={{ mt: '12px', }} onClick={() => clickListing(props.data.id)}>
        <Grid item xs={7} sx={{ width: '100%' }}>
          {/* listing title */}
          <Typography sx={{
            overflowX: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            fontWeight: 600,
            color: 'rgb(34, 34, 34)'
          }}>
            {props.data.title}
          </Typography>
        </Grid>

        {/* star rating */}
        <Grid item xs={5} sx={{ fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
          <Star />
          {`${props.data.svg.toFixed(1)} (${props.data.comment})`}
        </Grid>

        {/* listing type */}
        <Grid item xs={12} sx={{ color: '#717171', mt: '1px' }}>{propertyType[props.data.type]}</Grid>

        {/* listing location */}
        <Grid item xs={12} sx={{ color: '#717171', mt: '1px', display: 'flex' }}>
          <Bathtub />
          <Typography sx={{ ml: 0.5 }}>{props.data.bathroom === 6 ? '> 5' : props.data.bathroom}</Typography>
          <Bed sx={{ ml: 0.5 }}/>
          <Typography sx={{ ml: 0.5 }}>{props.data.bed}</Typography>
        </Grid>

        {/* listing price */}
        <Grid item xs={12} sx={{ mt: '6px', textDecoration: 'underline', display: 'flex' }}>
          <Typography sx={{ color: 'rgb(34, 34, 34)', fontWeight: 600 }}>
            {`$${formatNumber(props.data.price)} AUD`}
          </Typography>
          <Typography sx={{ color: 'rgb(34, 34, 34)' }}>&nbsp;night</Typography>
        </Grid>
      </Grid>
    </Grid>
  );
}

export default ListingBox;

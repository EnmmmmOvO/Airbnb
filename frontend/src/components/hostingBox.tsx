import React, { useEffect, useState } from 'react';
import { listingBoxTypes } from '../interfaces/interface';
import { Box, Grid, Typography } from '@mui/material';
import { propertyType } from '../types/types';
import { Bathtub, Bed, Star, Edit, DeleteForever, CancelScheduleSend, Send } from '@mui/icons-material';
import { formatNumber, newRequests } from '../helper';
import { ClickIcon, ShowListing } from '../styles/myHostingStyle';
import { useNavigate } from 'react-router-dom';
import {
  useAlertErrorContext, useCurrentContext, usePublishedContext,
  useSnackbarContext,
  useTokenContext,
  useWindowSizeContext,
  useDialogDateContext
} from '../context';

// HostingBox is the box that contains the information of the hosting in my hosting page
const HostingBox: React.FC<{ data: listingBoxTypes }> = (props: { data: listingBoxTypes }) => {
  const boxRef = React.useRef<HTMLDivElement>(null);
  const { selectDate } = useDialogDateContext();
  const { width } = useWindowSizeContext();
  const {
    published,
    currentList,
    setPublished,
    setUnpublished,
    setCurrentList
  } = usePublishedContext();
  const [boxHeight, setBoxHeight] = useState(0);
  const navigator = useNavigate();
  const { token } = useTokenContext();
  const { showSnackbar } = useSnackbarContext();
  const { current } = useCurrentContext();
  const { showAlertError } = useAlertErrorContext();

  // set the thumbnail box height to be the same as the width
  useEffect(() => {
    if (boxRef.current) {
      const style = window.getComputedStyle(boxRef.current);
      setBoxHeight(boxRef.current.clientWidth - parseFloat(style.paddingLeft));
    }
  }, [width]);

  // Define function for click delete button, if in current list, delete from current list,
  // else delete from published or unpublished list
  const deleteListing = async (id: number, published: boolean) : Promise<void> => {
    await newRequests(`/listings/${id}`, 'DELETE', undefined, token)
      .then(() => {
        if (current.includes(id)) {
          setCurrentList(prev => prev.filter(data => data.id !== id));
        } else if (published) {
          setPublished(prev => prev.filter(data => data.id !== id));
        } else {
          setUnpublished(prev => prev.filter(data => data.id !== id));
        }
      }).then(() => showSnackbar('Delete Success', 'success'))
      .catch(error => showAlertError('Delete Hosting Error', error.error));
  }

  // Define function for click unpublish button, if in current list, change the published status to false,
  // else change the published status to false and move it to unpublished list
  const unPublishListing = async (id: number) : Promise<void> => {
    await newRequests(`/listings/unpublish/${id}`, 'PUT', undefined, token)
      .then(() => {
        if (current.includes(id)) {
          const body = currentList.find(data => data.id === id) as listingBoxTypes;
          body.published = false;
          setCurrentList(prev => {
            const updatedList = prev.filter(data => data.id !== id);
            return [body, ...updatedList];
          });
        } else {
          const body = published.find(data => data.id === id) as listingBoxTypes;
          body.published = false;
          setUnpublished(prev => [body, ...prev]);
          setPublished(prev => prev.filter(data => data.id !== id));
        }
        showSnackbar('Unpublish Success', 'success');
      }).catch(error => showAlertError('Unpublish Hosting Error', error.error));
  }

  return (
    <Grid item xs={12} csm={6} md={4} lg={3} xxl={2.4} xxxl={2} ref={boxRef} sx={{ width: '100%', mb: 5 }}>
      {/* default thumbnail show */}
      <Box data-testid="body-thumbnail" sx={{ width: '100%', height: boxHeight, cursor: 'pointer' }} onClick={() => navigator(`/booking/${props.data.id}`)} >
        <ShowListing src={props.data.thumbnail} alt={props.data.title}/>
      </Box>
      <Grid data-testid="body-text" container sx={{ mt: '12px', cursor: 'pointer' }} onClick={() => navigator(`/booking/${props.data.id}`)}>
        {/* Hosting Title */}
        <Grid item xs={7} sx={{ width: '100%' }}>
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

        {/* Hosting Rating */}
        <Grid item xs={5} sx={{ fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
          <Star />
          {`${props.data.svg.toFixed(1)} (${props.data.comment})`}
        </Grid>

        {/* Hosting Type */}
        <Grid item xs={12} sx={{ color: '#717171', mt: '1px' }}>{propertyType[props.data.type]}</Grid>

        {/* Hosting Bathroom and Bedroom number */}
        <Grid item xs={12} sx={{ color: '#717171', mt: '1px', display: 'flex' }}>
          <Bathtub />
          <Typography sx={{ ml: 0.5 }}>{props.data.bathroom === 6 ? '> 5' : props.data.bathroom}</Typography>
          <Bed sx={{ ml: 0.5 }}/>
          <Typography sx={{ ml: 0.5 }}>{props.data.bed}</Typography>
        </Grid>

        {/* Hosting Price */}
        <Grid item xs={6} sx={{ mt: '6px', textDecoration: 'underline', display: 'flex' }}>
          <Typography sx={{ color: 'rgb(34, 34, 34)', fontWeight: 600 }}>
            {`$${formatNumber(props.data.price)} AUD`}
          </Typography>
          <Typography sx={{ color: 'rgb(34, 34, 34)' }}>&nbsp;night</Typography>
        </Grid>

        {/* Hosting Edit, Delete, Publish, Unpublish button */}
        <Grid item xs={6} sx={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'flex-end' }}>
          {props.data.published
            ? <ClickIcon data-testid="unpublish-button" onClick={(event) => {
              event.stopPropagation()
              unPublishListing(props.data.id)
            }}><CancelScheduleSend /></ClickIcon>
            : <ClickIcon data-testid="publish-button" onClick={(event) => {
              event.stopPropagation()
              selectDate(props.data.id)
            }}><Send /></ClickIcon>
          }
          <ClickIcon data-testid="delete-button" onClick={(event) => {
            event.stopPropagation()
            deleteListing(props.data.id, props.data.published)
          }}><DeleteForever /></ClickIcon>
          <ClickIcon data-testid="edit-button" onClick={(event): void => {
            event.stopPropagation()
            navigator(`/hosting/${props.data.id}`)
          }}><Edit /></ClickIcon>
        </Grid>
      </Grid>
    </Grid>
  );
}

export default HostingBox;

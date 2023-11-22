import React, { useState } from 'react';
import moment from 'moment';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid, IconButton,
  TextField, Typography
} from '@mui/material';
import {
  DialogDateContext, useAlertErrorContext,
  useCurrentContext,
  usePublishedContext,
  useSnackbarContext, useTokenContext,
  useWindowSizeContext
} from '../context';
import { Cancel } from '@mui/icons-material';
import { childrenTypes, listingBoxTypes } from '../interfaces/interface';
import { newRequests } from '../helper';

const DynamicDatePickers: React.FC<childrenTypes> = ({ children }) => {
  const [publishDate, setPublishDate] = useState<[moment.Moment | null, moment.Moment | null][]>([[null, null]]);
  const { width } = useWindowSizeContext();
  const [id, setId] = useState<number | null>(null);
  const { showSnackbar } = useSnackbarContext();
  const { showAlertError } = useAlertErrorContext();
  const { token } = useTokenContext();
  const { current } = useCurrentContext();
  const {
    published,
    unpublished,
    currentList,
    setPublished,
    setUnpublished,
    setCurrentList
  } = usePublishedContext();
  const [open, setOpen] = useState(false);
  const handleChangeDate = (index: number, type: number) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setPublishDate(publishDate.map((date, i) =>
      i === index ? [type === 0 ? moment(event.target.value) : date[0], type === 1 ? moment(event.target.value) : date[1]] : date
    ))
  }

  // Define the modal open and record the id for publish
  const selectDate = (id: number) => {
    setId(id);
    setOpen(true);
  }

  // Add a new range of date
  const addRange = () => setPublishDate(prev => [...prev, [null, null]]);

  // Close the modal and reset the state
  const closeDialog = () => {
    setOpen(false);
    setId(null);
    setPublishDate([[null, null]]);
  }

  // Delete the given range of date
  const deleteRange = (index: number) => {
    setPublishDate(prev =>
      prev.filter((_date, i) => i !== index)
    );
  }

  // Publish the hosting with data range
  const publishListing = async () : Promise<void> => {
    if (id === null) {
      closeDialog();
      return;
    }

    const availability: {start: string, end: string}[] = [];
    let check = false;

    // Check if the date is valid or if the date is empty
    publishDate.forEach(date => {
      if (date[0] && date[1]) {
        // Start date cannot be same or after end date
        if (date[0].isAfter(date[1]) || date[0].isSame(date[1])) {
          showAlertError('Publish Error', 'Start date cannot be same or after end date');
          check = true;
        }
        availability.push({
          start: date[0].format('YYYY-MM-DD'),
          end: date[1].format('YYYY-MM-DD')
        });
      } else {
        showAlertError('Publish Error', 'Please fill all the date');
        check = true;
      }
    })

    if (check) return;

    newRequests(`/listings/publish/${id}`, 'PUT', { availability }, token)
      .then(() => {
        // If the listing is in current, update the published state
        if (current.includes(id)) {
          setCurrentList(currentList.map(data => data.id === id ? { ...data, published: true } : data));
        } else {
          // If not in current, move the listing from unpublished to published
          const body = unpublished.find(data => data.id === id) as listingBoxTypes;
          body.published = true;
          setPublished([body, ...published])
          setUnpublished(unpublished.filter(data => data.id !== id));
        }
        showSnackbar('Publish Success', 'success');
      }).catch(error => showAlertError('Publish Error', error.error));
    closeDialog();
  }

  return (
    <DialogDateContext.Provider value={{ id, selectDate }}>
      {children}
      <Dialog
        open={open}
        onClose={closeDialog}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        PaperProps={{ sx: { width: '50%', minWidth: 300 } }}
      >
        <DialogTitle id="alert-dialog-title" sx={{ fontWeight: 600, fontSize: 20 }}>
          Publish Date Selector
          {/* A button for adding a new range of date */}
          <Button fullWidth sx={{ mt: 1 }} onClick={addRange}>Add an available Date</Button>
        </DialogTitle>
        <DialogContent >
          <Grid container spacing={2}>
            {publishDate.map((date, index) => (
              <React.Fragment key={index}>
                <Grid item xs={12} md={2} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Typography sx={{ fontSize: 16 }}>Range {index + 1}</Typography>
                  {/* A button for deleting the range of date for mobile screen, must keep one date range */}
                  {width <= 960 && index !== 0 && <IconButton onClick={() => deleteRange(index)}><Cancel /></IconButton>}
                </Grid>

                <Grid item xs={12} md={4.5} sx={{ mt: width > 743 ? 1 : 0 }}>
                  <TextField
                    fullWidth
                    type="date"
                    value={date[0] ? date[0].format('YYYY-MM-DD') : ''}
                    label="Start Date"
                    data-testid={`start-date${index}`}
                    InputLabelProps={{ shrink: true }}
                    onChange={handleChangeDate(index, 0)}
                    inputProps={{ min: moment().format('YYYY-MM-DD') }}
                  />
                </Grid>
                <Grid item xs={12} md={4.5} sx={{ mt: width > 743 ? 1 : 0 }}>
                  <TextField
                    fullWidth
                    type="date"
                    value={date[1] ? date[1].format('YYYY-MM-DD') : ''}
                    label="End Date"
                    data-testid={`end-date${index}`}
                    InputLabelProps={{ shrink: true }}
                    inputProps={{ min: date[0]?.format('YYYY-MM-DD') || moment().format('YYYY-MM-DD') }}
                    onChange={handleChangeDate(index, 1)}
                  />
                </Grid>
                {/* A button for deleting the range of date for large screen, must keep one date range */}
                {
                  width > 960 && index !== 0 && <Grid item xs={1} sx={{ display: 'flex', alignItems: 'center' }}>
                    <IconButton onClick={() => deleteRange(index)}><Cancel /></IconButton>
                  </Grid>
                }
              </React.Fragment>
            ))}
          </Grid>
        </DialogContent>
        <DialogActions >
          {/* A button for closing the modal and publish the hosting */}
          <Button data-testid="cancel-button" onClick={closeDialog}>Cancel</Button>
          <Button data-testid="publish-data-select-button" onClick={publishListing}>Publish</Button>
        </DialogActions>
      </Dialog>
    </DialogDateContext.Provider>
  );
};

export default DynamicDatePickers;

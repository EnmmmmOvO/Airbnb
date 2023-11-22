import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { RequestBody, listingDetailTypes, myBookingListTypes } from '../interfaces/interface';
import { newRequests } from '../helper';
import {
  useAlertErrorContext,
  useSnackbarContext,
  useTokenContext,
  useWindowSizeContext,
  usePageContext, useFilterDateContext
} from '../context';
import {
  Box, Typography, Grid, Button, Dialog, Slide, AppBar, Toolbar, IconButton, TableContainer,
  TableBody, Table, TableCell, TableRow, ListItem, TextField, TableHead, Rating, Avatar,
} from '@mui/material';
import AppTopBar from '../components/appTopBar';
import { DialogImg, ShowListing } from '../styles/listingStyle';
import { TransitionProps } from '@mui/material/transitions';
import {
  ArrowRightAlt,
  Close,
  KeyboardArrowLeft,
  KeyboardArrowRight,
  KeyboardDoubleArrowLeft,
  KeyboardDoubleArrowRight,
  Star
} from '@mui/icons-material';
import { auStates, bedType, labels, propertyType } from '../types/types';
import moment from 'moment';

export const Transition = React.forwardRef(function Transition (
  props: TransitionProps & {
    children: React.ReactElement;
  },
  ref: React.Ref<unknown>,
) {
  const slideProps = {
    ...props,
    appear: props.appear !== undefined ? props.appear : true,
    enter: props.enter !== undefined ? props.enter : true,
    exit: props.exit !== undefined ? props.exit : true,
  };

  return <Slide direction="up" ref={ref} {...slideProps} />;
});

const ListingPage : React.FC = () => {
  const { ListingId } = useParams();
  const { width, height } = useWindowSizeContext()
  const [timeRange, setTimeRange] = useState<number>(0);
  const { token, email } = useTokenContext();
  const { showAlertError } = useAlertErrorContext();
  const [start, setStart] = useState<string>('');
  const { showSnackbar } = useSnackbarContext();
  const [end, setEnd] = useState<string>('');
  const [position, setPosition] = useState<number>(0);
  const [pictureShow, setPictureShow] = React.useState(false);
  const [total, setTotal] = useState<number>(-1);
  const navigator = useNavigate();
  const [history, setHistory] = useState<myBookingListTypes[]>([]);
  const [yourRating, setYourRating] = useState<number | null>(0);
  const [yourComments, setYourComments] = useState<string>('');
  const [reviewPermission, setReviewPermission] = useState<number | null>(null);
  const [review, setReview] = useState<RequestBody[]>([]);
  const [detail, setDetail] = useState<listingDetailTypes>({
    id: '',
    title: '',
    address: '',
    amenities: [],
    bedroom: [],
    bathroom: 0,
    price: 0,
    type: 0,
    owner: '',
    postedOn: ''
  });
  const [thumbnail, setThumbnail] = useState<string[]>([]);
  const { setPage } = usePageContext();
  const [availableDate, setAvailableDate] = useState<{
    start: string;
    end: string;
  }[]>([]);
  const [hover, setHover] = React.useState(-1);
  const [allow, setAllow] = useState<boolean>(true);
  const { time, setTime } = useFilterDateContext();

  // The picture preview modal close
  const handleClose = () => {
    setPictureShow(false);
  };

  // If land page sort by date, then set the date range
  useEffect(() => {
    if (time !== null) {
      setStart(time[0] as string);
      setEnd(time[1] as string);
      setTime(null);
    }
  }, [time]);

  // Submit new booking
  const submitNewBooking = async () => {
    const body = {
      dateRange: { start, end },
      totalPrice: total * detail.price,
    }

    // If not login, then redirect to login page
    if (!token) {
      navigator(`/jump/listing/${ListingId}`);
      setTime([start, end])
      return;
    }

    newRequests(`/bookings/new/${ListingId}`, 'POST', body, token)
      .then(data => {
        // If success, then add to history table and reset the date range
        setHistory(prev => [...prev, {
          start,
          end,
          status: 'pending',
          id: (data as RequestBody).bookingId as number
        } as myBookingListTypes])
        showSnackbar('BookingPage Success', 'success');
        setStart('');
        setEnd('');
      })
  }

  // For picture preview modal, go to last picture
  const handleLast = () => {
    if (position > 0) setPosition(prev => prev - 1);
  }

  // For picture preview modal, go to next picture
  const handleNext = () => {
    if (position < thumbnail.length - 1) setPosition(prev => prev + 1);
  }

  // Check the date range is valid or not, if success, then set the submit button enable and show the total price
  useEffect(() => {
    if (start !== '' && end !== '') {
      const startD = new Date(start).getTime();
      const endD = new Date(end).getTime();
      const limitStart = new Date(availableDate[timeRange]?.start || '').getTime();
      const limitEnd = new Date(availableDate[timeRange]?.end || '').getTime();
      if (startD < limitStart || endD > limitEnd || startD >= endD) {
        setTotal(-1);
        setAllow(true);
      } else {
        setAllow(false);
        setTotal(Math.round((endD - startD) / (1000 * 3600 * 24)));
      }
    } else setAllow(true)
  }, [start, end]);

  // Fetch the listing detail
  useEffect(() => {
    setPage(3);
    newRequests(`/listings/${ListingId}`, 'GET')
      .then(dataListing => {
        const data = dataListing.listing as RequestBody;
        const address = data.address as RequestBody;
        const metadata = data.metadata as RequestBody;

        setDetail({
          id: data.id as string,
          title: data.title as string,
          address: `${address.street1}, ${address.street2}, ${address.city}, ${auStates[address.state as number]}, ${address.postcode}` as string,
          amenities: metadata.amenities as string[],
          bedroom: metadata.bedrooms as number[][],
          price: data.price as number,
          type: metadata.propertyType as number,
          bathroom: metadata.nob as number,
          owner: data.owner as string,
          postedOn: data.postedOn as string
        } as listingDetailTypes);
        setReview(data.reviews as RequestBody[]);
        setThumbnail([data.thumbnail as string, ...metadata.picture as string[]]);
        setAvailableDate(data.availability as {
          start: string;
          end: string;
        }[])
      })
      .catch(error => showAlertError('Listing Detail Error', error.error));
  }, [ListingPage]);

  // Fetch the booking history
  useEffect(() => {
    if (token) {
      newRequests('/bookings', 'GET', undefined, token)
        .then(data => {
          if (data && data.bookings) {
            const bookings = data.bookings as RequestBody[];
            bookings.forEach((bookings: RequestBody) => {
              if (bookings.owner === email && bookings.listingId === ListingId) {
                const dataRange = bookings.dateRange as RequestBody;
                if (bookings.status === 'accepted') setReviewPermission(bookings.id as number);
                setHistory(prev => [...prev, {
                  start: dataRange.start,
                  end: dataRange.end,
                  status: bookings.status,
                  id: bookings.id
                } as myBookingListTypes]);
              }
            })
          }
        })
    }
  }, [token]);

  // For picture preview modal, open the picture preview modal
  const openPicture = (id: number) => {
    setPosition(id);
    setPictureShow(true);
  }

  // For date range select, reset the date range
  const handleTimeRange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setStart('');
    setEnd('');
    setTimeRange(event.target.value as number)
  }

  // Delete the booking history, only for pending booking
  const deleteBooking = (id: number) => {
    newRequests(`/bookings/${id}`, 'DELETE', undefined, token)
      .then(() => {
        setHistory(prev => prev.filter(book => book.id !== id));
        showSnackbar('Delete BookingPage Success', 'success');
      })
      .catch(error => showAlertError('Delete BookingPage Error', error.error));
  }

  // Submit the review
  const submitReview = () => {
    // Check the input is valid or not
    if (yourRating === null) {
      showAlertError('Submit Review Error', 'Please select your rating');
      return;
    } else if (yourComments === '') {
      showAlertError('Submit Review Error', 'Please enter your comments');
      return;
    }

    newRequests(`/listings/${ListingId}/review/${reviewPermission}`, 'PUT', {
      review: {
        owner: email,
        postedOn: moment().format('YYYY-MM-DD'),
        rating: yourRating,
        comments: yourComments
      }
    }, token)
      .then(() => {
        // If success, then add to review table
        setReview(prev => [{
          owner: email,
          postedOn: moment().format('YYYY-MM-DD'),
          rating: yourRating,
          comments: yourComments
        } as RequestBody, ...prev]);
        showSnackbar('Submit Review Success', 'success');
      })
      .catch(error => {
        showAlertError('Submit Review Error', error.error)
      });
    setYourRating(0);
    setYourComments('');
    setHover(-1);
  }

  return (
    <Box sx={{ width: '100%', height: '100%' }}>
      <AppTopBar>
        <Box sx={{
          position: 'fixed',
          overflowY: 'auto',
          width: '100%',
          top: width > 743 ? 104 : 30,
          bottom: width > 743 ? 0 : '64px',
          padding: '0 104px',
          '@media (max-width: 1440px)': {
            padding: '0 52px'
          },
          '@media (max-width: 960px)': {
            padding: '0 24px'
          }
        }}>
          <Box sx={{ mb: 4, mt: 4 }}><Typography variant={ width > 600 ? 'h4' : 'h6' }>{detail.title}</Typography></Box>
          {/* Show max 5 thumbnail on the page */}
          <Grid container spacing={1}>
            <Grid item xs={12} csm={6} sx={{ display: 'flex', maxHeight: '474px' }}>
              <ShowListing
                src={thumbnail[0]}
                sx={{ cursor: 'pointer' }}
                alt={detail.title}
                onClick={() => openPicture(0)}
              />
            </Grid>
            {width > 743 && (
              <>
                <Grid item xs={3} container spacing={1}>
                  <Grid item xs={12} sx={{ height: '50%', maxHeight: '237px' }}>
                    {thumbnail[1] && <ShowListing
                      src={thumbnail[1]}
                      alt={detail.title}
                      onClick={() => openPicture(1)}
                    />}
                  </Grid>
                  <Grid item xs={12} sx={{ height: '50%', maxHeight: '237px' }}>
                    {thumbnail[2] && <ShowListing
                      src={thumbnail[2]}
                      alt={detail.title}
                      onClick={() => openPicture(2)}
                    />}
                  </Grid>
                </Grid>
                <Grid item xs={3} container spacing={1}>
                  <Grid item xs={12} sx={{ height: '50%', maxHeight: '237px' }}>
                    {thumbnail[3] && <ShowListing
                      src={thumbnail[3]}
                      alt={detail.title}
                      onClick={() => openPicture(3)}
                    />}
                  </Grid>
                  <Grid item xs={12} sx={{ height: '50%', maxHeight: '237px' }}>
                    {thumbnail[4] && <ShowListing
                      src={thumbnail[4]}
                      alt={detail.title}
                      onClick={() => openPicture(4)}
                    />}
                  </Grid>
                </Grid>
              </>
            )}
          </Grid>

          <Box
            sx={{ mt: 2, mb: 2, width: '100%', display: 'flex', justifyContent: 'flex-end' }}
            onClick={() => openPicture(0)}>
            <Button>Show All Pictures</Button>
          </Box>

          {/* Show the listing detail */}
          <Grid container spacing={6} sx={{ mb: 5 }}>
            <Grid item xs={12} lg={7} sx={{ order: { xs: 2, lg: 1 } }}>
              <TableContainer>
                <Table sx={{ borderTop: 1, borderBottom: 1, borderColor: '#e0e0e0', mt: 2, mb: 10 }}>
                  <TableBody>
                    <TableRow>
                      <TableCell component="th" scope="row">Address</TableCell>
                      <TableCell>{detail.address}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell component="th" scope="row">Type</TableCell>
                      <TableCell>{propertyType[detail.type]}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell component="th" scope="row">Number of Bedrooms</TableCell>
                      <TableCell>{detail.bedroom.length}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell component="th" scope="row">Bedrooms Detail</TableCell>
                      <TableCell>
                        {detail.bedroom.map((bed: number[], index: number) =>
                          <ListItem key={index} sx={{ listStyleType: 'none', p: 0 }}>
                            Room {index + 1}: {bed[0]} {bedType[bed[1] as number]}
                          </ListItem>
                        )}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell component="th" scope="row">Number of Bathrooms</TableCell>
                      <TableCell>{detail.bathroom}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell component="th" scope="row">Amenities</TableCell>
                      <TableCell>
                        {detail.amenities.map((amenity: string, index: number) =>
                          <ListItem key={index} sx={{ listStyleType: 'none', p: 0 }}>
                            {amenity}
                          </ListItem>
                        )}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>

              {/* Show the review */}
              <Box><Typography variant="h5">Review</Typography></Box>
              {/* If have booking history and booking success, show the comment part */}
              {reviewPermission !== null && <Box sx={{
                boxShadow: 4,
                borderRadius: 5,
                p: 3,
                mt: 4
              }}>
                <Box sx={{ mb: 1, width: '100%', display: 'flex', alignItems: 'center' }}>
                  <Typography variant="h6">Write Your Booking Review</Typography>
                </Box>
                <Box sx={{ width: '100%', display: 'flex', alignItems: 'center' }}>
                  <Rating
                    value={yourRating}
                    precision={0.5}
                    sx={{ fontSize: '2rem' }}
                    onChange={(_event, newValue) => setYourRating(newValue)}
                    onChangeActive={(_event, newHover) => {
                      setHover(newHover);
                    }}
                    emptyIcon={<Star style={{ opacity: 0.55 }} fontSize="inherit" />}
                    />
                  {yourRating !== null && (
                    <Box sx={{ ml: 2 }}>{labels[hover !== -1 ? hover : yourRating]}</Box>
                  )}
                </Box>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  label="Comments"
                  variant="outlined"
                  value={yourComments}
                  onChange={(event: React.ChangeEvent<HTMLInputElement>) => setYourComments(event.target.value)}
                  sx={{ mt: 2, mb: 2 }}
                />
                <Button
                  fullWidth
                  variant="contained"
                  onClick={submitReview}
                  sx={{
                    mt: 2,
                    bgcolor: '#FF385C',
                    '&:hover': {
                      bgcolor: '#A50000'
                    }
                  }}>Submit Your Comments</Button>
              </Box>}
              <TableContainer sx={{ mt: 4 }}>
                {/* Show the review */}
                <Table>
                  <TableBody>
                    {review.map((detail, index) => (
                      <TableRow key={index}><TableCell>
                        <Grid container spacing={1}>
                          <Grid item xs={12} sx={{ display: 'flex', alignItems: 'center' }}>
                            <Box sx={{ mr: 2 }}>
                              <Avatar sx={{ backgroundColor: 'rgb(113, 113, 113)' }}>
                                {(detail.owner as string)[0]}
                              </Avatar>
                            </Box>
                            <Box>
                              <Box sx={{ mb: '1px' }}><Typography>{detail.owner}</Typography></Box>
                              <Box sx={{ display: 'flex' }}>
                                <Rating value={detail.rating as number} precision={0.5} readOnly sx={{ mr: 2 }}/>
                                <Typography>{(detail.rating as number).toFixed(1)}</Typography>
                              </Box>
                            </Box>
                          </Grid>
                          <Grid item xs={12}>
                            <Typography>{detail.comments}</Typography>
                          </Grid>
                          <Grid item xs={12}>
                            <Typography sx={{ fontSize: width > 743 ? 14 : 10 }}>{detail.postedOn}</Typography>
                          </Grid>
                        </Grid>
                      </TableCell></TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Grid>

            <Grid item xs={12} lg={5} sx={{ order: { xs: 1, lg: 2 } }}>
              <Box sx={{
                boxShadow: 4,
                borderRadius: 5,
                p: 3,
                '@media (min-width: 1281px)': {
                  position: 'sticky',
                  top: 30,
                }
              }}>
                {/* Booking part */}
                <Box sx={{ display: 'flex', alignItems: 'baseline' }}>
                  <Typography variant="h5" sx={{ color: '#FF385C' }}>${detail.price}</Typography>
                  <Typography sx={{ ml: 1 }}>per night</Typography>
                </Box>
                <Box sx={{ mb: 1, mt: 2 }}>Select an variable date range</Box>
                <TextField
                  fullWidth
                  select
                  label="Available BookingPage Date Range"
                  margin="normal"
                  value={timeRange}
                  onChange={handleTimeRange}
                  InputLabelProps={{
                    shrink: true,
                  }}
                  SelectProps={{
                    native: true,
                  }}
                >
                  {availableDate.map((date: { start: string, end: string }, index : number) =>
                    <option key={index} value={index}>{date.start} - {date.end}</option>
                  )}
                </TextField>
                <Grid container spacing={1} sx={{ mt: 1 }}>
                  <Grid item xs={5.5}>
                    <TextField
                      fullWidth
                      type="date"
                      data-testid="start-date-picker"
                      label="start date"
                      InputLabelProps={{
                        shrink: true,
                      }}
                      value={start}
                      inputProps={{
                        min: availableDate[timeRange]?.start,
                        max: availableDate[timeRange]?.end,
                      }}
                      onChange={(event: React.ChangeEvent<HTMLInputElement>) => setStart(event.target.value)}
                    />
                  </Grid>
                  <Grid item xs={1} sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <ArrowRightAlt />
                  </Grid>
                  <Grid item xs={5.5}>
                    <TextField
                      fullWidth
                      type="date"
                      data-testid="end-date-picker"
                      label="end date"
                      value={end}
                      InputLabelProps={{
                        shrink: true,
                      }}
                      inputProps={{
                        min: availableDate[timeRange]?.start,
                        max: availableDate[timeRange]?.end,
                      }}
                      onChange={(event: React.ChangeEvent<HTMLInputElement>) => setEnd(event.target.value)}
                    />
                  </Grid>
                </Grid>
                {/* If have an available date range, show the total price */}
                {total !== -1 && <Box sx={{ width: '100%', display: 'flex', alignItems: 'center', mb: 2, mt: 2 }}>
                  <Typography variant="h6">Total</Typography>
                  <Typography variant="h4" sx={{ color: '#FF385C', ml: 2 }}>${total * detail.price}</Typography>
                </Box>}
                <Button
                  fullWidth
                  disabled={allow}
                  data-testid="booking-button"
                  variant="contained"
                  onClick={submitNewBooking}
                  sx={{
                    mt: 2,
                    bgcolor: '#FF385C',
                    '&:hover': {
                      bgcolor: '#A50000'
                    }
                  }}>BookingPage</Button>
                {history.length > 0 &&
                  <>
                  {/* Show the booking history if exists, can delete the booking with pending status */}
                  <Box sx={{ mt: 2 }}><Typography variant="h6">BookingPage History</Typography></Box>
                  <TableContainer>
                  <Table sx={{ borderTop: 1, borderBottom: 1, borderColor: '#e0e0e0', mt: 2 }}>
                    <TableHead>
                      <TableRow>
                        <TableCell></TableCell>
                        <TableCell align="center">Start Date</TableCell>
                        <TableCell align="center">End Date</TableCell>
                        <TableCell align="center">Status</TableCell>
                        <TableCell align="center">Action</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {history.map((book: myBookingListTypes, index: number) =>
                        <TableRow key={index}>
                          <TableCell align="center">{index + 1}</TableCell>
                          <TableCell align="center">{book.start}</TableCell>
                          <TableCell align="center">{book.end}</TableCell>
                          <TableCell align="center">{book.status}</TableCell>
                          <TableCell align="center">
                            <Button
                              disabled={book.status !== 'pending'}
                              onClick={() => deleteBooking(book.id)}
                            >
                              Delete
                            </Button>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
                </>}
              </Box>
            </Grid>
          </Grid>
        </Box>
      </AppTopBar>

      <Dialog
        fullScreen
        open={pictureShow}
        onClose={handleClose}
        TransitionComponent={Transition}
      >
        <AppBar color="default" sx={{ position: 'relative', bgcolor: 'white', boxShadow: 0 }}>
          <Toolbar>
            <IconButton
              edge="start"
              color="inherit"
              aria-label="close"
              onClick={handleClose}
            >
              <Close />
            </IconButton>
          </Toolbar>
        </AppBar>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
          <DialogImg src={thumbnail[position]} alt={detail.title} width={width} height={height - 120}/>
        </Box>
        <AppBar color="default" sx={{ position: 'relative', bottom: 0, bgcolor: 'white', boxShadow: 0 }}>
          <Toolbar sx={{ display: 'flex', justifyContent: 'center' }}>
            <IconButton
              edge="start"
              color="inherit"
              aria-label="close"
              disabled={position === 0}
              onClick={() => setPosition(0)}
              sx={{ mr: 5 }}
            >
              <KeyboardDoubleArrowLeft />
            </IconButton>
            <IconButton
              edge="start"
              color="inherit"
              aria-label="close"
              disabled={position === 0}
              onClick={handleLast}
              sx={{ mr: 5 }}
            >
              <KeyboardArrowLeft />
            </IconButton>
            <Box sx={{ mr: 5 }}>{`${position + 1}/${thumbnail.length}`}</Box>
            <IconButton
              edge="start"
              color="inherit"
              aria-label="close"
              disabled={position === thumbnail.length - 1}
              onClick={handleNext}
              sx={{ mr: 5 }}
            >
              <KeyboardArrowRight />
            </IconButton>
            <IconButton
              edge="start"
              color="inherit"
              aria-label="close"
              disabled={position === thumbnail.length - 1}
              onClick={() => setPosition(thumbnail.length - 1)}
            >
              <KeyboardDoubleArrowRight />
            </IconButton>
          </Toolbar>
        </AppBar>
      </Dialog>
    </Box>
  )
}

export default ListingPage;

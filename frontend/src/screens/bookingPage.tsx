import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAlertErrorContext, useSnackbarContext, useTokenContext, useWindowSizeContext } from '../context';
import { formatNumber, newRequests } from '../helper';
import { bookingDetailTypes, RequestBody } from '../interfaces/interface';
import {
  Box,
  Grid,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography
} from '@mui/material';
import AppTopBar from '../components/appTopBar';
import { Clear, Done } from '@mui/icons-material';
import { Logo } from '../styles/myHostingStyle';
import moment from 'moment';

const BookingPage: React.FC = () => {
  const { ListingId } = useParams();
  const { token } = useTokenContext();
  const [bookingList, setBookingList] = useState<RequestBody[]>([]);
  const [pending, setPending] = useState<{[key: string]: bookingDetailTypes[]}>({});
  const [accept, setAccept] = useState<bookingDetailTypes[]>([]);
  const [reject, setReject] = useState<bookingDetailTypes[]>([]);
  const [title, setTitle] = useState<string>('');
  const [postAt, setPostAt] = useState<number | string>(0);
  const { showAlertError } = useAlertErrorContext();
  const { width } = useWindowSizeContext();
  const [total, setTotal] = useState<number>(0);
  const [day, setDay] = useState<number>(0);
  const { showSnackbar } = useSnackbarContext();

  // When token or ListingId change, get booking detail and some information about the hosting
  useEffect(() => {
    if (token === null || ListingId === undefined) return;
    newRequests('/bookings', 'GET', undefined, token)
      .then((res) => {
        const temp = [] as RequestBody[];
        (res.bookings as RequestBody[]).forEach((data: RequestBody) => {
          if (data.listingId === ListingId) temp.push(data);
        });
        setBookingList(temp);
      }).catch(err => showAlertError('Booking Detail Load Error', err.error));
    newRequests(`/listings/${ListingId}`, 'GET')
      .then((res) => {
        setTitle((res.listing as RequestBody)?.title as string);
        const temp = Math.abs(moment((res.listing as RequestBody)?.postedOn as string).diff(moment(), 'days')) as number;
        setPostAt(isNaN(temp) ? 'Not Published' : temp);
      }).catch(err => showAlertError('Listing Detail Load Error', err.error));
  }, [token, ListingId]);

  // When bookingList change, sort bookingList to pending, accept, and reject
  useEffect(() : void => {
    const newPending = { ...pending };
    const newAccept = [...accept];
    bookingList.forEach((data: RequestBody) => {
      const dataRange = data.dateRange as RequestBody;
      const body = {
        id: data.id as number,
        start: dataRange.start,
        end: dataRange.end,
        owner: data.owner as string,
        price: data.totalPrice as number
      } as bookingDetailTypes;
      if (data.status === 'pending') {
        if (newPending[body.owner]) newPending[body.owner]?.push(body);
        else newPending[body.owner] = [body];
      } else if (data.status === 'accepted') newAccept.push(body);
      else setReject(prev => [...prev, body])
    });
    setPending(newPending);
    setAccept(newAccept);
  }, [bookingList]);

  // When accept change, calculate total price and total day
  useEffect(() => {
    let totalPrice = 0;
    let totalDay = 0;
    accept.forEach((data: bookingDetailTypes) => {
      const start = moment(data.start);
      const end = moment(data.end);
      const today = moment();
      if (today.year() === start.year() && today.month() === start.month()) {
        totalDay += Math.abs(start.diff(end, 'days')) as number;
        totalPrice += data.price as number;
      }
    });
    setTotal(totalPrice);
    setDay(totalDay);
  }, [accept]);

  // Logic for accept booking
  const acceptBooking = async (id: number, owner: string) : Promise<void> => {
    await newRequests(`/bookings/accept/${id}`, 'PUT', undefined, token)
      .then(() => {
        // If it success, delete booking from pending and add it to accept
        const acceptedBooking = pending[owner]?.find(booking => booking.id === id);
        deletePending(id, owner);
        if (acceptedBooking) setAccept(prevAccept => [...prevAccept, acceptedBooking]);
        showSnackbar('Accept Booking Success', 'success');
      }).catch(err => showAlertError('Accept Error', err.error));
  }

  // Logic for reject booking
  const rejectBooking = async (id: number, owner: string) : Promise<void> => {
    await newRequests(`/bookings/decline/${id}`, 'PUT', undefined, token)
      .then(() => {
        // If it success, delete booking from pending and add it to reject
        const rejectedBooking = pending[owner]?.find(booking => booking.id === id);
        deletePending(id, owner);
        if (rejectedBooking) setReject(prevAccept => [...prevAccept, rejectedBooking]);
        showSnackbar('Reject Booking Success', 'success');
      }).catch(err => showAlertError('Reject Error', err.error));
  }

  // Logic for delete booking from pending
  const deletePending = (id: number, owner: string) : void => {
    setPending(prevPending => {
      const newPending = { ...prevPending };
      if (newPending[owner]) {
        newPending[owner] = newPending[owner]?.filter(booking => booking.id !== id) as bookingDetailTypes[];
        if (newPending[owner]?.length === 0) delete newPending[owner];
      }
      return newPending;
    });
  }

  return (
    <Box sx={{ width: '100%', height: '100%' }}>
      <AppTopBar>

        <Box sx={{
          position: 'fixed',
          overflowY: 'auto',
          width: '100%',
          top: width > 743 ? 220 : 70,
          bottom: width > 743 ? 0 : '64px',
          padding: '0 104px',
          '@media (max-width: 1440px)': {
            padding: '0 52px'
          },
          '@media (max-width: 960px)': {
            padding: '0 24px'
          }
        }}>
          <Box sx={{ position: 'fixed', top: width > 743 ? 134 : 20, height: 30, display: 'flex', alignItems: 'center' }}>
            {width > 743
              ? <Typography variant='h4'>{title}</Typography>
              : <>
              <Logo src="/resources/logo2.svg" alt="logo"/>
              <Typography variant={ width > 600 ? 'h4' : 'h6' }>Booking Detail</Typography>
              </>
            }
          </Box>
          <Grid container spacing={2}>
            {/* This table show the pending booking, sort by the owner */}
            <Grid item xs={12} lg={8} sx={{ order: { xs: 2, lg: 1 }, mt: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%' }}>
                <Typography variant='h5'>Confirm Request</Typography>
              </Box>
              <TableContainer>
                <Table sx={{ borderTop: 1, borderBottom: 1, borderColor: '#e0e0e0', mt: 2, mb: 10 }}>
                  <TableHead>
                    <TableRow>
                      <TableCell align="center">Start Date</TableCell>
                      <TableCell align="center">End Date</TableCell>
                      <TableCell align="center">Action</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {Object.keys(pending).map((key: string) => (
                      <>
                        <TableRow key={key}>
                          <TableCell colSpan={3}><Typography sx={{ fontWeight: 600 }}>{key}</Typography></TableCell>
                        </TableRow>
                        {
                          (pending[key] as bookingDetailTypes[]).map((data: bookingDetailTypes, index: number) => (
                            <TableRow key={`${key}${index}`}>
                              <TableCell align="center">{data.start}</TableCell>
                              <TableCell align="center">{data.end}</TableCell>
                              <TableCell align="center">
                                <IconButton onClick={() => acceptBooking(data.id, data.owner)}><Done /></IconButton>
                                <IconButton onClick={() => rejectBooking(data.id, data.owner)}><Clear /></IconButton>
                              </TableCell>
                            </TableRow>
                          ))
                        }
                      </>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%' }}>
                <Typography variant='h5'>History Booking</Typography>
              </Box>
              <TableContainer>
                {/* This table show the accept and decline booking list */}
                <Table sx={{ borderTop: 1, borderBottom: 1, borderColor: '#e0e0e0', mt: 2, mb: 10 }}>
                  <TableHead>
                    <TableRow>
                      <TableCell align="center">User</TableCell>
                      <TableCell align="center">Start Date</TableCell>
                      <TableCell align="center">End Date</TableCell>
                      <TableCell align="center">Status</TableCell>
                      <TableCell align="center">Price</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {accept.map((data: bookingDetailTypes, index: number) => (
                      <TableRow key={`accept${index}`}>
                        <TableCell align="center">{data.owner}</TableCell>
                        <TableCell align="center">{data.start}</TableCell>
                        <TableCell align="center">{data.end}</TableCell>
                        <TableCell align="center">Accept</TableCell>
                        <TableCell align="center">${data.price}</TableCell>
                      </TableRow>
                    ))}
                    {reject.map((data: bookingDetailTypes, index: number) => (
                      <TableRow key={`reject${index}`}>
                        <TableCell align="center">{data.owner}</TableCell>
                        <TableCell align="center">{data.start}</TableCell>
                        <TableCell align="center">{data.end}</TableCell>
                        <TableCell align="center">Reject</TableCell>
                        <TableCell align="center"></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Grid>
            <Grid item xs={12} lg={4} sx={{ order: { xs: 1, lg: 2 } }}>
              <Box sx={{
                boxShadow: 4,
                borderRadius: 5,
                p: 2,
                mt: 1,
                '@media (min-width: 1281px)': {
                  position: 'sticky',
                  top: 20,
                }
              }}>
                <TableContainer>
                  {/* This table show the total profit and total day in this year */}
                  <Table>
                    <TableBody>
                      <TableRow>
                        <TableCell>Release Duration</TableCell>
                        <TableCell>{postAt}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Booking Duration in {moment().year()}</TableCell>
                        <TableCell>{day}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Profit in {moment().year()}</TableCell>
                        <TableCell>${formatNumber(total)}</TableCell>
                      </TableRow>
                      </TableBody>
                    </Table>
                </TableContainer>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </AppTopBar>
    </Box>
  )
}

export default BookingPage;

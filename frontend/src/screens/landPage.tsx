import React, { useEffect } from 'react';
import { Box, Grid } from '@mui/material';
import AppTopBar from '../components/appTopBar';
import {
  NormalOrderContext,
  useAlertErrorContext,
  usePageContext,
  useTokenContext,
  useWindowSizeContext
} from '../context';
import MobileSearch from '../components/mobileSearch';
import { newRequests } from '../helper';
import { listingFilterTypes, RequestBody } from '../interfaces/interface';
import ListingBox from '../components/listingBox';
import moment, { Moment } from 'moment';
import { auStates } from '../types/types';

const LandPage: React.FC = () => {
  const { token } = useTokenContext();
  const { width } = useWindowSizeContext();
  const { showAlertError } = useAlertErrorContext();
  const [normal, setNormal] = React.useState<{
    [key: number]: listingFilterTypes
  }>({});
  const [order, setOrder] = React.useState<number[]>([]);
  const { setPage } = usePageContext();

  // Set Land Page when token changed, fetch listing data with backend
  useEffect(() : void => {
    const record: number[] = [];
    const updateList = async () : Promise<void> => {
      // If token exists, fetch booking data for sort booked listing to top
      if (token) {
        newRequests('/bookings', 'GET', undefined, token)
          .then(data => {
            const bookings = data.bookings as RequestBody[];
            bookings.forEach((booking: RequestBody) => {
              if (booking.status !== 'declined' && !record.includes(parseInt(booking.listingId as string, 10))) {
                record.push(parseInt(booking.listingId as string, 10))
              }
            })
          }).catch(error => showAlertError('Fetch Error', error.error));
      }

      newRequests('/listings', 'GET')
        .then(async (data) => {
          const listings = data.listings as RequestBody[];
          for (const listing of listings) {
            newRequests(`/listings/${listing.id}`, 'GET')
              .then(res => {
                const detail = res.listing as RequestBody;
                if (detail && detail.published) {
                  let totalSvg = 0;
                  const review = detail.reviews as RequestBody[];
                  const metadata = detail.metadata as RequestBody;
                  const dateRange = [] as { start: Moment, end: Moment }[];
                  const availability = detail.availability as RequestBody[];
                  const address = detail.address as RequestBody;
                  let bed = 0;
                  (metadata.bedrooms as number[][]).forEach(data => {
                    if (data[0]) bed += (data[0] as number);
                  });

                  review.forEach((data: RequestBody) => {
                    totalSvg += data.rating as number;
                  });

                  availability.forEach((data: RequestBody) => {
                    dateRange.push({
                      start: moment(data.start as string),
                      end: moment(data.end as string)
                    });
                  });

                  const body: listingFilterTypes = {
                    id: listing.id as number,
                    address: `${address.street1}, ${address.street2}, ${address.city}, ${auStates[address.state as number]}, ${address.postcode}` as string,
                    title: detail.title as string,
                    thumbnail: detail.thumbnail as string,
                    svg: review.length === 0 ? 0 : totalSvg / review.length,
                    comment: review.length,
                    type: metadata.propertyType as number,
                    bed,
                    bathroom: metadata.nob as number,
                    price: detail.price as number,
                    published: detail.published as boolean,
                    dateRange,
                    history: record.includes(listing.id as number)
                  };

                  setNormal(prev => {
                    return { ...prev, [listing.id as number]: body }
                  })
                }
              })
          }
        })
    }
    updateList()
    setPage(0);
  }, [token])

  // Set Land Page order, if listing is booked, sort to top, else sort by title
  useEffect(() => {
    const order1 : number[] = [];
    const order2 : {[key: string] : number} = {};

    for (const key in normal) {
      const data = normal[parseInt(key, 10)];
      if (data) {
        if (data.history) {
          order1.push(data.id);
        } else {
          order2[data.title.toLowerCase()] = data.id;
        }
      }
    }
    for (const key of Object.keys(order2).sort()) {
      order1.push(order2[key] as number);
    }
    setOrder(order1);
  }, [normal]);

  return (
    <NormalOrderContext.Provider value={{ normal, setNormal, order, setOrder }}>
      <Box sx={{ width: '100%', height: '100%' }}>
        <AppTopBar>
          { width <= 743 && <MobileSearch /> }
          <Grid container spacing={4} sx={{
            position: 'fixed',
            overflowY: 'auto',
            top: width > 743 ? 134 : 120,
            bottom: width > 743 ? 0 : '64px',
            padding: '0 104px',
            '@media (max-width: 1440px)': {
              padding: '0 52px'
            },
            '@media (max-width: 960px)': {
              padding: '0 24px'
            }
          }}>
            {order.map((id: number) => <ListingBox key={id} data={normal[id] as listingFilterTypes} />)}
          </Grid>
        </AppTopBar>
      </Box>
    </NormalOrderContext.Provider>
  );
}

export default LandPage;

import React, { useEffect, useState } from 'react';
import {
  useAlertErrorContext,
  usePageContext,
  useWindowSizeContext,
  PublishedContext,
  useCurrentContext, useTokenContext
} from '../context';
import { Box, Button, Grid, Typography } from '@mui/material';
import AppTopBar from '../components/appTopBar';
import { listingBoxTypes, RequestBody } from '../interfaces/interface';
import { newRequests } from '../helper';
import HostingBox from '../components/hostingBox';
import { useNavigate } from 'react-router-dom';
import PublishDateSelect from '../components/publishDateSelect';

const MyHostingPage: React.FC = () => {
  const { setPage } = usePageContext();
  const { email } = useTokenContext();
  const { showAlertError } = useAlertErrorContext();
  const { current } = useCurrentContext();
  const [currentList, setCurrentList] = useState<listingBoxTypes[]>([]);
  const [published, setPublished] = useState<listingBoxTypes[]>([]);
  const [unpublished, setUnpublished] = useState<listingBoxTypes[]>([]);
  const { width } = useWindowSizeContext();
  const navigator = useNavigate();

  // Set My Hosting Page, check the listing which created by user email
  useEffect(() : void => {
    const updateList = async () : Promise<void> => {
      await newRequests('/listings', 'GET')
        .then(data => {
          if (data) return data.listings;
          return [];
        })
        .then(listings => {
          if (listings) {
            (listings as RequestBody[]).forEach(async (listing: Partial<RequestBody>) => {
              if (listing.owner !== email) return;
              await newRequests(`/listings/${listing.id}`, 'GET')
                .then(data => {
                  const detail = data.listing as RequestBody;
                  const metadata = detail.metadata as RequestBody;
                  const review = detail.reviews as RequestBody[];
                  let bed = 0;
                  (metadata.bedrooms as number[][]).forEach(data => {
                    if (data[0]) bed += (data[0] as number);
                  });

                  const total = review.reduce((prev, curr) => prev + (curr.rating as number), 0);

                  const body = {
                    id: listing.id,
                    title: detail.title,
                    thumbnail: detail.thumbnail,
                    svg: review.length === 0 ? 0 : total / review.length,
                    comment: review.length,
                    type: metadata.propertyType,
                    bed,
                    bathroom: metadata.nob,
                    price: detail.price,
                    published: detail.published,
                  } as listingBoxTypes;

                  if (current.includes(body.id)) setCurrentList(prev => [...prev, body]);
                  else if (detail.published) setPublished(prev => [...prev, body]);
                  else setUnpublished(prev => [...prev, body]);
                })
            });
          }
        }).catch(error => showAlertError('Fetch Error', error.error));
    }
    setPage(1);
    updateList();
  }, [email]);

  return (
    <PublishedContext.Provider value={{ published, unpublished, currentList, setPublished, setUnpublished, setCurrentList }}>
      <Box sx={{ width: '100%', height: '100%' }}>
        <PublishDateSelect>
          <AppTopBar>
            <Box sx={{
              height: 100,
              flexGrow: 1,
              padding: '0 104px',
              position: 'fixed',
              width: '100%',
              top: width > 743 ? 104 : 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              '@media (max-width: 1440px)': {
                padding: '0 52px'
              },
              '@media (max-width: 960px)': {
                padding: '0 24px'
              }
            }}>
              <Typography variant="h4">My Hosting</Typography>
              <Button onClick={() => navigator('/createHosting')}>Create A Hosting</Button>
            </Box>
            <Grid container spacing={4} sx={{
              position: 'fixed',
              overflowY: 'auto',
              top: width > 743 ? 230 : 120,
              bottom: width > 743 ? 0 : '64px',
              padding: '0 104px',
              '@media (max-width: 1440px)': {
                padding: '0 52px'
              },
              '@media (max-width: 960px)': {
                padding: '0 24px'
              }
            }}>
              {/* Set three part, Current, unPublished and published */}
              {currentList.length > 0 && <Grid item xs={12} sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography variant="h5">Current</Typography>
              </Grid>}
              {currentList.map((data, index) =>
                <HostingBox data={data} key={`current${index}`} />
              )}
              {unpublished.length > 0 && <Grid item xs={12} sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography variant="h5">Unpublished</Typography>
              </Grid>}
              {unpublished.map((data, index) =>
                <HostingBox data={data} key={`unPublish${index}`} />
              )}
              {published.length > 0 && <Grid item xs={12} sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography variant="h5">Published</Typography>
              </Grid>}
              {published.map((data, index) =>
                <HostingBox data={data} key={`Publish${index}`} />
              )}
            </Grid>
          </AppTopBar>
        </PublishDateSelect>
      </Box>
    </PublishedContext.Provider>
  );
}

export default MyHostingPage;

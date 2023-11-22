import React from 'react';
import {
  AppBar,
  Box,
  Button,
  Checkbox,
  Dialog,
  Grid,
  IconButton,
  MenuItem,
  TextField,
  Toolbar,
  Typography
} from '@mui/material';
import { Close, Search } from '@mui/icons-material';
import { Transition } from '../screens/listingPage';
import { useAlertErrorContext, useFilterDateContext, useNormalOrderContext } from '../context';
import moment from 'moment/moment';
import { listingFilterTypes } from '../interfaces/interface';

const MobileSearch: React.FC = () => {
  const [open, setOpen] = React.useState(false);
  const [filter, setFilter] = React.useState<number>(-1);
  const [minB, setMinB] = React.useState<boolean>(false);
  const [maxB, setMaxB] = React.useState<boolean>(false);
  const [minP, setMinP] = React.useState<boolean>(false);
  const [maxP, setMaxP] = React.useState<boolean>(false);
  const { setTime } = useFilterDateContext();
  const { normal, setOrder } = useNormalOrderContext();
  const { showAlertError } = useAlertErrorContext();

  // Define the logic of searching, search for the title and address
  const searchLogic = (data: string) => {
    const order: number[] = [];
    for (const value of Object.values(normal)) {
      if (value.title.toLowerCase().includes(data.toLowerCase()) ||
        value.address.toLowerCase().includes(data.toLowerCase())) {
        order.push(value.id);
      }
    }
    setOrder(order);
  }

  // Define the logic of normal (no filter), if login, show the history first, then sort by title
  const setNormal = () => {
    setTime(null);
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
  }

  // Define the logic of bedrooms, min and max are the number of bedrooms
  const bedroomsLogic = (min: number, max: number) => {
    // If the checkbox is not checked, set the min and max to -1 and Infinity, simulate the max and min
    if (!minB) min = -1;
    if (!maxB) max = Infinity;
    if (isNaN(min) || isNaN(max)) {
      throw new Error('Please filled the form correctly or uncheck the checkbox');
    }

    const order: number[] = [];
    for (const value of Object.values(normal)) {
      if (value.bed >= min && value.bed <= max) {
        order.push(value.id);
      }
    }
    setOrder(order);
  }

  // Define the logic of price, min and max are the number of price
  const priceLogic = (min: number, max: number) => {
    // If the checkbox is not checked, set the min and max to -1 and Infinity, simulate the max and min
    if (!minP) min = -1;
    if (!maxP) max = Infinity;
    if (isNaN(min) || isNaN(max)) {
      throw new Error('Please filled the form correctly or uncheck the checkbox');
    }

    const order: number[] = [];
    for (const value of Object.values(normal)) {
      if (value.price >= min && value.price <= max) {
        order.push(value.id);
      }
    }
    setOrder(order);
  }

  // Define the logic of date range, start and end are the string of date
  const dataRangeLogic = (start: string, end: string) => {
    if (start === '' || end === '') {
      throw new Error('Please filled the form correctly');
    }

    const startMoment = moment(start);
    const endMoment = moment(end);

    if (startMoment.isAfter(endMoment)) {
      throw new Error('Start date must be before end date');
    }

    const order: number[] = [];

    for (const value of Object.values(normal)) {
      let flag = false;
      for (const date of value.dateRange) {
        if (startMoment.isSameOrAfter(date.start) && endMoment.isSameOrBefore(date.end)) {
          flag = true;
          break;
        }
      }
      if (flag) order.push(value.id);
    }
    setOrder(order);
    setTime([start, end]);
  }

  // Define the logic of rate, only for lowest to highest and highest to lowest
  const rateLogic = (reserve: boolean) => {
    const list = Object.values(normal);
    list.sort((a: listingFilterTypes, b: listingFilterTypes) => {
      if (reserve) {
        return a.svg - b.svg;
      } else {
        return b.svg - a.svg;
      }
    });
    setOrder(list.map((data: listingFilterTypes) => data.id));
  }

  // Define the logic of submit
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) : void => {
    event.preventDefault();
    setTime(null);
    const data = new FormData(event.currentTarget);
    try {
      switch (filter) {
        case -1:
          setNormal();
          break;
        case 0:
          searchLogic(data.get('search') as string);
          break;
        case 1:
          dataRangeLogic(data.get('start') as string, data.get('end') as string);
          break;
        case 2:
          priceLogic(parseInt(data.get('minP') as string, 10), parseInt(data.get('maxP') as string, 10));
          break
        case 3:
          rateLogic(data.get('rate') as string === '1');
          break;
        case 4:
          bedroomsLogic(parseInt(data.get('minB') as string, 10), parseInt(data.get('maxB') as string, 10));
          break
        default:
          break;
      }
      setOpen(false);
    } catch (err: unknown) {
      if (err instanceof Error) {
        showAlertError('Filter Error', err.message);
      } else {
        showAlertError('Filter Error', 'Unknown Error');
      }
    }
  }

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static" color="default" sx={{
        height: 79,
        bgcolor: '#ffffff',
        boxShadow: 0,
      }}>
        <Toolbar sx={{ height: '100%', display: 'flex', alignItems: 'center' }}>
          <Box onClick={() => setOpen(true)} sx={{
            mb: 0,
            pl: 3,
            border: 2,
            borderColor: '#DDDDDD',
            borderRadius: 30,
            display: 'flex',
            alignItems: 'center',
            height: 64,
            width: '100%',
            boxShadow: 1,
            cursor: 'pointer',
            '&:hover': {
              boxShadow: 4,
            }
          }}>
            {/* For mobile, search and filter will on the top */}
            <Box sx={{ display: 'flex', alignItems: 'center' }}><Search sx={{ width: '30px', height: '30px' }} /></Box>
            <Box sx={{
              pl: 2,
              pr: 2,
              display: 'flex',
              alignItems: 'center'
            }}>Search & Filter</Box>
          </Box>
        </Toolbar>
      </AppBar>
      <Dialog
        fullScreen
        open={open}
        onClose={() => setOpen(false)}
        TransitionComponent={Transition}
      >
        {/* Use a full screen dialog to show the search and filter form */}
        <AppBar sx={{ position: 'relative', bgcolor: 'white', boxShadow: 0 }}>
          <Toolbar>
            <IconButton
              edge="start"
              onClick={() => setOpen(false)}
              aria-label="close"
            >
              <Close />
            </IconButton>
          </Toolbar>
        </AppBar>
        <Grid container spacing={2} sx={{ padding: '0 24px' }} component="form" onSubmit={handleSubmit}>
          <Grid item xs={12} sx={{ mt: 2, mb: 5 }}>
            <TextField
              select
              fullWidth
              label="Select Search or Filter Field"
              value={filter}
              InputLabelProps={{ shrink: true }}
              onChange={(e) => setFilter(parseInt(e.target.value, 10))}
              >
              {/* Select the filter type, default is normal (-1) */}
              <MenuItem value={-1}>Normal</MenuItem>
              <MenuItem value={0}>Search</MenuItem>
              <MenuItem value={1}>Date Range</MenuItem>
              <MenuItem value={2}>Price</MenuItem>
              <MenuItem value={3}>Rating</MenuItem>
              <MenuItem value={4}>Bedrooms</MenuItem>
            </TextField>
          </Grid>

          {filter === 0 && <Grid item xs={12}>
            {/* If the filter is search, show the search form */}
            <TextField fullWidth name='search' label="Enter a word to match the right house" />
          </Grid>
          }
          {filter === 1 && <>
          {/* If the filter is date range, show the date range form */}
            <Grid item xs={12}>Enter the date range you want to book</Grid>
            <Grid item xs={12}>
              <TextField type="date" label="Start Date" name="start" fullWidth InputLabelProps={{ shrink: true }}/>
            </Grid>
            <Grid item xs={12}>
              <TextField type="date" label="End Date" name="end" fullWidth InputLabelProps={{ shrink: true }}/>
            </Grid>
          </>}
          {filter === 2 && <>
            {/* If the filter is price, show the price form */}
            <Grid item xs={12}>Enter the Price range you want to find</Grid>
            <Grid item xs={1} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {/* If the checkbox is checked, if selected, it has a min price, if not, the min price is 0 */}
              <Checkbox checked={minP} onChange={(event) => setMinP(event.target.checked)} />
            </Grid>
            <Grid item xs={11}>
              <TextField
                disabled={!minP}
                type="number"
                label="Min Price"
                name="minP"
                fullWidth
                InputLabelProps={{ shrink: true }}
                inputProps={{ min: 0 }}
              />
            </Grid>
            <Grid item xs={1} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {/* If the checkbox is checked, if selected, it has a max price, if not, the max price is Infinity */}
              <Checkbox checked={maxP} onChange={(event) => setMaxP(event.target.checked)} />
            </Grid>
            <Grid item xs={11}>
              <TextField
                disabled={!maxP}
                type="number"
                name="maxP"
                label="Max Price"
                fullWidth
                InputLabelProps={{ shrink: true }}
                inputProps={{ min: 0 }}
              />
            </Grid>
          </>}
          {
            filter === 3 && <>
              {/* If the filter is rate, show the rate form */}
              <Grid item xs={12}>Select the order you want to view about ratings</Grid>
              <Grid item xs={12}><TextField fullWidth select name="rate" defaultValue={0}>
              <MenuItem value={0}>Highest To Lowest</MenuItem>
              <MenuItem value={1}>Lowest To Highest</MenuItem>
            </TextField></Grid>
            </>
          }
          {filter === 4 && <>
            {/* If the filter is bedrooms, show the bedrooms form */}
            <Grid item xs={12}>Select the bedrooms number you want to find</Grid>
            <Grid item xs={1} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {/* If the checkbox is checked, if selected, it has a min bedrooms, if not, the min bedrooms is 0 */}
              <Checkbox checked={minB} onChange={(event) => setMinB(event.target.checked)} />
            </Grid>
            <Grid item xs={11}>
              <TextField
                disabled={!minB}
                type="number"
                label="Min Bedrooms"
                name="minB"
                fullWidth
                InputLabelProps={{ shrink: true }}
                inputProps={{ min: 0 }}
              />
            </Grid>
            <Grid item xs={1} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {/* If the checkbox is checked, if selected, it has a max bedrooms, if not, the max bedrooms is Infinity */}
              <Checkbox checked={maxB} onChange={(event) => setMaxB(event.target.checked)} />
            </Grid>
            <Grid item xs={11}>
              <TextField
                disabled={!maxB}
                type="number"
                label="Max Bedrooms"
                name="maxB"
                fullWidth
                InputLabelProps={{ shrink: true }}
                inputProps={{ min: 0 }}
              />
            </Grid>
          </>}
          {
            (filter === 2 || filter === 4) &&
            <Grid item xs={12}><Typography sx={{ fontSize: 12 }}>
              {/* Notice for the checkbox function for price and bedrooms */}
              * Checkbox Unselected means not limit
            </Typography></Grid>
          }
          <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
            {/* Submit to apply the filter or search */}
            <Button type="submit" fullWidth variant="outlined">
              {filter === 0 ? 'Search' : filter === -1 ? 'Remove Filter' : 'Filter'}
            </Button>
          </Grid>
        </Grid>
      </Dialog>
    </Box>
  )
}

export default MobileSearch;

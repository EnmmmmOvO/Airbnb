import React from 'react';
import { Box, Checkbox, Grid, IconButton, MenuItem, Popover, TextField } from '@mui/material';
import { Search } from '@mui/icons-material'
import { SearchIcon } from '../styles/listingStyle';
import { useAlertErrorContext, useFilterDateContext, useNormalOrderContext } from '../context';
import { listingFilterTypes } from '../interfaces/interface';
import moment from 'moment';

const SearchFilterBar: React.FC = () => {
  const [anchorEl, setAnchorEl] = React.useState<HTMLDivElement | null>(null);
  const [anchorEl2, setAnchorEl2] = React.useState<HTMLDivElement | null>(null);
  const open = Boolean(anchorEl);
  const open2 = Boolean(anchorEl2);
  const [filter, setFilter] = React.useState<number>(-1);
  const { setOrder, normal } = useNormalOrderContext()
  const { showAlertError } = useAlertErrorContext();
  const { setTime } = useFilterDateContext();

  const [minB, setMinB] = React.useState<boolean>(false);
  const [maxB, setMaxB] = React.useState<boolean>(false);
  const [minP, setMinP] = React.useState<boolean>(false);
  const [maxP, setMaxP] = React.useState<boolean>(false);

  const handleClick = (event: React.MouseEvent<HTMLDivElement>) : void => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const clickTags = (event: React.MouseEvent<HTMLDivElement>, value: number) : void => {
    setAnchorEl2(event.currentTarget);
    setFilter(value);
  }

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
    setAnchorEl2(null);
    setAnchorEl(null);
  }

  // Define the logic of bedrooms, min and max are the number of bedrooms
  const bedroomsLogic = (min: number, max: number) => {
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
      setAnchorEl2(null);
      setAnchorEl(null);
    } catch (err: unknown) {
      if (err instanceof Error) {
        showAlertError('Filter Error', err.message);
      } else {
        showAlertError('Filter Error', 'Unknown Error');
      }
    }
  }

  return (
    <>
    <Box onClick={handleClick} sx={{
      border: 2,
      borderColor: '#DDDDDD',
      bgcolor: 'white',
      borderRadius: 30,
      pr: 1,
      pl: 3,
      width: '100%',
      maxWidth: 457,
      height: 63,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      boxShadow: 1,
      cursor: 'pointer',
      '&:hover': {
        boxShadow: 4,
      }
    }}>
      {/* For large screen version, filter is built by two popover */}
      <Box sx={{
        flex: 1,
        borderRight: 1,
        borderColor: '#000000',
        height: 30,
        display: 'flex',
        alignItems: 'center'
      }}>Search</Box>
      <Box sx={{
        flex: 1,
        height: 30,
        display: 'flex',
        alignItems: 'center',
        pl: 3
      }}>Filter</Box>
      <Box sx={{
        height: 42,
        width: 42,
        borderRadius: '50%',
        backgroundColor: '#ff385c',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <Search sx={{ color: 'white' }} />
      </Box>
    </Box>
    <Popover
      open={open}
      anchorEl={anchorEl}
      onClose={handleClose}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'center',
      }}
      transformOrigin={{
        vertical: 'top',
        horizontal: 'center',
      }}
      PaperProps={{
        sx: {
          mt: 2,
          width: '100%',
          height: 200,
          bgcolor: 'transparent',
          boxShadow: 0,
          pd: 0,
        }
      }}
    >
      <Grid container spacing={2}>
        <Grid item xs={0} lg={3}></Grid>
        <Grid item xs={12} lg={6} sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <Box sx={{
            border: 2,
            borderColor: '#DDDDDD',
            bgcolor: 'white',
            borderRadius: 30,
            pr: 10,
            pl: 10,
            width: '100%',
            height: 80,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: 15,
          }}>
            {/* Six button for six filter, click will show different filter popover */}
            <SearchIcon
              sx={{ boxShadow: filter === -1 ? 10 : 0 }}
              onClick={setNormal}>
              Normal
            </SearchIcon>
            <SearchIcon
              sx={{ boxShadow: filter === 0 ? 10 : 0 }}
              onClick={(event) => clickTags(event, 0)}>
              Search
            </SearchIcon>
            <SearchIcon
              sx={{ boxShadow: filter === 1 ? 10 : 0 }}
              onClick={(event) => clickTags(event, 1)}>
              Date
            </SearchIcon>
            <SearchIcon
              sx={{ boxShadow: filter === 2 ? 10 : 0 }}
              onClick={(event) => clickTags(event, 2)}>
              Price
            </SearchIcon>
            <SearchIcon
              sx={{ boxShadow: filter === 3 ? 10 : 0 }}
              onClick={(event) => clickTags(event, 3)}>
              Rating
            </SearchIcon>
            <SearchIcon
              sx={{ boxShadow: filter === 4 ? 10 : 0 }}
              onClick={(event) => clickTags(event, 4)}>
              Bedrooms
            </SearchIcon>
          </Box>
        </Grid>
      </Grid>
    </Popover>
      <Popover
        id='avatarBox'
        open={open2}
        anchorEl={anchorEl2}
        onClose={() => setAnchorEl2(null)}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
        PaperProps={{
          sx: {
            mt: 1,
            width: 730,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            p: 2
          }
        }}
      >
      <Grid container spacing={2} component="form" onSubmit={handleSubmit}>
        {/* If the filter is search, show the search form */}
        {filter === 0 && <Grid item xs={10.5}><TextField fullWidth name='search' /></Grid>}
        {filter === 1 && <>
          {/* If the filter is date range, show the date range form */}
          <Grid item xs={5}>
            <TextField type="date" label="Start Date" name="start" fullWidth InputLabelProps={{ shrink: true }}/>
          </Grid>
          <Grid item xs={0.5} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>~</Grid>
          <Grid item xs={5}>
            <TextField type="date" label="End Date" name="end" fullWidth InputLabelProps={{ shrink: true }}/>
          </Grid>
        </>}
        {filter === 2 && <>
          {/* If the filter is price, show the price form */}
          <Grid item xs={1} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {/* If the checkbox is checked, if selected, it has a min price, if not, the min price is 0 */}
            <Checkbox checked={minP} onChange={(event) => setMinP(event.target.checked)} />
          </Grid>
          <Grid item xs={4}>
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
          {/* If the checkbox is checked, if selected, it has a max price, if not, the max price is Infinity */}
          <Grid item xs={0.5} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>~</Grid>
          <Grid item xs={4}>
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
          <Grid item xs={1} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Checkbox checked={maxP} onChange={(event) => setMaxP(event.target.checked)} />
          </Grid>
        </>}
        {/* If the filter is rate, show the rate form */}
        {filter === 3 && <Grid item xs={10.5}><TextField fullWidth select name="rate" defaultValue={0}>
          <MenuItem value={0}>Highest To Lowest</MenuItem>
          <MenuItem value={1}>Lowest To Highest</MenuItem>
        </TextField></Grid>}
        {filter === 4 && <>
          {/* If the filter is bedrooms, show the bedrooms form */}
          <Grid item xs={1} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {/* If the checkbox is checked, if selected, it has a min bedrooms, if not, the min bedrooms is 0 */}
            <Checkbox checked={minB} onChange={(event) => setMinB(event.target.checked)} />
          </Grid>
          <Grid item xs={4}>
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
          {/* If the checkbox is checked, if selected, it has a max bedrooms, if not, the max bedrooms is Infinity */}
          <Grid item xs={0.5} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>~</Grid>
          <Grid item xs={4}>
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
          <Grid item xs={1} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Checkbox checked={maxB} onChange={(event) => setMaxB(event.target.checked)} />
          </Grid>
        </>}
        <Grid item xs={1.5} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {/* Submit to apply the filter or search */}
          <IconButton type="submit" sx={{ backgroundColor: '#ff385c' }}><Search sx={{ color: 'white' }} /></IconButton>
        </Grid>
        {/* Notice for the checkbox function for price and bedrooms */}
        {(filter === 2 || filter === 4) && <Grid item xs={12}>* Checkbox Unselected means not limit</Grid>}
      </Grid>
    </Popover>
    </>
  );
};

export default SearchFilterBar;

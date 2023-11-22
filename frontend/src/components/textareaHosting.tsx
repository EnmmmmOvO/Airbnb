import React, { useEffect, useState } from 'react';
import { AppBar, Box, Button, Container, Grid, IconButton, TextField, Toolbar, Typography } from '@mui/material';
import {
  useAlertErrorContext, useCurrentContext,
  useHostedIdContext,
  useSnackbarContext,
  useTokenContext,
  useWindowSizeContext
} from '../context';
import { useNavigate } from 'react-router-dom';
import { auStates, bedType, propertyType } from '../types/types';
import { AddCircle, ArrowBackIos, Clear, CloudUpload, FirstPage } from '@mui/icons-material';
import { amenitiesTypes, bedroomsTypes, picturesTypes, RequestBody } from '../interfaces/interface';
import { InputImg, PreviewImg } from '../styles/myHostingStyle';
import { fileToDataUrl, newRequests } from '../helper';

const TextareaHosting: React.FC = () => {
  const { token } = useTokenContext()
  const { id, setHostId } = useHostedIdContext();
  const { showAlertError } = useAlertErrorContext();
  const { showSnackbar } = useSnackbarContext();
  const { width } = useWindowSizeContext();
  const navigator = useNavigate();
  const { setCurrent } = useCurrentContext();

  const [property, setProperty] = useState<RequestBody | null>(null);

  const [title, setTitle] = useState<string>('');
  const [street1, setStreet1] = useState<string>('');
  const [street2, setStreet2] = useState<string>('');
  const [city, setCity] = useState<string>('');
  const [state, setState] = useState<number>(0);
  const [postcode, setPostcode] = useState<string>('');
  const [nob, setNob] = useState<number>(0);
  const [pType, setPType] = useState<number>(0);
  const [rent, setRent] = useState<string>('');
  const [rooms, setRooms] = useState<bedroomsTypes[]>([]);
  const [amenities, setAmenities] = useState<amenitiesTypes[]>([]);
  const [pictures, setPictures] = useState<picturesTypes[]>([]);

  // get the hosting detail from the backend
  useEffect(() => {
    const getInfo = async () : Promise<void> => {
      if (id !== null) {
        newRequests(`/listings/${id}`, 'GET', undefined, token)
          .then(data => {
            setProperty(data.listing as RequestBody)
          })
      }
    }
    getInfo();
  }, [id]);

  // If get any hosting detail, set the state
  useEffect(() => {
    if (property) {
      setTitle(property.title as string);
      setRent(property.price as string);

      const address: RequestBody = property.address as RequestBody;
      setStreet1(address.street1 as string);
      setStreet2(address.street2 as string);
      setCity(address.city as string);
      setState(address.state as number);
      setPostcode(address.postcode as string);

      const metadata: RequestBody = property.metadata as RequestBody;

      setNob(metadata.nob as number);
      setPType(metadata.propertyType as number);

      setRooms((metadata.bedrooms as number[][]).map((bedroom, index) => ({
        id: `beds${Date.now()}${index}`,
        numOfBeds: bedroom[0],
        bedType: bedroom[1]
      })) as bedroomsTypes[]);

      setAmenities((metadata.amenities as string[]).map((amenity, index) => ({
        id: `amenities${Date.now()}${index}`,
        detail: amenity
      })) as amenitiesTypes[]);
      setPictures([{ id: `thumbnail${Date.now()}-1`, url: property.thumbnail as string, blob: null }])
      setPictures(pictures => [
        ...pictures,
        ...(metadata.picture as string[]).map((picture, index) => ({
          id: `thumbnail${Date.now()}${index}`,
          url: picture,
          blob: null
        })) as picturesTypes[]]);
    }
  }, [property]);

  // convert the blob to base64
  const getBase64 = async (file: picturesTypes | undefined) : Promise<string> => {
    if (file === undefined) return ''
    else if (file.blob === null) return file.url

    return await fileToDataUrl(file.blob).then(dataUrl => {
      return dataUrl as string;
    }).catch(error => {
      console.error('Error converting to base64', error);
      return '';
    });
  }

  // submit the hosting detail to the backend
  const handleSubmit = async () : Promise<void> => {
    // Check if all the required fields are filled
    if (title === '' ||
      street1 === '' ||
      city === '' ||
      postcode === '' ||
      rent === ''
    ) {
      showAlertError('Error', 'Please fill in all the required fields');
      return;
    }

    if (pictures.length === 0) {
      showAlertError('Error', 'Please upload at least one picture as thumbnail');
      return;
    }

    const bedroomList : number[][] = [];
    rooms.forEach(room => {
      bedroomList.push([room.numOfBeds, room.bedType])
    })

    const amenityList: string[] = [];
    amenities.forEach(amenity => {
      amenityList.push(amenity.detail);
    })

    let thumbnail = '';
    await getBase64(pictures[0]).then(dataUrl => {
      thumbnail = dataUrl;
    });

    const imgList: string[] = [];
    for (let i = 1; i < pictures.length; i++) {
      await getBase64(pictures[i]).then(dataUrl => {
        imgList.push(dataUrl);
      });
    }

    const body : RequestBody = {
      title,
      address: {
        street1,
        street2,
        city,
        state,
        postcode: parseInt(postcode, 10),
      },
      price: parseInt(rent, 10),
      thumbnail,
      metadata: {
        propertyType: pType,
        nob,
        bedrooms: bedroomList,
        amenities: amenityList,
        picture: imgList,
      }
    }

    newRequests(id ? `/listings/${id}` : '/listings/new', id ? 'PUT' : 'POST', body, token)
      .then(data => {
        // If create a new hosting, add the id to the current hosting list, and notify the user
        setCurrent(prev => [...prev, parseInt(data.listingId as string, 10)]);
        showSnackbar(id ? 'Edit Detail Success' : 'Create Your Hosting Success', 'success');
        navigator('/myHosting');
        setHostId(null);
      })
      .catch(error => {
        showAlertError('Create Hosting Error', error.error);
      })
  }

  // remove the picture from the thumbnail list
  const handleRemoveFile = (id: string) : void => {
    setPictures(pictures.filter((picture) => picture.id !== id));
  }

  // Add the picture to the thumbnail list
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) : void => {
    const fileList = event.target.files;
    const fileArray: picturesTypes[] = pictures;
    if (fileList) {
      for (let i = 0; i < fileList.length; i++) {
        const file = fileList.item(i);
        if (file) {
          const fileURL = URL.createObjectURL(file);
          fileArray.push({ id: `thumbnail${Date.now()}${i}`, url: fileURL, blob: file });
        }
      }
    }
    setPictures(fileArray);
    // trigger the resize event to show the preview
    window.dispatchEvent(new Event('resize'));
  }

  // Add the bedroom to the bedroom list
  const handleAddRoom = () : void => {
    setRooms([
      ...rooms,
      { id: `beds${Date.now()}0`, numOfBeds: 1, bedType: 0 }
    ])
  }

  // Add the amenity to the amenity list
  const handleAddAmenities = () : void => {
    setAmenities([
      ...amenities,
      { id: `amenities${Date.now()}0`, detail: '' }
    ]);
  }

  // remove the amenity from the amenity list
  const handleRemoveAmenities = (id: string) : void => {
    setAmenities(amenities.filter((amenity) => amenity.id !== id));
  }

  // remove the bedroom from the bedroom list
  const handleRemoveBedroom = (id: string) : void => {
    setRooms(rooms.filter((room) => room.id !== id));
  }

  // move the picture to the front of the thumbnail list, to set the default thumbnail
  const handleMoveImageFront = (id: string) : void => {
    const pictureIndex = pictures.findIndex(picture => picture.id === id);
    if (pictureIndex === -1 || pictureIndex === 0) return;
    const newPictures = [...pictures];
    const [pictureToMove] = newPictures.splice(pictureIndex, 1) as [picturesTypes];
    newPictures.unshift(pictureToMove);
    setPictures(newPictures);
  }

  // change the number of beds in the bedroom list
  const changeBedNumber = (event: React.ChangeEvent<HTMLInputElement>, index: number) : void => {
    setRooms(rooms =>
      rooms.map((room, idx) =>
        idx === index
          ? { ...room, numOfBeds: parseInt(event.target.value, 10) }
          : room
      )
    );
  }

  // change the type of beds in the bedroom list
  const changeBedType = (event: React.ChangeEvent<HTMLInputElement>, index: number) : void => {
    setRooms(rooms =>
      rooms.map((room, idx) =>
        idx === index
          ? { ...room, bedType: parseInt(event.target.value, 10) }
          : room
      )
    );
  }

  // change the postcode, only allow number
  const changePostcode = (event: React.ChangeEvent<HTMLInputElement>) : void => {
    const { value } = event.target;
    if (value.length <= 4 && /^\d*$/.test(value)) {
      setPostcode(value);
    }
  }

  // change the rent, only allow number
  const changeRent = (event: React.ChangeEvent<HTMLInputElement>) : void => {
    const { value } = event.target;
    if (value === '' || /^[1-9]+[0-9]*$/.test(value)) {
      setRent(value);
    }
  }

  // change the amenity detail
  const changeAmenities = (event: React.ChangeEvent<HTMLInputElement>, index: number) : void => {
    setAmenities(amenities =>
      amenities.map((amenity, idx) =>
        idx === index
          ? { ...amenity, detail: event.target.value }
          : amenity
      )
    );
  }

  // cancel the hosting detail, and go back to the previous page, set all to default
  const cancel = () : void => {
    navigator(-1);
    setHostId(null);
  }

  return (
    <Grid container spacing={1} key={id !== null ? id : 'empty'} sx={{
      flexGrow: 1,
      position: 'fixed',
      display: 'flex',
      justifyContent: 'center',
      width: '100%',
      top: width > 743 ? '104px' : '64px',
      bottom: '64px',
      ml: width > 743 ? 0 : '3px',
      overflowY: 'auto',
    }}>
      <Container>
        <Grid item xs={12}>
          <Typography variant={ width > 743 ? 'h3' : 'h4' } sx={{ textAlign: 'center', mt: 5, mb: 5 }}>
            {/* If get the hosting detail, show the edit page, otherwise show the create page */}
            {id ? 'Edit Your Hosting' : 'Describe Your Hosting'}
          </Typography>
        </Grid>

        <Grid item xs={12} sx={{ mt: 3 }}>
          <Typography variant="h5">Detail</Typography>
        </Grid>

        {/* Hosting Title */}
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Title"
            name="title"
            type="text"
            value={title}
            onChange={(event) : void => setTitle(event.target.value)}
            variant="outlined"
            margin="normal"
          />
        </Grid>

        {/* Number of Bathroom, Property Type, Rent per night */}
        <Grid item container xs={12} spacing={1}>
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              select
              label="Number of Bathroom"
              name="nob"
              variant="outlined"
              data-testid="nob"
              type="number"
              value={nob}
              margin="normal"
              onChange={(event) : void => setNob(parseInt(event.target.value, 10))}
              InputLabelProps={{
                shrink: true,
              }}
              SelectProps={{
                native: true,
              }}
            >
              {[0, 1, 2, 3, 4, 5, '> 5'].map((option, index) =>
                  <option key={index} value={index}>{option}</option>
              )}
            </TextField>
          </Grid>

          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              select
              value={pType}
              data-testid="pType"
              name="propertyType"
              label="Property Type"
              margin="normal"
              onChange={(event) : void => setPType(parseInt(event.target.value, 10))}
              InputLabelProps={{
                shrink: true,
              }}
              SelectProps={{
                native: true,
              }}
            >
              {propertyType.map((option, index) =>
                <option key={index} value={index}>{option}</option>
              )}
            </TextField>
          </Grid>

          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              value={rent}
              label="Rent per night"
              name="rent"
              data-testid="rent"
              onChange={changeRent}
              variant="outlined"
              type="number"
              InputProps={{
                startAdornment: <Typography variant="h6" sx={{ mr: 1 }}>$</Typography>
              }}
              margin="normal"
            />
          </Grid>
        </Grid>

        {/* Address, including street1, street2, city, state, postcode, street 2 is optional */}
        <Grid item xs={12} sx={{ mt: 3 }}>
          <Typography variant="h5">Address</Typography>
        </Grid>

        <Grid item container xs={12} spacing={1}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              value={street1}
              name="street1"
              onChange={(event) : void => setStreet1(event.target.value)}
              type="text"
              label="Street 1"
              variant="outlined"
              margin="normal"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              value={street2}
              name="street2"
              onChange={(event) : void => setStreet2(event.target.value)}
              type="text"
              label="Street 2 (Optional)"
              variant="outlined"
              margin="normal"
            />
          </Grid>
        </Grid>

        <Grid item container xs={12} spacing={1}>
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              value={city}
              name="city"
              onChange={(event) : void => setCity(event.target.value)}
              type="text"
              label="City / Suburb"
              variant="outlined"
              margin="normal"
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              name="state"
              select
              value={state}
              label="State"
              data-testid="state"
              onChange={(event) : void => setState(parseInt(event.target.value, 10))}
              variant="outlined"
              margin="normal"
              InputLabelProps={{
                shrink: true,
              }}
              SelectProps={{
                native: true,
              }}
            >
              {auStates.map((option, index) => <option key={index} value={index}>{option}</option>)}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              value={postcode}
              name="postcode"
              type="number"
              onChange={changePostcode}
              label="Postcode"
              variant="outlined"
              margin="normal"
              InputProps={{
                sx: {
                  '& input[type=number]::-webkit-inner-spin-button, & input[type=number]::-webkit-outer-spin-button': {
                    WebkitAppearance: 'none',
                    margin: 0,
                  },
                  '& input[type=number]': {
                    MozAppearance: 'textfield',
                  },
                }
              }}
            />
          </Grid>
        </Grid>

        <Grid item xs={12} sx={{ mt: 3, mb: 2 }}>
          <Box sx={{
            display: 'flex',
            justifyContent: 'flex-start',
            alignItems: 'center',
            height: '100%',
          }}>
            <Typography variant="h5">Bedroom Property</Typography>
            <AddCircle data-testid="add-bedrooms-button" onClick={handleAddRoom} sx={{ ml: 2, cursor: 'pointer' }} />
          </Box>
        </Grid>

        {/* Bedroom, including number of beds and bed type, can add rooms or remove rooms */}
        <Grid item xs={12} sx={{ mb: 2 }}>
          <Typography sx={{ color: 'rgb(137, 137, 137)', fontSize: '16px' }}>
            Description your bedroom could include number of beds and their types
          </Typography>
        </Grid>

        {
          rooms.map((room, index) => (
            <Grid item container xs={12} spacing={2} key={room.id}>
              <Grid item xs={ width > 1100 || width <= 743 ? 1 : 2 }>
                <Box sx={{ display: 'flex', alignItems: 'center', height: '100%', justifyContent: 'center' }}>
                  <Typography variant="h6" >
                    {width <= 743 ? `${index + 1}` : `Room ${index + 1}`}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={width > 1100 ? 5 : width > 743 ? 4.5 : 4.3}>
                <TextField
                  fullWidth
                  name={`1${room.id}`}
                  label="Nubmer of Beds"
                  select
                  type="number"
                  data-testid={`bedsnumber${index}`}
                  value={room.numOfBeds}
                  onChange={(event: React.ChangeEvent<HTMLInputElement>) => changeBedNumber(event, index)}
                  InputLabelProps={{
                    shrink: true,
                  }}
                  SelectProps={{
                    native: true,
                  }}
                  variant="outlined"
                  margin="normal"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8, 10, '> 10'].map((option, index) =>
                      <option key={index} value={index + 1}>{option}</option>
                  )}
                </TextField>
              </Grid>
              <Grid item xs={width > 1100 ? 5.5 : width > 743 ? 4.5 : 5.7}>
                <TextField
                  fullWidth
                  select
                  name={`2${room.id}`}
                  label="Bed Type"
                  margin="normal"
                  data-testid={`bedstype${index}`}
                  value={room.bedType}
                  onChange={(event: React.ChangeEvent<HTMLInputElement>) => changeBedType(event, index)}
                  InputLabelProps={{
                    shrink: true,
                  }}
                  SelectProps={{
                    native: true,
                  }}
                >
                  {bedType.map((option, index) =>
                      <option key={index} value={index}>{option}</option>
                  )}
                </TextField>
              </Grid>
              <Grid item xs={width > 1100 ? 0.5 : 1}>
                <Box sx={{ display: 'flex', alignItems: 'center', height: '100%', justifyContent: 'center' }}>
                  <Box onClick={() => handleRemoveBedroom(room.id)} sx={{
                    color: 'rgb(137, 137, 137)',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    cursor: 'pointer',
                  }}>
                    <Clear/>
                  </Box>
                </Box>
              </Grid>
            </Grid>
          ))
        }

        {/* Amenities, including the special features and comforts of your property that will enhance your guests stay */}
        <Grid item xs={12} sx={{ mt: 3, mb: 2 }}>
          <Box sx={{
            display: 'flex',
            justifyContent: 'flex-start',
            alignItems: 'center',
            height: '100%',
          }}>
            <Typography variant="h5">Amenities Property</Typography>
            <AddCircle data-testid="add-amenity-button" onClick={handleAddAmenities} sx={{ ml: 2, cursor: 'pointer' }} />
          </Box>
        </Grid>

        <Grid item xs={12} sx={{ mb: 2 }}>
          <Typography sx={{ color: 'rgb(137, 137, 137)', fontSize: '16px' }}>
            Highlight the special features and comforts of your property that will enhance your guests stay.
          </Typography>
        </Grid>

        {
          amenities.map((amenity, index) => (
            <Grid item container xs={12} spacing={2} key={amenity.id}>
              <Grid item xs={width > 1100 ? 11.5 : 11}>
                <TextField
                  fullWidth
                  name={amenity.id}
                  data-testid={`amenities${index}`}
                  label={`Amenities ${index + 1}`}
                  type="text"
                  value={amenity.detail}
                  onChange={(event : React.ChangeEvent<HTMLInputElement>) => changeAmenities(event, index)}
                  variant="outlined"
                  margin="normal"
                />
              </Grid>
              <Grid item xs={width > 1100 ? 0.5 : 1}>
                <Box sx={{ display: 'flex', alignItems: 'center', height: '100%', justifyContent: 'center' }}>
                  <Box onClick={() => handleRemoveAmenities(amenity.id)} sx={{
                    color: 'rgb(137, 137, 137)',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    cursor: 'pointer',
                  }}>
                    <Clear />
                  </Box>
                </Box>
              </Grid>
            </Grid>
          ))
        }

        <Grid item xs={12} sx={{ mt: 3 }}>
          <Typography variant="h5">Thumbnail</Typography>
        </Grid>

        <Grid item xs={12} sx={{ mb: 2 }}>
          <Typography sx={{ color: 'rgb(137, 137, 137)', fontSize: '16px' }}>
            The first photo will be the default Thumbnail, use the button in the lower left corner to set the image
            you want as default.
          </Typography>
        </Grid>

        {/* Thumbnail, can submit multiple pictures */}
        <Grid item xs={12}>
          <Button component="label" variant="contained" startIcon={<CloudUpload />}>
            Upload Thumbnail
            <InputImg type="file" data-testid="image-upload" multiple onChange={handleFileChange} accept=".jpeg, .jpg, .png"/>
          </Button>
        </Grid>

        {/* Show the preview of the thumbnail, can remove the picture or move the picture to the front */}
        <Grid item xs={12} sx={{ mt: 4, mb: 4 }}>
          <Box sx={{
            width: '100%',
            height: '240px',
            padding: '20px',
            border: 1,
            overflowX: 'auto',
            display: 'flex',
            borderStyle: 'dashed',
            borderRadius: '30px'
          }}>
            {pictures.map((picture, index) =>
              (<Box key={picture.id}
                sx={{
                  position: 'relative',
                  width: '200px',
                  height: '200px',
                  flex: '0 0 auto',
                  borderColor: 'black',
                  mr: 2
                }}
              >
                <PreviewImg src={picture.url} alt="preview" loading="lazy" sizes="cover" />
                <IconButton onClick={() : void => handleRemoveFile(picture.id)}
                  sx={{
                    position: 'absolute',
                    top: 0,
                    right: 0,
                    color: 'rgba(255, 255, 255, 0.7)',
                    backgroundColor: 'rgba(0, 0, 0, 0.3)',
                    m: 1,
                    '&:hover': {
                      backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    }
                  }}
                >
                  <Clear />
                </IconButton>
                {index !== 0 && <IconButton onClick={() : void => handleMoveImageFront(picture.id)}
                  sx={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    color: 'rgba(255, 255, 255, 0.7)',
                    backgroundColor: 'rgba(0, 0, 0, 0.3)',
                    m: 1,
                    '&:hover': {
                      backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    }
                  }}
                >
                  <FirstPage />
                </IconButton>}
              </Box>
              ))
            }
          </Box>
        </Grid>

        {/* Submit the hosting detail */}
        {width > 743
          ? <AppBar position="fixed" sx={{ top: 'auto', bottom: 0, backgroundColor: 'white' }}>
            <Toolbar>
              <Box sx={{ flexGrow: 1 }} />
              <Button type="button" data-testid="submit" onClick={handleSubmit}>{id ? 'Save' : 'Submit'}</Button>
              <Button onClick={cancel} >Cancel</Button>
            </Toolbar>
          </AppBar>
          : <AppBar position="fixed" sx={{ top: 0, bottom: 'auto', backgroundColor: 'white', boxShadow: 0, borderBottom: 1, borderColor: '#dddddd' }}>
            <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Button onClick={cancel} ><ArrowBackIos /></Button>
              <Button type="submit" onClick={handleSubmit}>Submit</Button>
            </Toolbar>
          </AppBar>
        }
      </Container>
    </Grid>
  )
}

export default TextareaHosting;

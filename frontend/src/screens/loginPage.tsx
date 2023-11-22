import React, { useEffect, useRef, useState } from 'react';
import { useAlertErrorContext, useTokenContext, useSnackbarContext, useFilterDateContext } from '../context';
import { newRequests } from '../helper';
import { Grid, Button, IconButton, InputAdornment, TextField, Typography, Container, useMediaQuery, useTheme } from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { useLocation, useNavigate } from 'react-router-dom';
import { loginRegisterTextFieldErrorTypes, RequestBody } from '../interfaces/interface';
import { Logo, OuterGridContainer, Title, FormControlGridItem } from '../styles/loginRegisterStyle';

const LoginPage: React.FC = () => {
  const { setToken, setEmail } = useTokenContext();
  const { showAlertError } = useAlertErrorContext();
  const { showSnackbar } = useSnackbarContext();
  const location = useLocation();
  const [redirect, setRedirect] = useState<string | null>(null);
  const theme = useTheme();
  const { setTime } = useFilterDateContext();
  const isSmall = useMediaQuery(theme.breakpoints.down('sm'));
  const [showPassword, setShowPassword] = React.useState<boolean>(false);
  const navigator = useNavigate();
  const [emailError, setEmailError] = React.useState<loginRegisterTextFieldErrorTypes>({
    error: false,
    display: false,
    message: ''
  });

  // Record the url for Redirect to login page if user is not logged in
  useEffect(() => {
    if (!location.pathname.startsWith('/login')) {
      if (location.pathname.startsWith('/jump')) {
        setRedirect(location.pathname.slice(5));
      } else {
        setRedirect(location.pathname);
      }
    }
  }, [location]);

  const [passwordError, setPasswordError] = React.useState<loginRegisterTextFieldErrorTypes>({
    error: false,
    display: false,
    message: ''
  });
  const formRef = useRef<HTMLFormElement>(null);

  // Handle submit
  const handleSubmit = async (event : React.FormEvent<HTMLFormElement>) : Promise<void> => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    let check = false;

    // Check if email and password is empty
    if (data.get('email') === '') {
      setEmailError({
        ...emailError,
        display: true,
        message: 'Email is required'
      })
      check = true;
    } else if (!validateEmail(String(data.get('email')))) {
      setEmailError({
        ...emailError,
        display: true,
        message: 'Please enter a valid email address'
      })
      check = true;
    }

    if (data.get('password') === '') {
      setPasswordError({
        ...passwordError,
        display: true,
        message: 'Password is required'
      })
      check = true;
    }

    if (check) {
      showAlertError('Login Error', 'Please check your input');
      return;
    }

    newRequests('/user/auth/login', 'POST', {
      email: String(data.get('email')),
      password: String(data.get('password'))
    }).then((res : RequestBody) => {
      // Set token and email
      setToken(String(res.token));
      setEmail(String(data.get('email')));
      showSnackbar('Login Success', 'success');

      // Redirect to the page before login
      if (redirect) navigator(redirect);
      else navigator('/');
    }).catch(err => {
      showAlertError('Login Error', err.error);
      formRef.current?.reset();
    });
  }

  // Validate email
  const validateEmail = (email : string) : boolean => {
    const re = /\S+@\S+\.\S+/;
    return re.test(email);
  }

  // Handle email change
  const handleEmailChange = (event : React.ChangeEvent<HTMLInputElement>) : void => setEmailError({
    ...emailError,
    error: event.target.value !== '' && !validateEmail(event.target.value)
  })

  // Handle email blur, check if email is valid
  const handleEmailBlur = () : void => {
    if (emailError.error) {
      setEmailError({
        ...emailError,
        display: true,
        message: 'Please enter a valid email address'
      })
    }
  }

  // Handle password focus, remove error message
  const handleEmailFocus = () : void => setEmailError({
    ...emailError,
    display: false,
    message: ''
  })

  // Handle password focus, remove error message
  const handlePasswordFocus = () : void => setPasswordError({
    ...passwordError,
    display: false,
    message: ''
  });

  // Handle show password
  const handleClickShowPassword = () : void => setShowPassword(!showPassword)
  // Handle mouse down password
  const handleMouseDownPassword = (event: React.MouseEvent<HTMLButtonElement>) : void => event.preventDefault()

  return (
    <OuterGridContainer container direction="column" spacing={1}>
      <Grid item xs={12} sm={6} md={4} lg={3} sx={{ maxHeight: 100 }}>
        <Logo src="/resources/logo.svg" alt="Airbnb Logo" onClick={() => navigator('/')}/>
      </Grid>
      <Grid item xs={12} sm={6} md={4} lg={3} sx={{ maxHeight: !isSmall ? 120 : 100 }}>
        <Title variant={isSmall ? 'h4' : 'h3'}>Welcome to Airbnb</Title>
      </Grid>
      <FormControlGridItem item xs={12} sm={6} md={4} lg={3} sx={{ maxHeight: 300 }}>
        <Container component="form" onSubmit={handleSubmit} ref={formRef}>
          <TextField
            fullWidth
            label="Email"
            name="email"
            variant="outlined"
            type="email"
            error={emailError.display}
            onBlur={handleEmailBlur}
            onFocus={handleEmailFocus}
            onChange={handleEmailChange}
            helperText={emailError.message}
            sx={{ mb: 3 }}
          />
          <TextField
            fullWidth
            label="Password"
            type={showPassword ? 'text' : 'password'}
            name="password"
            variant="outlined"
            error={passwordError.display}
            onFocus={handlePasswordFocus}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={handleClickShowPassword}
                    onMouseDown={handleMouseDownPassword}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
            helperText={passwordError.message}
            sx={{ mb: 3 }}
          />
        <Button fullWidth variant="contained" type="submit" data-testid="signin-button">Sign In</Button>
        </Container>
      </FormControlGridItem>
      <Grid item xs={12} sm={6} md={4} lg={3} sx={{ maxHeight: '100px' }}>
        {/* Click to register */}
        <Typography variant="body2">
          New to Airbnb?
          <Button variant="text" onClick={() => {
            navigator('/register')
            if (redirect) setTime(null);
          }}>
            Create an account
          </Button>
        </Typography>
      </Grid>
    </OuterGridContainer>
  );
};

export default LoginPage;

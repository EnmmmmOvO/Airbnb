import React, { useEffect, useRef } from 'react'
import { useAlertErrorContext, useTokenContext, useSnackbarContext, useWindowSizeContext } from '../context';
import { newRequests } from '../helper';
import { Logo, OuterGridContainer, Title, FormControlGridItem } from '../styles/loginRegisterStyle';
import { Button, Container, Grid, IconButton, InputAdornment, TextField, Typography } from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { loginRegisterTextFieldErrorTypes, RequestBody } from '../interfaces/interface';

const LoginPage: React.FC = () => {
  const { setToken, setEmail } = useTokenContext();
  const { showAlertError } = useAlertErrorContext();
  const { showSnackbar } = useSnackbarContext();
  const { height, width } = useWindowSizeContext()
  const navigator = useNavigate();
  const [changeContent, setChangeContent] = React.useState<boolean>(false);

  const [showPassword, setShowPassword] = React.useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState<boolean>(false);

  // change for mobile version
  useEffect(() => {
    if (height <= 800 || width <= 960) setChangeContent(true);
    else setChangeContent(false);
  }, [height, width]);

  const [emailError, setEmailError] = React.useState<loginRegisterTextFieldErrorTypes>({
    error: false,
    display: false,
    message: ''
  });

  const [nameError, setNameError] = React.useState<loginRegisterTextFieldErrorTypes>({
    error: false,
    display: false,
    message: ''
  });

  const [passwordError, setPasswordError] = React.useState<loginRegisterTextFieldErrorTypes>({
    error: false,
    display: false,
    message: ''
  });

  const [confirmPasswordError, setConfirmPasswordError] = React.useState<loginRegisterTextFieldErrorTypes>({
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

    // Check if email, name, password and confirmPassword is empty
    if (data.get('email') === '') {
      setEmailError({
        ...emailError,
        display: true,
        message: 'Email is required'
      })
      check = true;
    } else if (!validateEmail(String(data.get('email')))) {
      setEmailError({
        error: false,
        display: true,
        message: 'Please enter a valid email address'
      })
      check = true;
    }

    if (data.get('name') === '') {
      setNameError({
        ...nameError,
        display: true,
        message: 'Name is required'
      })
      check = true;
    } else if (!validateNameFullSpace(String(data.get('name')))) {
      setNameError({
        ...nameError,
        display: true,
        message: 'Please enter a valid name'
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

    if (data.get('confirmPassword') !== data.get('password')) {
      setConfirmPasswordError({
        ...confirmPasswordError,
        display: true,
        message: 'Confirm password does not match password'
      })
      check = true;
    }

    if (check) {
      showAlertError('Login Error', 'Please fill in all fields');
      return;
    }

    newRequests('/user/auth/register', 'POST', {
      email: String(data.get('email')),
      password: String(data.get('password')),
      name: String(data.get('name'))
    }).then((res : RequestBody) => {
      // Set token and email
      setToken(String(res.token));
      setEmail(String(data.get('email')));
      showSnackbar('Register Success', 'success');
      navigator('/');
    }).catch(err => {
      showAlertError('Register Error', err.error);
      formRef.current?.reset();
    });
  };

  const validateEmail = (email : string) : boolean => {
    const re = /\S+@\S+\.\S+/;
    return re.test(email);
  };

  const validateNameFullSpace = (name : string) : boolean => {
    const re = /\S+/;
    return re.test(name);
  };

  // Handle email change, check if email is valid
  const handleEmailChange = (event : React.ChangeEvent<HTMLInputElement>) : void => setEmailError({
    ...emailError,
    error: event.target.value !== '' && !validateEmail(event.target.value)
  });

  // Handle email blur, show error if email is invalid
  const handleEmailBlur = () : void => {
    if (emailError.error) {
      setEmailError({
        ...emailError,
        display: true,
        message: 'Please enter a valid email address'
      })
    }
  };

  // if email is focused, hide error
  const handleEmailFocus = () : void => setEmailError({
    ...emailError,
    display: false,
    message: ''
  })

  // if name is focused, hide error
  const handleNameFocus = () : void => setNameError({
    ...nameError,
    display: false,
    message: ''
  });

  // if password is focused, hide error
  const handlePasswordFocus = () : void => setPasswordError({ ...passwordError, display: false, message: '' });

  // handle confirm password change, check if confirm password is the same as password
  const onConfirmPasswordChange = (event : React.ChangeEvent<HTMLInputElement>) : void => {
    const passwordValue = formRef.current?.elements.namedItem('password') as HTMLInputElement | null;
    setConfirmPasswordError({
      ...confirmPasswordError,
      error: String(event.target.value) !== String(passwordValue?.value)
    })
  }

  // handle confirm password blur, show error if confirm password is not the same as password
  const handleConfirmPasswordBlur = () : void => {
    if (confirmPasswordError.error) {
      setConfirmPasswordError({
        ...confirmPasswordError,
        display: true,
        message: 'Confirm password does not match password'
      })
    }
  }

  // if confirm password is focused, hide error
  const handleConfirmPasswordFocus = () : void => setConfirmPasswordError({ ...confirmPasswordError, display: false, message: '' });

  // handle show password
  const handleClickShowPassword = () : void => setShowPassword(!showPassword);
  const handleMouseDownPassword = (event: React.MouseEvent<HTMLButtonElement>) : void => event.preventDefault();
  const handleClickShowConfirmPassword = () : void => setShowConfirmPassword(!showConfirmPassword);
  const handleMouseDownConfirmPassword = (event: React.MouseEvent<HTMLButtonElement>) : void => event.preventDefault();

  return (
    <OuterGridContainer container direction="column" spacing={1}>
      <Grid item xs={12} sm={6} md={4} lg={3} sx={{ maxHeight: changeContent ? 100 : 80 }}>
        <Logo src="/resources/logo.svg" alt="Airbnb Logo" onClick={() => navigator('/')}/>
      </Grid>
      <Grid item xs={12} sm={6} md={4} lg={3} sx={{ maxHeight: changeContent ? 60 : 180 }}>
        <Title variant={ changeContent ? 'h5' : 'h3' }>
          {!changeContent
            ? 'First of all, enter your email address to create an account'
            : 'Sign Up To Airbnb'}
        </Title>
      </Grid>
      <FormControlGridItem item xs={12} sm={6} md={4} lg={3} sx={{ maxHeight: 400 }}>
        <Container component="form" onSubmit={handleSubmit} ref={formRef}>
          <TextField
            id="outlined-basic-email"
            label="Email"
            name="email"
            variant="outlined"
            type="email"
            error={emailError.display}
            onBlur={handleEmailBlur}
            onFocus={handleEmailFocus}
            onChange={handleEmailChange}
            helperText={emailError.message}
            sx={{ mb: changeContent ? 1 : 3, width: changeContent ? '100%' : '48%', mr: changeContent ? 0 : '4%' }}
          />
          <TextField
            id="outlined-basic-name"
            label="Username"
            name="name"
            variant="outlined"
            type="text"
            error={nameError.display}
            onFocus={handleNameFocus}
            helperText={nameError.message}
            sx={{ mb: changeContent ? 1 : 3, width: changeContent ? '100%' : '48%' }}
          />
          <TextField
            type={showPassword ? 'text' : 'password'}
            name="password"
            error={passwordError.display}
            onFocus={handlePasswordFocus}
            helperText={passwordError.message}
            InputProps={{
              endAdornment: <InputAdornment position="end">
                <IconButton
                  aria-label="toggle password visibility"
                  onClick={handleClickShowPassword}
                  onMouseDown={handleMouseDownPassword}
                  edge="end"
                >
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            }}
            label="Password"
            sx={{ mb: changeContent ? 1 : 3, width: changeContent ? '100%' : '48%', mr: changeContent ? 0 : '4%' }}
          />
          <TextField
            type={showConfirmPassword ? 'text' : 'password'}
            name="confirmPassword"
            error={confirmPasswordError.display}
            onFocus={handleConfirmPasswordFocus}
            onChange={onConfirmPasswordChange}
            onBlur={handleConfirmPasswordBlur}
            helperText={confirmPasswordError.message}
            label="Confirm Password"
            InputProps={{
              endAdornment: <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={handleClickShowConfirmPassword}
                    onMouseDown={handleMouseDownConfirmPassword}
                    edge="end"
                  >
                    {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
            }}
            sx={{ mb: changeContent ? 3 : 5, width: changeContent ? '100%' : '48%' }}
          />
          <Button variant="contained" type="submit" data-testid="register-button"
              sx={ !changeContent ? { width: '50%', left: '25%' } : { width: '100%' } }
            >Sign Up</Button>
        </Container>
      </FormControlGridItem>
      <Grid item xs={12} sm={6} md={4} lg={3} sx={{ maxHeight: 50 }}>
        <Typography>
          {/* Click to login */}
          Already have an account?
          <Button variant="text" onClick={() => navigator('/login')}>Log In</Button>
        </Typography>
      </Grid>
    </OuterGridContainer>
  )
}

export default LoginPage;

import React from 'react';
import Toolbar from '@mui/material/Toolbar';
import { Box, AppBar, Avatar, Popover } from '@mui/material';
import { useSnackbarContext, useTokenContext, useAlertErrorContext, useWindowSizeContext, usePageContext } from '../context';
import { useNavigate } from 'react-router-dom';
import { ManageSearch, Logout, Menu, Person } from '@mui/icons-material';
import { Logo, PopoverList } from '../styles/appBarStyle';
import { newRequests } from '../helper';
import SearchFilterBar from './searchFilterBar';
import { childrenTypes } from '../interfaces/interface';

const AppLgTopBar: React.FC<childrenTypes> = ({ children }) => {
  const { token, email, setToken, setEmail } = useTokenContext();
  const { page } = usePageContext();
  const { showSnackbar } = useSnackbarContext();
  const { showAlertError } = useAlertErrorContext();
  const { width } = useWindowSizeContext();
  const [anchorEl, setAnchorEl] = React.useState<HTMLElement | null>(null);
  const open = Boolean(anchorEl);
  const navigate = useNavigate();

  // define function for click button or icon
  const handleClick = (event: React.MouseEvent<HTMLElement>) : void => setAnchorEl(event.currentTarget);
  const handleClose = () : void => setAnchorEl(null);
  const navigateLand = () : void => navigate('/')
  const navigateLogin = () : void => navigate('/login')
  const navigateSignup = () : void => navigate('/register')

  // define for log out button, show notice when log out success, and ensure the popover is closed
  const handleLogout = () : void => {
    newRequests('/user/auth/logout', 'POST', undefined, token)
      .then(() : void => {
        setToken(null);
        setEmail(null);
        setAnchorEl(null);
        navigateLand();
        showSnackbar('Logout Success', 'success');
      }).catch((error) : void => {
        showAlertError('Logout Error', error.error);
      })
  }

  return (
    <>
    <Box sx={{ flexGrow: 1 }}>
      {/* AppBar is the top bar of the page, it contains the logo, search bar, profile button, and login button */}
      <AppBar position="static" color="default" sx={{
        boxShadow: 0,
        height: 104,
        position: 'fixed',
        padding: '0 80px',
        '@media (max-width: 1440px)': {
          padding: '0 28px'
        },
        '@media (max-width: 960px)': {
          padding: 0
        }
      }}>
        <Toolbar sx={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'space-between' }}>
          {/* Logo is the Airbnb logo, it will direct to landing page when click */}
          <Box sx={{ flex: 1, display: 'flex', alignItems: 'center' }}>
            <Logo
              src={ page === 0 && width <= 1440 ? '/resources/logo2.svg' : '/resources/logo.svg' }
              alt="Airbnb Logo"
              onClick={navigateLand}
              sx={{ height: width > 1440 ? 50 : 40, mr: 3 } }
            />
            {page === 0 && width <= 1100 && <SearchFilterBar/>}
          </Box>

          {/* SearchFilterBar is the search bar, it will only show when the page is landing page */}
          {page === 0 && width > 1100 &&
            <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <SearchFilterBar/>
            </Box>}

          <Box sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            height: 65,
            flex: 1
          }}>
            {/* Button for hosting, it will direct to hosting page when click */}
            <Box onClick={() : void => navigate('/myHosting')} sx={{
              fontWeight: 'bolder',
              fontFamily: 'Helvetica Neue, sans-serif',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              width: 192,
              height: '100%',
              borderRadius: 50,
              cursor: 'pointer',
              fontSize: 18,
              '&:hover': {
                backgroundColor: '#DDDDDD',
              }
            }}>
              {token ? 'Switch to hosting' : 'Airbnb your home'}
            </Box>
            {/* Button for landing page, it will direct to landing page when click */}
            <Box onClick={() : void => navigate('/')} sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              mr: width > 1440 ? 2 : 0,
              width: 65,
              height: '100%',
              borderRadius: '50%',
              cursor: 'pointer',
              '&:hover': {
                backgroundColor: '#DDDDDD',
              }
            }} data-testid="landing-page">
              <ManageSearch sx={{ fontSize: '30px' }} />
            </Box>
            {/* Button for profile, it will show popover for login or register when not token, click to logout when had login */}
            <Box aria-describedby="avatarBox" onClick={ token ? handleLogout : handleClick } sx={{
              width: 115,
              height: '100%',
              borderRadius: 30,
              border: 2,
              borderColor: '#DDDDDD',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              cursor: 'pointer',
              '&:hover': {
                boxShadow: 2,
              }
            }} data-testid="profile-button">
              {token
                ? (
                    <>
                      <Logout sx={{ width: 24, height: 24, mr: 2 }} data-testid="logout-button"/>
                      <Avatar sx={{ backgroundColor: 'rgb(113, 113, 113)' }}>
                        {/* Avatar is the user icon, it will show the first letter of the user email when login */}
                        {email !== null ? email[0]?.toUpperCase() : <Person sx={{ width: 32, height: 32, color: 'white' }} />}
                      </Avatar>
                    </>
                  )
                : (
                    <>
                      <Menu sx={{ width: 24, height: 24, mr: 2 }} data-testid="login-button"/>
                      <Avatar sx={{ backgroundColor: 'rgb(113, 113, 113)' }}>
                        <Person sx={{ width: 32, height: 32, color: 'white' }} data-testid="person-icon"/>
                      </Avatar>
                    </>
                  )
              }
            </Box>
            {/* Define the popover, it will show when click the profile button and token is null */}
            {
              token === null && <Popover
                id='avatarBox'
                open={open}
                anchorEl={anchorEl}
                onClose={handleClose}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'right',
                }}
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                sx={{ mt: 1 }}
                data-testid="login-popover"
              >
                <Box sx={{ width: 312, padding: '5px 0' }}>
                  <PopoverList onClick={navigateLogin}>Log in</PopoverList>
                  <PopoverList onClick={navigateSignup} sx={{ fontWeight: 'normal' }}>Sign up</PopoverList>
                </Box>
              </Popover>
            }
          </Box>
        </Toolbar>
      </AppBar>
    </Box>
    {children}
    </>
  );
}

export default AppLgTopBar;

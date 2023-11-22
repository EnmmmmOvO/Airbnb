import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import AppLgTopBar from './appLgTopBar';
import { TokenContext, PageContext, SnackbarContext, AlertErrorContext } from '../context';
import React from 'react';
import { newRequests } from '../helper';
import { alertErrorTypes, customerSnackbarTypes, pageTypes, tokenTypes } from '../interfaces/interface';

const mockNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

jest.mock('../helper', () => ({
  newRequests: jest.fn(),
}));

const logIn: tokenTypes = {
  token: 'mockToken',
  email: 'mockEmail@example.com',
  setToken: jest.fn(),
  setEmail: jest.fn()
};

const logOut: tokenTypes = {
  token: null,
  email: null,
  setToken: jest.fn(),
  setEmail: jest.fn()
};

const page0: pageTypes = {
  page: 0,
  setPage: jest.fn()
};

const page1: pageTypes = {
  page: 1,
  setPage: jest.fn()
};

const snackbar: customerSnackbarTypes = {
  message: '',
  open: false,
  status: 'info',
  showSnackbar: jest.fn(),
  closeSnackbar: jest.fn()
}

const alertError: alertErrorTypes = {
  showAlertError: jest.fn(),
  closeAlertError: jest.fn(),
  title: '',
  message: '',
}

const renderComponent = (ui: React.ReactElement,
  mockTokenContextValue: tokenTypes, mockPageContextValue: pageTypes) => {
  return render(
    <MemoryRouter>
      <SnackbarContext.Provider value={snackbar}>
        <AlertErrorContext.Provider value={alertError}>
          <TokenContext.Provider value={mockTokenContextValue}>
            <PageContext.Provider value={mockPageContextValue}>
              {ui}
            </PageContext.Provider>
          </TokenContext.Provider>
        </AlertErrorContext.Provider>
      </SnackbarContext.Provider>
    </MemoryRouter>
  );
};

test('Login Status: Logo is present and clicking can direct to land screen (/)', () => {
  const { getByAltText } = renderComponent(<AppLgTopBar />, logIn, page1);
  const logo = getByAltText('Airbnb Logo');
  expect(logo).toBeInTheDocument();
  fireEvent.click(logo);
  expect(mockNavigate).toHaveBeenCalledWith('/');
});

test('LogOut Status:  Logo is present and clicking can direct to land screen (/)', () => {
  const { getByAltText } = renderComponent(<AppLgTopBar />, logOut, page1);
  const logo = getByAltText('Airbnb Logo');
  expect(logo).toBeInTheDocument();
  fireEvent.click(logo);
  expect(mockNavigate).toHaveBeenCalledWith('/');
});

test('LogIn Status: check goto Hosting Page Button text is * Switch to hosting * and clickable', () => {
  renderComponent(<AppLgTopBar />, logIn, page1);
  const boxText = screen.getByText('Switch to hosting');
  expect(boxText).toBeInTheDocument();
  fireEvent.click(boxText);
  expect(mockNavigate).toHaveBeenCalledWith('/myHosting');

  const boxText2 = screen.queryByText('Airbnb your home');
  expect(boxText2).not.toBeInTheDocument();
});

test('LogOut Status: check goto Hosting Page Button text is * Airbnb your home * and clickable', () => {
  renderComponent(<AppLgTopBar />, logOut, page1);
  const boxText = screen.getByText('Airbnb your home');
  expect(boxText).toBeInTheDocument();
  fireEvent.click(boxText);
  expect(mockNavigate).toHaveBeenCalledWith('/myHosting');

  const boxText2 = screen.queryByText('Switch to hosting');
  expect(boxText2).not.toBeInTheDocument();
});

test('LogIn Status: click userButton and check Popover pop', () => {
  renderComponent(<AppLgTopBar />, logIn, page1);
  const landingPageBox = screen.queryByTestId('landing-page');
  expect(landingPageBox).toBeInTheDocument();
  if (landingPageBox) {
    fireEvent.click(landingPageBox);
    expect(mockNavigate).toHaveBeenCalledWith('/');
  }
});

test('LogOut Status: check Go to landing page Button exists and clickable', () => {
  renderComponent(<AppLgTopBar />, logOut, page1);
  const landingPageBox = screen.queryByTestId('landing-page');
  expect(landingPageBox).toBeInTheDocument();
  if (landingPageBox) {
    fireEvent.click(landingPageBox);
    expect(mockNavigate).toHaveBeenCalledWith('/');
  }
});

test('LogIn Status: profile button exists and email first letter will show in avatar', () => {
  renderComponent(<AppLgTopBar />, logIn, page1);
  expect(screen.queryByTestId('profile-button')).toBeInTheDocument();
  expect(screen.getByText((logIn.email as string)[0]?.toUpperCase() as string)).toBeInTheDocument();
  expect(screen.queryByTestId('logout-button')).toBeInTheDocument();
  expect(screen.queryByTestId('login-button')).not.toBeInTheDocument();
  expect(screen.queryByTestId('person-icon')).not.toBeInTheDocument();
  expect(screen.queryByText('Log in')).not.toBeInTheDocument();
  expect(screen.queryByText('Sign up')).not.toBeInTheDocument();
  expect(screen.queryByTestId('login-popover')).not.toBeInTheDocument();
});

test('LogOut Status: profile button exists and only show a mui Person icon', () => {
  renderComponent(<AppLgTopBar />, logOut, page1);
  expect(screen.queryByTestId('profile-button')).toBeInTheDocument();
  expect(screen.queryByTestId('login-button')).toBeInTheDocument();
  expect(screen.queryByTestId('logout-button')).not.toBeInTheDocument();
  expect(screen.queryByTestId('person-icon')).toBeInTheDocument();
  expect(screen.queryByText('Log in')).not.toBeInTheDocument();
  expect(screen.queryByText('Sign up')).not.toBeInTheDocument();
  expect(screen.queryByTestId('login-popover')).not.toBeInTheDocument();
});

test('LogIn Status: Click Button, token and email will be null and direct to /', async () => {
  (newRequests as jest.Mock).mockResolvedValue({});
  (logIn.setToken as jest.Mock).mockImplementation(() => null);
  (logIn.setEmail as jest.Mock).mockImplementation(() => null);
  renderComponent(<AppLgTopBar />, logIn, page1);
  const profileButton = screen.queryByTestId('profile-button');
  fireEvent.click(profileButton as HTMLElement);

  await waitFor(() => {
    expect(mockNavigate).toHaveBeenCalledWith('/');
    expect(logIn.setToken).toHaveBeenCalledWith(null);
    expect(logIn.setEmail).toHaveBeenCalledWith(null);
    expect(snackbar.showSnackbar).toHaveBeenCalledWith('Logout Success', 'success');
    expect(alertError.showAlertError).not.toHaveBeenCalledWith('Logout Error', 'Invalid Token');
  });
});

test('LogIn Status: click logout button return error', async () => {
  (newRequests as jest.Mock).mockRejectedValue({ error: 'Invalid Token' });
  (logIn.setToken as jest.Mock).mockImplementation(() => null);
  (logIn.setEmail as jest.Mock).mockImplementation(() => null);
  renderComponent(<AppLgTopBar />, logIn, page1);
  const profileButton = screen.queryByTestId('profile-button');
  fireEvent.click(profileButton as HTMLElement);

  await waitFor(() => {
    expect(alertError.showAlertError).toHaveBeenCalledWith('Logout Error', 'Invalid Token');
    expect(logIn.setToken).not.toHaveBeenCalledWith(null);
    expect(logIn.setEmail).not.toHaveBeenCalledWith(null);
    expect(mockNavigate).not.toHaveBeenCalledWith('/');
    expect(snackbar.showSnackbar).not.toHaveBeenCalledWith('Logout Success', 'success');
  });
});

test('LogOut Status: click profile show popover', () => {
  renderComponent(<AppLgTopBar />, logOut, page1);
  const profileButton = screen.queryByTestId('profile-button');
  expect(screen.queryByText('Log in')).not.toBeInTheDocument();
  expect(screen.queryByText('Sign up')).not.toBeInTheDocument();
  expect(screen.queryByTestId('login-popover')).not.toBeInTheDocument();
  fireEvent.click(profileButton as HTMLElement);
  expect(screen.queryByTestId('login-popover')).toBeInTheDocument();
  expect(screen.getByText('Log in')).toBeInTheDocument();
  expect(screen.getByText('Sign up')).toBeInTheDocument();
});

test('LogOut Status: click profile show popover, and click login', () => {
  renderComponent(<AppLgTopBar />, logOut, page1);
  const profileButton = screen.queryByTestId('profile-button');
  fireEvent.click(profileButton as HTMLElement);
  const loginButton = screen.getByText('Log in');
  fireEvent.click(loginButton);
  expect(mockNavigate).toHaveBeenCalledWith('/login');
});

test('LogOut Status: click profile show popover, and click signup', () => {
  renderComponent(<AppLgTopBar />, logOut, page1);
  const profileButton = screen.queryByTestId('profile-button');
  fireEvent.click(profileButton as HTMLElement);
  const loginButton = screen.getByText('Sign up');
  fireEvent.click(loginButton);
  expect(mockNavigate).toHaveBeenCalledWith('/register');
});

test('Page 0: In landing screen, show search and filter (log in status)', () => {
  renderComponent(<AppLgTopBar />, logIn, page0);
  expect(screen.getByText('Search')).toBeInTheDocument();
  expect(screen.getByText('Filter')).toBeInTheDocument();
});

test('Page 0: In landing screen, show search and filter (log out status)', () => {
  renderComponent(<AppLgTopBar />, logOut, page0);
  expect(screen.getByText('Search')).toBeInTheDocument();
  expect(screen.getByText('Filter')).toBeInTheDocument();
});

test('Page 1: In landing screen, not show search and filter', () => {
  renderComponent(<AppLgTopBar />, logOut, page1);
  expect(screen.queryByText('Search')).not.toBeInTheDocument();
  expect(screen.queryByText('Filter')).not.toBeInTheDocument();
});

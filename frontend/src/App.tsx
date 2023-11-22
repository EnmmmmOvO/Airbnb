import React, { useEffect, useState } from 'react';
import {
  TokenContext,
  WindowSizeContext,
  PageContext,
  HostedIdContext,
  CurrentContext, FilterDateContext
} from './context';
import SnackBarProvider from './components/snackBarProvider';
import AlertErrorProvider from './components/alertErrorProvider';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import LandPage from './screens/landPage';
import CssBaseline from '@mui/material/CssBaseline';
import LoginPage from './screens/loginPage';
import RegisterPage from './screens/registerPage';
import { windowSizeTypes } from './interfaces/interface';
import MyHostingPage from './screens/myHostingPage';
import CreateHostingPage from './screens/createHostingPage';
import EditHostingPage from './screens/editHostingPage';
import { ThemeProvider } from '@mui/material';
import theme from './themes/theme';
import ListingPage from './screens/listingPage'
import BookingPage from './screens/bookingPage';

const App: React.FC = () => {
  const [token, setToken] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [page, setPage] = useState<number>(0);
  const [current, setCurrent] = useState<number[]>([]);
  const [windowSize, setWindowSize] = useState<windowSizeTypes>({
    width: 0,
    height: 0
  });
  const [id, setHostId] = useState<number | null>(null);
  const [time, setTime] = useState<string[] | null>(null);

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight
      });
    }
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <ThemeProvider theme={theme}>
    <WindowSizeContext.Provider value={windowSize}>
      <TokenContext.Provider value={{ token, email, setToken, setEmail }}>
        <PageContext.Provider value={{ page, setPage }}>
          <FilterDateContext.Provider value={{ time, setTime }}>
            <HostedIdContext.Provider value={{ id, setHostId }}>
              <CurrentContext.Provider value={{ current, setCurrent }}>
                <CssBaseline />
                <AlertErrorProvider>
                  <SnackBarProvider>
                    <BrowserRouter>
                      <Routes>
                        <Route path="/login" element={<LoginPage />} />
                        <Route path="/register" element={<RegisterPage />} />
                        <Route path="/" element={<LandPage />} />
                        <Route path="/listing/:ListingId" element={<ListingPage />} />
                        { token
                          ? <>
                            <Route path="/myHosting" element={<MyHostingPage />} />
                            <Route path="/createHosting" element={<CreateHostingPage />} />
                            <Route path="/hosting/:HostedId" element={<EditHostingPage />} />
                            <Route path="/listing/:ListingId" element={<ListingPage />} />
                            <Route path="/booking/:ListingId" element={<BookingPage />} />
                          </>
                          : <Route path="/*" element={<LoginPage />} />
                        }
                      </Routes>
                    </BrowserRouter>
                  </SnackBarProvider>
                </AlertErrorProvider>
              </CurrentContext.Provider>
            </HostedIdContext.Provider>
          </FilterDateContext.Provider>
        </PageContext.Provider>
      </TokenContext.Provider>
    </WindowSizeContext.Provider>
    </ThemeProvider>
  );
};

export default App;

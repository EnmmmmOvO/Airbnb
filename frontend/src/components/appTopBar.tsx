import React from 'react';
import { useWindowSizeContext } from '../context';
import AppLgTopBar from './appLgTopBar';
import AppMobileBar from './appMobileBar';

type AppTopBarProps = {
  children?: React.ReactNode;
}

// Check the width of the window, if it is larger than 743px, use AppLgTopBar, otherwise use AppMobileBar
const AppTopBar: React.FC<AppTopBarProps> = ({ children }) => {
  const { width } = useWindowSizeContext();

  return (width > 743 ? <AppLgTopBar>{children}</AppLgTopBar> : <AppMobileBar>{children}</AppMobileBar>)
}

export default AppTopBar;

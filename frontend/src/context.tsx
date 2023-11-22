import { createContext, useContext } from 'react';
import {
  tokenTypes,
  windowSizeTypes,
  pageTypes,
  hostTypes,
  publishListingTypes,
  currentListingTypes,
  normalOrderTypes,
  filterDateTypes,
  alertErrorTypes,
  customerSnackbarTypes
} from './interfaces/interface';

// Token context: Record Email and Token
export const TokenContext = createContext<tokenTypes>({
  token: null,
  email: null,
  setToken: () => {
    if (process.env.NODE_ENV === 'development') {
      console.warn('setToken function not implemented');
    }
  },
  setEmail: () => {
    if (process.env.NODE_ENV === 'development') {
      console.warn('setEmail function not implemented');
    }
  }
});

export const useTokenContext = () => {
  const { token, email, setToken, setEmail } = useContext(TokenContext);
  return { token, email, setToken, setEmail };
};

// Snackbar context: Record Snackbar message, status, and control open/close
export const SnackbarContext = createContext<customerSnackbarTypes>({
  message: '',
  open: false,
  status: 'info',
  showSnackbar: () => {
    if (process.env.NODE_ENV === 'development') {
      console.warn('showSnackbar function not implemented');
    }
  },
  closeSnackbar: () => {
    if (process.env.NODE_ENV === 'development') {
      console.warn('closeSnackbar function not implemented');
    }
  }
});

export const useSnackbarContext = () => {
  const { message, open, status, showSnackbar, closeSnackbar } = useContext(SnackbarContext);
  return { message, open, status, showSnackbar, closeSnackbar };
};

// Alert Error context: Record Alert Error message, title, and control open/close
export const AlertErrorContext = createContext<alertErrorTypes>({
  title: '',
  message: '',
  showAlertError: () => {
    if (process.env.NODE_ENV === 'development') {
      console.warn('throwAlertError function not implemented');
    }
  },
  closeAlertError: () => {
    if (process.env.NODE_ENV === 'development') {
      console.warn('closeAlertError function not implemented');
    }
  }
});

export const useAlertErrorContext = () => {
  const { title, message, showAlertError, closeAlertError } = useContext(AlertErrorContext);
  return { title, message, showAlertError, closeAlertError };
};

// Window size context: Record width and height changing
export const WindowSizeContext = createContext<windowSizeTypes>({
  width: 0,
  height: 0
});

export const useWindowSizeContext = () => {
  const { width, height } = useContext(WindowSizeContext);
  return { width, height };
};

// Page context: Record current page, for top bar show search and filter or not
export const PageContext = createContext<pageTypes>({
  page: 0,
  setPage: () => {
    if (process.env.NODE_ENV === 'development') {
      console.warn('setPage function not implemented');
    }
  }
});

export const usePageContext = () => {
  const { page, setPage } = useContext(PageContext);
  return { page, setPage };
}

// Hosted Id context: Record current host id, for edit hosting
export const HostedIdContext = createContext<hostTypes>({
  id: null,
  setHostId: () => {
    if (process.env.NODE_ENV === 'development') {
      console.warn('setHostId function not implemented');
    }
  }
});

export const useHostedIdContext = () => {
  const { id, setHostId } = useContext(HostedIdContext);
  return { id, setHostId };
}

// Published context: Record published and unpublished, current list in my hosting page
export const PublishedContext = createContext<publishListingTypes>({
  published: [],
  unpublished: [],
  currentList: [],
  setPublished: () => {
    if (process.env.NODE_ENV === 'development') {
      console.warn('setPublished function not implemented');
    }
  },
  setUnpublished: () => {
    if (process.env.NODE_ENV === 'development') {
      console.warn('setUnpublished function not implemented');
    }
  },
  setCurrentList: () => {
    if (process.env.NODE_ENV === 'development') {
      console.warn('setCurrentList function not implemented');
    }
  }
});

export const usePublishedContext = () => {
  const {
    published,
    unpublished,
    currentList,
    setPublished,
    setUnpublished,
    setCurrentList
  } = useContext(PublishedContext);
  return {
    published,
    unpublished,
    currentList,
    setPublished,
    setUnpublished,
    setCurrentList
  };
}

// Current context: Record the hosting which edit or create in this session
export const CurrentContext = createContext<currentListingTypes>({
  current: [],
  setCurrent: () => {
    if (process.env.NODE_ENV === 'development') {
      console.warn('setCurrent function not implemented');
    }
  }
});

export const useCurrentContext = () => {
  const { current, setCurrent } = useContext(CurrentContext);
  return { current, setCurrent };
}

// Dialog Date context: Provide the id if published hosting to publish after select date
interface dialogDateContext {
  id: number | null;
  selectDate: (id: number) => void;
}

export const DialogDateContext = createContext<dialogDateContext>({
  id: null,
  selectDate: () => {
    if (process.env.NODE_ENV === 'development') {
      console.warn('selectDate function not implemented');
    }
  }
});

export const useDialogDateContext = () => {
  const { id, selectDate } = useContext(DialogDateContext);
  return { id, selectDate };
}

// Normal Order context: Normal record the the key and value of published listing, the order record the order of
// the key for search and filter
export const NormalOrderContext = createContext<normalOrderTypes>({
  normal: {},
  order: [],
  setOrder: () => {
    if (process.env.NODE_ENV === 'development') {
      console.warn('setOrder function not implemented');
    }
  },
  setNormal: () => {
    if (process.env.NODE_ENV === 'development') {
      console.warn('setOrder function not implemented');
    }
  }
});

export const useNormalOrderContext = () => {
  const { normal, order, setOrder, setNormal } = useContext(NormalOrderContext);
  return { normal, order, setOrder, setNormal };
}

// Filter Date context: If filter by date, record the date and set date in booking page
export const FilterDateContext = createContext<filterDateTypes>({
  time: null,
  setTime: () => {
    if (process.env.NODE_ENV === 'development') {
      console.warn('setTime function not implemented');
    }
  }
})

export const useFilterDateContext = () => {
  const { time, setTime } = useContext(FilterDateContext);
  return { time, setTime };
}

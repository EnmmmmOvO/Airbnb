import React from 'react';
import { Moment } from 'moment';
import { SnackbarStatus } from '../types/types';

// Define the types of the variables for the whole project
export interface loginRegisterTextFieldErrorTypes {
  error: boolean;
  display: boolean;
  message: string;
}

export interface tokenTypes {
  email: string | null;
  token: string | null;
  setToken: (token: string | null) => void;
  setEmail: (email: string | null) => void;
}

export interface windowSizeTypes {
  width: number;
  height: number;
}

export interface childrenTypes {
  children?: React.ReactNode;
}

export interface pageTypes {
  page: number;
  setPage: (page: number) => void;
}

export interface bedroomsTypes {
  id: string;
  numOfBeds: number;
  bedType: number;
}

export interface amenitiesTypes {
  id: string;
  detail: string;
}

export interface picturesTypes {
  id: string;
  url: string;
  blob: Blob | null;
}

export interface hostTypes {
  id: number | null;
  setHostId: (id: number | null) => void;
}

export interface RequestBody {
  [key: string]: string | number | boolean | null | RequestBody | number[][] | number[] | string[] | RequestBody[];
}

export interface listingBoxTypes {
  id: number;
  published: boolean;
  title: string;
  type: number;
  bed: number;
  bathroom: number;
  thumbnail: string;
  svg: number;
  comment: number;
  price: number;
}

export interface publishListingTypes {
  published: listingBoxTypes[];
  unpublished: listingBoxTypes[];
  currentList: listingBoxTypes[];
  setPublished: React.Dispatch<React.SetStateAction<listingBoxTypes[]>>;
  setUnpublished: React.Dispatch<React.SetStateAction<listingBoxTypes[]>>;
  setCurrentList: React.Dispatch<React.SetStateAction<listingBoxTypes[]>>;
}

export interface customerSnackbarTypes {
  message: string;
  open: boolean;
  status: SnackbarStatus;
  showSnackbar: (message: string, status: SnackbarStatus) => void;
  closeSnackbar: () => void;
}

export interface alertErrorTypes {
  title: string;
  message: string;
  showAlertError: (title: string, message: string) => void;
  closeAlertError: () => void;
}

export interface currentListingTypes {
  current: number[];
  setCurrent: React.Dispatch<React.SetStateAction<number[]>>;
}

export interface listingDetailTypes {
  id: string;
  title: string;
  address: string;
  amenities: string[];
  bedroom: number[][];
  bathroom: number;
  type: number;
  price: number;
  owner: string;
  postedOn: string;
}

export interface myBookingListTypes {
  id: number;
  start: string;
  end: string;
  status: string;
}

export interface bookingDetailTypes {
  id: number;
  start: string;
  end: string;
  owner: string;
  price: number;
}

export interface listingFilterTypes {
  id: number;
  address: string;
  published: boolean;
  title: string;
  type: number;
  bed: number;
  bathroom: number;
  thumbnail: string;
  svg: number;
  comment: number;
  price: number;
  dateRange: {
    start: Moment;
    end: Moment;
  }[];
  history: boolean;
}

export interface normalOrderTypes {
  normal: {[key: string]: listingFilterTypes};
  order: number[];
  setOrder: React.Dispatch<React.SetStateAction<number[]>>;
  setNormal: React.Dispatch<React.SetStateAction<{[key: string]: listingFilterTypes}>>;
}

export interface filterDateTypes {
  time: string[] | null;
  setTime: React.Dispatch<React.SetStateAction<string[] | null>>;
}

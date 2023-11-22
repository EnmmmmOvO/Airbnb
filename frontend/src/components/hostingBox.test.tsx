import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import HostingBox from './hostingBox';
import {
  alertErrorTypes,
  currentListingTypes,
  customerSnackbarTypes,
  listingBoxTypes,
  publishListingTypes
} from '../interfaces/interface';
import React from 'react';
import { newRequests, formatNumber } from '../helper';
import { propertyType } from '../types/types';
import { CurrentContext, PublishedContext, SnackbarContext, AlertErrorContext, DialogDateContext } from '../context';

const mockNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

jest.mock('../helper', () => ({
  ...jest.requireActual('../helper'),
  newRequests: jest.fn(),
  formatNumber: jest.fn(),
}));

let propsPublished: listingBoxTypes = {
  id: 12345678,
  published: true,
  title: 'mockTitle',
  type: 0,
  bed: 10,
  bathroom: 6,
  thumbnail: 'mockThumbnail',
  svg: 4.5,
  comment: 123,
  price: 1000,
}

let propsUnPublished: listingBoxTypes = {
  id: 87654321,
  published: false,
  title: 'mockTitle222',
  type: 7,
  bed: 3,
  bathroom: 1,
  thumbnail: 'mockThumbnail2',
  svg: 3,
  comment: 1,
  price: 1000000,
}

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

const publish: publishListingTypes = {
  published: [],
  unpublished: [],
  currentList: [],
  setPublished: jest.fn(),
  setUnpublished: jest.fn(),
  setCurrentList: jest.fn()
}

const current : currentListingTypes = {
  current: [12345678],
  setCurrent: jest.fn()
}

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

const dateSelect = {
  id: null,
  selectDate: jest.fn()
}

afterEach(() => {
  propsPublished = {
    id: 12345678,
    published: true,
    title: 'mockTitle',
    type: 0,
    bed: 10,
    bathroom: 6,
    thumbnail: 'mockThumbnail',
    svg: 4.5,
    comment: 123,
    price: 1000,
  };
  propsUnPublished = {
    id: 87654321,
    published: false,
    title: 'mockTitle222',
    type: 7,
    bed: 3,
    bathroom: 1,
    thumbnail: 'mockThumbnail2',
    svg: 3,
    comment: 1,
    price: 1000000,
  };
  publish.published = [] as listingBoxTypes[];
  publish.unpublished = [] as listingBoxTypes[];
  publish.currentList = [] as listingBoxTypes[];
  current.current = [12345678];
  jest.resetAllMocks();
});

const renderComponent = (props: listingBoxTypes, current: currentListingTypes, publish: publishListingTypes) => {
  return render(
    <DialogDateContext.Provider value={ dateSelect }>
      <SnackbarContext.Provider value={ snackbar }>
        <AlertErrorContext.Provider value={ alertError }>
          <CurrentContext.Provider value={ current }>
            <PublishedContext.Provider value={ publish }>
              <HostingBox data={props} />
            </PublishedContext.Provider>
          </CurrentContext.Provider>
        </AlertErrorContext.Provider>
      </SnackbarContext.Provider>
    </DialogDateContext.Provider>
  );
}

test('HostingBox component, Test Basic Information', async () => {
  (formatNumber as jest.Mock).mockReturnValue('1,000');
  renderComponent(propsPublished, current, publish);
  expect(screen.queryByText('mockTitle')).toBeInTheDocument();
  expect(screen.queryByText('4.5 (123)')).toBeInTheDocument();
  expect(screen.queryByText(propertyType[0] as string)).toBeInTheDocument();
  expect(screen.queryByText('> 5')).toBeInTheDocument();
  expect(screen.queryByText('10')).toBeInTheDocument();
  expect(screen.queryByText('$1,000 AUD')).toBeInTheDocument();
});

test('HostingBox component, Test Basic Information 2', async () => {
  (formatNumber as jest.Mock).mockReturnValue('1,000,000');
  renderComponent(propsUnPublished, current, publish);
  expect(screen.queryByText('mockTitle222')).toBeInTheDocument();
  expect(screen.queryByText('3.0 (1)')).toBeInTheDocument();
  expect(screen.queryByText(propertyType[7] as string)).toBeInTheDocument();
  expect(screen.queryByText('1')).toBeInTheDocument();
  expect(screen.queryByText('3')).toBeInTheDocument();
  expect(screen.queryByText('$1,000,000 AUD')).toBeInTheDocument();
});

test('UnPublished: Test Button Exists', async () => {
  renderComponent(propsUnPublished, current, publish);
  expect(screen.queryByTestId('delete-button')).toBeInTheDocument();
  expect(screen.queryByTestId('publish-button')).toBeInTheDocument();
  expect(screen.queryByTestId('unpublish-button')).not.toBeInTheDocument();
  expect(screen.queryByTestId('edit-button')).toBeInTheDocument();
});

test('Published: Test Button Exists', async () => {
  renderComponent(propsUnPublished, current, publish);
  expect(screen.queryByTestId('delete-button')).toBeInTheDocument();
  expect(screen.queryByTestId('publish-button')).toBeInTheDocument();
  expect(screen.queryByTestId('unpublish-button')).not.toBeInTheDocument();
  expect(screen.queryByTestId('edit-button')).toBeInTheDocument();
});

test('UnPublished: Button Click', async () => {
  renderComponent(propsUnPublished, current, publish);
  expect(screen.queryByTestId('delete-button')).toBeInTheDocument();
  expect(screen.queryByTestId('publish-button')).toBeInTheDocument();
  expect(screen.queryByTestId('unpublish-button')).not.toBeInTheDocument();
  expect(screen.queryByTestId('edit-button')).toBeInTheDocument();
});

test('Published: Test delete Button Click (in current)', async () => {
  (newRequests as jest.Mock).mockResolvedValue({});
  renderComponent(propsUnPublished, {
    current: [87654321],
    setCurrent: jest.fn()
  }, publish);
  const deleteButton = screen.getByTestId('delete-button');
  fireEvent.click(deleteButton);
  await waitFor(() => {
    expect(publish.setCurrentList).toHaveBeenCalled();
    expect(publish.setPublished).not.toHaveBeenCalled();
    expect(publish.setUnpublished).not.toHaveBeenCalled();
    expect(snackbar.showSnackbar).toHaveBeenCalledWith('Delete Success', 'success');
  })
});

test('Published: Test delete Button Click (not in current)', async () => {
  (newRequests as jest.Mock).mockResolvedValue({});
  renderComponent(propsPublished, {
    current: [],
    setCurrent: jest.fn()
  }, publish);
  const deleteButton = screen.getByTestId('delete-button');
  fireEvent.click(deleteButton);
  await waitFor(() => {
    expect(publish.setPublished).toHaveBeenCalled();
    expect(publish.setCurrentList).not.toHaveBeenCalled();
    expect(publish.setUnpublished).not.toHaveBeenCalled();
    expect(snackbar.showSnackbar).toHaveBeenCalledWith('Delete Success', 'success');
  })
});

test('UnPublished: Test delete Button Click (not in current)', async () => {
  (newRequests as jest.Mock).mockResolvedValue({});
  renderComponent(propsUnPublished, current, publish);
  const deleteButton = screen.getByTestId('delete-button');
  fireEvent.click(deleteButton);
  await waitFor(() => {
    expect(publish.setUnpublished).toHaveBeenCalled();
    expect(publish.setCurrentList).not.toHaveBeenCalled();
    expect(publish.setPublished).not.toHaveBeenCalled();
    expect(snackbar.showSnackbar).toHaveBeenCalledWith('Delete Success', 'success');
  })
});

test('UnPublished: Test delete Button Click (in current)', async () => {
  (newRequests as jest.Mock).mockResolvedValue({});
  renderComponent(propsUnPublished, {
    current: [87654321],
    setCurrent: jest.fn()
  }, publish);
  const deleteButton = screen.getByTestId('delete-button');
  fireEvent.click(deleteButton);
  await waitFor(() => {
    expect(publish.setCurrentList).toHaveBeenCalled();
    expect(publish.setPublished).not.toHaveBeenCalled();
    expect(publish.setUnpublished).not.toHaveBeenCalled();
    expect(snackbar.showSnackbar).toHaveBeenCalledWith('Delete Success', 'success');
  })
});

test('Test delete Button Click throw error', async () => {
  (newRequests as jest.Mock).mockRejectedValue({ error: 'Invalid input' })
  renderComponent(propsUnPublished, current, publish);
  const deleteButton = screen.getByTestId('delete-button');
  fireEvent.click(deleteButton);
  await waitFor(() => {
    expect(alertError.showAlertError).toHaveBeenCalledWith('Delete Hosting Error', 'Invalid input');
  })
});

test('Published: Test unpublish Button Click (in current)', async () => {
  (newRequests as jest.Mock).mockResolvedValue({});
  const temp = {
    ...publish,
    currentList: [propsPublished],
  }
  renderComponent(propsPublished, current, temp);
  const unpublishButton = screen.getByTestId('unpublish-button');
  fireEvent.click(unpublishButton);
  await waitFor(() => {
    expect(temp.setCurrentList).toHaveBeenCalled();
    expect(temp.setPublished).not.toHaveBeenCalled();
    expect(temp.setUnpublished).not.toHaveBeenCalled();
    expect(snackbar.showSnackbar).toHaveBeenCalledWith('Unpublish Success', 'success');
  })
});

test('Published: Test unpublish Button Click (not in current)', async () => {
  (newRequests as jest.Mock).mockResolvedValue({});
  const temp = {
    ...publish,
    published: [propsPublished],
  }
  renderComponent(propsPublished, {
    current: [],
    setCurrent: jest.fn()
  }, temp);
  const unpublishButton = screen.getByTestId('unpublish-button');
  fireEvent.click(unpublishButton);
  await waitFor(() => {
    expect(temp.setCurrentList).not.toHaveBeenCalled();
    expect(temp.setPublished).toHaveBeenCalled();
    expect(temp.setUnpublished).toHaveBeenCalled();
    expect(snackbar.showSnackbar).toHaveBeenCalledWith('Unpublish Success', 'success');
  })
});

test('Test unpublished Button Click throw error', async () => {
  (newRequests as jest.Mock).mockRejectedValue({ error: 'Invalid input' })
  const temp = {
    ...publish,
    published: [propsPublished],
  }
  renderComponent(propsPublished, {
    current: [],
    setCurrent: jest.fn()
  }, temp);
  const unpublishButton = screen.getByTestId('unpublish-button');
  fireEvent.click(unpublishButton);
  await waitFor(() => {
    expect(alertError.showAlertError).toHaveBeenCalledWith('Unpublish Hosting Error', 'Invalid input');
  })
});

test('Test edit Button Click 1', async () => {
  renderComponent(propsPublished, current, publish);
  const editButton = screen.getByTestId('edit-button');
  fireEvent.click(editButton);
  expect(mockNavigate).toHaveBeenCalledWith(`/hosting/${propsPublished.id}`);
});

test('Test edit Button Click 2', async () => {
  renderComponent(propsUnPublished, current, publish);
  const editButton = screen.getByTestId('edit-button');
  fireEvent.click(editButton);
  expect(mockNavigate).toHaveBeenCalledWith(`/hosting/${propsUnPublished.id}`);
});

test('Test click component body 1 thumbnail', async () => {
  renderComponent(propsUnPublished, current, publish);
  const button = screen.getByTestId('body-thumbnail');
  fireEvent.click(button);
  expect(mockNavigate).toHaveBeenCalledWith(`/booking/${propsUnPublished.id}`);
});

test('Test click component body 1 text', async () => {
  renderComponent(propsUnPublished, current, publish);
  const button = screen.getByTestId('body-text');
  fireEvent.click(button);
  expect(mockNavigate).toHaveBeenCalledWith(`/booking/${propsUnPublished.id}`);
});

test('Test click component body 2 thumbnail', async () => {
  renderComponent(propsPublished, current, publish);
  const button = screen.getByTestId('body-thumbnail');
  fireEvent.click(button);
  expect(mockNavigate).toHaveBeenCalledWith(`/booking/${propsPublished.id}`);
});

test('Test click component body 2 thumbnail', async () => {
  renderComponent(propsPublished, current, publish);
  const button = screen.getByTestId('body-text');
  fireEvent.click(button);
  expect(mockNavigate).toHaveBeenCalledWith(`/booking/${propsPublished.id}`);
});

test('UnPublished: Test publish Button Click', async () => {
  renderComponent(propsUnPublished, current, publish);
  const publishButton = screen.getByTestId('publish-button');
  fireEvent.click(publishButton);
  expect(dateSelect.selectDate).toHaveBeenCalledWith(propsUnPublished.id);
});

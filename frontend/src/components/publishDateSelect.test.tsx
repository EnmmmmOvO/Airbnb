import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import DynamicDatePickers from './publishDateSelect';
import { AlertErrorContext, CurrentContext, DialogDateContext, PublishedContext, SnackbarContext } from '../context';
import userEvent from '@testing-library/user-event';
import {
  alertErrorTypes,
  currentListingTypes,
  customerSnackbarTypes,
  listingBoxTypes,
  publishListingTypes
} from '../interfaces/interface';
import { newRequests } from '../helper';

const MockChildComponent = () => {
  const { selectDate } = React.useContext(DialogDateContext);
  return (
    <div>
      <button onClick={() => selectDate(1)}>Select Date</button>
    </div>
  );
};

const alertError: alertErrorTypes = {
  showAlertError: jest.fn(), closeAlertError: jest.fn(), title: '', message: ''
}

jest.mock('../helper', () => ({
  newRequests: jest.fn(),
}));

const user: listingBoxTypes = {
  id: 1,
  published: false,
  title: 'mockTitle',
  type: 0,
  bed: 0,
  bathroom: 0,
  thumbnail: '',
  svg: 0,
  comment: 0,
  price: 0,
}

beforeEach(() => {
  jest.clearAllMocks();
})

const publish: publishListingTypes = {
  published: [],
  unpublished: [],
  currentList: [],
  setPublished: jest.fn(),
  setUnpublished: jest.fn(),
  setCurrentList: jest.fn()
}

const current :currentListingTypes = {
  current: [],
  setCurrent: jest.fn()
}

const snackbar: customerSnackbarTypes = {
  message: '',
  open: false,
  status: 'info',
  showSnackbar: jest.fn(),
  closeSnackbar: jest.fn()
}

const renderComponent = (publish: publishListingTypes, current: currentListingTypes) => {
  render(
    <SnackbarContext.Provider value={ snackbar } >
      <CurrentContext.Provider value={ current }>
        <PublishedContext.Provider value={ publish }>
          <AlertErrorContext.Provider value={ alertError }>
            <DynamicDatePickers>
              <MockChildComponent />
            </DynamicDatePickers>
          </AlertErrorContext.Provider>
        </PublishedContext.Provider>
      </CurrentContext.Provider>
    </SnackbarContext.Provider>
  );
}

test('DynamicDatePickers start', () => {
  renderComponent(publish, current);
  fireEvent.click(screen.getByText('Select Date'));
  expect(screen.getByText('Publish Date Selector')).toBeInTheDocument();
  expect(screen.getByText('Add an available Date')).toBeInTheDocument();
  expect(screen.getByText('Cancel')).toBeInTheDocument();
  expect(screen.getByText('Publish')).toBeInTheDocument();
  expect(screen.getByText('Range 1')).toBeInTheDocument();
});

test('DynamicDatePickers close', () => {
  renderComponent(publish, current);
  fireEvent.click(screen.getByText('Select Date'));
  const endDateInput = screen.getByTestId('end-date0').querySelector('input');
  const startDateInput = screen.getByTestId('start-date0').querySelector('input');
  expect(endDateInput).toBeInTheDocument();
  expect(startDateInput).toBeInTheDocument();
  expect(endDateInput).toHaveValue('');
  expect(startDateInput).toHaveValue('');
  userEvent.type(startDateInput as HTMLElement, '2021-10-01');
  userEvent.type(endDateInput as HTMLElement, '2021-10-02');
  expect(startDateInput).toHaveValue('2021-10-01');
  expect(endDateInput).toHaveValue('2021-10-02');
});

test('Click Add a date range', () => {
  renderComponent(publish, current);
  fireEvent.click(screen.getByText('Select Date'));
  expect(screen.getByText('Range 1')).toBeInTheDocument();
  expect(screen.queryByText('Range 2')).not.toBeInTheDocument();
  fireEvent.click(screen.getByText('Add an available Date'));
  expect(screen.getByText('Range 2')).toBeInTheDocument();
  expect(screen.getByTestId('end-date1').querySelector('input')).toHaveValue('');
  expect(screen.getByTestId('start-date1').querySelector('input')).toHaveValue('');
});

test('Click Publish with empty textarea', () => {
  renderComponent(publish, current);
  fireEvent.click(screen.getByText('Select Date'));
  fireEvent.click(screen.getByText('Publish'));
  expect(alertError.showAlertError).toHaveBeenCalledWith('Publish Error', 'Please fill all the date')
});

test('Click Publish with same date', () => {
  renderComponent(publish, current);
  fireEvent.click(screen.getByText('Select Date'));
  const endDateInput = screen.getByTestId('end-date0').querySelector('input');
  const startDateInput = screen.getByTestId('start-date0').querySelector('input');
  userEvent.type(startDateInput as HTMLElement, '2021-10-01');
  userEvent.type(endDateInput as HTMLElement, '2021-10-01');
  fireEvent.click(screen.getByText('Publish'));
  expect(alertError.showAlertError).toHaveBeenCalledWith('Publish Error',
    'Start date cannot be same or after end date')
});

test('Click Publish with start date before end date', () => {
  renderComponent(publish, current);
  fireEvent.click(screen.getByText('Select Date'));
  const endDateInput = screen.getByTestId('end-date0').querySelector('input');
  const startDateInput = screen.getByTestId('start-date0').querySelector('input');
  userEvent.type(startDateInput as HTMLElement, '2021-10-01');
  userEvent.type(endDateInput as HTMLElement, '2020-10-01');
  fireEvent.click(screen.getByText('Publish'));
  expect(alertError.showAlertError).toHaveBeenCalledWith('Publish Error',
    'Start date cannot be same or after end date')
});

test('Click Publish with one date range, (in current)', async () => {
  (newRequests as jest.Mock).mockResolvedValue({});
  const tempPublish = { ...publish, currentList: [user] }
  renderComponent(tempPublish, {
    current: [1],
    setCurrent: jest.fn()
  });
  fireEvent.click(screen.getByText('Select Date'));
  const startDateInput = screen.getByTestId('start-date0').querySelector('input');
  const endDateInput = screen.getByTestId('end-date0').querySelector('input');
  userEvent.type(startDateInput as HTMLElement, '2023-12-01');
  userEvent.type(endDateInput as HTMLElement, '2023-12-30');
  fireEvent.click(screen.getByText('Publish'));

  await waitFor(() => {
    expect(newRequests).toHaveBeenCalledWith('/listings/publish/1', 'PUT', {
      availability: [{
        start: '2023-12-01',
        end: '2023-12-30'
      }]
    }, null);
    expect(tempPublish.setCurrentList).toHaveBeenCalled();
    expect(snackbar.showSnackbar).toHaveBeenCalledWith('Publish Success', 'success');
  });
});

test('Click Publish with one date range, (not in current)', async () => {
  (newRequests as jest.Mock).mockResolvedValue({});
  const tempPublish = { ...publish, unpublished: [user] }
  renderComponent(tempPublish, current);
  fireEvent.click(screen.getByText('Select Date'));
  const startDateInput = screen.getByTestId('start-date0').querySelector('input');
  const endDateInput = screen.getByTestId('end-date0').querySelector('input');
  userEvent.type(startDateInput as HTMLElement, '2023-12-01');
  userEvent.type(endDateInput as HTMLElement, '2023-12-30');
  fireEvent.click(screen.getByText('Publish'));

  await waitFor(() => {
    expect(newRequests).toHaveBeenCalledWith('/listings/publish/1', 'PUT', {
      availability: [{
        start: '2023-12-01',
        end: '2023-12-30'
      }]
    }, null);
    expect(tempPublish.setPublished).toHaveBeenCalled();
    expect(tempPublish.setUnpublished).toHaveBeenCalled();
    expect(snackbar.showSnackbar).toHaveBeenCalledWith('Publish Success', 'success');
  });
});

test('Click Publish with multi date range', async () => {
  (newRequests as jest.Mock).mockResolvedValue({});
  const tempPublish = { ...publish, unpublished: [user] }
  renderComponent(tempPublish, current);
  fireEvent.click(screen.getByText('Select Date'));
  const startDateInput = screen.getByTestId('start-date0').querySelector('input');
  const endDateInput = screen.getByTestId('end-date0').querySelector('input');
  userEvent.type(startDateInput as HTMLElement, '2023-12-01');
  userEvent.type(endDateInput as HTMLElement, '2023-12-30');
  fireEvent.click(screen.getByText('Add an available Date'));
  const startDateInput1 = screen.getByTestId('start-date1').querySelector('input');
  const endDateInput1 = screen.getByTestId('end-date1').querySelector('input');
  userEvent.type(startDateInput1 as HTMLElement, '2024-12-01');
  userEvent.type(endDateInput1 as HTMLElement, '2024-12-30');
  fireEvent.click(screen.getByText('Add an available Date'));
  const startDateInput2 = screen.getByTestId('start-date2').querySelector('input');
  const endDateInput2 = screen.getByTestId('end-date2').querySelector('input');
  userEvent.type(startDateInput2 as HTMLElement, '2025-12-01');
  userEvent.type(endDateInput2 as HTMLElement, '2025-12-30');

  fireEvent.click(screen.getByText('Publish'));

  await waitFor(() => {
    expect(newRequests).toHaveBeenCalledWith('/listings/publish/1', 'PUT', {
      availability: [{
        start: '2023-12-01',
        end: '2023-12-30'
      }, {
        start: '2024-12-01',
        end: '2024-12-30'
      }, {
        start: '2025-12-01',
        end: '2025-12-30'
      }]
    }, null);
    expect(tempPublish.setPublished).toHaveBeenCalled();
    expect(tempPublish.setUnpublished).toHaveBeenCalled();
    expect(snackbar.showSnackbar).toHaveBeenCalledWith('Publish Success', 'success');
  });
});

test('Throw error with backend', async () => {
  (newRequests as jest.Mock).mockRejectedValue({ error: 'Invalid input' })
  const tempPublish = { ...publish, unpublished: [user] }
  renderComponent(tempPublish, current);
  fireEvent.click(screen.getByText('Select Date'));
  const startDateInput = screen.getByTestId('start-date0').querySelector('input');
  const endDateInput = screen.getByTestId('end-date0').querySelector('input');
  userEvent.type(startDateInput as HTMLElement, '2023-12-01');
  userEvent.type(endDateInput as HTMLElement, '2023-12-30');
  fireEvent.click(screen.getByText('Add an available Date'));
  const startDateInput1 = screen.getByTestId('start-date1').querySelector('input');
  const endDateInput1 = screen.getByTestId('end-date1').querySelector('input');
  userEvent.type(startDateInput1 as HTMLElement, '2024-12-01');
  userEvent.type(endDateInput1 as HTMLElement, '2024-12-30');
  fireEvent.click(screen.getByText('Add an available Date'));
  const startDateInput2 = screen.getByTestId('start-date2').querySelector('input');
  const endDateInput2 = screen.getByTestId('end-date2').querySelector('input');
  userEvent.type(startDateInput2 as HTMLElement, '2025-12-01');
  userEvent.type(endDateInput2 as HTMLElement, '2025-12-30');

  fireEvent.click(screen.getByText('Publish'));

  await waitFor(() => {
    expect(newRequests).toHaveBeenCalledWith('/listings/publish/1', 'PUT', {
      availability: [{
        start: '2023-12-01',
        end: '2023-12-30'
      }, {
        start: '2024-12-01',
        end: '2024-12-30'
      }, {
        start: '2025-12-01',
        end: '2025-12-30'
      }]
    }, null);
    expect(tempPublish.setPublished).not.toHaveBeenCalled();
    expect(tempPublish.setUnpublished).not.toHaveBeenCalled();
    expect(alertError.showAlertError).toHaveBeenCalledWith('Publish Error', 'Invalid input');
  });
});

test('click Cancel dialog', async () => {
  renderComponent(publish, current);
  fireEvent.click(screen.getByText('Select Date'));
  const startDateInput = screen.getByTestId('start-date0').querySelector('input');
  const endDateInput = screen.getByTestId('end-date0').querySelector('input');
  userEvent.type(startDateInput as HTMLElement, '2023-12-01');
  userEvent.type(endDateInput as HTMLElement, '2023-12-30');
  fireEvent.click(screen.getByText('Add an available Date'));
  const startDateInput1 = screen.getByTestId('start-date1').querySelector('input');
  const endDateInput1 = screen.getByTestId('end-date1').querySelector('input');
  userEvent.type(startDateInput1 as HTMLElement, '2024-12-01');
  userEvent.type(endDateInput1 as HTMLElement, '2024-12-30');
  fireEvent.click(screen.getByText('Add an available Date'));
  const startDateInput2 = screen.getByTestId('start-date2').querySelector('input');
  const endDateInput2 = screen.getByTestId('end-date2').querySelector('input');
  userEvent.type(startDateInput2 as HTMLElement, '2025-12-01');
  userEvent.type(endDateInput2 as HTMLElement, '2025-12-30');
  fireEvent.click(screen.getByText('Cancel'));
  expect(screen.getByTestId('start-date0').querySelector('input')).toHaveValue('');
  expect(screen.getByTestId('end-date0').querySelector('input')).toHaveValue('');
  expect(screen.queryByTestId('start-date1')).not.toBeInTheDocument();
  expect(screen.queryByTestId('end-date1')).not.toBeInTheDocument();
  expect(screen.queryByTestId('start-date2')).not.toBeInTheDocument();
  expect(screen.queryByTestId('end-date2')).not.toBeInTheDocument();
});

// Record the types or some stable data
export type SnackbarStatus = 'success' | 'error' | 'warning' | 'info';

export const propertyType: string[] = [
  'House',
  'Apartment',
  'Duplex',
  'Villa',
  'Townhouse',
  'Rural Estate',
  'Cabin',
  'Beachfront Property',
  'Loft',
  'Studio',
  'Ranch',
  'Row House',
  'Other'
]

export const bedType: string[] = [
  'Single Bed',
  'Double Bed',
  'King Size Bed',
  'Queen Size Bed',
  'Children Bed',
  'Other'
]

export const auStates: string[] = [
  'ACT',
  'NSW',
  'NT',
  'QLD',
  'SA',
  'TAS',
  'VIC',
  'WA'
]

export const labels: { [index: string]: string } = {
  0.5: 'Useless',
  1: 'Useless+',
  1.5: 'Poor',
  2: 'Poor+',
  2.5: 'Ok',
  3: 'Ok+',
  3.5: 'Good',
  4: 'Good+',
  4.5: 'Excellent',
  5: 'Excellent+',
};

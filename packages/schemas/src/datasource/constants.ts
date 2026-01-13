import type { DatasourceOption } from './types.js';

/**
 * Default datasource field
 */
export const DEFAULT_DATASOURCE_FIELD = 'Patient.patient_first_name';

/**
 * Default datasource options when no options are provided
 * Provides basic patient and test fields
 */
export const DEFAULT_DATASOURCE_OPTIONS: DatasourceOption[] = [
  {
    label: '── 👤 Patient Information ──',
    value: '__SEPARATOR_PATIENT__',
    disabled: true,
  },
  {
    label: 'Patient → First Name',
    value: 'Patient.firstName',
    description: 'Patient first name',
    entity: 'Patient',
    property: 'firstName',
    type: 'string',
    sample: 'John',
  },
  {
    label: 'Patient → Last Name',
    value: 'Patient.lastName',
    description: 'Patient last name',
    entity: 'Patient',
    property: 'lastName',
    type: 'string',
    sample: 'Doe',
  },
  {
    label: 'Patient → Date of Birth',
    value: 'Patient.dateOfBirth',
    description: 'Patient date of birth',
    entity: 'Patient',
    property: 'dateOfBirth',
    type: 'date',
    sample: '1990-01-15',
  },
  {
    label: '── 🧪 Test Information ──',
    value: '__SEPARATOR_TEST__',
    disabled: true,
  },
  {
    label: 'Test → Test Name',
    value: 'Test.testName',
    description: 'Name of the test',
    entity: 'Test',
    property: 'testName',
    type: 'string',
    sample: 'Genetic Test',
  },
  {
    label: 'Test → Test Code',
    value: 'Test.testCode',
    description: 'Test identification code',
    entity: 'Test',
    property: 'testCode',
    type: 'string',
    sample: '1800',
  },
];

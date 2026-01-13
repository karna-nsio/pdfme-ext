import type { TextSchema } from '../text/types.js';

/**
 * Datasource option interface
 * Represents a field available for data binding
 */
export interface DatasourceOption {
  /** Display label for the option */
  label: string;
  /** Unique value for the option (e.g., "Patient.patient_first_name") */
  value: string;
  /** Optional description of the field */
  description?: string;
  /** Whether the option is disabled (e.g., separator) */
  disabled?: boolean;
  /** Entity name (e.g., "Patient", "Test") */
  entity?: string;
  /** Property name (e.g., "patient_first_name") */
  property?: string;
  /** Data type (e.g., "string", "date", "number") */
  type?: string;
  /** Sample value for preview */
  sample?: string;
  /** Whether field contains Protected Health Information */
  is_phi_data?: boolean;
  /** Whether field is required */
  is_required?: boolean;
  /** Whether content is dynamically generated */
  is_dynamic?: boolean;
  /** Field category for grouping */
  fieldCategory?: string;
  /** Data source mapping information */
  dataSource?: {
    database?: string;
    schema?: string;
    table?: string;
    column?: string;
    [key: string]: any;
  };
}

/**
 * Datasource schema interface
 * Extends TextSchema with datasource-specific properties
 */
export interface DatasourceSchema extends TextSchema {
  /** Selected datasource field (e.g., "Patient.patient_first_name") */
  datasourceField: string;
}

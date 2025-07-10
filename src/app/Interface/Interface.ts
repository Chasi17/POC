export interface Employee{
  empId?: number;
  name: string;
  designation?: string;
  reportingTo?: string;
  billable: 'yes' | 'no';
  skill?: string;
  project?: string;
  location?: string;
  email: string;
  doj?: string; // ISO date
  remarks?: string;
}

export interface CreateEmployeeRequest {
    empId?: number;
  name: string;
  designation?: string;
  reportingTo?: string;
  billable: boolean;
  skill?: string;
  project?: string;
  location?: string;
  email: string;
  doj?: string; // ISO date
  remarks?: string;
}
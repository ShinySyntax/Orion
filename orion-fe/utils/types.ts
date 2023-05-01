/* eslint-disable @typescript-eslint/no-explicit-any */

import type { MenuProps } from 'antd';

export type MenuItem = Required<MenuProps>['items'][number];

export type SidebarProps = {
  children: JSX.Element | JSX.Element[];
  sidebarKey: string;
};

export type DashboardProps = {
  isSuccess: boolean;
  username?: string;
  role?: string;
  org?: string;
  data: any[];
};

export type CertificateByIdProps = {
  isSuccess: boolean;
  id?: any;
  accidentData?: any;
  maintenanceData?: any;
  certData?: any;
  certHistoryData?: any;
};

export type TransactionProps = {
  org?: string;
  nik?: string;
  isSuccess: boolean;
  data: any;
};

export type Certificate = {
  id: string;
  model: string;
  model_name: string;
  address: string;
  brand: string;
  category: string;
  chassis_number: string;
  engine_number: string;
  color: string;
  fuel_type: string;
  name: string;
  national_id: string;
  number_of_axles: string;
  number_of_wheels: string;
  registration_number: string;
  serial_number: string;
  type: string;
  year_of_manufacture: string;
  is_in_transaction: boolean;
};

export type Transaction = {
  id: string;
  model: string;
  model_name: string;
  certificate_id: string;
  status: string;
  old_owner_national_id: string;
  new_owner_national_id: string;
};

export type RegisterNewUserProps = {
  nik: string;
};

export type AddAccidentProps = {
  id: string;
  vehicleCondition: string;
  vehicleDescription: string;
  location: string;
  occurenceTime: string;
  report: string;
};

export type AddMaintenanceProps = {
  id: string;
  vehicleCondition: string;
  vehicleDescription: string;
  serviceDescription: string;
  serviceLocation: string;
};

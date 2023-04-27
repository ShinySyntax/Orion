import Link from 'next/link';

import {
  HomeOutlined,
  UserAddOutlined,
  FileOutlined,
  PlusCircleFilled,
  SafetyCertificateFilled,
} from '@ant-design/icons';
import { MenuItem } from '@utils/types';

const itemsMap: Record<string, MenuItem[]> = {
  org1_admin: [
    {
      label: <Link href="/">Home</Link>,
      key: '/',
      icon: <HomeOutlined />,
    },
    {
      label: <Link href="/users/registration">Register New User</Link>,
      key: '/users/registration',
      icon: <UserAddOutlined />,
    },
    {
      label: <Link href="/certificates">Check Certificates</Link>,
      key: '/certificates',
      icon: <SafetyCertificateFilled />,
    },
  ],
  org1_user: [
    {
      label: <Link href="/">Home</Link>,
      key: '/',
      icon: <HomeOutlined />,
    },
    {
      label: <Link href="/transactions">Transactions</Link>,
      key: '/transactions',
      icon: <FileOutlined />,
    },
    {
      label: <Link href="/certificates">Check Certificates</Link>,
      key: '/certificates',
      icon: <SafetyCertificateFilled />,
    },
  ],
  org2: [
    {
      label: <Link href="/">Home</Link>,
      key: '/',
      icon: <HomeOutlined />,
    },
    {
      label: <Link href="/users/registration">Register New User</Link>,
      key: '/users/registration',
      icon: <UserAddOutlined />,
    },
    {
      label: <Link href="/transactions">Transactions</Link>,
      key: '/transactions',
      icon: <FileOutlined />,
    },
    {
      label: <Link href="/accidents">Add New Accident Report</Link>,
      key: '/accidents',
      icon: <PlusCircleFilled />,
    },
    {
      label: <Link href="/certificates">Check Certificates</Link>,
      key: '/certificates',
      icon: <SafetyCertificateFilled />,
    },
  ],
  org3: [
    {
      label: <Link href="/">Home</Link>,
      key: '/',
      icon: <HomeOutlined />,
    },
    {
      label: <Link href="/users/registration">Register New User</Link>,
      key: '/users/registration',
      icon: <UserAddOutlined />,
    },
    {
      label: <Link href="/maintenances">Add New Maintenance Report</Link>,
      key: '/maintenances',
      icon: <PlusCircleFilled />,
    },
    {
      label: <Link href="/certificates">Check Certificates</Link>,
      key: '/certificates',
      icon: <SafetyCertificateFilled />,
    },
  ],
};

export { itemsMap };

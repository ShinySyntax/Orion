/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button, Card, Form, Input, Modal } from 'antd';
import {
  ADMIN_ROLE,
  APP_ORG,
  GOVERMENT_ORG,
  MAINTENANCE_ORG,
  ORG_NAME_MAP,
  USER_ROLE,
} from 'constants/main';
import { useAuth } from 'context/AuthContext';
import { GetServerSidePropsContext } from 'next';
import nextCookie from 'next-cookies';
import { useState } from 'react';

import setupAxios from '@utils/axios';
import { Certificate, DashboardProps } from '@utils/types';

import styles from '../../styles/pages/dashboard.module.scss';
import { useRouter } from 'next/router';

const Dashboard = (props: DashboardProps) => {
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCertID, setSelectedCertID] = useState('');
  const [transferLoading, setTransferLoading] = useState(false);
  const [item, setItem] = useState({ isNotFound: false, data: props.data });

  const { axios, messageApi } = useAuth();
  const router = useRouter();

  const { isSuccess, role, org } = props;
  const currOrgName = org ? ORG_NAME_MAP[org] : '';
  const currRole = role || '';

  const handleSearch = async (nik: string) => {
    setLoading(true);
    try {
      const URL = `/channels/mychannel/chaincodes/orion?fcn=GetListCertificateByNIK&args=[${nik}]`;
      const itemRes = await axios.get(URL);

      const isItemDataExist = itemRes?.data?.data;
      if (!isItemDataExist || itemRes.data.data.length === 0)
        throw new Error('item data not exist');

      setItem({ isNotFound: false, data: itemRes.data.data });
    } catch {
      setItem({ isNotFound: true, data: [] });
    }
    setLoading(false);
  };

  const handleTransferCertificate = async (values: {
    newOwnerNIK: string;
    secret: string;
    detail: string;
  }) => {
    setTransferLoading(true);

    const { newOwnerNIK, secret, detail } = values;
    try {
      await axios.post('channels/mychannel/chaincodes/orion/private', {
        fcn: 'CreateCertificateTransaction',
        transient: {
          key: 'transaction_properties',
          data: {
            transaction_id: selectedCertID,
            origin_nik: props.username,
            destination_nik: newOwnerNIK,
            secret_key: secret,
            transaction_detail: detail,
          },
        },
        args: [selectedCertID, props.username, newOwnerNIK, secret],
      });

      messageApi.success('Berhasil transfer BPKB', 1000);
    } catch (err) {
      console.log(err);
      messageApi.open({
        type: 'error',
        content: 'Gagal transfer BPKB',
      });
    }

    setSelectedCertID('');
    setIsModalOpen(false);
    setTransferLoading(false);

    setTimeout(() => router.reload(), 500);
  };

  if (!isSuccess) return <h1>Internal Server Error</h1>;

  return (
    <>
      <Modal
        title="Transfer BPKB"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
      >
        <Form
          name="basic"
          style={{ marginTop: '2em' }}
          initialValues={{ remember: true }}
          onFinish={handleTransferCertificate}
          autoComplete="off"
        >
          <Form.Item
            label="New Owner NIK"
            name="newOwnerNIK"
            rules={[
              {
                required: true,
                message: 'Tolong masukkan nomor induk kependudukan!',
              },
              {
                len: 16,
                message:
                  'Tolong sesuaikan dengan format nomor induk kependudukan dengan panjang 16',
              },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Secret"
            name="secret"
            rules={[
              {
                required: true,
                message: 'Tolong masukkan secret!',
              },
            ]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Detail Transaksi"
            name="detail"
            rules={[
              {
                required: true,
                message: 'Tolong masukkan deskripsi transaksi',
              },
            ]}
          >
            <Input.TextArea rows={4} />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              block
              loading={transferLoading}
            >
              Transfer BPKB
            </Button>
          </Form.Item>
        </Form>
      </Modal>
      <h1 className={styles.dashboardTitle}>
        {currRole} Dashboard - {currOrgName}
      </h1>
      {(currRole === ADMIN_ROLE || org === GOVERMENT_ORG) && (
        <Input.Search
          placeholder="Masukkan NIK Untuk Menampilkan Daftar BPKB"
          onSearch={(val: string) => handleSearch(val)}
          loading={loading}
        />
      )}
      <div className={styles.itemsContainer}>
        {item.data.length === 0 && item.isNotFound ? (
          <h1 className={styles.notFoundTitle}>Data Tidak Ditemukan</h1>
        ) : (
          item.data.map((val: Certificate, idx) => (
            <Card
              key={`${val.chassis_number}-${idx}`}
              title={`BPKB - ${val.chassis_number}`}
              bordered={false}
            >
              <p>Nama Pemilik: {val.name}</p>
              <p>NIK Pemilik: {val.national_id}</p>
              <p>Brand Kendaraan: {val.brand}</p>
              <p>Tipe Kendaraan: {val.type}</p>
              <p>Warna Kendaraan: {val.color}</p>
              <br />
              <Button
                type="primary"
                block
                onClick={() =>
                  router.push(`/certificates/${val.chassis_number}`)
                }
              >
                Get More
              </Button>
              <br />
              <br />
              {currRole !== ADMIN_ROLE && org === APP_ORG && (
                <Button
                  type="primary"
                  block
                  danger
                  onClick={() => {
                    setSelectedCertID(val.chassis_number);
                    setIsModalOpen(true);
                  }}
                  disabled={val.is_in_transaction}
                >
                  Transfer BPKB
                </Button>
              )}
            </Card>
          ))
        )}
      </div>
    </>
  );
};

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const { access_token } = nextCookie(context);
  const axios = setupAxios({ accessToken: access_token });

  const props: DashboardProps = { isSuccess: false, data: [] };
  try {
    const userRes = await axios.get('users/current');

    const isUserDataExist = userRes?.data?.data;
    if (!isUserDataExist) throw new Error('user not exist');

    const { username, role, org } = userRes.data.data;

    if (org === APP_ORG && role === USER_ROLE) {
      const URL = `/channels/mychannel/chaincodes/orion?fcn=GetListCertificateByNIK&args=[${username}]`;
      const itemRes = await axios.get(URL);

      const isItemDataExist = itemRes?.data?.data;
      if (!isItemDataExist || itemRes.data.data.length === 0)
        throw new Error('item data not exist');

      props.data = itemRes.data.data;
    }

    props.username = username;
    props.role = role;
    props.org = org;
    props.isSuccess = true;
  } catch (err) {
    console.error(err);
  }

  return { props };
}

export default Dashboard;

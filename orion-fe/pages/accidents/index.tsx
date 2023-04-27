import { Button, DatePicker, Form, Input } from 'antd';
import { ORG_NAME_MAP } from 'constants/main';
import { useAuth } from 'context/AuthContext';

import { AddAccidentProps } from '@utils/types';

import styles from '../../styles/components/Form.module.scss';
import { useState } from 'react';
import { useRouter } from 'next/router';

const AddAccidentReport = () => {
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const { user, axios, messageApi } = useAuth();

  const onFinish = async (values: AddAccidentProps) => {
    setLoading(true);

    const {
      id,
      vehicleCondition,
      vehicleDescription,
      location,
      occurenceTime,
      report,
    } = values;

    try {
      const URL = 'channels/mychannel/chaincodes/orion';
      await axios.post(URL, {
        fcn: 'AddAccidentHistory',
        args: [
          id,
          vehicleCondition,
          vehicleDescription,
          location,
          occurenceTime,
          report,
        ],
      });
      messageApi.open({
        type: 'success',
        content: 'Berhasil menambahkan laporan kecelakaan',
      });

      setTimeout(() => {
        router.reload();
      }, 500);
    } catch (err) {
      console.log(err);
      messageApi.open({
        type: 'error',
        content: 'Gagal menambahkan laporan kecelakaan',
      });
    }

    setLoading(false);
  };

  return (
    <>
      <h1>
        <b>
          Halaman Pelaporan Kecelakaan - {ORG_NAME_MAP[user?.data?.org || '']}
        </b>
      </h1>
      <Form
        name="basic"
        style={{ marginTop: '2em' }}
        initialValues={{ remember: true }}
        onFinish={onFinish}
        autoComplete="off"
      >
        <Form.Item
          className={styles.formItem}
          label="Nomor Kendaraan"
          name="id"
          rules={[
            {
              required: true,
              message: 'Tolong masukkan nomor kendaraan',
            },
          ]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          className={styles.formItem}
          label="Kondisi Kendaraan"
          name="vehicleCondition"
          rules={[
            {
              required: true,
              message: 'Tolong masukkan kondisi kendaraan',
            },
          ]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          className={styles.formItem}
          label="Deskripsi Kendaraan"
          name="vehicleDescription"
          rules={[
            {
              required: true,
              message: 'Tolong masukkan deskripsi kendaraan',
            },
          ]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          className={styles.formItem}
          label="Lokasi Kejadian"
          name="location"
          rules={[
            {
              required: true,
              message: 'Tolong masukkan lokasi kejadian',
            },
          ]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          className={styles.formItem}
          label="Waktu Kejadian"
          name="occurenceTime"
          rules={[
            {
              required: true,
              message: 'Tolong masukkan lokasi kejadian',
            },
          ]}
        >
          <DatePicker style={{ width: '100%' }} />
        </Form.Item>

        <Form.Item
          className={styles.formItem}
          label="Deskripsi Laporan"
          name="report"
          rules={[
            {
              required: true,
              message: 'Tolong masukkan deskirpis laporan',
            },
          ]}
        >
          <Input.TextArea rows={4} />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" block loading={loading}>
            Tambahkan Laporan
          </Button>
        </Form.Item>
      </Form>
    </>
  );
};

export default AddAccidentReport;

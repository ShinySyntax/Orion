/* eslint-disable @typescript-eslint/no-explicit-any */
import { useAuth } from 'context/AuthContext';

import styles from '../../styles/pages/dashboard.module.scss';
import { useState } from 'react';
import { Button, Card, Input } from 'antd';
import { Certificate } from '@utils/types';
import { useRouter } from 'next/router';

const Certificates = () => {
  const [loading, setLoading] = useState(false);
  const [item, setItem] = useState<any>({ isNotFound: false, data: [] });

  const router = useRouter();
  const { axios } = useAuth();

  const handleSearch = async (id: string) => {
    setLoading(true);
    try {
      const URL = `/channels/mychannel/chaincodes/orion?fcn=GetCertificateByID&args=["${id}"]`;
      const itemRes = await axios.get(URL);

      const isItemDataExist = itemRes?.data?.data;
      if (!isItemDataExist || itemRes.data.data.length === 0)
        throw new Error('item data not exist');

      setItem({ isNotFound: false, data: [itemRes.data.data] });
    } catch {
      setItem({ isNotFound: true, data: [] });
    }
    setLoading(false);
  };

  return (
    <>
      <Input.Search
        placeholder="Masukkan ID Untuk Menampilkan Daftar BPKB"
        onSearch={(val: string) => handleSearch(val)}
        loading={loading}
      />
      <div className={styles.itemsContainer}>
        {item.data.length === 0 && item.isNotFound ? (
          <h1 className={styles.notFoundTitle}>Data Tidak Ditemukan</h1>
        ) : (
          item.data.map((val: Certificate, idx: number) => (
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
            </Card>
          ))
        )}
      </div>
    </>
  );
};

export default Certificates;

import nextCookie from 'next-cookies';
import { GetServerSidePropsContext } from 'next';

import setupAxios from '@utils/axios';
import { Transaction, TransactionProps } from '@utils/types';
import { ADMIN_ROLE, APP_ORG, GOVERMENT_ORG, USER_ROLE } from 'constants/main';
import { Button, Card, Form, Input, Modal } from 'antd';
import { useState } from 'react';
import { useAuth } from 'context/AuthContext';
import { useRouter } from 'next/router';

const Transaction = (props: TransactionProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTxID, setSelectedTxID] = useState('');
  const [transferLoading, setTransferLoading] = useState(false);

  const router = useRouter();
  const { axios, messageApi } = useAuth();

  const handleApproveTransfer = async (values: { secret: string }) => {
    setTransferLoading(true);

    const { secret } = values;
    try {
      await axios.post('channels/mychannel/chaincodes/orion', {
        fcn: 'ApproveCertificateTransaction',
        args: [selectedTxID, props.nik, secret],
      });

      messageApi.success('Berhasil approve transaksi', 1000);
    } catch (err) {
      console.log(err);
      messageApi.open({
        type: 'error',
        content: 'Gagal approve transaksi',
      });
    }

    setSelectedTxID('');
    setIsModalOpen(false);
    setTransferLoading(false);

    setTimeout(() => router.reload(), 500);
  };

  const handleProcessTransfer = async (txID: string) => {
    setTransferLoading(true);

    try {
      await axios.post('channels/mychannel/chaincodes/orion', {
        fcn: 'ProcessCertificateTransaction',
        args: [txID],
      });

      messageApi.success('Berhasil approve transaksi', 1000);
    } catch (err) {
      console.log(err);
      messageApi.open({
        type: 'error',
        content: 'Gagal approve transaksi',
      });
    }

    setTransferLoading(false);
    setTimeout(() => router.reload(), 500);
  };

  return (
    <>
      <Modal
        title="Approve Transaksi"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
      >
        <Form
          name="basic"
          style={{ marginTop: '2em' }}
          initialValues={{ remember: true }}
          onFinish={handleApproveTransfer}
          autoComplete="off"
        >
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

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              block
              loading={transferLoading}
            >
              Approve Transfer
            </Button>
          </Form.Item>
        </Form>
      </Modal>
      {props.data.map((val: Transaction, idx: number) => (
        <Card
          key={`${val.id}-${idx}`}
          title={`Transaction - ${val.id}`}
          bordered={false}
        >
          <p>Transaction ID: {val.id}</p>
          <p>NIK Pemilik: {val.old_owner_national_id}</p>
          <p>NIK Calon Pemilik: {val.new_owner_national_id}</p>
          <p>Status: {val.status}</p>
          <br />
          {val.status === 'in-progress' && (
            <Button
              type="primary"
              block
              onClick={() => {
                setSelectedTxID(
                  val.id.replace('Model-Certificate-Transaction-', '')
                );
                setIsModalOpen(true);
              }}
            >
              Approve Pemindahan Sertifikat
            </Button>
          )}
          {props.org === GOVERMENT_ORG && (
            <Button
              type="primary"
              block
              onClick={() =>
                handleProcessTransfer(
                  val.id.replace('Model-Certificate-Transaction-', '')
                )
              }
              loading={transferLoading}
            >
              Proses Pemindahan Sertifikat
            </Button>
          )}
        </Card>
      ))}
    </>
  );
};

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const { access_token } = nextCookie(context);
  const axios = setupAxios({ accessToken: access_token });

  const props: TransactionProps = { isSuccess: false, data: [] };
  try {
    const userRes = await axios.get('users/current');

    const isUserDataExist = userRes?.data?.data;
    if (!isUserDataExist) throw new Error('user not exist');

    const { username, role, org } = userRes.data.data;

    let url = '';
    if (org === APP_ORG && role === USER_ROLE) {
      url = `channels/mychannel/chaincodes/orion?fcn=GetListTransactionsByNewOwnerNIK&args=["${username}"]`;
    } else if (org === APP_ORG && role === ADMIN_ROLE) {
      url = `channels/mychannel/chaincodes/orion?fcn=GetAllListTransactions&args=[]`;
    } else if (org === GOVERMENT_ORG) {
      url = `channels/mychannel/chaincodes/orion?fcn=GetListTransactionsByStatus&args=["approved-by-new-owner"]`;
    } else {
      throw new Error('this organization not eligible to access this site');
    }

    const transactionRes = await axios.get(url);
    if (transactionRes?.data?.data) {
      props.data = transactionRes.data.data;
    }

    props.org = org;
    props.nik = username;
    props.isSuccess = true;
  } catch (err) {
    console.error(err);
  }

  return { props };
}

export default Transaction;

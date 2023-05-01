import { RegisterNewUserProps } from '@utils/types';
import { Button, Form, Input, notification } from 'antd';
import { ORG_NAME_MAP } from 'constants/main';
import { useAuth } from 'context/AuthContext';

const Registration = () => {
  const { user, axios, messageApi } = useAuth();

  const onFinish = async (values: RegisterNewUserProps) => {
    const userData = user.data;
    const nik = values.nik;

    try {
      if (userData.username === nik)
        throw new Error('tidak bisa register user dengan nik yang sama');

      const URL = `/users/register`;
      const resp = await axios.post(URL, { username: nik, org: userData.org });

      const isRespDataExist = resp?.data?.data;
      if (!isRespDataExist)
        throw new Error('gagal melakukan registrasi user baru');

      const password = resp.data.data.secret;
      messageApi.open({
        type: 'success',
        content: 'Berhasil melakukan registrasi untuk user baru',
      });
      notification.open({
        message: 'User baru telah dibuat',
        description: `Password untuk user baru => ${password}`,
        duration: 0,
      });
    } catch (err) {
      console.log(err);
      messageApi.open({
        type: 'error',
        content:
          'Gagal melakukan registrasi untuk user baru, silahkan coba beberapa saat lagi dan cek log',
      });
    }
  };

  return (
    <>
      <h1>
        <b>
          Halaman Registrasi Pengguna Baru -{' '}
          {ORG_NAME_MAP[user?.data?.org || '']}
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
          label="NIK"
          name="nik"
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

        <Form.Item>
          <Button type="primary" htmlType="submit" block>
            Create New User
          </Button>
        </Form.Item>
      </Form>
    </>
  );
};

export default Registration;

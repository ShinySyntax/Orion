import { useAuth } from 'context/AuthContext';
import styles from '../styles/pages/login.module.scss';
import { Button, Form, Input, Select } from 'antd';
import { login } from '@utils/auth';
import { useRouter } from 'next/router';

const Login = () => {
  const { axios, messageApi } = useAuth();
  const router = useRouter();

  const onFinish = async (values: any) => {
    try {
      const { username, organization: org, password } = values;
      const res = await axios.post('/users/login', { username, password, org });
      await login(res.data.data);
      messageApi.success('Success login', 1000);
      setTimeout(() => {
        router.push('/dashboard');
      }, 1100);
    } catch (err) {
      let message = 'Failed to login ';
      if (err instanceof Error) {
        message += err.message;
      }

      messageApi.open({
        type: 'error',
        content: message,
      });
    }
  };

  const onFinishFailed = (values: any) => {
    messageApi.open({
      type: 'error',
      content: values,
    });
  };

  return (
    <main className={[styles.main].join(' ')}>
      <h1>Orion</h1>
      <div className={styles.formContainer}>
        <Form
          className={styles.form}
          name="basic"
          initialValues={{ remember: true }}
          onFinish={onFinish}
          onFinishFailed={onFinishFailed}
          autoComplete="off"
        >
          <Form.Item
            label="Username"
            name="username"
            rules={[{ required: true, message: 'Please input your username!' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Organization"
            name="organization"
            rules={[
              { required: true, message: 'Please input your organization!' },
            ]}
          >
            <Select
              placeholder="Select a option and change input text above"
              allowClear
            >
              <Select.Option value="org1">App organization</Select.Option>
              <Select.Option value="org2">Goverment organization</Select.Option>
              <Select.Option value="org3">
                Maintenance organization
              </Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="Password"
            name="password"
            rules={[{ required: true, message: 'Please input your password!' }]}
          >
            <Input.Password />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit">
              Submit
            </Button>
          </Form.Item>
        </Form>
      </div>
    </main>
  );
};

export default Login;

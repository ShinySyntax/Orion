import { GetServerSidePropsContext } from 'next';
import nextCookie from 'next-cookies';

import setupAxios from '@utils/axios';
import { CertificateByIdProps } from '@utils/types';

import styles from '../../styles/pages/certificateId.module.scss';

const Certificate = (props: CertificateByIdProps) => {
  const {
    id,
    isSuccess,
    certData,
    certHistoryData,
    accidentData,
    maintenanceData,
  } = props;

  if (!isSuccess) return <h1>404 Not Found</h1>;

  return (
    <>
      <h1 className={styles.title}>Certificate - {id}</h1>
      <div className={styles.jsonContainer}>
        <h1>Certificate Detail</h1>
        <pre>{JSON.stringify(certData, null, 2)}</pre>
      </div>
      <hr />
      <div className={styles.jsonContainer}>
        <h1>Certificate History</h1>
        <pre>{JSON.stringify(certHistoryData, null, 2)}</pre>
      </div>
      <div className={styles.jsonContainer}>
        <h1>Accident History</h1>
        <pre>{JSON.stringify(accidentData, null, 2)}</pre>
      </div>
      <div className={styles.jsonContainer}>
        <h1>Maintenance History</h1>
        <pre>{JSON.stringify(maintenanceData, null, 2)}</pre>
      </div>
    </>
  );
};

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const props: CertificateByIdProps = { isSuccess: false };
  if (context.params && context.params.id) {
    props.id = context.params.id || '';
  }

  const { id } = props;
  const { access_token } = nextCookie(context);
  const axios = setupAxios({ accessToken: access_token });

  const preURL = 'channels/mychannel/chaincodes/orion';
  try {
    const promiseRes = await Promise.allSettled([
      axios.get(`${preURL}?fcn=GetCertificateByID&args=["${id}"]`),
      axios.get(`${preURL}?fcn=GetListCertificateHistoryByID&args=["${id}"]`),
      axios.get(`${preURL}?fcn=GetListAccidentHistoryByID&args=["${id}"]`),
      axios.get(`${preURL}?fcn=GetListMaintenanceHistoryByID&args=["${id}"]`),
    ]);

    for (const [idx, e] of promiseRes.entries()) {
      if (e.status === 'rejected') continue;

      const currData = e.value.data.data;
      switch (idx) {
        case 0:
          props.certData = currData;
          break;
        case 1:
          props.certHistoryData = currData;
          break;
        case 2:
          props.accidentData = currData;
          break;
        case 3:
          props.maintenanceData = currData;
          break;
        default:
          break;
      }
    }

    props.isSuccess = true;
  } catch (err) {
    console.error(err);
  }

  return { props };
}

export default Certificate;

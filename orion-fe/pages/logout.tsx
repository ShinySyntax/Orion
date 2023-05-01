/* eslint-disable react-hooks/exhaustive-deps */
import { NextPage } from 'next';
import { useEffect } from 'react';
import { sanitizeCookie } from 'utils/auth';
import { useRouter } from 'next/router';

const Page__Logout: NextPage = () => {
  const router = useRouter();
  const to = router?.query?.to as string;

  const redirectUrl: string = to?.replace('/login?=to', '') || '/dashboard';

  useEffect(() => {
    sanitizeCookie({});
    router.push({
      pathname: '/login',
      query: {
        to: redirectUrl,
      },
    });
  }, []);

  return <></>;
};

export default Page__Logout;

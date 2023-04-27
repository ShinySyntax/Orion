import App, { AppContext } from 'next/app';

import 'antd/dist/antd';
import 'antd/dist/reset.css';
import 'antd/dist/antd-with-locales';
import '../styles/_base.scss';

import Sidebar from '@components/Sidebar/Sidebar';

import type { AppProps } from 'next/app';
import { EXCLUDE_TEMPLATE_PATH } from 'constants/main';
import { protectAuth, sanitizeCookie } from '@utils/auth';
import { AuthProvider } from 'context/AuthContext';
import { PUBLIC_ROUTE } from '@utils/CONSTANT';

const MyApp = ({ Component, pageProps, router }: AppProps) => {
  const { access_token, user } = pageProps;
  const currURL = router.pathname;

  sanitizeCookie({ access_token });

  if (EXCLUDE_TEMPLATE_PATH.includes(currURL))
    return (
      <AuthProvider token={access_token} userData={user}>
        <Component {...pageProps} />
      </AuthProvider>
    );

  return (
    <AuthProvider token={access_token} userData={user}>
      <Sidebar sidebarKey={currURL}>
        <Component {...pageProps} />
      </Sidebar>
    </AuthProvider>
  );
};

MyApp.getInitialProps = async (appContext: AppContext) => {
  const appProps = await App.getInitialProps(appContext);
  const pageContext = appContext.ctx;
  const pathname = pageContext.pathname;
  appProps.pageProps = { token: '', error: '' };

  if (PUBLIC_ROUTE.includes(pathname) && pathname !== '/') return appProps;

  try {
    const { access_token, user } = await protectAuth(
      pageContext,
      pageContext.pathname
    );
    appProps.pageProps = { access_token, user };
    return appProps;
  } catch (error: any) {
    appProps.pageProps = {
      access_token: '',
      refresh_token: '',
      user: {},
    };

    return appProps;
  }
};

export default MyApp;

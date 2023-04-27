/* eslint-disable @typescript-eslint/no-explicit-any */
import jwtDecode from 'jwt-decode';
import { NextPageContext } from 'next';
import nextCookie from 'next-cookies';
import Router from 'next/router';
import { Cookies } from 'react-cookie';
import {
  ALLOWED_ROLE,
  EXIT_ROUTE,
  GUEST_ROUTE,
  LANDING_AUTH_ROUTE,
  LANDING_ROUTE,
  PUBLIC_ROUTE,
} from './CONSTANT';
import { IDecodedJWT } from './interface';
import setupAxios from './axios';

const cookies = new Cookies();

export const removeTokens = () => {
  cookies.remove('access_token', { path: '/' });
};

export const updateTokens = ({ access_token = '' }: any) => {
  removeTokens();
  cookies.set('access_token', access_token, {
    maxAge: 60 * 60 * 24,
    path: '/',
  });
};

export const login = ({ token = '', user }: any) => {
  if (!user && token) user = jwtDecode(token);
  if (!isAllowedRole(user))
    throw new Error('Kamu tidak terautorisasi untuk memakai aplikasi ini');
  updateTokens({ access_token: token });
};

export const logout = () => {
  removeTokens();
  Router.push(LANDING_ROUTE);
};

export const getToken = () => {
  return cookies.get('access_token');
};

const getLogoutTo = (pageContext: NextPageContext) => {
  let pathname = pageContext.asPath || pageContext.pathname;

  if (pageContext.query.id) {
    pathname = pathname.replace('[id]', pageContext.query.id as string);
  }

  if (pageContext.query.page) {
    pathname = pathname.replace('[page]', pageContext.query.page as string);
  }

  if (pageContext.query.slug) {
    pathname = pathname.replace('[slug]', pageContext.query.page as string);
  }

  return pathname;
};

export const isAllowedRole = (user: any) => {
  if (!user) return false;
  return ALLOWED_ROLE.includes(user?.role);
};

export const sanitizeCookie = ({ access_token }: any) => {
  if (typeof window === 'undefined') return;
  if (!access_token) cookies.remove('access_token', { path: '/' });

  if (access_token)
    cookies.set('access_token', access_token, {
      maxAge: 60 * 60 * 24,
      path: '/',
    });
};

export const protectAuth: (ctx: NextPageContext, path?: string) => any = async (
  ctx: NextPageContext,
  path?: string
) => {
  const { access_token = '' } = nextCookie(ctx);
  path = path || ctx.pathname;

  const redirectOnError = () => {
    removeTokens();
    if (typeof window !== 'undefined')
      return Router.push(`${EXIT_ROUTE}?to=${path}`);

    const isTokenExisted = access_token;

    if (path === undefined || path !== '/') {
      ctx?.res?.writeHead(302, {
        Location: isTokenExisted
          ? `${EXIT_ROUTE}?to=${getLogoutTo(ctx)}`
          : LANDING_ROUTE,
      });
      ctx?.res?.end();
    }

    return { access_token };
  };

  const redirectToAuthPage = () => {
    if (typeof window !== 'undefined') return Router.push(LANDING_AUTH_ROUTE);

    ctx?.res?.writeHead(302, { Location: LANDING_AUTH_ROUTE });
    ctx?.res?.end();

    return { access_token };
  };

  const decoded: IDecodedJWT = access_token
    ? jwtDecode(access_token)
    : ({} as any);
  try {
    // GUEST ROUTE CANNOT HAVE ACCESS TOKEN
    if (GUEST_ROUTE.includes(path)) {
      if (access_token && isAllowedRole(decoded)) {
        return redirectToAuthPage();
      }

      return { access_token: null, refresh_token: null };
    }

    //PUBLIC ROUTE ALLOW USER TO HAVE ACCESS TOKEN
    if (PUBLIC_ROUTE.includes(path) || !path) {
      return {
        access_token,
        user: isAllowedRole(decoded) ? decoded : null,
      };
    }

    // HERE USER MUST HAVE ACCESS TOKEN & VERIFIED AS USER

    // KICK IF USER IS NOT AN ALLOWED USER
    const userAxios = setupAxios({ accessToken: access_token });
    const isNotAllowedUser = !access_token && !isAllowedRole(decoded);

    if (isNotAllowedUser) {
      throw Error('Kamu tidak terautorisasi untuk memakai aplikasi ini');
    }

    // FINAL CHECK IF ACCESS TOKEN IS VALID
    const response = await userAxios.get('/users/current', {
      headers: { Authorization: `Bearer ${access_token}` },
    });

    const isUserInvalid =
      !response?.data?.data || !isAllowedRole(response?.data?.data);
    if (isUserInvalid) {
      throw Error('Kamu tidak terautorisasi untuk memakai aplikasi ini');
    }

    const user = response?.data;

    return {
      access_token,
      user,
    };
  } catch (error: any) {
    return redirectOnError();
  }
};

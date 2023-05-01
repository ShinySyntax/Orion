export const AXIOS_BASE_URL =
  process.env.NEXT_PUBLIC_AXIOS_BASE_URL || 'http://localhost:3000/api/v1';
export const AXIOS_BASE_URL_AUTH =
  process.env.NEXT_PUBLIC_AXIOS_BASE_URL_AUTH || 'http://localhost:3000/api/v1';
export const AXIOS_TIMEOUT =
  parseInt(process.env.NEXT_PUBLIC_AXIOS_TIMEOUT as string) || 10000;

export const ALLOWED_ROLE = ['user', 'admin'];

// PUBLIC_ROUTE is route that optinally require user to have token
export const PUBLIC_ROUTE = ['/_error', '/logout'];

// GUEST_ROUTE is route that requires user to have no token
export const GUEST_ROUTE = ['/register', '/login'];

// EXIT_ROUTE is route that remove any app data
export const EXIT_ROUTE = '/logout';

// LANDING_ROUTE is route that user sees first
export const LANDING_ROUTE = '/';

// LANDING_AUTH_ROUTE is route that user sees first after login
export const LANDING_AUTH_ROUTE = '/dashboard';

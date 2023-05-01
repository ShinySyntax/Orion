const EXCLUDE_TEMPLATE_PATH = ['/login'];

const APP_ORG = 'org1';
const GOVERMENT_ORG = 'org2';
const MAINTENANCE_ORG = 'org3';

const ORG_NAME_MAP: Record<string, string> = {
  org1: 'Organisasi Orion (App)',
  org2: 'Organisasi Kepolisian Daerah',
  org3: 'Organisasi Servis Kendaraan',
};

const ADMIN_ROLE = 'admin';
const USER_ROLE = 'user';

export {
  EXCLUDE_TEMPLATE_PATH,
  APP_ORG,
  GOVERMENT_ORG,
  MAINTENANCE_ORG,
  ADMIN_ROLE,
  USER_ROLE,
  ORG_NAME_MAP,
};

const apiV1 = 'v1';

const org1 = 'org1';
const org2 = 'org2';
const org3 = 'org3';

const configFolder = 'configs';

const orgCcpMap: Record<string, string> = {
  org1: 'connection-org1.json',
  org2: 'connection-org2.json',
  org3: 'connection-org3.json',
};

const orgCaMap: Record<string, string> = {
  org1: 'ca.org1.example.com',
  org2: 'ca.org2.example.com',
  org3: 'ca.org3.example.com',
};

const orgWalletMap: Record<string, string> = {
  org1: 'org1-wallet',
  org2: 'org2-wallet',
  org3: 'org3-wallet',
};

const orgMspMap: Record<string, string> = {
  org1: 'Org1MSP',
  org2: 'Org2MSP',
  org3: 'Org3MSP',
};

const orgAffiliationMap: Record<string, string> = {
  org1: 'org1.department1',
  org2: 'org2.department1',
  org3: 'org1.department1',
};

const certificateType = 'X.509';

const adminUsername = 'admin';
const adminPassword = 'adminpw';

const admin2Username = 'admin2';

const secret = 'cY4jKg2eL9BbXH1R6mpv0ZPQw';

const publicPath = ['/api/v1/users/login'];

const channelName = 'mychannel';
const chaincodeName = 'orion';

export {
  apiV1,
  org1,
  org2,
  org3,
  configFolder,
  orgCcpMap,
  orgCaMap,
  orgWalletMap,
  orgMspMap,
  orgAffiliationMap,
  certificateType,
  adminUsername,
  admin2Username,
  adminPassword,
  secret,
  publicPath,
  channelName,
  chaincodeName,
};

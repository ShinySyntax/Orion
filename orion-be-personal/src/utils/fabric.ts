/* eslint-disable @typescript-eslint/no-explicit-any */
import FabricCAServices from 'fabric-ca-client';
import { Wallets } from 'fabric-network';
import fs from 'fs';
import path from 'path';
import {
  adminPassword,
  adminUsername,
  admin2Username,
  configFolder,
  orgAffiliationMap,
  orgCaMap,
  orgCcpMap,
  orgMspMap,
  orgWalletMap,
} from '@src/constants/constant';
import logger from './logger';

const getCCP = (org: string) => {
  const ccpFile = orgCcpMap[org] || '';
  if (!ccpFile) return null;

  const ccpPath = path.resolve(__dirname, '..', configFolder, ccpFile);
  const ccpJSON = fs.readFileSync(ccpPath, 'utf8');

  return JSON.parse(ccpJSON);
};

const getCaInfo = (org: string, ccp: any) => {
  const caName = orgCaMap[org] || '';
  if (!caName) return null;

  return ccp.certificateAuthorities[caName];
};

const getCaUrl = (org: string, ccp: any) => {
  const caInfo = getCaInfo(org, ccp);
  if (!caInfo) return null;

  return caInfo.url;
};

const getWalletPath = (org: string) => {
  const walletName = orgWalletMap[org] || '';

  return walletName ? path.join(process.cwd(), walletName) : '';
};

const getAffiliation = (org: string) => {
  return orgAffiliationMap[org] || '';
};

const enrollAdmin = async (org: string) => {
  const caURL = await getCaUrl(org, getCCP(org));
  const ca = new FabricCAServices(caURL);

  const walletPath = getWalletPath(org);
  const wallet = await Wallets.newFileSystemWallet(walletPath);

  const adminIdentity = await wallet.get(adminUsername);
  if (adminIdentity) {
    logger.error('an identity for the admin user "admin" already exists in the wallet');
    return;
  }

  const enrollment = await ca.enroll({
    enrollmentID: adminUsername,
    enrollmentSecret: adminPassword,
  });

  const x509Identity = {
    credentials: {
      certificate: enrollment.certificate,
      privateKey: enrollment.key.toBytes(),
    },
    mspId: orgMspMap[org],
    type: 'X.509',
  };

  await wallet.put(adminUsername, x509Identity);

  logger.info('successfully enrolled admin user "admin" and imported it into the wallet');
};

const enrollNewAdmin = async (org: string) => {
  const caURL = await getCaUrl(org, getCCP(org));
  const ca = new FabricCAServices(caURL);

  const walletPath = getWalletPath(org);
  const wallet = await Wallets.newFileSystemWallet(walletPath);

  const adminIdentity = await wallet.get(adminUsername);
  if (!adminIdentity) throw new Error(`admin identity not exist, please generate first`);

  const provider = wallet.getProviderRegistry().getProvider(adminIdentity.type);
  const adminUser = await provider.getUserContext(adminIdentity, adminUsername);

  const secret = await ca.register(
    {
      affiliation: orgAffiliationMap[org],
      enrollmentID: admin2Username,
      role: 'client',
      attrs: [
        { name: 'hf.Registrar.Roles', value: 'client,orderer,peer' },
        { name: 'hf.Registrar.DelegateRoles', value: 'client,orderer,peer' },
        { name: 'hf.Revoker', value: 'true' },
        { name: 'role', value: 'admin', ecert: true },
        {
          name: 'hf.Registrar.Attributes',
          value:
            'role, hf.Registrar.Roles, hf.Registrar.DelegateRoles, hf.Revoker, hf.Registrar.Attributes',
        },
      ],
      maxEnrollments: -1,
    },
    adminUser
  );
  const enrollment = await ca.enroll({
    enrollmentID: admin2Username,
    enrollmentSecret: secret,
    attr_reqs: [{ name: 'role', optional: false }],
  });

  const x509Identity = {
    credentials: {
      certificate: enrollment.certificate,
      privateKey: enrollment.key.toBytes(),
    },
    mspId: orgMspMap[org],
    type: 'X.509',
  };

  await wallet.put(admin2Username, x509Identity);

  const message = `username: ${admin2Username}, password: ${secret}, org: ${org}`;
  fs.writeFileSync(`./credentials/admin2_${org}.txt`, message);

  logger.info(`successfully enrolled new admin user for org ${org}`);
};

const enrollNewUser = async (username: string, org: string) => {
  const caURL = await getCaUrl(org, getCCP(org));
  const ca = new FabricCAServices(caURL);

  const walletPath = getWalletPath(org);
  const wallet = await Wallets.newFileSystemWallet(walletPath);

  const adminIdentity = await wallet.get(adminUsername);
  if (!adminIdentity) throw new Error(`admin identity not exist, please generate first`);

  const provider = wallet.getProviderRegistry().getProvider(adminIdentity.type);
  const adminUser = await provider.getUserContext(adminIdentity, adminUsername);

  const secret = await ca.register(
    {
      affiliation: orgAffiliationMap[org],
      enrollmentID: username,
      role: 'client',
      attrs: [{ name: 'role', value: 'user', ecert: true }],
      maxEnrollments: -1,
    },
    adminUser
  );
  const enrollment = await ca.enroll({
    enrollmentID: username,
    enrollmentSecret: secret,
    attr_reqs: [{ name: 'role', optional: false }],
  });

  const x509Identity = {
    credentials: {
      certificate: enrollment.certificate,
      privateKey: enrollment.key.toBytes(),
    },
    mspId: orgMspMap[org],
    type: 'X.509',
  };

  await wallet.put(username, x509Identity);

  const message = `username: ${username}, password: ${secret}, org: ${org}`;
  fs.writeFileSync(`./credentials/user_${username}_${org}.txt`, message);

  logger.info(`successfully enrolled new user for org ${org}`);
};

export {
  getCCP,
  getCaInfo,
  getCaUrl,
  getWalletPath,
  getAffiliation,
  enrollAdmin,
  enrollNewAdmin,
  enrollNewUser,
};

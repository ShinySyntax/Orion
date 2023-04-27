import { Wallets } from 'fabric-network';
import FabricCAServices from 'fabric-ca-client';
import { adminUsername, chaincodeName, channelName, orgMspMap } from '@src/constants/constant';
import { composeSuccessResService } from '@src/utils/common';
import { getAffiliation, getCaUrl, getCCP, getWalletPath } from '@src/utils/fabric';
import logger from '@src/utils/logger';
import query from './query';

const registerUser = async (username: string, org: string) => {
  const walletPath = getWalletPath(org);
  const wallet = await Wallets.newFileSystemWallet(walletPath);

  const userIdentity = await wallet.get(username);
  if (userIdentity)
    throw new Error(`an identity for the user ${username} already exists in the wallet`);

  const adminIdentity = await wallet.get(adminUsername);
  if (!adminIdentity) throw new Error(`admin identity not exist, please generate first`);

  const provider = wallet.getProviderRegistry().getProvider(adminIdentity.type);
  const adminUser = await provider.getUserContext(adminIdentity, 'admin');

  const caURL = await getCaUrl(org, getCCP(org));
  const ca = new FabricCAServices(caURL);

  const secret = await ca.register(
    {
      affiliation: getAffiliation(org),
      enrollmentID: username,
      role: 'client',
      maxEnrollments: -1,
      attrs: [
        {
          name: 'role',
          value: 'user',
          ecert: true,
        },
      ],
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
    role: 'user',
  };
  await wallet.put(username, x509Identity);

  logger.info(`success register user with username ${username}`);

  return composeSuccessResService({ secret });
};

const loginUser = async (username: string, password: string, org: string) => {
  const walletPath = await getWalletPath(org);
  const wallet = await Wallets.newFileSystemWallet(walletPath);

  const caURL = await getCaUrl(org, getCCP(org));
  const ca = new FabricCAServices(caURL);

  try {
    await ca.enroll({
      enrollmentID: username,
      enrollmentSecret: password,
      attr_reqs: [{ name: 'role', optional: false }],
    });
  } catch (err) {
    logger.error(err);
    throw new Error('login failed, please check again your credential');
  }

  const user = await wallet.get(username);
  if (!user) throw new Error('login failed, user not exist');

  const userDetail = await query(channelName, chaincodeName, [], 'GetUserInfo', username, org);
  const { msp_id: mspID, role } = userDetail.data;

  return composeSuccessResService({ org: mspID, role });
};

export { registerUser, loginUser };

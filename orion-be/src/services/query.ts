import { Gateway, Wallets } from 'fabric-network';
import { getCCP, getWalletPath } from '@src/utils/fabric';
import logger from '@src/utils/logger';

const query = async (
  channelName: string,
  chaincodeName: string,
  args: string[],
  fcn: string,
  username: string,
  orgName: string
) => {
  try {
    const wallet = await Wallets.newFileSystemWallet(getWalletPath(orgName));

    const identity = await wallet.get(username);
    if (!identity) throw new Error('an identity for specific username not exist in the wallet');

    const gateway = new Gateway();
    await gateway.connect(getCCP(orgName), {
      wallet,
      identity: username,
      discovery: { enabled: true, asLocalhost: true },
    });

    const network = await gateway.getNetwork(channelName);

    const contract = network.getContract(chaincodeName);
    const data = await contract.evaluateTransaction(fcn, ...args);
    const jsonData = JSON.parse(data.toString());

    return { success: true, data: jsonData };
  } catch (error) {
    logger.error(`Failed to execute query transaction: ${error}`);

    let message = '';
    if (error instanceof Error) message = error.message;

    return { success: false, data: message };
  }
};

export default query;

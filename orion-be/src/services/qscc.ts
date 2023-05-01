/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable import/prefer-default-export */
/* eslint-disable consistent-return */
import { Gateway, Wallets } from 'fabric-network';
import * as common from 'fabric-common';
import { getCCP, getWalletPath } from '@src/utils/fabric';
import logger from '@src/utils/logger';

const { BlockDecoder } = common as any;

export const qscc = async (
  channelName: string,
  chaincodeName: string,
  args: string[],
  fcn: string,
  username: string,
  orgName: string
) => {
  try {
    const ccp = getCCP(orgName);

    const walletPath = getWalletPath(orgName) || '';
    const wallet = await Wallets.newFileSystemWallet(walletPath);
    logger.info(`Wallet path: ${walletPath}`);

    // Check to see if we've already enrolled the user.
    const identity = await wallet.get(username);
    if (!identity) {
      logger.error(
        `An identity for the user ${username} does not exist in the wallet, please register user first`
      );

      return;
    }

    const gateway = new Gateway();
    await gateway.connect(ccp, {
      wallet,
      identity: username,
      discovery: { enabled: true, asLocalhost: true },
    });

    const network = await gateway.getNetwork(channelName);
    const contract = network.getContract(chaincodeName);

    let result;
    switch (fcn) {
      case 'GetBlockByNumber':
        result = await contract.evaluateTransaction(fcn, channelName, args[0]);
        result = BlockDecoder.decode(result);
        break;
      case 'GetTransactionByID':
        result = await contract.evaluateTransaction(fcn, channelName, args[0]);
        result = BlockDecoder.decodeTransaction(result);
        break;
      default:
        result = null;
        break;
    }

    return result;
  } catch (error) {
    logger.error(`Failed to evaluate transaction: ${error}`);

    let message = '';
    if (error instanceof Error) message = error.message;

    return message;
  }
};

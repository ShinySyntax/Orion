/* eslint-disable @typescript-eslint/no-explicit-any */
import { DefaultEventHandlerStrategies, Gateway, Wallets } from 'fabric-network';
import { getCCP, getWalletPath } from '@src/utils/fabric';
import logger from '@src/utils/logger';

const invoke = async (
  channelName: string,
  chaincodeName: string,
  fcn: string,
  args: string[],
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
      eventHandlerOptions: {
        commitTimeout: 100,
        strategy: DefaultEventHandlerStrategies.NETWORK_SCOPE_ALLFORTX,
      },
    });

    const network = await gateway.getNetwork(channelName);

    const contract = network.getContract(chaincodeName);
    await contract.submitTransaction(fcn, ...args);

    return { success: true, data: { message: 'finish invoke new transaction' } };
  } catch (error) {
    logger.error(`Failed to invoke transaction: ${error}`);

    let message = '';
    if (error instanceof Error) message = error.message;

    return { success: true, data: { message } };
  }
};

const invokePrivate = async (
  channelName: string,
  chaincodeName: string,
  fcn: string,
  transient: any,
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
      eventHandlerOptions: {
        commitTimeout: 100,
        strategy: DefaultEventHandlerStrategies.NETWORK_SCOPE_ALLFORTX,
      },
    });

    const network = await gateway.getNetwork(channelName);

    const contract = network.getContract(chaincodeName);

    const transientKey = transient.key;
    const transientData = transient.data;
    const transientDataBuffer = {
      [transientKey]: Buffer.from(JSON.stringify(transientData)),
    };
    await contract.createTransaction(fcn).setTransient(transientDataBuffer).submit();

    return { success: true, data: { message: 'finish invoke new private transaction' } };
  } catch (error) {
    logger.error(`Failed to invoke transaction: ${error}`);

    let message = '';
    if (error instanceof Error) message = error.message;

    return { success: true, data: { message } };
  }
};

export { invoke, invokePrivate };

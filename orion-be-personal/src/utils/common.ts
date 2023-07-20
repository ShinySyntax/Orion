import logger from './logger';

const composeErrorResService = (errMsg: string) => {
  logger.error(errMsg);

  return {
    isSuccess: false,
    data: {
      message: errMsg,
    },
  };
};

const composeSuccessResService = (data: object) => {
  return {
    isSuccess: true,
    data,
  };
};

export { composeErrorResService, composeSuccessResService };

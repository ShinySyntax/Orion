/* eslint-disable @typescript-eslint/no-explicit-any */
import jwt from 'jsonwebtoken';
import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import logger from '@src/utils/logger';
import query from '@src/services/query';
import { invoke, invokePrivate } from '@src/services/invoke';
import { apiV1, secret } from '@src/constants/constant';
import { loginUser, registerUser } from '@src/services/auth';
import {
  validInvokeChaincode,
  validInvokePrivateChaincode,
  validLogin,
  validQueryChaincode,
  validRegister,
} from '@src/routes/v1/schema';

const invokeChaincode = async (req: any, res: Response) => {
  const { error: validateParamsErr, value: reqParams } = validInvokeChaincode.params.validate(
    req.params
  );
  const { error: validateBodyErr, value: reqBody } = validInvokeChaincode.body.validate(req.body);

  if (validateParamsErr || validateBodyErr) {
    let errorMsg = '';
    if (validateParamsErr) {
      errorMsg += validateParamsErr.message;
      errorMsg += ' ';
    }
    if (validateBodyErr) {
      errorMsg += validateBodyErr.message;
      errorMsg += ' ';
    }

    return res.status(StatusCodes.BAD_REQUEST).json({
      apiV1,
      error: {
        code: StatusCodes.BAD_REQUEST,
        message: errorMsg,
      },
    });
  }

  const { fcn, args } = reqBody;
  const { channelName, chaincodeName } = reqParams;

  try {
    logger.info(`starting invoke function ${fcn} from chaincode ${chaincodeName}`);

    const resp = await invoke(channelName, chaincodeName, fcn, args, req.username, req.org);
    if (!resp.success) throw new Error(resp.data.message);

    logger.info(
      `finish invoke function ${fcn} from chaincode ${chaincodeName} with response ${resp}`
    );

    return res.status(StatusCodes.OK).json({ apiV1, data: resp.data });
  } catch (err) {
    logger.error(`error when invoke chaincode ${err}`);

    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      apiV1,
      error: {
        code: StatusCodes.INTERNAL_SERVER_ERROR,
        message: 'error invoke chaincode',
      },
    });
  }
};

const invokePrivateChaincode = async (req: any, res: Response) => {
  const { error: validateParamsErr, value: reqParams } =
    validInvokePrivateChaincode.params.validate(req.params);
  const { error: validateBodyErr, value: reqBody } = validInvokePrivateChaincode.body.validate(
    req.body
  );

  if (validateParamsErr || validateBodyErr) {
    let errorMsg = '';
    if (validateParamsErr) {
      errorMsg += validateParamsErr.message;
      errorMsg += ' ';
    }
    if (validateBodyErr) {
      errorMsg += validateBodyErr.message;
      errorMsg += ' ';
    }

    return res.status(StatusCodes.BAD_REQUEST).json({
      apiV1,
      error: {
        code: StatusCodes.BAD_REQUEST,
        message: errorMsg,
      },
    });
  }

  const { fcn, transient } = reqBody;
  const { channelName, chaincodeName } = reqParams;

  try {
    logger.info(`starting invoke function ${fcn} from chaincode ${chaincodeName}`);

    const resp = await invokePrivate(
      channelName,
      chaincodeName,
      fcn,
      transient,
      req.username,
      req.org
    );
    if (!resp.success) throw new Error(resp.data.message);

    logger.info(
      `finish invoke function ${fcn} from chaincode ${chaincodeName} with response ${resp}`
    );

    return res.status(StatusCodes.OK).json({ apiV1, data: resp.data });
  } catch (err) {
    logger.error(`error when invoke chaincode ${err}`);

    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      apiV1,
      error: {
        code: StatusCodes.INTERNAL_SERVER_ERROR,
        message: 'error invoke chaincode',
      },
    });
  }
};

const queryChaincode = async (req: any, res: Response) => {
  const { error: validateParamsErr, value: reqParams } = validQueryChaincode.params.validate(
    req.params
  );

  const { error: validateQueryErr, value: reqQuery } = validQueryChaincode.query.validate(
    req.query
  );

  if (validateParamsErr || validateQueryErr) {
    let errorMsg = '';
    if (validateParamsErr) {
      errorMsg += validateParamsErr.message;
      errorMsg += ' ';
    }
    if (validateQueryErr) {
      errorMsg += validateQueryErr.message;
      errorMsg += ' ';
    }

    return res.status(StatusCodes.BAD_REQUEST).json({
      apiV1,
      error: {
        code: StatusCodes.BAD_REQUEST,
        message: errorMsg,
      },
    });
  }

  const { fcn, args } = reqQuery;
  const { channelName, chaincodeName } = reqParams;

  try {
    logger.info(`starting query function ${fcn} from chaincode ${chaincodeName}`);

    const resp = await query(
      channelName,
      chaincodeName,
      JSON.parse(args),
      fcn,
      req.username,
      req.org
    );
    if (!resp.success) throw new Error(resp.data);

    logger.info(
      `finish query function ${fcn} from chaincode ${chaincodeName} with response ${resp}`
    );

    return res.status(StatusCodes.OK).json({ apiV1, data: resp.data });
  } catch (err) {
    logger.error(`error when query chaincode ${err}`);

    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      apiV1,
      error: {
        code: StatusCodes.INTERNAL_SERVER_ERROR,
        message: 'error query chaincode',
      },
    });
  }
};

const register = async (req: any, res: Response) => {
  try {
    const { error: validateBodyErr, value: reqBody } = validRegister.body.validate(req.body);
    if (validateBodyErr)
      return res.status(StatusCodes.BAD_REQUEST).json({
        apiV1,
        error: {
          code: StatusCodes.BAD_REQUEST,
          message: validateBodyErr.message,
        },
      });

    try {
      const { username, org } = reqBody;

      if (req.role !== 'admin' || req.org !== org)
        return res.status(StatusCodes.FORBIDDEN).json({
          apiV1,
          error: {
            code: StatusCodes.FORBIDDEN,
            message: 'not eligible to register new user',
          },
        });

      const resp = await registerUser(username, org);

      return res.status(StatusCodes.OK).json({ apiV1, data: resp.data });
    } catch (err) {
      logger.error(err);

      return res.status(StatusCodes.UNAUTHORIZED).json({
        apiV1,
        error: {
          code: StatusCodes.UNAUTHORIZED,
          message: 'failed to login',
        },
      });
    }
  } catch (err) {
    logger.error(err);

    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      apiV1,
      error: {
        code: StatusCodes.INTERNAL_SERVER_ERROR,
        message: 'internal server error',
      },
    });
  }
};

const login = async (req: Request, res: Response) => {
  try {
    const { error: validateBodyErr, value: reqBody } = validLogin.body.validate(req.body);
    if (validateBodyErr)
      return res.status(StatusCodes.BAD_REQUEST).json({
        apiV1,
        error: {
          code: StatusCodes.BAD_REQUEST,
          message: validateBodyErr.message,
        },
      });

    try {
      const { username, password, org } = reqBody;

      const resp: any = await loginUser(username, password, org);

      const token = jwt.sign(
        {
          username,
          org,
          role: resp.data.role,
        },
        secret,
        { expiresIn: '24h' }
      );

      return res.status(StatusCodes.OK).json({ apiV1, data: { ...resp.data, token } });
    } catch (err) {
      logger.error(err);

      return res.status(StatusCodes.UNAUTHORIZED).json({
        apiV1,
        error: {
          code: StatusCodes.UNAUTHORIZED,
          message: 'failed to login',
        },
      });
    }
  } catch (err) {
    logger.error(err);

    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      apiV1,
      error: {
        code: StatusCodes.INTERNAL_SERVER_ERROR,
        message: 'internal server error',
      },
    });
  }
};

const getUserCurrent = (req: any, res: Response) => {
  const { username, role, org } = req;

  return res.status(StatusCodes.OK).json({
    apiV1,
    data: {
      username,
      role,
      org,
    },
  });
};

export { invokeChaincode, invokePrivateChaincode, queryChaincode, login, register, getUserCurrent };

import Joi from 'joi';

const validInvokeChaincode = {
  params: Joi.object({
    channelName: Joi.string().required(),
    chaincodeName: Joi.string().required(),
  }),
  body: Joi.object({
    fcn: Joi.string().required(),
    args: Joi.array().items(Joi.string()).required(),
  }),
};

const validInvokePrivateChaincode = {
  params: Joi.object({
    channelName: Joi.string().required(),
    chaincodeName: Joi.string().required(),
  }),
  body: Joi.object({
    fcn: Joi.string().required(),
    transient: Joi.any(),
  }),
};

const validQueryChaincode = {
  params: Joi.object({
    channelName: Joi.string().required(),
    chaincodeName: Joi.string().required(),
  }),
  query: Joi.object({
    fcn: Joi.string().required(),
    args: Joi.string().required(),
  }),
};

const validQueryQscc = {
  params: Joi.object({
    channelName: Joi.string().required(),
    chaincodeName: Joi.string().required(),
  }),
  query: Joi.object({
    fcn: Joi.string().required(),
    args: Joi.array().items(Joi.string()).required(),
  }),
};

const validRegister = {
  body: Joi.object({
    username: Joi.string().required(),
    org: Joi.string().required(),
  }),
};

const validLogin = {
  body: Joi.object({
    username: Joi.string().required(),
    password: Joi.string().required(),
    org: Joi.string().required(),
  }),
};

export {
  validInvokeChaincode,
  validInvokePrivateChaincode,
  validQueryChaincode,
  validQueryQscc,
  validLogin,
  validRegister,
};

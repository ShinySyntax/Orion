import { Router } from 'express';
import {
  queryChaincode,
  invokeChaincode,
  login,
  register,
  getUserCurrent,
  invokePrivateChaincode,
} from '@src/controllers';

const r = Router();

r.post('/channels/:channelName/chaincodes/:chaincodeName/private', invokePrivateChaincode);
r.get('/channels/:channelName/chaincodes/:chaincodeName', queryChaincode);
r.post('/channels/:channelName/chaincodes/:chaincodeName', invokeChaincode);

r.post('/users/login', login);
r.get('/users/current', getUserCurrent);
r.post('/users/register', register);

export default r;

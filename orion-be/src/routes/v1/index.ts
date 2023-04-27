import { Router } from 'express';
import endpoints from '@src/routes/v1/endpoint';

const router = Router();

router.use('/', endpoints);

export default router;

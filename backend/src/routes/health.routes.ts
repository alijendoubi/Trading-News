import { Router, Request, Response } from 'express';
import { HttpResponse } from '../utils/http-response.js';

const router = Router();

router.get('/', (req: Request, res: Response) => {
  HttpResponse.success(res, { status: 'ok', timestamp: new Date().toISOString() });
});

export default router;

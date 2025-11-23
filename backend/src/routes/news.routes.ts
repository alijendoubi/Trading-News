import { Router, Request, Response } from 'express';
import { mockNews } from '../services/mock-data.service.js';
import { HttpResponse } from '../utils/http-response.js';

const router = Router();

router.get('/', (req: Request, res: Response) => {
  const page = Math.max(1, parseInt(req.query.page as string) || 1);
  const pageSize = Math.min(100, parseInt(req.query.pageSize as string) || 20);
  const offset = (page - 1) * pageSize;
  const filtered = mockNews.slice(offset, offset + pageSize);
  HttpResponse.paginated(res, filtered, mockNews.length, page, pageSize);
});

export default router;

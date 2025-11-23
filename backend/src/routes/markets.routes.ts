import { Router, Request, Response } from 'express';
import { mockAssets } from '../services/mock-data.service.js';
import { HttpResponse } from '../utils/http-response.js';

const router = Router();

router.get('/assets', (req: Request, res: Response) => {
  const page = Math.max(1, parseInt(req.query.page as string) || 1);
  const pageSize = Math.min(100, parseInt(req.query.pageSize as string) || 20);
  const offset = (page - 1) * pageSize;
  const filtered = mockAssets.slice(offset, offset + pageSize);
  HttpResponse.paginated(res, filtered, mockAssets.length, page, pageSize);
});

router.get('/search', (req: Request, res: Response) => {
  const query = (req.query.q as string || '').toLowerCase();
  const results = mockAssets.filter(a => a.symbol.toLowerCase().includes(query) || a.name.toLowerCase().includes(query));
  HttpResponse.success(res, results);
});

export default router;

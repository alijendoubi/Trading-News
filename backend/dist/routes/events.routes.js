import { Router } from 'express';
import { mockEvents } from '../services/mock-data.service.js';
import { HttpResponse } from '../utils/http-response.js';
const router = Router();
router.get('/', (req, res) => {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const pageSize = Math.min(100, parseInt(req.query.pageSize) || 20);
    const offset = (page - 1) * pageSize;
    const filtered = mockEvents.slice(offset, offset + pageSize);
    HttpResponse.paginated(res, filtered, mockEvents.length, page, pageSize);
});
router.get('/:id', (req, res) => {
    const event = mockEvents.find(e => e.id === req.params.id);
    if (!event) {
        HttpResponse.notFound(res);
        return;
    }
    HttpResponse.success(res, event);
});
router.get('/country/:country', (req, res) => {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const pageSize = Math.min(100, parseInt(req.query.pageSize) || 20);
    const offset = (page - 1) * pageSize;
    const filtered = mockEvents.filter(e => e.country === req.params.country).slice(offset, offset + pageSize);
    const total = mockEvents.filter(e => e.country === req.params.country).length;
    HttpResponse.paginated(res, filtered, total, page, pageSize);
});
export default router;
//# sourceMappingURL=events.routes.js.map
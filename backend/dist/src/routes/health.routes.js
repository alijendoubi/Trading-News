import { Router } from 'express';
import { HttpResponse } from '../utils/http-response.js';
const router = Router();
router.get('/', (req, res) => {
    HttpResponse.success(res, { status: 'ok', timestamp: new Date().toISOString() });
});
export default router;
//# sourceMappingURL=health.routes.js.map
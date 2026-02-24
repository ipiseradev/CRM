import { Router } from 'express';
import { metricsController } from '../controllers/metrics.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { tenantGuard } from '../middlewares/tenant.guard';

const router = Router();

// All routes require auth + tenant
router.use(authMiddleware, tenantGuard);

router.get('/summary', metricsController.getSummary);

export default router;

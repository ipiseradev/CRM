import { Router } from 'express';
import { dealsController } from '../controllers/deals.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { tenantGuard } from '../middlewares/tenant.guard';
import { validateBody } from '../middlewares/validate.middleware';
import { CreateDealSchema, UpdateDealSchema, UpdateDealStageSchema } from '@salescore/shared';

const router = Router();

// All routes require auth + tenant
router.use(authMiddleware, tenantGuard);

router.get('/', dealsController.getAll);
router.get('/kanban', dealsController.getKanban);
router.get('/:id', dealsController.getById);
router.post('/', validateBody(CreateDealSchema), dealsController.create);
router.patch('/:id', validateBody(UpdateDealSchema), dealsController.update);
router.patch('/:id/stage', validateBody(UpdateDealStageSchema), dealsController.updateStage);
router.delete('/:id', dealsController.delete);

export default router;

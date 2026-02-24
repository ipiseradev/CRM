import { Router } from 'express';
import { activitiesController } from '../controllers/activities.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { tenantGuard } from '../middlewares/tenant.guard';
import { validateBody } from '../middlewares/validate.middleware';
import { CreateActivitySchema } from '@salescore/shared';

const router = Router();

// All routes require auth + tenant
router.use(authMiddleware, tenantGuard);

router.get('/', activitiesController.getAll);
router.get('/:id', activitiesController.getById);
router.post('/', validateBody(CreateActivitySchema), activitiesController.create);
router.delete('/:id', activitiesController.delete);

export default router;

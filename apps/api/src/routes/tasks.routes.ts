import { Router } from 'express';
import { tasksController } from '../controllers/tasks.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { tenantGuard } from '../middlewares/tenant.guard';
import { validateBody } from '../middlewares/validate.middleware';
import { CreateTaskSchema, UpdateTaskSchema } from '@salescore/shared';

const router = Router();

// All routes require auth + tenant
router.use(authMiddleware, tenantGuard);

router.get('/', tasksController.getAll);
router.get('/:id', tasksController.getById);
router.post('/', validateBody(CreateTaskSchema), tasksController.create);
router.patch('/:id', validateBody(UpdateTaskSchema), tasksController.update);
router.patch('/:id/done', tasksController.markDone);
router.delete('/:id', tasksController.delete);

export default router;

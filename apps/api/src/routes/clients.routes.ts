import { Router } from 'express';
import { clientsController } from '../controllers/clients.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { tenantGuard } from '../middlewares/tenant.guard';
import { validateBody } from '../middlewares/validate.middleware';
import { CreateClientSchema, UpdateClientSchema } from '@salescore/shared';

const router = Router();

// All routes require auth + tenant
router.use(authMiddleware, tenantGuard);

router.get('/', clientsController.getAll);
router.get('/:id', clientsController.getById);
router.post('/', validateBody(CreateClientSchema), clientsController.create);
router.patch('/:id', validateBody(UpdateClientSchema), clientsController.update);
router.delete('/:id', clientsController.delete);

export default router;

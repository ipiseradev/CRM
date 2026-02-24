import { Router } from 'express';
import { authController } from '../controllers/auth.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { tenantGuard } from '../middlewares/tenant.guard';
import { validateBody } from '../middlewares/validate.middleware';
import { RegisterSchema, LoginSchema, RefreshTokenSchema } from '@salescore/shared';

const router = Router();

// Public routes
router.post('/register', validateBody(RegisterSchema), authController.register);
router.post('/login', validateBody(LoginSchema), authController.login);
router.post('/refresh', validateBody(RefreshTokenSchema), authController.refresh);
router.post('/logout', authController.logout);

// Protected routes
router.get('/me', authMiddleware, tenantGuard, authController.me);
router.patch('/branding', authMiddleware, tenantGuard, authController.updateBranding);

export default router;

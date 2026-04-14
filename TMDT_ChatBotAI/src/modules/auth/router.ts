import { Router } from 'express';
import { AuthController } from './controllers/auth.controller';
import { authenticate } from '../../common/middlewares/authenticate';

const router = Router();
const authController = new AuthController();

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/refresh', authController.refresh);
router.post('/logout', authenticate, authController.logout);

export default router;

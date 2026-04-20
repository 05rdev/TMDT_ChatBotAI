import { Router } from 'express';
import { NotificationController } from './controllers/notification.controller';
import { authenticate } from '../../middlewares/authenticate';
import { authorize } from '../../middlewares/authorize';

const router = Router();
const notificationController = new NotificationController();

// User routes
router.use(authenticate);
router.get('/', notificationController.getMyNotifications);
router.put('/read-all', notificationController.markAllAsRead);
router.put('/:id/read', notificationController.markAsRead);

// Admin routes
router.post('/send', authorize(['ADMIN']), notificationController.sendToUser);
router.post('/broadcast', authorize(['ADMIN']), notificationController.broadcast);

export default router;

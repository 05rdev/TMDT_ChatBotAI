import { Router } from 'express';
import { NotificationController } from './controllers/notification.controller';
import { authenticate } from '../../middlewares/authenticate';
import { authorize } from '../../middlewares/authorize';

const router = Router();
const notificationController = new NotificationController();

// User routes
router.use(authenticate);
router.get('/', notificationController.getMyNotifications as any);
router.get('/:userId', notificationController.getMyNotifications as any);
router.put('/read-all', notificationController.markAllAsRead as any);
router.put('/:id/read', notificationController.markAsRead as any);
router.delete('/:id', notificationController.deleteNotification as any);

// Admin routes
router.post('/send', authorize(['ADMIN']), notificationController.sendToUser as any);
router.post('/broadcast', authorize(['ADMIN']), notificationController.broadcast as any);
router.get('/admin/all', authorize(['ADMIN']), notificationController.getAllForAdmin as any);
router.delete('/admin/:id', authorize(['ADMIN']), notificationController.deleteGlobalNotification as any);

export default router;

import { Router } from 'express';
import { register, login, getProfile } from './user.controller';
import { authenticate } from '@middlewares/auth.middleware';

export const userRouter = Router();

userRouter.post('/register', register);
userRouter.post('/login', login);
userRouter.get('/profile', authenticate, getProfile);

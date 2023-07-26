import express from 'express';
import authRoutes from './authRoutes';
import userRoutes from './userRoutes';
import { customError, notFound } from '../helpers/errorHandler';

const router = express.Router();

router.use('/users', userRoutes);
router.use(notFound);
router.use(customError);

export default router;

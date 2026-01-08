import { Router } from 'express';
import clientsRouter from './clients.js';
import policiesRouter from './policies.js';
import activitiesRouter from './activities.js';
import documentsRouter from './documents.js';
import dashboardRouter from './dashboard.js';

const router = Router();

// Mount routes
router.use('/clients', clientsRouter);
router.use('/policies', policiesRouter);
router.use('/activities', activitiesRouter);
router.use('/documents', documentsRouter);
router.use('/dashboard', dashboardRouter);

export default router;

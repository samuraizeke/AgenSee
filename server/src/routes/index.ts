import { Router } from 'express';
import clientsRouter from './clients.js';
import policiesRouter from './policies.js';
import activitiesRouter from './activities.js';
import documentsRouter from './documents.js';
import dashboardRouter from './dashboard.js';
import searchRouter from './search.js';
import notesRouter from './notes.js';

const router = Router();

// Mount routes
router.use('/clients', clientsRouter);
router.use('/policies', policiesRouter);
router.use('/activities', activitiesRouter);
router.use('/documents', documentsRouter);
router.use('/dashboard', dashboardRouter);
router.use('/search', searchRouter);
router.use('/notes', notesRouter);

export default router;

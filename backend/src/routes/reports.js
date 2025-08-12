
import express from 'express';
import * as reportsController from '../controllers/reports.controller.js';
import { protect } from '../middleware/admin.auth.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

router.get('/leads', reportsController.getLeadsReport);
router.get('/activities', reportsController.getActivitiesReport);
router.get('/performance', reportsController.getPerformanceReport);
router.get('/export', reportsController.exportReport);

export default router;

import { Router } from 'express';
import { AlertsController } from '../controllers/alerts.controller.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

// All alert routes require authentication
router.use(authenticate);

/**
 * @route   GET /api/alerts
 * @desc    Get user's alerts
 * @access  Private
 */
router.get('/', AlertsController.getAlerts);

/**
 * @route   POST /api/alerts
 * @desc    Create new alert
 * @access  Private
 */
router.post('/', AlertsController.createAlert);

/**
 * @route   PUT /api/alerts/:id
 * @desc    Update alert
 * @access  Private
 */
router.put('/:id', AlertsController.updateAlert);

/**
 * @route   DELETE /api/alerts/:id
 * @desc    Delete alert
 * @access  Private
 */
router.delete('/:id', AlertsController.deleteAlert);

export default router;

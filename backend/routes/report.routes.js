import express from 'express';
import { reportRoute } from '../controllers/reportController.js';

const router = express.Router();

router.post('/report-issue', reportRoute)

export default router;
import Router from 'express';
import { createAdmin, getMe, loginAdmin } from '../controllers/admins';
import { authorize, protectAdmin } from '../middlewares/authHandler';

const router = Router();

router
  .get('/me', protectAdmin, getMe)
  .post('/', protectAdmin, authorize('SUPERADMIN'), createAdmin);

router.post('/login', loginAdmin);

export default router;

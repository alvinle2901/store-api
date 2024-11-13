import Router from 'express';
import {
  changePassword,
  createAdmin,
  deleteAdmin,
  getAdmin,
  getAdmins,
  getMe,
  loginAdmin,
  updateAdmin,
  updateAdminSelf
} from '../controllers/admins';
import { authorize, adminOnly } from '../middlewares/authHandler';

const router = Router();

router
  .get('/', adminOnly, authorize('SUPERADMIN'), getAdmins)
  .post('/', adminOnly, authorize('SUPERADMIN'), createAdmin)
  .put('/', adminOnly, updateAdminSelf)
  .get('/me', adminOnly, getMe)
  .post('/login', loginAdmin)
  .put('/change-password', adminOnly, changePassword);

router
  .get('/:id', adminOnly, authorize('SUPERADMIN'), getAdmin)
  .put('/:id', adminOnly, authorize('SUPERADMIN'), updateAdmin)
  .delete('/:id', adminOnly, authorize('SUPERADMIN'), deleteAdmin);

export default router;

import { Router } from 'express';
import {
  changePassword,
  loginCustomer,
  registerCustomer,
  updateCustomerSelf
} from '../controllers/auth';
import { protect } from '../middlewares/authHandler';

const router = Router();

router
  .get('/getMe', protect, (req, res) => {
    res.json({ msg: 'Hello World' });
  })
  .post('/register', registerCustomer)
  .post('/login', loginCustomer)
  .put('/update-details', protect, updateCustomerSelf)
  .put('/change-password', protect, changePassword)
  .post('/forgot-password')
  .post('/reset-password/:resettoken');

export default router;

import express from 'express';
import {
  register,
  refresh,
  logout,
  login,
  sendResetEmailController,
  resetPwd,
} from '../controllers/auth.js';
import { validateBody } from '../middlewares/validateBody.js';
import {
  loginSchema,
  registerSchema,
  resetPwdSchema,
  sendResetEmailSchema,
} from '../schemas/authSchemas.js';
import { ctrlWrapper } from '../utils/ctrlWrapper.js';
import cookieParser from 'cookie-parser';

const router = express.Router();

router.post(
  '/send-reset-email',
  validateBody(sendResetEmailSchema),
  ctrlWrapper(sendResetEmailController),
);

router.use(cookieParser());

router.post('/register', validateBody(registerSchema), ctrlWrapper(register));
router.post('/login', validateBody(loginSchema), ctrlWrapper(login));
router.post('/refresh', ctrlWrapper(refresh));
router.post('/logout', ctrlWrapper(logout));
router.post('/reset-pwd', validateBody(resetPwdSchema), ctrlWrapper(resetPwd));

export default router;

import express from 'express';
import { register, refresh, logout } from '../controllers/auth.js';
import { validateBody } from '../middlewares/validateBody.js';
import { registerSchema } from '../schemas/authSchemas.js';
import { ctrlWrapper } from '../utils/ctrlWrapper.js';
import cookieParser from 'cookie-parser';

const router = express.Router();

router.use(cookieParser());

router.post('/register', validateBody(registerSchema), ctrlWrapper(register));
router.post('/refresh', ctrlWrapper(refresh));
router.post('/logout', ctrlWrapper(logout));

export default router;

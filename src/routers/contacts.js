import express from 'express';
import {
  getAllContacts,
  getContact,
  createContact,
  patchContact,
  removeContact,
} from '../controllers/contacts.js';
import { ctrlWrapper } from '../utils/ctrlWrapper.js';

const router = express.Router();

router.get('/', ctrlWrapper(getAllContacts));
router.get('/:contactId', ctrlWrapper(getContact));
router.post('/', ctrlWrapper(createContact));
router.patch('/:contactId', ctrlWrapper(patchContact));
router.delete('/:contactId', ctrlWrapper(removeContact));

export default router;

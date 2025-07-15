import createError from 'http-errors';
import {
  getContactsPaginated,
  getContactById,
  addContact,
  updateContactById,
  deleteContactById,
} from '../services/contacts.js';

export const getAllContacts = async (req, res, next) => {
  const userId = req.user._id;
  const page = parseInt(req.query.page) > 0 ? parseInt(req.query.page) : 1;
  const perPage =
    parseInt(req.query.perPage) > 0 ? parseInt(req.query.perPage) : 10;
  const sortBy = req.query.sortBy || 'name';
  const sortOrder = req.query.sortOrder === 'desc' ? 'desc' : 'asc';

  const { contacts, totalItems } = await getContactsPaginated(
    userId,
    page,
    perPage,
    sortBy,
    sortOrder,
  );

  const totalPages = Math.ceil(totalItems / perPage);
  const hasPreviousPage = page > 1;
  const hasNextPage = page < totalPages;

  res.json({
    status: 200,
    message: 'Successfully found contacts!',
    data: {
      data: contacts,
      page,
      perPage,
      totalItems,
      totalPages,
      hasPreviousPage,
      hasNextPage,
    },
  });
};

export const getContact = async (req, res, next) => {
  const userId = req.user._id;
  const { contactId } = req.params;
  const contactData = await getContactById(userId, contactId);

  if (!contactData) throw createError(404, 'Contact not found');

  const obj = contactData.toObject ? contactData.toObject() : contactData;
  res.json({
    status: 200,
    message: `Successfully found contact with id ${contactId}!`,
    contactData: obj,
  });
};

export const createContact = async (req, res, next) => {
  const userId = req.user._id;
  const { name, phoneNumber, contactType } = req.body;
  if (!name || !phoneNumber || !contactType) {
    throw createError(400, 'name, phoneNumber and contactType are required');
  }
  const newContact = await addContact(req.body);
  const obj = newContact.toObject ? newContact.toObject() : newContact;
  res.status(201).json({
    status: 201,
    message: 'Successfully created a contact!',
    data: obj,
  });
};

export const patchContact = async (req, res, next) => {
  const userId = req.user._id;
  const { contactId } = req.params;
  const updatedContact = await updateContactById(userId, contactId, req.body);

  if (!updatedContact) throw createError(404, 'Contact not found');
  if (!updatedContact) throw createError(404, 'Contact not found');

  const obj = updatedContact.toObject
    ? updatedContact.toObject()
    : updatedContact;
  res.json({
    status: 200,
    message: 'Successfully patched a contact!',
    data: obj,
  });
};

export const removeContact = async (req, res, next) => {
  const userId = req.user._id;
  const { contactId } = req.params;
  const deletedContact = await deleteContactById(userId, contactId);

  if (!deletedContact) throw createError(404, 'Contact not found');
  if (!deletedContact) throw createError(404, 'Contact not found');

  res.status(204).send();
};

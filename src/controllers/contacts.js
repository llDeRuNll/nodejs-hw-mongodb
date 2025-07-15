import createError from 'http-errors';
import {
  getContacts,
  getContactById,
  addContact,
  updateContactById,
  deleteContactById,
} from '../services/contacts.js';

export const getAllContacts = async (req, res, next) => {
  const contactsArr = await getContacts();
  const contactsData = contactsArr.map((contact) => {
    const obj = contact.toObject ? contact.toObject() : contact;
    return obj;
  });
  res.json({
    status: 200,
    message: 'Successfully found contacts!',
    contactsData,
  });
};

export const getContact = async (req, res, next) => {
  const { contactId } = req.params;
  const contactData = await getContactById(contactId);

  if (!contactData) throw createError(404, 'Contact not found');

  const obj = contactData.toObject ? contactData.toObject() : contactData;
  res.json({
    status: 200,
    message: `Successfully found contact with id ${contactId}!`,
    contactData: obj,
  });
};

export const createContact = async (req, res, next) => {
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
  const { contactId } = req.params;
  const updatedContact = await updateContactById(contactId, req.body);

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
  const { contactId } = req.params;
  const deletedContact = await deleteContactById(contactId);

  if (!deletedContact) throw createError(404, 'Contact not found');

  res.status(204).send();
};

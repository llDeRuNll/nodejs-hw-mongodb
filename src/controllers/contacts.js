import createError from 'http-errors';
import cloudinary from '../utils/cloudinary.js';
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
  const { name, phoneNumber, contactType } = req.body;
  if (!name || !phoneNumber || !contactType) {
    throw createError(400, 'name, phoneNumber and contactType are required');
  }

  let photoUrl = null;
  if (req.file) {
    const uploadResult = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: 'contacts' },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        },
      );
      stream.end(req.file.buffer);
    });
    photoUrl = uploadResult.secure_url;
  }

  const newContact = await addContact({
    ...req.body,
    photo: photoUrl,
    userId: req.user._id,
  });

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

  let photoUrl;
  if (req.file) {
    const uploadResult = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: 'contacts' },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        },
      );
      stream.end(req.file.buffer);
    });
    photoUrl = uploadResult.secure_url;
  }

  const update = { ...req.body };
  if (photoUrl) update.photo = photoUrl;

  const updatedContact = await updateContactById(userId, contactId, update);
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
  res.status(204).send();
};

import ContactCollection from '../db/models/Contacts.js';

export const getContacts = () => ContactCollection.find();

export const getContactById = (id) => ContactCollection.findById(id);

export const addContact = (payload) => ContactCollection.create(payload);

export const updateContactById = (id, payload) =>
  ContactCollection.findByIdAndUpdate(id, payload, { new: true });

export const deleteContactById = (id) =>
  ContactCollection.findByIdAndDelete(id);

import ContactCollection from '../db/models/Contacts.js';

export const getContacts = () => ContactCollection.find();

export const getContactById = (id) => ContactCollection.findById(id);

export const addContact = (payload) => ContactCollection.create(payload);

export const updateContactById = (id, payload) =>
  ContactCollection.findByIdAndUpdate(id, payload, { new: true });

export const deleteContactById = (id) =>
  ContactCollection.findByIdAndDelete(id);

export const getContactsPaginated = async (
  page = 1,
  perPage = 10,
  sortBy = 'name',
  sortOrder = 'asc',
) => {
  const skip = (page - 1) * perPage;

  const allowedSortFields = ['name'];
  const field = allowedSortFields.includes(sortBy) ? sortBy : 'name';

  const order = sortOrder === 'desc' ? -1 : 1;
  const sort = { [field]: order };

  const [contacts, totalItems] = await Promise.all([
    ContactCollection.find().sort(sort).skip(skip).limit(perPage),
    ContactCollection.countDocuments(),
  ]);
  return { contacts, totalItems };
};

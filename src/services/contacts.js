import ContactCollection from '../db/models/Contacts.js';

export const getContactsPaginated = async (
  userId,
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

  const filter = { userId };

  const [contacts, totalItems] = await Promise.all([
    ContactCollection.find(filter).sort(sort).skip(skip).limit(perPage),
    ContactCollection.countDocuments(filter),
  ]);
  return { contacts, totalItems };
};

export const getContacts = (userId) => ContactCollection.find({ userId });

export const getContactById = (userId, id) =>
  ContactCollection.findOne({ _id: id, userId });

export const addContact = (payload) => ContactCollection.create(payload);

export const updateContactById = (userId, id, payload) =>
  ContactCollection.findOneAndUpdate({ _id: id, userId }, payload, {
    new: true,
  });

export const deleteContactById = (userId, id) =>
  ContactCollection.findOneAndDelete({ _id: id, userId });

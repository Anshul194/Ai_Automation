import Role from '../models/Role.js';

export const createRole = async (data) => {
  const role = new Role(data);
  return await role.save();
};

export const getRoles = async () => {
  return await Role.find();
};

export const getRoleById = async (id) => {
  return await Role.findById(id);
};

export const updateRole = async (id, data) => {
  return await Role.findByIdAndUpdate(id, data, { new: true, runValidators: true });
};

export const deleteRole = async (id) => {
  return await Role.findByIdAndDelete(id);
};

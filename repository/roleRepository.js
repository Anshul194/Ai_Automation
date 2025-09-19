import Role from '../models/Role.js';

export const create = async (data) => new Role(data).save();
export const findAll = async () => Role.find();
export const findById = async (id) => Role.findById(id);
export const update = async (id, data) => Role.findByIdAndUpdate(id, data, { new: true, runValidators: true });
export const remove = async (id) => Role.findByIdAndDelete(id);

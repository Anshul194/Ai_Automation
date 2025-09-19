import Short from '../models/short.js';

export default class ShortRepository {
  async create(data) {
    if (!data) {
      throw new Error('Short data is required');
    }

    try {
      return await Short.create(data);
    } catch (err) {
      if (err.code === 11000) {
        throw new Error('Short creation failed due to duplicate key');
      }
      throw new Error(`Failed to create short: ${err.message}`);
    }
  }

  async findBy(filter = {}) {
    try {
      return await Short.findOne(filter).populate('category', 'name');
    } catch (err) {
      throw new Error(`Failed to find short: ${err.message}`);
    }
  }

  async findMany(filter = {}, sort = { createdAt: -1 }, skip = 0, limit = 10) {
    try {
      const safeSkip = Math.max(0, parseInt(skip) || 0);
      const safeLimit = Math.min(100, Math.max(1, parseInt(limit) || 10));

      return await Short.find(filter)
        .sort(sort)
        .skip(safeSkip)
        .limit(safeLimit)
        .populate('category', 'name');
    } catch (err) {
      throw new Error(`Failed to get shorts: ${err.message}`);
    }
  }

  async count(filter = {}) {
    try {
      return await Short.countDocuments(filter);
    } catch (err) {
      throw new Error(`Failed to count shorts: ${err.message}`);
    }
  }

  async updateById(id, data) {
    if (!id) {
      throw new Error('Short ID is required');
    }

    if (!data || Object.keys(data).length === 0) {
      throw new Error('Update data is required');
    }

    try {
      const { _id, __v, createdAt, ...updateData } = data;

      const short = await Short.findByIdAndUpdate(id, updateData, {
        new: true,
        runValidators: true,
      }).populate('category', 'name');

      if (!short) {
        throw new Error('Short not found');
      }

      return short;
    } catch (err) {
      if (err.name === 'CastError') {
        throw new Error('Invalid short ID format');
      }
      if (err.name === 'ValidationError') {
        throw new Error('Validation failed: ' + Object.values(err.errors).map(e => e.message).join(', '));
      }
      throw new Error(`Failed to update short: ${err.message}`);
    }
  }

  async findById(id) {
    if (!id) {
      throw new Error('Short ID is required');
    }

    try {
      const short = await Short.findById(id).populate('category', 'name');

      if (!short) {
        throw new Error('Short not found');
      }

      return short;
    } catch (err) {
      if (err.name === 'CastError') {
        throw new Error('Invalid short ID format');
      }
      throw new Error(`Failed to find short by id: ${err.message}`);
    }
  }

  async deleteById(id) {
    if (!id) {
      throw new Error('Short ID is required');
    }

    try {
      const short = await Short.findByIdAndDelete(id);

      if (!short) {
        throw new Error('Short not found');
      }

      return short;
    } catch (err) {
      if (err.name === 'CastError') {
        throw new Error('Invalid short ID format');
      }
      throw new Error(`Failed to delete short: ${err.message}`);
    }
  }
}
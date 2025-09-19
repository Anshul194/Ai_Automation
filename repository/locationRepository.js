import Location from '../models/location.js';

export default class LocationRepository {
  async create(data) {
    if (!data) {
      throw new Error('Location data is required');
    }

    try {
      return await Location.create(data);
    } catch (err) {
      if (err.code === 11000) {
        throw new Error('Location with this name and country already exists');
      }
      throw new Error(`Failed to create location: ${err.message}`);
    }
  }

  async findBy(filter = {}) {
    try {
      return await Location.findOne(filter);
    } catch (err) {
      throw new Error(`Failed to find location: ${err.message}`);
    }
  }

  async findMany(filter = {}, sort = { createdAt: -1 }, skip = 0, limit = 10) {
    try {
      const safeSkip = Math.max(0, parseInt(skip) || 0);
      const safeLimit = Math.min(100, Math.max(1, parseInt(limit) || 10));

      return await Location.find(filter)
        .sort(sort)
        .skip(safeSkip)
        .limit(safeLimit);
    } catch (err) {
      throw new Error(`Failed to get locations: ${err.message}`);
    }
  }

  async count(filter = {}) {
    try {
      return await Location.countDocuments(filter);
    } catch (err) {
      throw new Error(`Failed to count locations: ${err.message}`);
    }
  }

  async updateById(id, data) {
    if (!id) {
      throw new Error('Location ID is required');
    }

    if (!data || Object.keys(data).length === 0) {
      throw new Error('Update data is required');
    }

    try {
      const { _id, __v, createdAt, ...updateData } = data;

      const location = await Location.findByIdAndUpdate(id, updateData, {
        new: true,
        runValidators: true,
      });

      if (!location) {
        throw new Error('Location not found');
      }

      return location;
    } catch (err) {
      if (err.name === 'CastError') {
        throw new Error('Invalid location ID format');
      }
      throw new Error(`Failed to update location: ${err.message}`);
    }
  }

  async findById(id) {
    if (!id) {
      throw new Error('Location ID is required');
    }

    try {
      const location = await Location.findById(id);

      if (!location) {
        throw new Error('Location not found');
      }

      return location;
    } catch (err) {
      if (err.name === 'CastError') {
        throw new Error('Invalid location ID format');
      }
      throw new Error(`Failed to find location by id: ${err.message}`);
    }
  }

  async deleteById(id) {
    if (!id) {
      throw new Error('Location ID is required');
    }

    try {
      const location = await Location.findByIdAndDelete(id);

      if (!location) {
        throw new Error('Location not found');
      }

      return location;
    } catch (err) {
      if (err.name === 'CastError') {
        throw new Error('Invalid location ID format');
      }
      throw new Error(`Failed to delete location: ${err.message}`);
    }
  }

  async findByStatus(status) {
    try {
      return await Location.find({ status });
    } catch (err) {
      throw new Error(`Failed to find locations by status: ${err.message}`);
    }
  }

  async updateStatus(id, status) {
    if (!id) {
      throw new Error('Location ID is required');
    }

    if (!['active', 'inactive'].includes(status)) {
      throw new Error('Invalid status. Must be "active" or "inactive"');
    }

    try {
      const location = await Location.findByIdAndUpdate(
        id,
        { status },
        { new: true, runValidators: true }
      );

      if (!location) {
        throw new Error('Location not found');
      }

      return location;
    } catch (err) {
      if (err.name === 'CastError') {
        throw new Error('Invalid location ID format');
      }
      throw new Error(`Failed to update location status: ${err.message}`);
    }
  }
}
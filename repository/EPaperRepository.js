import EPaper from '../models/EPaper.js';

export default class EPaperRepository {
  async create(data) {
    if (!data) throw new Error('E-Paper data is required');
    try {
      return await EPaper.create(data);
    } catch (err) {
      if (err.code === 11000) throw new Error('Duplicate entry');
      throw new Error(`Failed to create E-Paper: ${err.message}`);
    }
  }

  async findMany(filter = {}, sort = { createdAt: -1 }, skip = 0, limit = 10) {
    try {
      const safeSkip = Math.max(0, parseInt(skip) || 0);
      const safeLimit = Math.min(100, Math.max(1, parseInt(limit) || 10));
      return await EPaper.find(filter).sort(sort).skip(safeSkip).limit(safeLimit);
    } catch (err) {
      throw new Error(`Failed to fetch E-Papers: ${err.message}`);
    }
  }

  async count(filter = {}) {
    try {
      return await EPaper.countDocuments(filter);
    } catch (err) {
      throw new Error(`Failed to count E-Papers: ${err.message}`);
    }
  }

  async findById(id) {
    try {
      const paper = await EPaper.findById(id);
      if (!paper) throw new Error('E-Paper not found');
      return paper;
    } catch (err) {
      throw new Error(`Failed to find E-Paper: ${err.message}`);
    }
  }

  async updateById(id, data) {
    try {
      const { _id, __v, createdAt, ...updateData } = data;
      const paper = await EPaper.findByIdAndUpdate(id, updateData, {
        new: true,
        runValidators: true,
      });
      if (!paper) throw new Error('E-Paper not found');
      return paper;
    } catch (err) {
      throw new Error(`Failed to update E-Paper: ${err.message}`);
    }
  }

  async deleteById(id) {
    try {
      const paper = await EPaper.findByIdAndDelete(id);
      if (!paper) throw new Error('E-Paper not found');
      return paper;
    } catch (err) {
      throw new Error(`Failed to delete E-Paper: ${err.message}`);
    }
  }
}

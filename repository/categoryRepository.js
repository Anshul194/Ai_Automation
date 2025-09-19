import Category from '../models/Category.js';

export default class CategoryRepository {
  async create(data) {
    if (!data) {
      throw new Error('Category data is required');
    }
    
    try {
      return await Category.create(data);
    } catch (err) {
      if (err.code === 11000) {
        const field = Object.keys(err.keyPattern)[0];
        throw new Error(`Category with this ${field} already exists`);
      }
      throw new Error(`Failed to create category: ${err.message}`);
    }
  }

  async findBy(filter = {}) {
    try {
      return await Category.findOne(filter);
    } catch (err) {
      throw new Error(`Failed to find category: ${err.message}`);
    }
  }

  async findMany(filter = {}, sort = { createdAt: -1 }, skip = 0, limit = 10) {
    try {
      const safeSkip = Math.max(0, parseInt(skip) || 0);
      const safeLimit = Math.min(100, Math.max(1, parseInt(limit) || 10));
      
      return await Category.find(filter)
        .sort(sort)
        .skip(safeSkip)
        .limit(safeLimit);
    } catch (err) {
      throw new Error(`Failed to get categories: ${err.message}`);
    }
  }

  async count(filter = {}) {
    try {
      return await Category.countDocuments(filter);
    } catch (err) {
      throw new Error(`Failed to count categories: ${err.message}`);
    }
  }

  async updateById(id, data) {
    if (!id) {
      throw new Error('Category ID is required');
    }
    
    if (!data || Object.keys(data).length === 0) {
      throw new Error('Update data is required');
    }

    try {
      const { _id, __v, createdAt, ...updateData } = data;
      
      const category = await Category.findByIdAndUpdate(
        id, 
        updateData, 
        { new: true, runValidators: true }
      );
      
      if (!category) {
        throw new Error('Category not found');
      }
      
      return category;
    } catch (err) {
      if (err.name === 'CastError') {
        throw new Error('Invalid category ID format');
      }
      throw new Error(`Failed to update category: ${err.message}`);
    }
  }

  async findById(id) {
    if (!id) {
      throw new Error('Category ID is required');
    }

    try {
      const category = await Category.findById(id);
      
      if (!category) {
        throw new Error('Category not found');
      }
      
      return category;
    } catch (err) {
      if (err.name === 'CastError') {
        throw new Error('Invalid category ID format');
      }
      throw new Error(`Failed to find category by id: ${err.message}`);
    }
  }

  async deleteById(id) {
    if (!id) {
      throw new Error('Category ID is required');
    }

    try {
      const category = await Category.findByIdAndDelete(id);

      if (!category) {
        throw new Error('Category not found');
      }

      return category;
    } catch (err) {
      if (err.name === 'CastError') {
        throw new Error('Invalid category ID format');
      }
      throw new Error(`Failed to delete category: ${err.message}`);
    }
  }

  async findByStatus(status) {
    try {
      return await Category.find({ status });
    } catch (err) {
      throw new Error(`Failed to find categories by status: ${err.message}`);
    }
  }

  async updateStatus(id, status) {
    if (!id) {
      throw new Error('Category ID is required');
    }

    if (!['active', 'inactive'].includes(status)) {
      throw new Error('Invalid status. Must be "active" or "inactive"');
    }

    try {
      const category = await Category.findByIdAndUpdate(
        id,
        { status },
        { new: true, runValidators: true }
      );

      if (!category) {
        throw new Error('Category not found');
      }

      return category;
    } catch (err) {
      if (err.name === 'CastError') {
        throw new Error('Invalid category ID format');
      }
      throw new Error(`Failed to update category status: ${err.message}`);
    }
  }
}
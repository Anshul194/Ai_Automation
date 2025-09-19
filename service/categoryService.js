import CategoryRepository from "../repository/categoryRepository.js";

class CategoryService {
  constructor() {
    this.categoryRepository = new CategoryRepository();
  }

  async createCategory({ name, description, color, status = 'active' }) {
    try {
      if (!name) {
        throw new Error('Category name is required');
      }

      // Check if category with same name already exists
      const existingCategory = await this.categoryRepository.findBy({ 
        name: { $regex: new RegExp(`^${name}$`, 'i') } 
      });

      if (existingCategory) {
        throw new Error('Category with this name already exists');
      }

      return await this.categoryRepository.create({
        name: name.trim(),
        description: description?.trim(),
        color: color?.trim(),
        status
      });
    } catch (error) {
      console.error("❌ Error in createCategory:", error);
      throw error;
    }
  }

  async getAllCategories(filter = {}, sort = { createdAt: -1 }, skip = 0, limit = 10) {
    try {
      const categories = await this.categoryRepository.findMany(filter, sort, skip, limit);

      const total = await this.categoryRepository.count(filter);
      
      return {
        categories,
        pagination: {
          total,
          page: Math.floor(skip / limit) + 1,
          pages: Math.ceil(total / limit),
          limit: parseInt(limit)
        }
      };
    } catch (error) {
      console.error("❌ Error in getAllCategories:", error);
      throw new Error("Failed to get all categories");
    }
  }

  async getCategoryById(id) {
    try {
      return await this.categoryRepository.findById(id);
    } catch (error) {
      console.error("❌ Error in getCategoryById:", error);
      throw error;
    }
  }

  async updateCategory(id, updateData) {
    try {
      if (updateData.name) {
        // Check if another category with same name exists
        const existingCategory = await this.categoryRepository.findBy({ 
          name: { $regex: new RegExp(`^${updateData.name}$`, 'i') },
          _id: { $ne: id }
        });

        if (existingCategory) {
          throw new Error('Category with this name already exists');
        }
        
        updateData.name = updateData.name.trim();
      }

      if (updateData.description) {
        updateData.description = updateData.description.trim();
      }

      if (updateData.color) {
        updateData.color = updateData.color.trim();
      }

      return await this.categoryRepository.updateById(id, updateData);
    } catch (error) {
      console.error("❌ Error in updateCategory:", error);
      throw error;
    }
  }

  async deleteCategory(id) {
    if (!id) {
      throw new Error('Category ID is required');
    }

    try {
      const deletedCategory = await this.categoryRepository.deleteById(id);

      if (!deletedCategory) {
        throw new Error('Category not found');
      }

      return deletedCategory;
    } catch (error) {
      console.error('❌ Error in deleteCategory:', error);
      throw error;
    }
  }

  async getActiveCategories() {
    try {
      return await this.categoryRepository.findByStatus('active');
    } catch (error) {
      console.error("❌ Error in getActiveCategories:", error);
      throw new Error("Failed to get active categories");
    }
  }

  async updateCategoryStatus(id, status) {
    try {
      return await this.categoryRepository.updateStatus(id, status);
    } catch (error) {
      console.error("❌ Error in updateCategoryStatus:", error);
      throw error;
    }
  }

  async searchCategories(searchTerm, status = null) {
    try {
      const filter = {
        name: { $regex: searchTerm, $options: 'i' }
      };

      if (status) {
        filter.status = status;
      }

      return await this.categoryRepository.findMany(filter);
    } catch (error) {
      console.error("❌ Error in searchCategories:", error);
      throw new Error("Failed to search categories");
    }
  }
}

export default CategoryService;
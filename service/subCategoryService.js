import SubCategoryRepository from '../repository/subCategoryRepository.js';

export default class SubCategoryService {
  constructor() {
    this.subCategoryRepository = new SubCategoryRepository();
  }

  async createSubCategory(data) {
    try {
      return await this.subCategoryRepository.create(data);
    } catch (error) {
      throw new Error(`Failed to create subcategory: ${error.message}`);
    }
  }

  async getAllSubCategories(params) {
    try {
      return await this.subCategoryRepository.findAll(params);
    } catch (error) {
      throw new Error(`Failed to get all subcategories: ${error.message}`);
    }
  }

  async getSubCategoryById(id) {
    try {
      return await this.subCategoryRepository.findById(id);
    } catch (error) {
      throw new Error(`Failed to get subcategory by ID: ${error.message}`);
    }
  }

  //getSubCategoryByCategoryId
  async getSubCategoryByCategoryId(categoryId) {
    try {
      return await this.subCategoryRepository.findByCategoryId(categoryId);
    } catch (error) {
      throw new Error(`Failed to get subcategories by category ID: ${error.message}`);
    }
  }

  async updateSubCategory(id, data) {
    try {
      return await this.subCategoryRepository.update(id, data);
    } catch (error) {
      throw new Error(`Failed to update subcategory: ${error.message}`);
    }
  }

  async deleteSubCategory(id) {
    try {
      return await this.subCategoryRepository.delete(id);
    } catch (error) {
      throw new Error(`Failed to delete subcategory: ${error.message}`);
    }
  }
}

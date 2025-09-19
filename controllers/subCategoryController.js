import SubCategoryService from '../service/subCategoryService.js';
import { initRedis } from '../config/redisClient.js';
import { subCategoryCreateValidator, subCategoryUpdateValidator } from '../validations/subCategoryValidation.js';
import Admin from '../models/admin.js';

import mongoose from 'mongoose';
const subCategoryService = new SubCategoryService();


// ✅ Create
export const createSubCategory = async (req, res) => {
  try {
    const { error, value } = subCategoryCreateValidator.validate(req.body, { abortEarly: false });
    if (error) {
      return res.status(400).json({ success: false, message: 'Validation failed', details: error.details });
    }

    const subCategoryData = { ...value };

    if (req.files?.image?.[0]) {
      subCategoryData.image = req.files.image[0].filename;
    }
    if (req.files?.coverImage?.[0]) {
      subCategoryData.coverImage = req.files.coverImage[0].filename;
    }

    const created = await subCategoryService.createSubCategory(subCategoryData);

    const redis = await initRedis();
    await redis.del('sub-categories:all*');

    res.status(201).json({
      success: true,
      message: 'Subcategory created successfully.',
      data: created,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ✅ Get All
export const getAllSubCategories = async (req, res) => {
  try {
    const cacheKey = `sub-categories:all:${JSON.stringify(req.query)}`;
    const redis = await initRedis();
    const cached = await redis.get(cacheKey);

    // Uncomment if you want to use cache
    // if (cached) {
    //   return res.status(200).json({ success: true, ...JSON.parse(cached), fromCache: true });
    // }
    const query = req.query;

    if (req.user && req.user.type) {
      const admin = await Admin.findOne({ _id: req.user.id });
      if (admin && !admin.isSuper_Admin) {
        const type = req.user.type;
        query.MainCategory = new mongoose.Types.ObjectId(type);
      }

      
    }

    console.log('query', query);
      
    const subCategories = await subCategoryService.getAllSubCategories(query);
    await redis.setEx(cacheKey, 300, JSON.stringify(subCategories)); // Cache for 5 mins

    res.status(200).json({
      success: true,
      message: 'Subcategories fetched successfully.',
      ...subCategories,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ✅ Get By ID
export const getSubCategoryById = async (req, res) => {
  try {
    const id = req.params.id;
    const cacheKey = `sub-category:${id}`;
    const redis = await initRedis();
    const cached = await redis.get(cacheKey);

    // Uncomment if you want to use cache
    // if (cached) {
    //   return res.status(200).json({ success: true, data: JSON.parse(cached), fromCache: true });
    // }

    const subCategory = await subCategoryService.getSubCategoryById(id);

    if (!subCategory) {
      return res.status(404).json({ success: false, message: 'Subcategory not found' });
    }

    await redis.setEx(cacheKey, 300, JSON.stringify(subCategory));

    res.status(200).json({
      success: true,
      message: 'Subcategory fetched successfully.',
      data: subCategory,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

//getSubCategoryByCategoryId
export const getSubCategoryByCategoryId = async (req, res) => {
  try {
    const categoryId = req.params.id;
    const cacheKey = `sub-categories:category:${categoryId}`;
    const redis = await initRedis();
    const cached = await redis.get(cacheKey);

    // Uncomment if you want to use cache
    // if (cached) {
    //   return res.status(200).json({ success: true, data: JSON.parse(cached), fromCache: true });
    // }

    const subCategories = await subCategoryService.getSubCategoryByCategoryId(categoryId);

    

    if (!subCategories || subCategories.length === 0) {
      return res.status(404).json({ success: false, message: 'No subcategories found for this category' });
    }

    await redis.setEx(cacheKey, 300, JSON.stringify(subCategories));

    res.status(200).json({
      success: true,
      message: 'Subcategories by category fetched successfully.',
      data: subCategories,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ✅ Update
export const updateSubCategory = async (req, res) => {
  try {
    const id = req.params.id;

    const { error, value } = subCategoryUpdateValidator.validate(req.body, { abortEarly: false });
    if (error) {
      return res.status(400).json({ success: false, message: 'Validation failed', details: error.details });
    }

    const subCategoryData = { ...value };

    if (req.files?.image?.[0]) {
      subCategoryData.image = req.files.image[0].filename;
    }
    if (req.files?.coverImage?.[0]) {
      subCategoryData.coverImage = req.files.coverImage[0].filename;
    }

    const updated = await subCategoryService.updateSubCategory(id, subCategoryData);

    const redis = await initRedis();
    await redis.del('sub-categories:all*');
    await redis.del(`sub-category:${id}`);

    res.status(200).json({
      success: true,
      message: 'Subcategory updated successfully.',
      data: updated,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ✅ Delete
export const deleteSubCategory = async (req, res) => {
  try {
    const id = req.params.id;
    const deleted = await subCategoryService.deleteSubCategory(id);

    const redis = await initRedis();
    await redis.del('sub-categories:all*');
    await redis.del(`sub-category:${id}`);

    res.status(200).json({
      success: true,
      message: 'Subcategory deleted successfully.',
      data: deleted,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

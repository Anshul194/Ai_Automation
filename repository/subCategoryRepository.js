import SubCategory from '../models/subCategory.js';

export default class SubCategoryRepository {
  async create(data) {
    try {
      return await SubCategory.create(data);
    } catch (error) {
      throw new Error(`Failed to create subcategory: ${error.message}`);
    }
  }

  async findAll({ search = '', page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc', status, MainCategory }) {
    try {
      const query = {};
      if (status) query.status = status;
      if (search) {
        const looseRegex = search.split('').join('.*');
        query.title = { $regex: looseRegex, $options: 'i' };
      }
      if (MainCategory) {
        query.MainCategory = MainCategory;
      }

      console?.log('Subcategory search query', query);

      const skip = (page - 1) * limit;

      const subCategories = await SubCategory.find(query)
        .populate('MainCategory', 'title')
        .sort({ [sortBy]: sortOrder === 'asc' ? 1 : -1 })
        .skip(skip)
        .limit(limit);

      const total = await SubCategory.countDocuments(query);

      return {
        data: subCategories,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      };
    } catch (error) {
      throw new Error(`Failed to fetch subcategories: ${error.message}`);
    }
  }

  async findById(id) {
    try {
      return await SubCategory.findById(id).populate('MainCategory', 'title');
    } catch (error) {
      throw new Error(`Failed to fetch subcategory by ID: ${error.message}`);
    }
  }

  //findByCategoryId
  async findByCategoryId(categoryId) {
    try {
      let subCategory = await SubCategory.find({ MainCategory: categoryId }).populate('MainCategory', 'title');
      //change cover_image path for specific id 
      if (!subCategory || subCategory.length === 0) {
        throw new Error('No subcategories found for this category');
      }
      if (categoryId === '6846793b682dba0bccc3179f') {
        for (const sub of subCategory) {
          if (sub._id == '68467a7f682dba0bccc31809') {
            sub.coverImage = '3_5_button_3.png';
          } else if (sub._id == '68467a5e682dba0bccc31802') {
            sub.coverImage = '3_5_button_2.png';
          } else if (sub._id == '68467a45682dba0bccc317f2') {
            sub.coverImage = '3_5_button_1.png';
          } 
        }
      }
      return subCategory;

    } catch (error) {
      throw new Error(`Failed to fetch subcategories by category ID: ${error.message}`);
    }
  }

  async update(id, data) {
    try {
      return await SubCategory.findByIdAndUpdate(id, data, { new: true }).populate('MainCategory', 'title');
    } catch (error) {
      throw new Error(`Failed to update subcategory: ${error.message}`);
    }
  }

  async delete(id) {
    try {
      return await SubCategory.findByIdAndDelete(id);
    } catch (error) {
      throw new Error(`Failed to delete subcategory: ${error.message}`);
    }
  }
}
    
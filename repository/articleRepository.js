import Article from '../models/article.js';

export default class ArticleRepository {
  async create(data) {
    if (!data) {
      throw new Error('Article data is required');
    }

    try {
      return await Article.create(data);
    } catch (err) {
      if (err.code === 11000) {
        throw new Error('Article creation failed due to duplicate key');
      }
      throw new Error(`Failed to create article: ${err.message}`);
    }
  }

  async findBy(filter = {}) {
    try {
      return await Article.findOne(filter).populate('category', 'name');
    } catch (err) {
      throw new Error(`Failed to find article: ${err.message}`);
    }
  }

  async findMany(filter = {}, sort = { createdAt: -1 }, skip = 0, limit = 10) {
    try {
      const safeSkip = Math.max(0, parseInt(skip) || 0);
      const safeLimit = Math.min(100, Math.max(1, parseInt(limit) || 10));

      return await Article.find(filter)
        .sort(sort)
        .skip(safeSkip)
        .limit(safeLimit)
        .populate('category', 'name');
    } catch (err) {
      throw new Error(`Failed to get articles: ${err.message}`);
    }
  }

  async count(filter = {}) {
    try {
      return await Article.countDocuments(filter);
    } catch (err) {
      throw new Error(`Failed to count articles: ${err.message}`);
    }
  }

  async updateById(id, data) {
    if (!id) {
      throw new Error('Article ID is required');
    }

    if (!data || Object.keys(data).length === 0) {
      throw new Error('Update data is required');
    }

    try {
      const { _id, __v, createdAt, ...updateData } = data;

      const article = await Article.findByIdAndUpdate(id, updateData, {
        new: true,
        runValidators: true,
      }).populate('category', 'name');

      if (!article) {
        throw new Error('Article not found');
      }

      return article;
    } catch (err) {
      if (err.name === 'CastError') {
        throw new Error('Invalid article ID format');
      }
      if (err.name === 'ValidationError') {
        throw new Error('Validation failed: ' + Object.values(err.errors).map(e => e.message).join(', '));
      }
      throw new Error(`Failed to update article: ${err.message}`);
    }
  }

  async findById(id) {
    if (!id) {
      throw new Error('Article ID is required');
    }

    try {
      const article = await Article.findById(id).populate('category', 'name');

      if (!article) {
        throw new Error('Article not found');
      }

      return article;
    } catch (err) {
      if (err.name === 'CastError') {
        throw new Error('Invalid article ID format');
      }
      throw new Error(`Failed to find article by id: ${err.message}`);
    }
  }

  async deleteById(id) {
    if (!id) {
      throw new Error('Article ID is required');
    }

    try {
      const article = await Article.findByIdAndDelete(id);

      if (!article) {
        throw new Error('Article not found');
      }

      return article;
    } catch (err) {
      if (err.name === 'CastError') {
        throw new Error('Invalid article ID format');
      }
      throw new Error(`Failed to delete article: ${err.message}`);
    }
  }

  async findByStatus(status) {
    try {
      return await Article.find({ status }).populate('category', 'name');
    } catch (err) {
      throw new Error(`Failed to find articles by status: ${err.message}`);
    }
  }

  async updateStatus(id, status) {
    if (!id) {
      throw new Error('Article ID is required');
    }

    if (!['draft', 'published'].includes(status)) {
      throw new Error('Invalid status. Must be "draft" or "published"');
    }

    try {
      const article = await Article.findByIdAndUpdate(
        id,
        { status },
        { new: true, runValidators: true }
      ).populate('category', 'name');

      if (!article) {
        throw new Error('Article not found');
      }

      return article;
    } catch (err) {
      if (err.name === 'CastError') {
        throw new Error('Invalid article ID format');
      }
      throw new Error(`Failed to update article status: ${err.message}`);
    }
  }
}
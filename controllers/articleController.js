import ArticleService from '../service/articleService.js';
import { initRedis } from '../config/redisClient.js';
import mongoose from 'mongoose';

const articleService = new ArticleService();

export const createArticle = async (req, res) => {
  try {
    const { coloredHeading, restHeading, articleTitle, author, category, status, excerpt, content } = req.body;
    const featuredImage = req.file ? req.file.filename : null;

    // Log request body and user for debugging
    console.log('createArticle - Request body:', req.body);
    console.log('createArticle - req.user:', req.user);

    // Validate user authentication (super admin check)
    if (!req.user || !req.user._id) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized: Super Admin not authenticated',
        data: {},
        err: 'No super admin found in request',
      });
    }

    // Validate all required fields
    const missingFields = [];
    if (!coloredHeading) missingFields.push('coloredHeading');
    if (!restHeading) missingFields.push('restHeading');
    if (!articleTitle) missingFields.push('articleTitle');
    if (!author || typeof author !== 'string' || author.trim() === '') missingFields.push('author');
    if (!category) missingFields.push('category');
    if (!featuredImage) missingFields.push('featuredImage');
    if (!excerpt) missingFields.push('excerpt');
    if (!content) missingFields.push('content');

    if (missingFields.length > 0) {
      console.error(`Missing fields: ${missingFields.join(', ')}`);
      return res.status(400).json({
        success: false,
        message: `Missing required fields: ${missingFields.join(', ')}`,
        data: {},
        err: `Missing required fields: ${missingFields.join(', ')}`,
      });
    }

    // Validate category ID format
    if (!mongoose.Types.ObjectId.isValid(category)) {
      console.error(`Invalid category ID: ${category}`);
      return res.status(400).json({
        success: false,
        message: 'Invalid category ID format',
        data: {},
        err: 'Invalid category ID format',
      });
    }

    const newArticle = await articleService.createArticle({
      coloredHeading,
      restHeading,
      articleTitle,
      author: author.trim(),
      category,
      status,
      featuredImage,
      excerpt,
      content,
    });

    const redis = await initRedis();
    await redis.del('articles:all*');

    res.status(201).json({
      success: true,
      message: 'Article created successfully by Super Admin',
      data: newArticle,
      err: {},
    });
  } catch (err) {
    console.error('Error in createArticle controller:', err);
    res.status(400).json({
      success: false,
      message: err.message,
      data: {},
      err: err.message,
    });
  }
};

// Other controller functions remain unchanged
export const getAllArticles = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };
    const filter = {};

    if (status) {
      filter.status = status;
    }

    if (search) {
      filter.articleTitle = { $regex: search, $options: 'i' };
    }

    const result = await articleService.getAllArticles(filter, sort, skip, parseInt(limit));

    res.status(200).json({
      success: true,
      message: 'Articles fetched successfully',
      data: result,
      err: {},
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch articles',
      data: {},
      err: err.message,
    });
  }
};

export const getArticleById = async (req, res) => {
  try {
    const { articleId } = req.params;
    const cacheKey = `article:${articleId}`;
    const redis = await initRedis();

    const article = await articleService.getArticleById(articleId);
    await redis.setEx(cacheKey, 300, JSON.stringify(article));

    res.status(200).json({
      success: true,
      message: 'Article fetched successfully',
      data: article,
      err: {},
    });
  } catch (err) {
    const statusCode = err.message.includes('not found') ? 404 : 500;
    res.status(statusCode).json({
      success: false,
      message: err.message,
      data: {},
      err: err.message,
    });
  }
};

export const updateArticle = async (req, res) => {
  try {
    const { articleId } = req.params;
    const { coloredHeading, restHeading, articleTitle, author, category, status, excerpt, content } = req.body;
    const featuredImage = req.file ? req.file.filename : undefined;
    const updateData = {
      coloredHeading,
      restHeading,
      articleTitle,
      author: author ? author.trim() : undefined,
      category,
      status,
      excerpt,
      content,
    };
    if (featuredImage) {
      updateData.featuredImage = featuredImage;
    }

    const updatedArticle = await articleService.updateArticle(articleId, updateData);

    const redis = await initRedis();
    await redis.del('articles:all*');
    await redis.del(`article:${articleId}`);

    res.status(200).json({
      success: true,
      message: 'Article updated successfully',
      data: updatedArticle,
      err: {},
    });
  } catch (err) {
    const statusCode = err.message.includes('not found') ? 404 : 400;
    res.status(statusCode).json({
      success: false,
      message: err.message,
      data: {},
      err: err.message,
    });
  }
};

export const deleteArticle = async (req, res) => {
  try {
    const { articleId } = req.params;

    if (!articleId) {
      return res.status(400).json({
        success: false,
        message: 'Article ID is required',
        data: {},
        err: 'Missing articleId in request params',
      });
    }

    const deletedArticle = await articleService.deleteArticle(articleId);

    const redis = await initRedis();
    await redis.del('articles:all*');
    await redis.del(`article:${articleId}`);

    res.status(200).json({
      success: true,
      message: 'Article deleted successfully',
      data: deletedArticle,
    });
  } catch (err) {
    const isNotFound = err.message.toLowerCase().includes('not found');
    res.status(isNotFound ? 404 : 500).json({
      success: false,
      message: err.message,
      data: {},
      err: err.message,
    });
  }
};

export const getPublishedArticles = async (req, res) => {
  try {
    const redis = await initRedis();
    const cacheKey = 'articles:published';

    const articles = await articleService.getPublishedArticles();
    await redis.setEx(cacheKey, 300, JSON.stringify(articles));

    res.status(200).json({
      success: true,
      message: 'Published articles fetched successfully',
      data: articles,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch published articles',
      data: {},
      err: err.message,
    });
  }
};

export const updateArticleStatus = async (req, res) => {
  try {
    const { articleId } = req.params;
    const { status } = req.body;

    if (!['draft', 'published'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status value',
        data: {},
        err: 'Invalid status value',
      });
    }

    const updatedArticle = await articleService.updateArticleStatus(articleId, status);

    const redis = await initRedis();
    await redis.del('articles:all*');
    await redis.del(`article:${articleId}`);
    await redis.del('articles:published');

    res.status(200).json({
      success: true,
      message: `Article ${status} successfully`,
      data: updatedArticle,
    });
  } catch (err) {
    const statusCode = err.message.includes('not found') ? 404 : 400;
    res.status(statusCode).json({
      success: false,
      message: err.message,
      data: {},
      err: err.message,
    });
  }
};

export const searchArticles = async (req, res) => {
  try {
    const { q: searchTerm, status } = req.query;
    if (!searchTerm) {
      return res.status(400).json({
        success: false,
        message: 'Search term is required',
        data: {},
        err: 'Missing search parameter "q"',
      });
    }

    const result = await articleService.searchArticles(searchTerm, status);
    res.status(200).json({
      success: true,
      message: 'Search completed successfully',
      data: result,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Search failed',
      data: {},
      err: err.message,
    });
  }
};
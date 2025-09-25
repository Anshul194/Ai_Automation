import ShortService from '../service/shortService.js';
import { initRedis } from '../config/redisClient.js';
import mongoose from 'mongoose';

const shortService = new ShortService();

export const createShort = async (req, res) => {
  try {
    const { title, description, category, relatedLinks = [],tags = [] } = req.body;
    const videoImage = req.files['videoImage'] ? req.files['videoImage'][0].filename : null;
    const thumbnailImage = req.files['thumbnailImage'] ? req.files['thumbnailImage'][0].filename : null;

    // Log request body and user for debugging
    console.log('createShort - Request body:', req.body);
    console.log('createShort - req.files:', req.files);

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
    if (!title) missingFields.push('title');
    if (!videoImage) missingFields.push('videoImage');
    if (!thumbnailImage) missingFields.push('thumbnailImage');
    if (!description) missingFields.push('description');
    if (!category) missingFields.push('category');

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

    // Validate relatedLinks (optional, but valid if provided)
    if (relatedLinks && Array.isArray(relatedLinks)) {
      const invalidLinks = relatedLinks.filter(link => 
        !link.url || typeof link.url !== 'string' || link.url.trim() === ''
      );
      if (invalidLinks.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Invalid relatedLinks: Each link must have a non-empty url',
          data: {},
          err: 'Invalid relatedLinks format',
        });
      }
    }

    const newShort = await shortService.createShort({
      title,
      videoImage,
      thumbnailImage,
      description,
      category,
      tags: tagsArray,
      relatedLinks: relatedLinks.map(link => ({
        url: link.url.trim(),
        linkTitle: link.linkTitle ? link.linkTitle.trim() : '',
      })),
    });

    const redis = await initRedis();
    await redis.del('shorts:all*');

    res.status(201).json({
      success: true,
      message: 'Short created successfully by Super Admin',
      data: newShort,
      err: {},
    });
  } catch (err) {
    console.error('Error in createShort controller:', err);
    res.status(400).json({
      success: false,
      message: err.message,
      data: {},
      err: err.message,
    });
  }
};

export const getAllShorts = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };
    const filter = {};

    if (search) {
      filter.title = { $regex: search, $options: 'i' };
    }

    const result = await shortService.getAllShorts(filter, sort, skip, parseInt(limit));

    res.status(200).json({
      success: true,
      message: 'Shorts fetched successfully',
      data: result,
      err: {},
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch shorts',
      data: {},
      err: err.message,
    });
  }
};

export const getShortById = async (req, res) => {
  try {
    const { shortId } = req.params;
    const cacheKey = `short:${shortId}`;
    const redis = await initRedis();

    const short = await shortService.getShortById(shortId);
    await redis.setEx(cacheKey, 300, JSON.stringify(short));

    res.status(200).json({
      success: true,
      message: 'Short fetched successfully',
      data: short,
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

export const updateShort = async (req, res) => {
  try {
    const { shortId } = req.params;
    const { title, description, category, relatedLinks = [], tags = [] } = req.body;
    const videoImage = req.files['videoImage'] ? req.files['videoImage'][0].filename : undefined;
    const thumbnailImage = req.files['thumbnailImage'] ? req.files['thumbnailImage'][0].filename : undefined;

    // ✅ tags normalize
    const tagsArray = Array.isArray(tags)
      ? tags.map(t => t.trim())
      : typeof tags === 'string'
        ? tags.split(',').map(t => t.trim())
        : [];

    const updateData = {
      title,
      description,
      category,
      relatedLinks,
       tags: tagsArray,
    };
    if (videoImage) updateData.videoImage = videoImage;
    if (thumbnailImage) updateData.thumbnailImage = thumbnailImage;

    const updatedShort = await shortService.updateShort(shortId, updateData);

    const redis = await initRedis();
    await redis.del('shorts:all*');
    await redis.del(`short:${shortId}`);

    res.status(200).json({
      success: true,
      message: 'Short updated successfully',
      data: updatedShort,
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

export const deleteShort = async (req, res) => {
  try {
    const { shortId } = req.params;

    if (!shortId) {
      return res.status(400).json({
        success: false,
        message: 'Short ID is required',
        data: {},
        err: 'Missing shortId in request params',
      });
    }

    const deletedShort = await shortService.deleteShort(shortId);

    const redis = await initRedis();
    await redis.del('shorts:all*');
    await redis.del(`short:${shortId}`);

    res.status(200).json({
      success: true,
      message: 'Short deleted successfully',
      data: deletedShort,
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

export const searchShorts = async (req, res) => {
  try {
    const { q: searchTerm } = req.query;
    if (!searchTerm) {
      return res.status(400).json({
        success: false,
        message: 'Search term is required',
        data: {},
        err: 'Missing search parameter "q"',
      });
    }

    const result = await shortService.searchShorts(searchTerm);
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
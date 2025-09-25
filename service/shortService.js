import ShortRepository from '../repository/shortRepository.js';
import Category from '../models/Category.js';

class ShortService {
  constructor() {
    this.shortRepository = new ShortRepository();
  }

  async createShort({ title, videoImage, thumbnailImage, description, category, relatedLinks = [],tags = [] }) {
    try {
      // Log all inputs for debugging
      console.log('createShort inputs:', {
        title,
        videoImage,
        thumbnailImage,
        description,
        category,
        relatedLinks,
      });

      // Validate required fields
      const missingFields = [];
      if (!title) missingFields.push('title');
      if (!videoImage) missingFields.push('videoImage');
      if (!thumbnailImage) missingFields.push('thumbnailImage');
      if (!description) missingFields.push('description');
      if (!category) missingFields.push('category');

      if (missingFields.length > 0) {
        throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
      }

      // Validate category exists
      const categoryDoc = await Category.findById(category);
      if (!categoryDoc) {
        throw new Error('Invalid category ID');
      }

      // Validate relatedLinks (optional, but valid if provided)
      if (relatedLinks && Array.isArray(relatedLinks)) {
        const invalidLinks = relatedLinks.filter(link => 
          !link.url || typeof link.url !== 'string' || link.url.trim() === ''
        );
        if (invalidLinks.length > 0) {
          throw new Error('Invalid relatedLinks: Each link must have a non-empty url');
        }
      }

      // Check for duplicate title
      const existingShort = await this.shortRepository.findBy({
        title: { $regex: new RegExp(`^${title}$`, 'i') },
      });

      if (existingShort) {
        throw new Error('Short with this title already exists');
      }

      return await this.shortRepository.create({
        title: title.trim(),
        videoImage: videoImage.trim(),
        thumbnailImage: thumbnailImage.trim(),
        description: description.trim(),
        category,
        relatedLinks: relatedLinks.map(link => ({
          url: link.url.trim(),
          linkTitle: link.linkTitle ? link.linkTitle.trim() : '',
        })),
        tags: tags.map(t => t.trim()),
      });
    } catch (error) {
      console.error('❌ Error in createShort:', error);
      throw error;
    }
  }

  async getAllShorts(filter = {}, sort = { createdAt: -1 }, skip = 0, limit = 10) {
    try {
      const shorts = await this.shortRepository.findMany(filter, sort, skip, limit);
      const total = await this.shortRepository.count(filter);

      return {
        shorts,
        pagination: {
          total,
          page: Math.floor(skip / limit) + 1,
          pages: Math.ceil(total / limit),
          limit: parseInt(limit),
        },
      };
    } catch (error) {
      console.error('❌ Error in getAllShorts:', error);
      throw new Error('Failed to get all shorts');
    }
  }

  async getShortById(id) {
    try {
      const short = await this.shortRepository.findById(id);
      return short;
    } catch (error) {
      console.error('❌ Error in getShortById:', error);
      throw error;
    }
  }

  async updateShort(id, updateData) {
    try {
      const { title, description, category, relatedLinks = [], tags = [] } = updateData;
      const videoImage = updateData.videoImage || undefined;
      const thumbnailImage = updateData.thumbnailImage || undefined;
      const updateDataFinal = { title, description, category, relatedLinks };

      if (videoImage) updateDataFinal.videoImage = videoImage.trim();
      if (thumbnailImage) updateDataFinal.thumbnailImage = thumbnailImage.trim();

      if (title) {
        const existingShort = await this.shortRepository.findBy({
          title: { $regex: new RegExp(`^${title}$`, 'i') },
          _id: { $ne: id },
        });

        if (existingShort) {
          throw new Error('Short with this title already exists');
        }

        updateDataFinal.title = title.trim();
      }

      if (description) updateDataFinal.description = description.trim();
      if (relatedLinks && Array.isArray(relatedLinks)) {
        const invalidLinks = relatedLinks.filter(link => 
          !link.url || typeof link.url !== 'string' || link.url.trim() === ''
        );
        if (invalidLinks.length > 0) {
          throw new Error('Invalid relatedLinks: Each link must have a non-empty url');
        }
        updateDataFinal.relatedLinks = relatedLinks.map(link => ({
          url: link.url.trim(),
          linkTitle: link.linkTitle ? link.linkTitle.trim() : '',
        }));
      }

      if (tags && Array.isArray(tags)) {
      const invalidTags = tags.filter((tag) => typeof tag !== 'string' || tag.trim() === '');
      if (invalidTags.length > 0) {
        throw new Error('Invalid tags: Each tag must be a non-empty string');
      }
      updateDataFinal.tags = tags.map((tag) => tag.trim());
    }

      if (category) {
        const categoryDoc = await Category.findById(category);
        if (!categoryDoc) {
          throw new Error('Invalid category ID');
        }
      }

      return await this.shortRepository.updateById(id, updateDataFinal);
    } catch (error) {
      console.error('❌ Error in updateShort:', error);
      throw error;
    }
  }

  async deleteShort(id) {
    if (!id) {
      throw new Error('Short ID is required');
    }

    try {
      const deletedShort = await this.shortRepository.deleteById(id);

      if (!deletedShort) {
        throw new Error('Short not found');
      }

      return deletedShort;
    } catch (error) {
      console.error('❌ Error in deleteShort:', error);
      throw error;
    }
  }

  async searchShorts(searchTerm) {
    try {
      const filter = {
        $or: [
          { title: { $regex: searchTerm, $options: 'i' } },
          { description: { $regex: searchTerm, $options: 'i' } },
        ],
      };

      return await this.shortRepository.findMany(filter);
    } catch (error) {
      console.error('❌ Error in searchShorts:', error);
      throw new Error('Failed to search shorts');
    }
  }
}

export default ShortService;
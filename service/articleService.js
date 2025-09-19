import ArticleRepository from '../repository/articleRepository.js';
import Category from '../models/Category.js';

class ArticleService {
  constructor() {
    this.articleRepository = new ArticleRepository();
  }

  async createArticle({ coloredHeading, restHeading, articleTitle, author, category, status = 'draft', featuredImage, excerpt, content }) {
    try {
      // Log all inputs for debugging
      console.log('createArticle inputs:', {
        coloredHeading,
        restHeading,
        articleTitle,
        author,
        category,
        status,
        featuredImage,
        excerpt,
        content,
      });

      // Validate required fields
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
        throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
      }

      // Validate category exists
      const categoryDoc = await Category.findById(category);
      if (!categoryDoc) {
        throw new Error('Invalid category ID');
      }

      // Check for duplicate article title
      const existingArticle = await this.articleRepository.findBy({
        articleTitle: { $regex: new RegExp(`^${articleTitle}$`, 'i') },
      });

      if (existingArticle) {
        throw new Error('Article with this title already exists');
      }

      return await this.articleRepository.create({
        coloredHeading: coloredHeading.trim(),
        restHeading: restHeading.trim(),
        articleTitle: articleTitle.trim(),
        author: author.trim(),
        category,
        status,
        featuredImage: featuredImage.trim(),
        excerpt: excerpt.trim(),
        content,
      });
    } catch (error) {
      console.error('❌ Error in createArticle:', error);
      throw error;
    }
  }

  async getAllArticles(filter = {}, sort = { createdAt: -1 }, skip = 0, limit = 10) {
    try {
      const articles = await this.articleRepository.findMany(filter, sort, skip, limit);
      const total = await this.articleRepository.count(filter);

      return {
        articles,
        pagination: {
          total,
          page: Math.floor(skip / limit) + 1,
          pages: Math.ceil(total / limit),
          limit: parseInt(limit),
        },
      };
    } catch (error) {
      console.error('❌ Error in getAllArticles:', error);
      throw new Error('Failed to get all articles');
    }
  }

  async getArticleById(id) {
    try {
      const article = await this.articleRepository.findById(id);
      return article;
    } catch (error) {
      console.error('❌ Error in getArticleById:', error);
      throw error;
    }
  }

  async updateArticle(id, updateData) {
    try {
      const { coloredHeading, restHeading, articleTitle, author, category, status, featuredImage, excerpt, content } = updateData;

      if (articleTitle) {
        // Check if another article with same title exists
        const existingArticle = await this.articleRepository.findBy({
          articleTitle: { $regex: new RegExp(`^${articleTitle}$`, 'i') },
          _id: { $ne: id },
        });

        if (existingArticle) {
          throw new Error('Article with this title already exists');
        }

        updateData.articleTitle = articleTitle.trim();
      }

      if (coloredHeading) updateData.coloredHeading = coloredHeading.trim();
      if (restHeading) updateData.restHeading = restHeading.trim();
      if (author) updateData.author = author.trim();
      if (excerpt) updateData.excerpt = excerpt.trim();
      if (featuredImage) updateData.featuredImage = featuredImage.trim();

      if (category) {
        const categoryDoc = await Category.findById(category);
        if (!categoryDoc) {
          throw new Error('Invalid category ID');
        }
      }

      return await this.articleRepository.updateById(id, updateData);
    } catch (error) {
      console.error('❌ Error in updateArticle:', error);
      throw error;
    }
  }

  async deleteArticle(id) {
    if (!id) {
      throw new Error('Article ID is required');
    }

    try {
      const deletedArticle = await this.articleRepository.deleteById(id);

      if (!deletedArticle) {
        throw new Error('Article not found');
      }

      return deletedArticle;
    } catch (error) {
      console.error('❌ Error in deleteArticle:', error);
      throw error;
    }
  }

  async getPublishedArticles() {
    try {
      return await this.articleRepository.findByStatus('published');
    } catch (error) {
      console.error('❌ Error in getPublishedArticles:', error);
      throw new Error('Failed to get published articles');
    }
  }

  async updateArticleStatus(id, status) {
    try {
      return await this.articleRepository.updateStatus(id, status);
    } catch (error) {
      console.error('❌ Error in updateArticleStatus:', error);
      throw error;
    }
  }

  async searchArticles(searchTerm, status = null) {
    try {
      const filter = {
        $or: [
          { articleTitle: { $regex: searchTerm, $options: 'i' } },
          { coloredHeading: { $regex: searchTerm, $options: 'i' } },
          { restHeading: { $regex: searchTerm, $options: 'i' } },
          { author: { $regex: searchTerm, $options: 'i' } },
        ],
      };

      if (status) {
        filter.status = status;
      }

      return await this.articleRepository.findMany(filter);
    } catch (error) {
      console.error('❌ Error in searchArticles:', error);
      throw new Error('Failed to search articles');
    }
  }
}

export default ArticleService;
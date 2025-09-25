import EPaperRepository from '../repository/EPaperRepository.js';

class EPaperService {
  constructor() {
    this.repo = new EPaperRepository();
  }

  async createEPaper(data) {
    try {
      return await this.repo.create(data);
    } catch (error) {
      throw error;
    }
  }

  async getAllEPapers(filter = {}, sort = { createdAt: -1 }, skip = 0, limit = 10) {
    try {
      const epapers = await this.repo.findMany(filter, sort, skip, limit);
      const total = await this.repo.count(filter);
      return {
        epapers,
        pagination: {
          total,
          page: Math.floor(skip / limit) + 1,
          pages: Math.ceil(total / limit),
          limit: parseInt(limit),
        },
      };
    } catch (error) {
      throw error;
    }
  }

  async getEPaperById(id) {
    try {
      return await this.repo.findById(id);
    } catch (error) {
      throw error;
    }
  }

  async updateEPaper(id, data) {
    try {
      return await this.repo.updateById(id, data);
    } catch (error) {
      throw error;
    }
  }

  async deleteEPaper(id) {
    try {
      return await this.repo.deleteById(id);
    } catch (error) {
      throw error;
    }
  }
}

export default EPaperService;

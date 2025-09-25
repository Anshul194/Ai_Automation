import EPaperService from '../service/EPaperService.js';
import { initRedis } from '../config/redisClient.js';

const service = new EPaperService();

export const createEPaper = async (req, res) => {
  try {
    const data = req.body;

    // 🖼 handle uploaded files
    if (req.files && req.files.pages) {
      data.pages = req.files.pages.map((file, index) => ({
        pageNumber: index + 1,
        fileUrl: file.filename, // multer save
      }));
      data.totalPages = req.files.pages.length;
    }

    const newPaper = await service.createEPaper(data);

    // Invalidate all E-Paper list cache
    const redis = await initRedis();
    await redis.del('epapers:all*');

    res.status(201).json({
      success: true,
      message: 'E-Paper created successfully',
      data: newPaper,
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const getAllEPapers = async (req, res) => {
  try {
    const { page = 1, limit = 10, search } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const filter = search
      ? { publicationName: { $regex: search, $options: 'i' } }
      : {};

    // Redis cache key for paginated/all epapers
    const cacheKey = `epapers:all:${page}:${limit}:${search || ''}`;
    const redis = await initRedis();
    const cached = await redis.get(cacheKey);
    if (cached) {
      return res.status(200).json({ success: true, ...JSON.parse(cached) });
    }

    const result = await service.getAllEPapers(filter, { createdAt: -1 }, skip, parseInt(limit));
    await redis.setEx(cacheKey, 300, JSON.stringify(result));

    res.status(200).json({ success: true, ...result });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getEPaperById = async (req, res) => {
  try {
    const cacheKey = `epaper:${req.params.id}`;
    const redis = await initRedis();
    const cached = await redis.get(cacheKey);
    if (cached) {
      return res.status(200).json({ success: true, data: JSON.parse(cached) });
    }

    const paper = await service.getEPaperById(req.params.id);
    await redis.setEx(cacheKey, 300, JSON.stringify(paper));

    res.status(200).json({ success: true, data: paper });
  } catch (err) {
    res.status(404).json({ success: false, message: err.message });
  }
};

export const updateEPaper = async (req, res) => {
  try {
    const data = req.body;

    if (req.files && req.files.pages) {
      data.pages = req.files.pages.map((file, index) => ({
        pageNumber: index + 1,
        fileUrl: file.filename,
      }));
      data.totalPages = req.files.pages.length;
    }

    const updated = await service.updateEPaper(req.params.id, data);

    // Invalidate relevant cache
    const redis = await initRedis();
    await redis.del('epapers:all*');
    await redis.del(`epaper:${req.params.id}`);

    res.status(200).json({ success: true, data: updated });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const deleteEPaper = async (req, res) => {
  try {
    const deleted = await service.deleteEPaper(req.params.id);

    // Invalidate relevant cache
    const redis = await initRedis();
    await redis.del('epapers:all*');
    await redis.del(`epaper:${req.params.id}`);

    res.status(200).json({ success: true, data: deleted });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

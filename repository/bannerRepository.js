import Banner from '../models/banner.js';

export default {
  create: (data) => Banner.create(data),
  findAll: async (filters = {}, page = 1, limit = 10) => {
  const skip = (page - 1) * limit;

  const [banners, total] = await Promise.all([
    Banner.find(filters)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Banner.countDocuments(filters)
  ]);

  return { banners, total };
},

  findById: (id) => Banner.findById(id),
  updateById: (id, data) => Banner.findByIdAndUpdate(id, data, { new: true }),
  deleteById: (id) => Banner.findByIdAndDelete(id)
};

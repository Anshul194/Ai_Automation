import bannerRepo from '../repository/bannerRepository.js';

export default {
  createBanner: (data) => bannerRepo.create(data),
  getBanners: async (filters, { page, limit }) => {
  return bannerRepo.findAll(filters, page, limit);
},

  getBannerById: (id) => bannerRepo.findById(id),
  updateBanner: (id, data) => bannerRepo.updateById(id, data),
  deleteBanner: (id) => bannerRepo.deleteById(id)
};

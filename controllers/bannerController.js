import bannerService from '../service/bannerService.js';

export default {
  create: async (req, res) => {
    try {
      const data = req.body;
      if (req.file) {
        data.image = req.file.filename; // Or req.file.path if storing path
      }

      const banner = await bannerService.createBanner(data);

      res.status(201).json({
        success: true,
        message: "Banner created successfully",
        // data: banner,
        err: {}
      });
    } catch (err) {
      res.status(400).json({
        success: false,
        message: err.message,
        data: {},
        err: err
      });
    }
  },

  
getAll: async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = "",
      isActive
    } = req.query;

    const filters = {};

    if (search) {
      filters.title = { $regex: search, $options: "i" };
    }

    if (isActive !== undefined && isActive !== "") {
      const activeValue = String(isActive).toLowerCase();
      if (["true", "1"].includes(activeValue)) {
        filters.isActive = true;
      } else if (["false", "0"].includes(activeValue)) {
        filters.isActive = false;
      }
    }

    const options = {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
    };

    const { banners, total } = await bannerService.getBanners(filters, options);

    res.status(200).json({
      success: true,
      message: "Banners fetched successfully",
      data: {
        banners,
        pagination: {
          total,
          page: options.page,
          limit: options.limit,
          totalPages: Math.ceil(total / options.limit),
        },
      },
      err: {}
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
      data: {},
      err: err
    });
  }
}
,
  getById: async (req, res) => {
    try {
      const banner = await bannerService.getBannerById(req.params.id);
      if (!banner) {
        return res.status(404).json({
          success: false,
          message: "Banner not found",
          data: {},
          err: {}
        });
      }

      res.status(200).json({
        success: true,
        message: "Banner fetched successfully",
        data: banner,
        err: {}
      });
    } catch (err) {
      res.status(500).json({
        success: false,
        message: err.message,
        data: {},
        err: err
      });
    }
  },

  update: async (req, res) => {
    try {
      const data = req.body;
      if (req.file) {
        data.image = req.file.filename; // Or req.file.path if storing path
      }

      const banner = await bannerService.updateBanner(req.params.id, data);
      if (!banner) {
        return res.status(404).json({
          success: false,
          message: "Banner not found",
          data: {},
          err: {}
        });
      }

      res.status(200).json({
        success: true,
        message: "Banner updated successfully",
        data: banner,
        err: {}
      });
    } catch (err) {
      res.status(400).json({
        success: false,
        message: err.message,
        data: {},
        err: err
      });
    }
  },

  delete: async (req, res) => {
    try {
      const banner = await bannerService.deleteBanner(req.params.id);
      if (!banner) {
        return res.status(404).json({
          success: false,
          message: "Banner not found",
          data: {},
          err: {}
        });
      }

      res.status(200).json({
        success: true,
        message: "Banner deleted successfully",
        data: {},
        err: {}
      });
    } catch (err) {
      res.status(500).json({
        success: false,
        message: err.message,
        data: {},
        err: err
      });
    }
  }
};

import LocationService from '../service/locationService.js';
import { initRedis } from '../config/redisClient.js';
import Admin from '../models/admin.js';
import mongoose from 'mongoose';

const locationService = new LocationService();

export const createLocation = async (req, res) => {
  try {
    const { name, country, region, description, status } = req.body;

    if (!name || !country) {
      return res.status(400).json({
        success: false,
        message: 'Name and country are required',
        data: {},
        err: 'Missing required fields: name and/or country',
      });
    }

    const newLocation = await locationService.createLocation({ name, country, region, description, status });

    const redis = await initRedis();
    await redis.del('locations:all*');

    res.status(201).json({
      success: true,
      message: 'Location created successfully',
      data: newLocation,
      err: {},
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
      data: {},
      err: err.message,
    });
  }
};

export const getAllLocations = async (req, res) => {
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

    if (req.user && req.user.type) {
      const admin = await Admin.findOne({ _id: req.user.id });
      if (!admin.isSuper_Admin) {
        const type = req.user.type;
        filter._id = new mongoose.Types.ObjectId(type);
      }
    }

    if (status) {
      filter.status = status;
    }

    if (search) {
      filter.name = { $regex: search, $options: 'i' }; // case-insensitive partial match
    }

    const result = await locationService.getAllLocations(filter, sort, skip, parseInt(limit));

    res.status(200).json({
      success: true,
      message: 'Locations fetched successfully',
      data: result,
      err: {},
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch locations',
      data: {},
      err: err.message,
    });
  }
};

export const getLocationById = async (req, res) => {
  try {
    const { locationId } = req.params;
    const cacheKey = `location:${locationId}`;
    const redis = await initRedis();

    const location = await locationService.getLocationById(locationId);
    await redis.setEx(cacheKey, 300, JSON.stringify(location));

    res.status(200).json({
      success: true,
      message: 'Location fetched successfully',
      data: location,
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

export const updateLocation = async (req, res) => {
  try {
    const { locationId } = req.params;
    const updateData = { ...req.body };

    const updatedLocation = await locationService.updateLocation(locationId, updateData);

    const redis = await initRedis();
    await redis.del('locations:all*');
    await redis.del(`location:${locationId}`);

    res.status(200).json({
      success: true,
      message: 'Location updated successfully',
      data: updatedLocation,
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

export const deleteLocation = async (req, res) => {
  try {
    const { locationId } = req.params;

    if (!locationId) {
      return res.status(400).json({
        success: false,
        message: 'Location ID is required',
        data: {},
        err: 'Missing locationId in request params',
      });
    }

    const deletedLocation = await locationService.deleteLocation(locationId);

    const redis = await initRedis();
    await redis.del('locations:all*');
    await redis.del(`location:${locationId}`);

    res.status(200).json({
      success: true,
      message: 'Location deleted successfully',
      data: deletedLocation,
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

export const getActiveLocations = async (req, res) => {
  try {
    const redis = await initRedis();
    const cacheKey = 'locations:active';

    const locations = await locationService.getActiveLocations();
    await redis.setEx(cacheKey, 300, JSON.stringify(locations));

    res.status(200).json({
      success: true,
      message: 'Active locations fetched successfully',
      data: locations,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch active locations',
      data: {},
      err: err.message,
    });
  }
};

export const updateLocationStatus = async (req, res) => {
  try {
    const { locationId } = req.params;
    const { status } = req.body;

    if (!['active', 'inactive'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status value',
        data: {},
        err: 'Invalid status value',
      });
    }

    const updatedLocation = await locationService.updateLocationStatus(locationId, status);

    const redis = await initRedis();
    await redis.del('locations:all*');
    await redis.del(`location:${locationId}`);
    await redis.del('locations:active');

    res.status(200).json({
      success: true,
      message: `Location ${status} successfully`,
      data: updatedLocation,
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

export const searchLocations = async (req, res) => {
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

    const result = await locationService.searchLocations(searchTerm, status);
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
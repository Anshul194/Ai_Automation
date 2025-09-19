import LocationRepository from '../repository/locationRepository.js';

class LocationService {
  constructor() {
    this.locationRepository = new LocationRepository();
  }

  async createLocation({ name, country, region, description, status = 'active' }) {
    try {
      if (!name || !country) {
        throw new Error('Name and country are required');
      }

      // Check if location with same name and country already exists
      const existingLocation = await this.locationRepository.findBy({
        name: { $regex: new RegExp(`^${name}$`, 'i') },
        country: { $regex: new RegExp(`^${country}$`, 'i') },
      });

      if (existingLocation) {
        throw new Error('Location with this name and country already exists');
      }

      return await this.locationRepository.create({
        name: name.trim(),
        country: country.trim(),
        region: region?.trim(),
        description: description?.trim(),
        status,
      });
    } catch (error) {
      console.error('❌ Error in createLocation:', error);
      throw error;
    }
  }

  async getAllLocations(filter = {}, sort = { createdAt: -1 }, skip = 0, limit = 10) {
    try {
      const locations = await this.locationRepository.findMany(filter, sort, skip, limit);
      const total = await this.locationRepository.count(filter);

      return {
        locations,
        pagination: {
          total,
          page: Math.floor(skip / limit) + 1,
          pages: Math.ceil(total / limit),
          limit: parseInt(limit),
        },
      };
    } catch (error) {
      console.error('❌ Error in getAllLocations:', error);
      throw new Error('Failed to get all locations');
    }
  }

  async getLocationById(id) {
    try {
      return await this.locationRepository.findById(id);
    } catch (error) {
      console.error('❌ Error in getLocationById:', error);
      throw error;
    }
  }

  async updateLocation(id, updateData) {
    try {
      if (updateData.name || updateData.country) {
        // Check if another location with same name and country exists
        const existingLocation = await this.locationRepository.findBy({
          name: { $regex: new RegExp(`^${updateData.name || ''}$`, 'i') },
          country: { $regex: new RegExp(`^${updateData.country || ''}$`, 'i') },
          _id: { $ne: id },
        });

        if (existingLocation) {
          throw new Error('Location with this name and country already exists');
        }

        if (updateData.name) updateData.name = updateData.name.trim();
        if (updateData.country) updateData.country = updateData.country.trim();
      }

      if (updateData.region) updateData.region = updateData.region.trim();
      if (updateData.description) updateData.description = updateData.description.trim();

      return await this.locationRepository.updateById(id, updateData);
    } catch (error) {
      console.error('❌ Error in updateLocation:', error);
      throw error;
    }
  }

  async deleteLocation(id) {
    if (!id) {
      throw new Error('Location ID is required');
    }

    try {
      const deletedLocation = await this.locationRepository.deleteById(id);

      if (!deletedLocation) {
        throw new Error('Location not found');
      }

      return deletedLocation;
    } catch (error) {
      console.error('❌ Error in deleteLocation:', error);
      throw error;
    }
  }

  async getActiveLocations() {
    try {
      return await this.locationRepository.findByStatus('active');
    } catch (error) {
      console.error('❌ Error in getActiveLocations:', error);
      throw new Error('Failed to get active locations');
    }
  }

  async updateLocationStatus(id, status) {
    try {
      return await this.locationRepository.updateStatus(id, status);
    } catch (error) {
      console.error('❌ Error in updateLocationStatus:', error);
      throw error;
    }
  }

  async searchLocations(searchTerm, status = null) {
    try {
      const filter = {
        $or: [
          { name: { $regex: searchTerm, $options: 'i' } },
          { country: { $regex: searchTerm, $options: 'i' } },
        ],
      };

      if (status) {
        filter.status = status;
      }

      return await this.locationRepository.findMany(filter);
    } catch (error) {
      console.error('❌ Error in searchLocations:', error);
      throw new Error('Failed to search locations');
    }
  }
}

export default LocationService;
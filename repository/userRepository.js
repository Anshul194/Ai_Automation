import User from '../models/user.js'; 

export default class UserRepository {
  async create(data) {
    try {
      // Clean the data before creating
      const cleanedData = { ...data };
      
      // Remove email field if it's null, undefined, or empty string
      if (!cleanedData.email || cleanedData.email.trim() === '') {
        delete cleanedData.email;
      }
      
      console.log("📝 Creating user with cleaned data:", cleanedData);
      return await User.create(cleanedData);
    } catch (err) {
      console.error("❌ Repository create error:", err);
      throw new Error(`Failed to create user: ${err.message}`);
    }
  }

  async findByPhone(phone) {
    try {
      return await User.findOne({ phone });
    } catch (err) {
      throw new Error(`Failed to find user by phone: ${err.message}`);
    }
  }

  async findBy(filter = {}) {
    try {
      return await User.findOne(filter);
    } catch (err) {
      throw new Error(`Failed to find user: ${err.message}`);
    }
  }

  async findMany(filter = {}, sort = {}, skip = 0, limit = 10) {
    try {
      return await User.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limit);
    } catch (err) {
      throw new Error(`Failed to get users: ${err.message}`);
    }
  }

  async count(filter = {}) {
    try {
      return await User.countDocuments(filter);
    } catch (err) {
      throw new Error(`Failed to count users: ${err.message}`);
    }
  }

  async updateById(id, data) {
    try {
      // Clean the update data
      const cleanedData = { ...data };
      
      // Handle email field in updates
      if (cleanedData.email !== undefined) {
        if (!cleanedData.email || cleanedData.email.trim() === '') {
          // If email is null/undefined/empty, remove it from the document
          cleanedData.$unset = { email: 1 };
          delete cleanedData.email;
        }
      }
      
      console.log(`Updating user with ID: ${id} with cleaned data:`, cleanedData);
      return await User.findByIdAndUpdate(id, cleanedData, { new: true });
    } catch (err) {
      throw new Error(`Failed to update user: ${err.message}`);
    }
  }

  async findById(id) {
    try {
      return await User.findById(id);
    } catch (err) {
      throw new Error(`Failed to find user by id: ${err.message}`);
    }
  }

  async softDeleteById(id) {
    try {
      return await User.findByIdAndUpdate(id, { isDeleted: true }, { new: true });
    } catch (err) {
      throw new Error(`Failed to soft delete user: ${err.message}`);
    }
  }

  async creditBalance(userId, amount) {
    try {
      return await User.findByIdAndUpdate(
        userId,
        { $inc: { balance: Math.abs(amount) } },
        { new: true }
      );
    } catch (err) {
      throw new Error(`Failed to credit balance: ${err.message}`);
    }
  }

  async debitBalance(userId, amount) {
    try {
      // Use $inc with negative value, but ensure balance does not go below zero
      const user = await User.findById(userId);
      if (!user) throw new Error('User not found');
      if (user.balance < amount) throw new Error('Insufficient balance');
      return await User.findByIdAndUpdate(
        userId,
        { $inc: { balance: -Math.abs(amount) } },
        { new: true }
      );
    } catch (err) {
      throw new Error(`Failed to debit balance: ${err.message}`);
    }
  }
}
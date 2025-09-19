import UserRepository from "../repository/userRepository.js";
import bcrypt from "bcryptjs";

class UserService {
  constructor() {
    this.userRepository = new UserRepository();
  }

  async getUserByEmail(email) {
    try {
      return await this.userRepository.findBy({ email });
    } catch (error) {
      console.error("❌ Error in getUserByEmail:", error);
      throw new Error("Failed to get user by email");
    }
  }

  async getUserByPhone(phone) {
    try {
      return await this.userRepository.findByPhone(phone);
    } catch (error) {
      console.error("❌ Error in getUserByPhone:", error);
      throw new Error("Failed to get user by phone");
    }
  }

  async getUserById(id) {
    try {
      return await this.userRepository.findBy({ _id: id });
    } catch (error) {
      console.error("❌ Error in getUserById:", error);
      throw new Error("Failed to get user by ID");
    }
  }

  async signup({ fullName, email, phone, role, isVerified }) {
    try {
      const userData = {
        fullName,
        phone,
      };
      
      // Only set email if it's a non-empty, non-null string
      if (email && typeof email === "string" && email.trim()) {
        userData.email = email.trim();
      }
      // If email is null, undefined, or empty string, don't set it at all
      
      if (role) userData.role = role;
      if (typeof isVerified === "boolean") userData.isVerified = isVerified;
      
      return await this.userRepository.create(userData);
    } catch (error) {
      console.error("❌ Error in signup:", error?.message);
      throw new Error("Failed to sign up user");
    }
  }

  async login(email, password) {
    try {
      const user = await this.userRepository.findBy({ email });
      if (!user || !this.comparePassword(password, user.password)) {
        return null;
      }
      return user;
    } catch (error) {
      console.error("❌ Error in login:", error);
      throw new Error("Failed to login user");
    }
  }

  async getAllUsers() {
    try {
      return await this.userRepository.findMany();
    } catch (error) {
      console.error("❌ Error getting all users:", error);
      throw new Error("Failed to get all users");
    }
  }

  async getUsers(filter, sort, skip, limit) {
    try {
      return await this.userRepository.findMany(filter, sort, skip, limit);
    } catch (error) {
      console.error("❌ Error in getUsers:", error);
      throw new Error("Failed to get users with pagination");
    }
  }

  async countUsers(filter) {
    try {
      return await this.userRepository.count(filter);
    } catch (error) {
      console.error("❌ Error in countUsers:", error);
      throw new Error("Failed to count users");
    }
  }

  async getUserById(userId) {
    try {
      return await this.userRepository.findById(userId);
    } catch (error) {
      console.error("❌ Error getting user by ID:", error);
      throw new Error("Failed to get user by ID");
    }
  }

  hashPassword(password) {
    try {
      const salt = bcrypt.genSaltSync(10);
      return bcrypt.hashSync(password, salt);
    } catch (error) {
      console.error("❌ Password hashing error:", error);
      throw new Error("Failed to hash password");
    }
  }

  async updateUserById(userId, data) {
    try {
      return await this.userRepository.updateById(userId, data);
    } catch (error) {
      console.error("❌ Error updating user:", error);
      throw new Error("Failed to update user");
    }
  }

  comparePassword(inputPassword, hashedPassword) {
    try {
      return bcrypt.compareSync(inputPassword, hashedPassword);
    } catch (error) {
      console.error("❌ Password comparison error:", error);
      return false;
    }
  }

  async creditUserWallet(userId, amount) {
    if (!userId || typeof amount !== 'number' || amount <= 0) {
      throw new Error('Invalid userId or amount');
    }
    try {
      return await this.userRepository.creditBalance(userId, amount);
    } catch (error) {
      console.error('❌ Error crediting user wallet:', error);
      throw new Error(error.message || 'Failed to credit user wallet');
    }
  }

  async debitUserWallet(userId, amount) {
    if (!userId || typeof amount !== 'number' || amount <= 0) {
      throw new Error('Invalid userId or amount');
    }
    try {
      return await this.userRepository.debitBalance(userId, amount);
    } catch (error) {
      console.error('❌ Error debiting user wallet:', error);
      throw new Error(error.message || 'Failed to debit user wallet');
    }
  }
}

export default UserService;
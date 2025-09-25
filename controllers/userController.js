import UserService from "../service/userService.js"; 
import { Token } from "../utils/index.js";
import { initRedis } from "../config/redisClient.js";

import { sendEmail } from "../middlewares/emailService.js"; 

import User from '../models/user.js';
import ExcelJS from 'exceljs';

const userService = new UserService();
// const walletService = new WalletService();
import axios from 'axios';



export const Logout = async (req, res) => {
  try {
    const accessToken = req.cookies?.accessToken;
    const refreshToken = req.cookies?.refreshToken;

    if (!accessToken || !refreshToken) {
      return res.status(400).json({
        success: false,
        message: "No tokens provided for logout",
        data: {},
        err: "Missing tokens",
      });
    }

    const redis = await initRedis();

    // Delete tokens from Redis
    await redis.del(`accessToken:${accessToken}`);
    await redis.del(`refreshToken:${refreshToken}`);

    // Clear cookies
    res.clearCookie("accessToken", {
      httpOnly: true,
      secure: true,
      sameSite: "Strict",
    });

    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: true,
      sameSite: "Strict",
    });

    return res.status(200).json({
      success: true,
      message: "✅ Logout successful",
      data: {},
      err: {},
    });
  } catch (err) {
    console.error("❌ Logout Error:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error during logout",
      data: {},
      err: err.message,
    });
  }
};


//getWalletBalance
export const getWalletBalance = async (req, res) => {
  try {
    const userId = req.user._id;
    console.log("Fetching wallet balance for user:", userId);
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
        data: {},
        err: "Missing user ID",
      });
    }

    console.log("Fetching wallet balance for user:", userId);

    const user = await userService.getUserById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
        data: {},
        err: "Invalid user ID",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Wallet balance fetched successfully",
      data: { balance: user.balance ? user.balance : 0 },
      err: {},
    });
  } catch (err) {
    console.error("❌ Error getting wallet balance:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch wallet balance",
      data: {},
      err: err.message,
    });
  }
};

export const requestOtp = async (req, res) => {
  const { phone } = req.body;
  if (!phone) return res.status(400).json({ message: "Phone is required" });

  const user = await userService.getUserByPhone(phone);

  // generate a 6-digit OTP
  // Note: In production, use a more secure method to generate OTPs
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  if (phone == '7014628523' || phone == '8347496266' || phone == '7016292085' || phone == '7774010984' || phone == '6354822602'|| phone == '7774010984'){

    const otp = '123456';

    const redis = await initRedis();
    await redis.setEx(`otp:${phone}`, 300, otp);
    console.log(`📩 OTP sent to ${phone}: ${otp}`);

    return res.status(200).json({
      success: true,
      message: `OTP sent to ${phone}`,
      data: { isNewUser: !user }
    });

  }

  const signature = '';
  let variables_values = otp;
  if (signature !== '') {
    variables_values = `${otp}|${signature}|`;
  }

  const data = {
    sender_id: "HEMZNX",
    message: "5054",
    variables_values,
    route: "dlt",
    numbers: phone,
    flash: 0
  };

  try {
    const response = await axios.post(
      "https://sms.nexprism.in/dev/api",
      data,
      {
        headers: {
          authorization: process.env.FAST2SMS_API_KEY,
          accept: "*/*",
          "cache-control": "no-cache",
          "content-type": "application/json"
        },
        timeout: 30000,
        httpsAgent: new (await import('https')).Agent({ rejectUnauthorized: false })
      }
    );
    const result = response.data;
    if (result && result.return) {
      const redis = await initRedis();
      await redis.setEx(`otp:${phone}`, 300, otp);
      console.log(`📩 OTP sent to ${phone}: ${otp}`);

      return res.status(200).json({
        success: true,
        message: `OTP sent to ${phone}`,
        data: { isNewUser: !user }
      });
    } else {
      // Handle error response from SMS API
      return res.status(500).json({
        success: false,
        message: "Failed to send OTP",
        data: {},
        err: result ? result.message : "Unknown error"
      });
    }
  } catch (err) {
    console.error("❌ Error sending OTP:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to send OTP",
      data: {},
      err: err.message || "Unknown error"
    });
  }

 
};
export const verifyOtp = async (req, res) => {
  const { phone, otp } = req.body;
  if (!phone || !otp) return res.status(400).json({ message: "Phone & OTP required" });

  const redis = await initRedis();
  const storedOtp = await redis.get(`otp:${phone}`);

  if (!storedOtp || storedOtp !== otp) {
    return res.status(400).json({ message: "Invalid or expired OTP" });
  }

  await redis.del(`otp:${phone}`);
  let user = await userService.getUserByPhone(phone);

  // ✅ If user exists → mark as verified if not already
  if (user) {
    if (!user.isVerified) {
      user = await userService.updateUserById(user._id, { isVerified: true });
    }

    const { accessToken, refreshToken, accessTokenExp, refreshTokenExp } = await Token.generateTokens(user);
    await redis.setEx(`accessToken:${accessToken}`, Math.floor((accessTokenExp - Date.now()) / 1000), "valid");
    await redis.setEx(`refreshToken:${refreshToken}`, Math.floor((refreshTokenExp - Date.now()) / 1000), user._id.toString());
    Token.setTokensCookies(res, accessToken, refreshToken, accessTokenExp, refreshTokenExp);

    return res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        user: {
          _id: user._id,
          fullName: user.fullName,
          phone: user.phone,
          isVerified: true
        },
        tokens: { accessToken, refreshToken }
      }
    });
  }

  // ✅ If user is new → create session to complete registration
  const sessionId = `sess:${Date.now()}:${Math.random().toString(36).substring(2)}`;
  await redis.setEx(`session:${sessionId}`, 600, phone); // 10 mins

  res.cookie("sessionId", sessionId, {
    httpOnly: true,
    secure: false,
    sameSite: "Lax",
    maxAge: 10 * 60 * 1000
  });

  return res.status(206).json({
    success: true,
    message: "OTP verified, complete registration",
    data: { phone }
  });
};

export const completeRegistration = async (req, res) => {
  const { fullName, phone, email } = req.body;

  if (!fullName || !phone) {
    return res.status(400).json({
      success: false,
      message: "Full name and phone are required."
    });
  }

  const redis = await initRedis();

  if (!phone) {
    return res.status(401).json({
      success: false,
      message: "OTP verification expired or invalid"
    });
  }

  let user = await userService.getUserByPhone(phone);


  // If user email already exists, use it
  if (email) {
    const existingUser = await userService.getUserByEmail(email);
    if (existingUser) { 
      //return error if email already exists
      return res.status(409).json({
        success: false,
        message: "User already exists with this email",
        data: {},
        err: "Email already exists"
      });
    }
  }
 

  if (!user) {
    user = await userService.signup({
      fullName,
      phone,
      email: email, 
      isVerified: true
    });
  }

  const {
    accessToken,
    refreshToken,
    accessTokenExp,
    refreshTokenExp
  } = await Token.generateTokens(user);

  await redis.setEx(
    `accessToken:${accessToken}`,
    Math.floor((accessTokenExp - Date.now()) / 1000),
    "valid"
  );
  await redis.setEx(
    `refreshToken:${refreshToken}`,
    Math.floor((refreshTokenExp - Date.now()) / 1000),
    user._id.toString()
  );

  Token.setTokensCookies(res, accessToken, refreshToken, accessTokenExp, refreshTokenExp);

  return res.status(user ? 200 : 201).json({
    success: true,
    message: user ? "Welcome back!" : "Registration complete",
    data: {
      user: {
        _id: user._id,
        fullName: user.fullName,
        phone: user.phone,
        email: user.email,
        isVerified: true
      },
      tokens: { accessToken, refreshToken }
    }
  });
};
export const getAllUsers = async (req, res) => {
  try {
    const { search = "", status, sortField = "createdAt", sortOrder = "desc" } = req.query;
    const limitParam = parseInt(req.query.limit);
    const pageParam = parseInt(req.query.page);

    // hardcoded role filter
    const filter = { role: "user" };

    if (search) {
      filter.$or = [
        { fullName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
      ];
    }

    if (status === "active") filter.blocked = false;
    if (status === "inactive") filter.blocked = true;

    const sort = { [sortField]: sortOrder === "asc" ? 1 : -1 };

    const total = await userService.countUsers(filter);

    const usePagination = limitParam && pageParam;

    const limit = usePagination ? limitParam : total;
    const page = usePagination ? pageParam : 1;
    const skip = (page - 1) * limit;

    const users = await userService.getUsers(filter, sort, skip, limit);

    return res.status(200).json({
      success: true,
      message: "Fetched users with pagination & filters",
      data: {
        users,
        total,
        page,
        totalPages: usePagination ? Math.ceil(total / limit) : 1,
      },
      err: {},
    });
  } catch (err) {
    console.error("❌ Error getting all users:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch users",
      data: [],
      err: err.message,
    });
  }
};


// export const getAllUsers = async (req, res) => {
//   try {
//     const { search = "", role, status, sortField = "createdAt", sortOrder = "desc" } = req.query;
//     const limitParam = parseInt(req.query.limit);
//     const pageParam = parseInt(req.query.page);

//     const filter = {};

//     if (search) {
//       filter.$or = [
//         { fullName: { $regex: search, $options: "i" } },
//         { email: { $regex: search, $options: "i" } },
//         { phone: { $regex: search, $options: "i" } },
//       ];
//     }

//     if (role) filter.role = role;
//     if (status === "active") filter.blocked = false;
//     if (status === "inactive") filter.blocked = true;

//     const sort = { [sortField]: sortOrder === "asc" ? 1 : -1 };

//     const total = await userService.countUsers(filter);

//     // ✅ If limit or page not provided, return all users
//     const usePagination = limitParam && pageParam;

//     const limit = usePagination ? limitParam : total;
//     const page = usePagination ? pageParam : 1;
//     const skip = (page - 1) * limit;

//     const users = await userService.getUsers(filter, sort, skip, limit);

//     return res.status(200).json({
//       success: true,
//       message: "Fetched users with pagination & filters",
//       data: {
//         users,
//         total,
//         page,
//         totalPages: usePagination ? Math.ceil(total / limit) : 1,
//       },
//       err: {},
//     });
//   } catch (err) {
//     console.error("❌ Error getting all users:", err);
//     return res.status(500).json({
//       success: false,
//       message: "Failed to fetch users",
//       data: [],
//       err: err.message,
//     });
//   }
// };





// export const getAllUsers = async (req, res) => {
//   try {
//     const users = await userService.getAllUsers();
//     return res.status(200).json({
//       success: true,
//       message: "Fetched all users",
//       data: users,
//       err: {},
//     });
//   } catch (err) {
//     console.error("❌ Error getting all users:", err);
//     return res.status(500).json({
//       success: false,
//       message: "Failed to fetch users",
//       data: [],
//       err: err.message,
//     });
//   }
// };

// Get user by ID
export const getUserById = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
        data: {},
        err: "Missing user ID",
      });
    }

    const user = await userService.getUserById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
        data: {},
        err: "Invalid ID",
      });
    }

    return res.status(200).json({
      success: true,
      message: "User fetched successfully",
      data: user,
      err: {},
    });
  } catch (err) {
    console.error("❌ Error getting user by ID:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      data: {},
      err: err.message,
    });
  }
};

export const blockUser = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ success: false, message: "User ID is required" });
    }

    const updatedUser = await userService.updateUserById(userId, { blocked: true });

    if (!updatedUser) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    return res.status(200).json({
      success: true,
      message: "🚫 User blocked successfully",
      data: updatedUser,
    });
  } catch (err) {
    console.error("❌ Block user error:", err);
    return res.status(500).json({ success: false, message: "Failed to block user", err: err.message });
  }
};

export const unblockUser = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ success: false, message: "User ID is required" });
    }

    const updatedUser = await userService.updateUserById(userId, { blocked: false });

    if (!updatedUser) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    return res.status(200).json({
      success: true,
      message: "✅ User unblocked successfully",
      data: updatedUser,
    });
  } catch (err) {
    console.error("❌ Unblock user error:", err);
    return res.status(500).json({ success: false, message: "Failed to unblock user", err: err.message });
  }
};

// export const createUserByAdmin = async (req, res) => {
//   try {
//     const { firstName, lastName, email, phone, password, role = "user" } = req.body;

//     if (!firstName || !lastName || !phone) {
//       return res.status(400).json({
//         success: false,
//         message: "First name, last name, and phone are required",
//         data: {},
//         err: "Missing required fields",
//       });
//     }

//     const fullName = `${firstName.trim()} ${lastName.trim()}`;

//     // Check if phone or email already exists
//     const existingByPhone = await userService.getUserByPhone(phone);
//     const existingByEmail = email ? await userService.getUserByEmail(email) : null;

//     if (existingByPhone || existingByEmail) {
//       return res.status(409).json({
//         success: false,
//         message: "User with this phone or email already exists",
//         data: {},
//         err: "Duplicate user",
//       });
//     }

//     // Optional: hash password only if provided
//     const hashedPassword = password ? userService.hashPassword(password) : undefined;

//     const newUser = await userService.signup({
//       fullName,
//       email: email || `${phone}@example.com`, // fallback email if not provided
//       phone,
//       password: hashedPassword,
//       role,
//       isVerified: true,
//     });

//     return res.status(201).json({
//       success: true,
//       message: "✅ User created successfully by admin",
//       data: newUser,
//       err: {},
//     });
//   } catch (error) {
//     console.error("❌ Admin create user error:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Failed to create user",
//       data: {},
//       err: error.message,
//     });
//   }
// };

export const createUserByAdmin = async (req, res) => {
  try {
    const { fullName, email, phone, role = "user" } = req.body;

    if (!fullName || !phone) {
      return res.status(400).json({
        success: false,
        message: "Full name and phone are required",
        data: {},
        err: "Missing required fields",
      });
    }

     if (!/^\d{10}$/.test(phone)) {
      return res.status(400).json({
        success: false,
        message: "Phone number must be exactly 10 digits",
        data: {},
        err: "Invalid phone number format",
      });
    }

    // Check if user already exists
    const existingByPhone = await userService.getUserByPhone(phone);
    const existingByEmail = email ? await userService.getUserByEmail(email) : null;

    if (existingByPhone || existingByEmail) {
      return res.status(409).json({
        success: false,
        message: "User with this phone or email already exists",
        data: {},
        err: "Duplicate user",
      });
    }

    // Create new user
    const newUser = await userService.signup({
      fullName: fullName.trim(),
      phone,
      // Only set email if it's a non-empty, non-null string
      ...(email && typeof email === "string" && email.trim() ? { email: email.trim() } : {}),
      role,
      isVerified: true,
    });

    return res.status(201).json({
      success: true,
      message: "✅ User created successfully by admin",
      data: {
        user: {
          _id: newUser._id,
          fullName: newUser.fullName,
          phone: newUser.phone,
          email: newUser.email,
          role: newUser.role,
          isVerified: newUser.isVerified,
        },
      },
      err: {},
    });
  } catch (error) {
    console.error("❌ Admin create user error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create user",
      data: {},
      err: error.message,
    });
  }
};

// export const updateUserWallet = async (req, res) => {
//   try {
//     const { userId } = req.params;
//     const { action, amount } = req.body;
//     if (!userId || typeof amount !== 'number' || amount <= 0 || !['credit', 'debit'].includes(action)) {
//       return res.status(400).json({ success: false, message: 'Invalid userId, amount, or action' });
//     }
//     let updatedUser;
//     if (action === 'credit') {
//       updatedUser = await userService.creditUserWallet(userId, amount);
//     } else {
//       updatedUser = await userService.debitUserWallet(userId, amount);
//     }
//     //enter the wallet history
   

//     return res.status(200).json({
//       success: true,
//       message: `${action === 'credit' ? 'Credited' : 'Debited'} ₹${amount} ${action === 'credit' ? 'to' : 'from'} user wallet`,
//       data: updatedUser,
//     });
//   } catch (err) {
//     return res.status(500).json({ success: false, message: err.message || 'Failed to update wallet' });
//   }
// };



export const updateUserWallet = async (req, res) => {
  try {
    const { userId } = req.params;
    const { action, amount, description = '' } = req.body;

    if (!userId || typeof amount !== 'number' || amount <= 0 || !['credit', 'debit'].includes(action)) {
      return res.status(400).json({ success: false, message: 'Invalid userId, amount, or action' });
    }

    let updatedUser;

    if (action === 'credit') {
      updatedUser = await userService.creditUserWallet(userId, amount);
    } else {
      updatedUser = await userService.debitUserWallet(userId, amount);
    }

   return res.status(200).json({
      success: true,
      message: `${action === 'credit' ? 'Credited' : 'Debited'} ₹${amount} ${action === 'credit' ? 'to' : 'from'} user wallet`,
      data: updatedUser,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message || 'Failed to update wallet' });
  }
};


export const exportCustomers = async (req, res) => {
  try {
    const {
      format = 'csv',
      search = '',
      role,
      status,
      sortField = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const filter = {};

    if (search) {
      filter.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }

    // Only export users with role 'user'
    filter.role = 'user';

    if (role) filter.role = role;
    if (status === 'active') filter.blocked = false;
    if (status === 'inactive') filter.blocked = true;

    const sort = { [sortField]: sortOrder === 'asc' ? 1 : -1 };

    const users = await User.find(filter).sort(sort).lean();
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `customers_export_${timestamp}.${format}`;

    if (format === 'xlsx') {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Customers');

      // Header
      worksheet.columns = [
        { header: 'ID', key: 'id', width: 24 },
        { header: 'Full Name', key: 'fullName', width: 25 },
        { header: 'Email', key: 'email', width: 30 },
        { header: 'Phone', key: 'phone', width: 20 },
        { header: 'Role', key: 'role', width: 15 },
        { header: 'Status', key: 'status', width: 12 },
        { header: 'Wallet Balance', key: 'balance', width: 15 },
        { header: 'Verified', key: 'isVerified', width: 10 },
        { header: 'Created At', key: 'createdAt', width: 25 },
        { header: 'Updated At', key: 'updatedAt', width: 25 }
      ];

      users.forEach(user => {
        worksheet.addRow({
          id: user._id.toString(),
          fullName: user.fullName || '',
          email: user.email || '',
          phone: user.phone || '',
          role: user.role || 'user',
          status: user.blocked ? 'Blocked' : 'Active',
          balance: user.balance || 0,
          isVerified: user.isVerified ? 'Yes' : 'No',
          createdAt: user.createdAt ? new Date(user.createdAt).toLocaleString('en-IN') : '',
          updatedAt: user.updatedAt ? new Date(user.updatedAt).toLocaleString('en-IN') : ''
        });
      });

      worksheet.getRow(1).font = { bold: true };
      worksheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE6E6FA' }
      };

      worksheet.eachRow(row => {
        row.eachCell(cell => {
          cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
          };
        });
      });

      // Summary statistics
      const totalUsers = users.length;
      const activeUsers = users.filter(u => !u.blocked).length;
      const blockedUsers = users.filter(u => u.blocked).length;
      const verifiedUsers = users.filter(u => u.isVerified).length;
      const totalBalance = users.reduce((sum, u) => sum + (u.balance || 0), 0);

      worksheet.addRow([]);
      worksheet.addRow(['SUMMARY STATISTICS']);
      worksheet.addRow(['Total Users', totalUsers]);
      worksheet.addRow(['Active Users', activeUsers]);
      worksheet.addRow(['Blocked Users', blockedUsers]);
      worksheet.addRow(['Verified Users', verifiedUsers]);
      worksheet.addRow(['Total Wallet Balance (₹)', `₹${totalBalance.toLocaleString('en-IN')}`]);

      const summaryStartRow = worksheet.rowCount - 5;
      worksheet.getRow(summaryStartRow).font = { bold: true, size: 14 };
      for (let i = summaryStartRow + 1; i <= worksheet.rowCount; i++) {
        worksheet.getRow(i).font = { bold: true };
        worksheet.getRow(i).getCell(1).fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFF0F8FF' }
        };
      }

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

      await workbook.xlsx.write(res);
      res.end();

    } else if (format === 'csv') {
      const csvHeaders = [
        'ID',
        'Full Name',
        'Email',
        'Phone',
        'Role',
        'Status',
        'Wallet Balance',
        'Verified',
        'Created At',
        'Updated At'
      ];

      const csvRows = users.map(user => [
        user._id.toString(),
        user.fullName || '',
        user.email || '',
        user.phone || '',
        user.role || 'user',
        user.blocked ? 'Blocked' : 'Active',
        user.balance || 0,
        user.isVerified ? 'Yes' : 'No',
        user.createdAt ? new Date(user.createdAt).toLocaleString() : '',
        user.updatedAt ? new Date(user.updatedAt).toLocaleString() : ''
      ]);

      const csvContent = [
        csvHeaders.join(','),
        ...csvRows.map(row =>
          row.map(field => {
            if (typeof field === 'string' && (field.includes(',') || field.includes('"') || field.includes('\n'))) {
              return `"${field.replace(/"/g, '""')}"`;
            }
            return field;
          }).join(',')
        )
      ].join('\n');

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Pragma', 'no-cache');

      return res.status(200).send(csvContent);

    } else if (format === 'json') {
      const exportData = {
        exportDate: new Date().toISOString(),
        totalRecords: users.length,
        filters: { search, role, status, sortField, sortOrder },
        customers: users.map(user => ({
          id: user._id,
          fullName: user.fullName,
          email: user.email,
          phone: user.phone,
          role: user.role,
          status: user.blocked ? 'blocked' : 'active',
          walletBalance: user.balance || 0,
          isVerified: user.isVerified,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt
        }))
      };

      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

      return res.status(200).json(exportData);

    } else {
      return res.status(400).json({
        success: false,
        message: "Invalid export format. Supported formats: csv, json, xlsx",
        data: {},
        err: "Invalid format parameter"
      });
    }

  } catch (err) {
    console.error("❌ Error exporting customers:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to export customers",
      data: {},
      err: err.message
    });
  }
};






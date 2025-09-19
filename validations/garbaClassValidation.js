import Joi from 'joi';

const baseGarbaClassSchema = {
  eid: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/) // ObjectId format
    .required()
    .messages({
      'string.empty': 'Event ID is required.',
      'string.pattern.base': 'Event ID must be a valid MongoDB ObjectId.',
    }),
  name: Joi.string()
    .trim()
    .min(1)
    .max(100)
    .required()
    .messages({
      'string.empty': 'Name is required.',
      'string.min': 'Name must be at least 1 character.',
      'string.max': 'Name must be at most 100 characters.',
    }),
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': 'Email must be a valid email address.',
      'string.empty': 'Email is required.',
    }),
  phone: Joi.string()
    .pattern(/^\+?[0-9]{7,15}$/) // simple phone regex, adjust if needed
    .required()
    .messages({
      'string.pattern.base': 'Phone number is invalid.',
      'string.empty': 'Phone is required.',
    }),
  password: Joi.string()
    .min(6)
    
    .messages({
      'string.min': 'Password must be at least 6 characters.',
      'string.empty': 'Password is required.',
    }),
 profilePic: Joi.alternatives()
  .try(Joi.string(), Joi.object())
  .optional()
  .messages({
    'alternatives.types': 'Profile picture must be a string or a file.',
  }),

  latitude: Joi.string().optional(),
  longitude: Joi.string().optional(),
  zone: Joi.string().optional(),
  role: Joi.string().optional(),
  blocked: Joi.boolean().optional(),
  isDeleted: Joi.boolean().optional(),
};

// Create validation: all required fields must be present
export const garbaClassCreateValidator = Joi.object(baseGarbaClassSchema);

// Update validation: all optional but minimum 1 field required
export const garbaClassUpdateValidator = Joi.object({
  eid: baseGarbaClassSchema.eid.optional(),
  name: baseGarbaClassSchema.name.optional(),
  email: baseGarbaClassSchema.email.optional(),
  phone: baseGarbaClassSchema.phone.optional(),
  password: baseGarbaClassSchema.password.optional(),
  profilePic: baseGarbaClassSchema.profilePic.optional(),
  latitude: baseGarbaClassSchema.latitude.optional(),
  longitude: baseGarbaClassSchema.longitude.optional(),
  zone: baseGarbaClassSchema.zone.optional(),
  role: baseGarbaClassSchema.role.optional(),
  blocked: baseGarbaClassSchema.blocked.optional(),
  isDeleted: baseGarbaClassSchema.isDeleted.optional(),
}).min(1);

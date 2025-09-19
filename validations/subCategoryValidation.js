import Joi from 'joi';

// Custom ObjectId validator (24-character hex string)
const objectId = Joi.string()
  .regex(/^[0-9a-fA-F]{24}$/)
  .message('Each MainCategory ID must be a valid ObjectId');

// Base schema for reuse
const baseSchema = {
  title: Joi.string().trim().min(1).max(255).required().messages({
    'string.empty': 'Title is required.',
    'string.max': 'Title must be under 255 characters.',
  }),
  image: Joi.string().allow('', null),
  coverImage: Joi.string().allow('', null),
  MainCategory: Joi.array()
    .items(objectId)
    .min(1)
    .required()
    .messages({
      'array.base': 'MainCategory must be an array.',
      'array.min': 'At least one MainCategory is required.',
      'string.pattern.base': 'Each MainCategory must be a valid ObjectId.',
    }),
  status: Joi.string().valid('active', 'inactive'),
};

// ✅ Create Validator
export const subCategoryCreateValidator = Joi.object({
  ...baseSchema,
});

// ✅ Update Validator (at least one field must be present)
export const subCategoryUpdateValidator = Joi.object({
  title: baseSchema.title.optional(),
  image: baseSchema.image.optional(),
  coverImage: baseSchema.coverImage.optional(),
  MainCategory: baseSchema.MainCategory.optional(),
  status: baseSchema.status.optional(),
}).min(1).messages({
  'object.min': 'At least one field must be provided for update.',
});

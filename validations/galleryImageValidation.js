import Joi from 'joi';

// Base schema for cover image fields
const basegalleryImageSchema = {
  event: Joi.string()
    .regex(/^[0-9a-fA-F]{24}$/)
    .messages({
      'string.pattern.base': 'Event must be a valid ObjectId.',
      'any.required': 'Event ID is required.'
    }),
  images: Joi.array()
    .items(Joi.string().trim())
    .min(1)
    .messages({
      'array.min': 'At least one image is required.',
      'any.required': 'Images are required.'
    }),
  status: Joi.string()
    .valid('publish', 'Unpublish')
    .messages({
      'any.only': 'Status must be either "publish" or "draft".'
    })
};

// Create validator - required fields must be present
export const galleryImageCreateValidator = Joi.object({
  event: basegalleryImageSchema.event.required(),
  images: basegalleryImageSchema.images.optional(), // Will be handled by file upload
  status: basegalleryImageSchema.status.optional()
});

// Update validator - all optional, but at least one field required
export const galleryImageUpdateValidator = Joi.object({
  event: basegalleryImageSchema.event.optional(),
  images: basegalleryImageSchema.images.optional(),
  status: basegalleryImageSchema.status.optional()
}).min(1); // Require at least one field in update
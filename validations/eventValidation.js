import Joi from 'joi';

// ObjectId validation helper
const objectId = Joi.string().regex(/^[0-9a-fA-F]{24}$/).message('Must be a valid ObjectId');

// Base event schema
const baseEventSchema = {
  name: Joi.string()
    .trim()
    .min(1)
    .max(200)
    .messages({
      'string.empty': 'Event name is required.',
      'string.min': 'Event name must be at least 1 character.',
      'string.max': 'Event name must be at most 200 characters.'
    }),
  image: Joi.string()
    .uri()
    .trim()
    .allow('')
    .messages({
      'string.uri': 'Image must be a valid URI.'
    }),
  coverImage: Joi.string()
    .uri()
    .trim()
    .allow('')
    .messages({
      'string.uri': 'Cover image must be a valid URI.'
    }),
  startDate: Joi.date()
    .messages({
      'date.base': 'Start date must be a valid date.'
    }),
  startTime: Joi.string()
    .trim()
    .messages({
      'string.empty': 'Start time is required.'
    }),
  endTime: Joi.string()
    .trim()
    .messages({
      'string.empty': 'End time is required.'
    }),
  latitude: Joi.any(),
  longitude: Joi.any(),
  isBook: Joi.boolean(),
  placeName: Joi.string()
    .trim()
    .min(1)
    .max(200)
    .messages({
      'string.empty': 'Place name is required.',
      'string.min': 'Place name must be at least 1 character.',
      'string.max': 'Place name must be at most 200 characters.'
    }),
  fullAddress: Joi.string()
    .trim()
    .min(1)
    .max(500)
    .messages({
      'string.empty': 'Full address is required.',
      'string.min': 'Full address must be at least 1 character.',
      'string.max': 'Full address must be at most 500 characters.'
    }),
  status: Joi.string()
    .valid('active', 'inactive'),
  eventStatus: Joi.string()
    .valid('pending', 'approved', 'rejected'),
category: Joi.alternatives().try(
  objectId,
  Joi.array().items(objectId)
).messages({
  'alternatives.types': 'Category must be a valid ObjectId or an array of ObjectIds.'
}),  eventSponsors: Joi.array().items(objectId).messages({
    'array.base': 'Event sponsors must be an array of ObjectIds.'
  }),
  ticketsTypes: Joi.array().items(objectId).messages({
    'array.base': 'Tickets must be an array of ObjectIds.'
  }),
    galleryImages: Joi.array().items(objectId).messages({
    'array.base': 'Gallery images must be an array of ObjectIds.'
  }),
  coverImages: Joi.array().items(objectId).messages({
    'array.base': 'Cover images must be an array of ObjectIds.'
  }),
  description: Joi.string().trim().allow(''),
  disclaimer: Joi.string().allow(''),
  deletedAt: Joi.date().allow(null)
};

// ✅ Create Validator
export const eventCreateValidator = Joi.object({
  name: baseEventSchema.name.required(),
  image: baseEventSchema.image.optional(),
  coverImage: baseEventSchema.coverImage.optional(),
  startDate: baseEventSchema.startDate.required(),
  startTime: baseEventSchema.startTime.required(),
  endTime: baseEventSchema.endTime.required(),
  latitude: baseEventSchema.latitude.required(),
  longitude: baseEventSchema.longitude.required(),
  isBook: baseEventSchema.isBook.optional(),
  placeName: baseEventSchema.placeName.required(),
  fullAddress: baseEventSchema.fullAddress.required(),
  status: baseEventSchema.status.optional(),
  eventStatus: baseEventSchema.eventStatus.optional(),
  category: baseEventSchema.category.required(),
  eventSponsors: baseEventSchema.eventSponsors.optional(),
  ticketsTypes: baseEventSchema.ticketsTypes.optional(),
  galleryImages: baseEventSchema.galleryImages.optional(),
  coverImages: baseEventSchema.coverImages.optional(),
  description: baseEventSchema.description.optional(),
  disclaimer: baseEventSchema.disclaimer.optional(),
  deletedAt: baseEventSchema.deletedAt.optional()
});

// ✅ Update Validator
export const eventUpdateValidator = Joi.object({
  name: baseEventSchema.name.optional(),
  image: baseEventSchema.image.optional(),
  coverImage: baseEventSchema.coverImage.optional(),
  startDate: baseEventSchema.startDate.optional(),
  startTime: baseEventSchema.startTime.optional(),
  endTime: baseEventSchema.endTime.optional(),
  latitude: baseEventSchema.latitude.optional(),
  longitude: baseEventSchema.longitude.optional(),
  isBook: baseEventSchema.isBook.optional(),
  placeName: baseEventSchema.placeName.optional(),
  fullAddress: baseEventSchema.fullAddress.optional(),
  status: baseEventSchema.status.optional(),
  eventStatus: baseEventSchema.eventStatus.optional(),
  category: baseEventSchema.category.optional(),
  eventSponsors: baseEventSchema.eventSponsors.optional(),
  ticketsTypes: baseEventSchema.ticketsTypes.optional(),
  galleryImages: baseEventSchema.galleryImages.optional(),
  coverImages: baseEventSchema.coverImages.optional(),
  description: baseEventSchema.description.optional(),
  disclaimer: baseEventSchema.disclaimer.optional(),
  deletedAt: baseEventSchema.deletedAt.optional()
}).min(1); // Ensure at least one field is present

// validations/eventSponsorValidation.js
import Joi from 'joi';

// Base schema for event sponsor fields
const baseEventSponsorSchema = {
  event: Joi.string()
    .regex(/^[0-9a-fA-F]{24}$/)
    .messages({
      'string.pattern.base': 'Event must be a valid ObjectId.',
      'any.required': 'Event ID is required.'
    }),
  name: Joi.string()
    .trim()
    .min(1)
    .max(200)
    .messages({
      'string.empty': 'Sponsor name is required.',
      'string.min': 'Sponsor name must be at least 1 character.',
      'string.max': 'Sponsor name must be at most 200 characters.',
      'any.required': 'Sponsor name is required.'
    }),
  image: Joi.string()
    .trim()
    .allow('')
    .messages({
      'string.base': 'Image must be a string.',
      'any.required': 'Image is required.'
    }),
  link: Joi.string()
    .uri()
    .trim()
    .allow('')
    .messages({
      'string.uri': 'Link must be a valid URL.',
      'string.base': 'Link must be a string.'
    }),
  status: Joi.string()
    .valid('Publish', 'Unpublish')
    .messages({
      'any.only': 'Status must be either "Publish" or "Unpublish".'
    }),
  is_home: Joi.boolean()
    .messages({
      'boolean.base': 'is_home must be a boolean value.'
    })
};

// Create validator - required fields must be present
export const eventSponsorCreateValidator = Joi.object({
  event: baseEventSponsorSchema.event.required(),
  name: baseEventSponsorSchema.name.required(),
  image: baseEventSponsorSchema.image.optional(), // Handled by file upload
  link: baseEventSponsorSchema.link.optional(),
  status: baseEventSponsorSchema.status.optional(),
  is_home: baseEventSponsorSchema.is_home.optional()
});

// Update validator - all optional, but at least one field required
export const eventSponsorUpdateValidator = Joi.object({
  event: baseEventSponsorSchema.event.optional(),
  name: baseEventSponsorSchema.name.optional(),
  image: baseEventSponsorSchema.image.optional(),
  link: baseEventSponsorSchema.link.optional(),
  status: baseEventSponsorSchema.status.optional(),
  is_home: baseEventSponsorSchema.is_home.optional()
}).min(1); // Require at least one field in update

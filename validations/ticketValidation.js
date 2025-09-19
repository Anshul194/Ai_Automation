import Joi from "joi";

const priceSchema = Joi.object({
  date: Joi.date(),
  day: Joi.string().valid(
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday"
  ),
  zone: Joi.string().trim().max(100).optional(),
  price: Joi.number().min(0).required(),
});

const baseTicketSchema = {
  event: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({ "string.pattern.base": "Event must be a valid ObjectId." }),
  ticketTypeId: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      "string.pattern.base": "Ticket Type ID must be a valid ObjectId.",
    }),
  ticketType: Joi.string().trim().min(1).max(100).required(),
  prices: Joi.array().items(priceSchema).min(1).required(),
  type: Joi.string().valid("Regular", "Khelaiya").optional(),
  color: Joi.string().trim().allow(null).optional(),
  fontColor: Joi.string().trim().allow(null).optional(),
  limit: Joi.number().integer().min(1).required(),
  status: Joi.string().valid("publish", "Unpublish").optional(),

};


export const ticketCreateValidator = Joi.object(baseTicketSchema);

export const ticketUpdateValidator = Joi.object({
  event: baseTicketSchema.event.optional(),
  ticketType: baseTicketSchema.ticketType.optional(),
  prices: baseTicketSchema.prices.optional(),
  type: baseTicketSchema.type.optional(),
  color: baseTicketSchema.color.optional(),
  fontColor: baseTicketSchema.fontColor.optional(),
  limit: baseTicketSchema.limit.optional(),
  status: baseTicketSchema.status.optional(),
  ticketTypeId: baseTicketSchema.ticketTypeId.optional(),
}).min(1);

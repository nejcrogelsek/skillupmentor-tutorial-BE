import * as Joi from '@hapi/joi'

export const configValidationSchema = Joi.object({
  STAGE: Joi.string().required(),
  JWT_SECRET: Joi.string().required(),
  JWT_SECRET_EXPIRES: Joi.number().required(),
  JWT_REFRESH_SECRET: Joi.string().required(),
  JWT_REFRESH_SECRET_EXPIRES: Joi.number().required(),
})

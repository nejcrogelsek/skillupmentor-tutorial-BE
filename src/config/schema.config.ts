import * as Joi from '@hapi/joi'

export const configValidationSchema = Joi.object({
  STAGE: Joi.string().required(),
  SENDGRID_API_KEY: Joi.string().required(),
  SENDGRID_EMAIL_FROM: Joi.string().required(),
  JWT_SECRET: Joi.string().required(),
  JWT_SECRET_EXPIRES: Joi.number().required(),
  JWT_REFRESH_SECRET: Joi.string().required(),
  JWT_REFRESH_SECRET_EXPIRES: Joi.number().required(),
  JWT_EMAIL_VERIFICATION_SECRET: Joi.string().required(),
  JWT_EMAIL_VERIFICATION_EXPIRES: Joi.number().required(),
  CLIENT_URL: Joi.string().required(),
  EMAIL_CONFIRMATION_URL: Joi.string().required(),
  ON_EMAIL_VERIFICATION_SUCCESS_URL: Joi.string().required(),
  ON_VERIFY_RESET_TOKEN_SUCCESS_URL: Joi.string().required(),
  ON_ERROR_URL: Joi.string().required(),
})

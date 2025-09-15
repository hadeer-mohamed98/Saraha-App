import { Types } from "mongoose";
import { asyncHandler } from "../utils/response.js";
import joi from "joi";
import { genderEnum } from "../DB/models/User.model.js";
import { fileValidation } from "../utils/multer/local.multer.js";
// export const validation = (schema) => {
//   return asyncHandler(async (req, res, next) => {
//     const validationResult = schema.validate(req.body, {
//       abortEarly: false,
//     });
//     if (validationResult.error) {
//       return res.status(400).json({ err_message:"validation error",  validationResult });
//     }
//     return next()
//   });

// };

export const generalFields = {
  fullName: joi.string().min(2).max(20).required().messages({
    "string.min": "min name length is 2 char",
    "any.required": "full name is mandatory",
  }),
  email: joi.string().email({
    minDomainSegments: 2,
    maxDomainSegments: 3,
    tlds: { allow: ["net", "com", "edu"] },
  }),

  password: joi
    .string()
    .pattern(new RegExp(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/)),
  confirmPassword: joi.string().valid(joi.ref("password")),
  phone: joi.string().pattern(new RegExp(/^(002|\+2)?01[0125][0-9]{8}$/)),
  otp: joi.string().pattern(new RegExp(/^\d{6}$/)),
  gender: joi.string().valid(...Object.values(genderEnum)),
  id: joi.string().custom((value, helper) => {
    return Types.ObjectId.isValid(value) || helper.message("invalid ObjectId");
  }),
  file: {
    fieldname: joi.string(),
    originalname: joi.string(),
    encoding: joi.string(),
    mimetype: joi.string(),
    finalPath: joi.string(),
    destination: joi.string(),
    filename: joi.string(),
    path: joi.string(),
    size: joi.number().positive(),
  },
};

export const validation = (schema) => {
  return asyncHandler(async (req, res, next) => {
    const validationErrors = [];
    for (const key of Object.keys(schema)) {
      const validationResult = schema[key].validate(req[key], {
        abortEarly: false,
      });
      if (validationResult.error) {
        validationErrors.push({key, details: validationResult.error?.details});
      }
    }
    if (validationErrors.length) {
      return res
        .status(400)
        .json({ err_message: "validation error", error: validationErrors });
    }
    return next();
  });
};

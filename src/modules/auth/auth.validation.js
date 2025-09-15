import joi from "joi";
import { generalFields } from "../../middleware/validation.middleware.js";

export const login = {
  body: joi.object().keys({
    email: generalFields.email.required(),
    password:generalFields.password.required(),
  }).required().options({allowUnknown:false})
};

export const signup = {
  body: login.body.append({
    fullName: generalFields.fullName.required(),
    confirmPassword: generalFields.confirmPassword.required(),
    phone: generalFields.phone.required(),
  }).required().options({allowUnknown:false})
};

export const confirmEmail = {
  body: joi.object().keys({
    email: generalFields.email.required(),
    otp: generalFields.otp.required()
  }).required().options({allowUnknown:false})
};

export const sendForgotPassword = {
  body: joi.object().keys({
    email: generalFields.email.required(),
  })
};

export const verifyForgotPassword = {
  body: sendForgotPassword.body.append({
    otp: generalFields.otp.required()
  })
};

export const resetPassword = {
  body: verifyForgotPassword.body.append({
    password:generalFields.password.required(),
    confirmPassword:generalFields.confirmPassword.required()
  })
};

// export const login = {
//   body: joi.object().keys({
//     email: joi
//       .string()
//       .email({
//         minDomainSegments: 2,
//         maxDomainSegments: 3,
//         tlds: { allow: ["net", "com", "edu"] },
//       })
//       .required(),
//     password: joi
//       .string()
//       .pattern(
//         new RegExp(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/)
//       )
//       .required(),
//   }),
// };

// export const signup = {
//   query: joi.object().keys({
//     lang: joi.string().valid("ar", "en").required(),
//   }),

//   body: joi.object()
//     .keys({
//       fullName: joi.string()
//       // .alphanum()
//       .min(2).max(20).required().messages({
//         "string.min": "min name length is 2 char",
//         "any.required": "full name is mandatory",
//       }),
//       email: joi
//         .string()
//         .email({
//           minDomainSegments: 2,
//           maxDomainSegments: 3,
//           tlds: { allow: ["net", "com", "edu"] },
//         })
//         .required(),
//       phone: joi
//         .string()
//         .pattern(new RegExp(/^(002|\+2)?01[0125][0-9]{8}$/))
//         .required(),
//       password: joi
//         .string()
//         .pattern(
//           new RegExp(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/)
//         )
//         .required(),
//       confirmPassword: joi.string().valid(joi.ref("password")).required(),
//     })
//     .required()
//     .options({ allowUnknown: false }),
// };








//   age:joi.number().positive().integer().min(18).max(150),
//   flag:joi.boolean().sensitive().truthy(1, "1").falsy(0, "0"),
//   fav:joi.array().ordered(joi.string().required(), joi.number().required())

import * as DBService from "../../DB/db.service.js";
import { providerEnum, UserModel } from "../../DB/models/User.model.js";
import { asyncHandler, successResponse } from "../../utils/response.js";
import {
  compareHash,
  generateHash,
} from "../../utils/security/hash.security.js";
import { generateEncryption } from "../../utils/security/encryption.security.js";
import { generateLoginCredentials } from "../../utils/security/token.security.js";
import { OAuth2Client } from "google-auth-library";
import { emailEvent } from "../../utils/events/email.event.js";
import { customAlphabet } from "nanoid";

const generateOTP = customAlphabet("0123456789", 6);

export const signup = asyncHandler(async (req, res, next) => {
  const { fullName, email, password, phone } = req.body;

  if (await DBService.findOne({ model: UserModel, filter: { email } })) {
    return next(new Error("email exist", { cause: 409 }));
  }
  const hashPassword = await generateHash({ plaintext: password });
  const encPhone = await generateEncryption({ plaintext: phone });
  const otp = generateOTP();
  const confirmEmailOtp = await generateHash({ plaintext: otp });

  const [user] = await DBService.create({
    model: UserModel,
    data: [
      {
        fullName,
        email,
        password: hashPassword,
        phone: encPhone,
        confirmEmailOtp,
      },
    ],
  });

  emailEvent.emit("confirmEmail", { to: email, otp: otp });
  return successResponse({ res, status: 201, data: { user } });
});

export const login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;
  const user = await DBService.findOne({
    model: UserModel,
    filter: { email, provider: providerEnum.system },
    //  select:"-password"
  });
  if (!user) {
    return next(new Error("invalid email or password", { cause: 404 }));
  }
  if (!user.confirmEmail) {
    return next("please verify your account first");
  }
  if (user.deletedAt) {
    return next("this account is deleted");
  }
  const match = await compareHash({
    plaintext: password,
    hashValue: user.password,
  });
  if (!match) {
    return next(new Error("invalid email or password 2 ", { cause: 404 }));
  }

  const credentials = await generateLoginCredentials({ user });

  return successResponse({ res, data: { credentials } });
});

// export const sendForgotPassword = asyncHandler(async (req, res, next) => {
//   const { email } = req.body;
//   const otp = customAlphabet("0123456789", 6)();
//   const user = await DBService.findOneAndUpdate({
//     model: UserModel,
//     filter: {
//       email,
//       confirmEmail: { $exists: true },
//       deletedAt: { $exists: false },
//       provider: providerEnum.system,
//     },
//     data: {
//       forgotPasswordOTP: await generateHash({ plaintext: otp }),
//     },
//   });
//   if (!user) {
//     return next(new Error("invalid email or password", { cause: 404 }));
//   }
//   emailEvent.emit("sendForgotPassword", {
//     to: email,
//     subject: "Forgot Password",
//     title: "Reset Password",
//     otp,
//   });

//   return successResponse({ res });
// });

// export const verifyForgotPassword = asyncHandler(async (req, res, next) => {
//   const { email, otp } = req.body;
//   const user = await DBService.findOne({
//     model: UserModel,
//     filter: {
//       email,
//       confirmEmail: { $exists: true },
//       deletedAt: { $exists: false },
//       forgotPasswordOTP: { $exists: true },
//       provider: providerEnum.system,
//     },
//   });
//   if (!user) {
//     return next(new Error("invalid email or password", { cause: 404 }));
//   }
//   if (
//     !(await compareHash({ plaintext: otp, hashValue: user.forgotPasswordOTP }))
//   ) {
//     return next(new Error("invalid otp", { cause: 400 }));
//   }

//   return successResponse({ res });
// });

// export const resetPassword = asyncHandler(async (req, res, next) => {
//   const { email, otp, password } = req.body;
//   const user = await DBService.findOne({
//     model: UserModel,
//     filter: {
//       email,
//       confirmEmail: { $exists: true },
//       deletedAt: { $exists: false },
//       forgotPasswordOTP: { $exists: true },
//       provider: providerEnum.system,
//     },
//   });
//   if (!user) {
//     return next(new Error("invalid email or password", { cause: 404 }));
//   }
//   if (
//     !(await compareHash({ plaintext: otp, hashValue: user.forgotPasswordOTP }))
//   ) {
//     return next(new Error("invalid otp", { cause: 400 }));
//   }
//   const updatedUser = await DBService.updateOne({
//     model: UserModel,
//     filter: {
//       email,
//     },
//     data: {
//       password: await generateHash({ plaintext: password }),
//       changeCredentialsTime: new Date(),
//       $unset: {
//         forgotPasswordOTP: 1,
//       },
//     },
//   });

//   return updatedUser.matchedCount
//     ? successResponse({ res })
//     : next(new Error("Fail to reset Account Password"));
// });



// ============================
// Send Forgot Password OTP
// ============================

export const sendForgotPassword = asyncHandler(async (req, res, next) => {
  const { email } = req.body;
  const user = await DBService.findOne({
    model: UserModel,
    filter: {
      email,
      confirmEmail: { $exists: true },
      deletedAt: { $exists: false },
      provider: providerEnum.system,
    },
  });

  if (!user) {
    return next(new Error("invalid email", { cause: 404 }));
  }

  // لو في بلوك
  if (user.otpBlockedUntil && user.otpBlockedUntil > new Date()) {
    return next(new Error("Too many attempts, try again later", { cause: 429 }));
  }

  // لو لسه عنده OTP شغال
  if (user.otpExpires && user.otpExpires > new Date()) {
    return next(new Error("OTP already sent, wait until it expires", { cause: 400 }));
  }

  // توليد OTP جديد
  const otp = generateOTP();
  const hashedOtp = await generateHash({ plaintext: otp });

  await DBService.updateOne({
    model: UserModel,
    filter: { _id: user._id },
    data: {
      otp: hashedOtp,
      otpExpires: new Date(Date.now() + 2 * 60 * 1000), // صلاحية دقيقتين
      otpAttempts: 0, // reset attempts
      $unset: { otpBlockedUntil: 1 }, // clear block لو موجود
    },
  });

  // ابعت OTP على الإيميل
  emailEvent.emit("sendForgotPassword", {
    to: email,
    subject: "Forgot Password",
    title: "Reset Password",
    otp,
  });

  return successResponse({ res, message: "OTP sent successfully" });
});


// ============================
// Verify Forgot Password OTP
// ============================
export const verifyForgotPassword = asyncHandler(async (req, res, next) => {
  const { email, otp } = req.body;
  const user = await DBService.findOne({ model: UserModel, filter: { email } });

  if (!user || !user.otp) {
    return next(new Error("Invalid request", { cause: 404 }));
  }

  // check block
  if (user.otpBlockedUntil && user.otpBlockedUntil > new Date()) {
    return next(new Error("Account blocked, try again later", { cause: 429 }));
  }

  // check expiry
  if (!user.otpExpires || user.otpExpires < new Date()) {
    return next(new Error("OTP expired", { cause: 400 }));
  }

  const isMatch = await compareHash({ plaintext: otp, hashValue: user.otp });

  if (!isMatch) {
    const attempts = (user.otpAttempts || 0) + 1;

    if (attempts >= 5) {
      await DBService.updateOne({
        model: UserModel,
        filter: { _id: user._id },
        data: {
          otpAttempts: attempts,
          otpBlockedUntil: new Date(Date.now() + 5 * 60 * 1000), // بلوك 5 دقايق
        },
      });
      return next(new Error("Too many attempts, account blocked for 5 minutes", { cause: 429 }));
    } else {
      await DBService.updateOne({
        model: UserModel,
        filter: { _id: user._id },
        data: { otpAttempts: attempts },
      });
    }

    return next(new Error("Invalid OTP", { cause: 400 }));
  }

  // ✅ صح → امسح OTP وخلي المستخدم يقدر يغير الباسورد
  await DBService.updateOne({
    model: UserModel,
    filter: { _id: user._id },
    data: { otpVerified: true },
  });

  return successResponse({ res, message: "OTP verified, you can reset your password" });
});

// ============================
// Reset Password
// ============================

export const resetPassword = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  const user = await DBService.findOne({ model: UserModel, filter: { email } });

  if (!user || !user.otpVerified) {
    return next(new Error("OTP verification required", { cause: 403 }));
  }

  await DBService.updateOne({
    model: UserModel,
    filter: { _id: user._id },
    data: {
      password: await generateHash({ plaintext: password }),
      changeCredentialsTime: new Date(),
      $unset: { otp: 1, otpExpires: 1, otpAttempts: 1, otpVerified: 1 },
    },
  });

  return successResponse({ res, message: "Password reset successfully" });
});

export const confirmEmail = asyncHandler(async (req, res, next) => {
  const { email, otp } = req.body;
  const user = await DBService.findOne({
    model: UserModel,
    filter: {
      email,
      confirmEmail: { $exists: false },
      confirmEmailOtp: { $exists: true },
    },
  });
  if (!user) {
    return next(
      new Error("invalid account or already verified", { cause: 404 })
    );
  }
  if (
    !(await compareHash({ plaintext: otp, hashValue: user.confirmEmailOtp }))
  ) {
    return next(new Error("invalid otp"));
  }
  const updatedUser = await DBService.updateOne({
    model: UserModel,
    filter: { email },
    data: {
      confirmEmail: Date.now(),
      $unset: { confirmEmailOtp: true },
      $inc: { __v: 1 },
    },
  });
  return updatedUser.matchedCount
    ? successResponse({ res, status: 200, data: {} })
    : next(new Error("Fail to confirm user email"));
});

async function verifyGoogleAccount({ idToken } = {}) {
  const client = new OAuth2Client();
  const ticket = await client.verifyIdToken({
    idToken,
    audience: process.env.WEB_CLIENT_IDS.split(","),
  });
  const payload = ticket.getPayload();
  return payload;
}

export const signupWithGmail = asyncHandler(async (req, res, next) => {
  const { idToken } = req.body;
  const { picture, name, email_verified, email } = await verifyGoogleAccount({
    idToken,
  });
  if (!email_verified) {
    return next(new Error("not verified email", { cause: 400 }));
  }
  const user = await DBService.findOne({
    model: UserModel,
    filter: { email },
  });
  if (user) {
    if (user.provider === providerEnum.google) {
      const credentials = await generateLoginCredentials({ user });
      return successResponse({ res, status: 200, data: { credentials } });
    }
    return next(new Error("email exists", { cause: 409 }));
  }
  const [newUser] = await DBService.create({
    model: UserModel,
    data: [
      {
        fullName: name,
        email,
        picture,
        confirmEmail: Date.now(),
        provider: providerEnum.google,
      },
    ],
  });
  const credentials = await generateLoginCredentials({ user: newUser });
  return successResponse({ res, status: 201, data: { credentials } });
  // return successResponse({ res, status: 201, data: { user: newUser._id } });
});

export const loginWithGmail = asyncHandler(async (req, res, next) => {
  const { idToken } = req.body;
  const { email_verified, email } = await verifyGoogleAccount({ idToken });
  if (!email_verified) {
    return next(new Error("not verified email", { cause: 400 }));
  }
  const user = await DBService.findOne({
    model: UserModel,
    filter: { email, provider: providerEnum.google },
  });
  if (!user) {
    return next(
      new Error("invalid login data or invalid provider", { cause: 404 })
    );
  }
  const credentials = await generateLoginCredentials({ user });
  return successResponse({ res, status: 200, data: { credentials } });
});

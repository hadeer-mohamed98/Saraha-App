import { validation } from "../../middleware/validation.middleware.js";
import * as authService from "./auth.service.js";
import * as validators from "./auth.validation.js";
import { Router } from "express";

const router = Router();
router.post("/signup", validation(validators.signup), authService.signup);
router.post("/login", validation(validators.login), authService.login);
router.patch(
  "/send-forgot-password",
  validation(validators.sendForgotPassword),
  authService.sendForgotPassword
);

router.patch(
  "/verify-forgot-password",
  validation(validators.verifyForgotPassword),
  authService.verifyForgotPassword
);

router.patch(
  "/reset-forgot-password",
  validation(validators.resetPassword),
  authService.resetPassword
);

router.patch("/confirm-email", authService.confirmEmail);
router.post("/signup/gmail", authService.signupWithGmail);
router.post("/login/gmail", authService.loginWithGmail);
export default router;

import {
  auth,
  authentication,
} from "../../middleware/authentication.middleware.js";
import { validation } from "../../middleware/validation.middleware.js";
import { cloudFileUpload } from "../../utils/multer/cloud.multer.js";
import {
  fileValidation,
  localFileUpload,
} from "../../utils/multer/local.multer.js";
import { tokenTypeEnum } from "../../utils/security/token.security.js";
import { endPoint } from "./user.authorization.js";
import * as userService from "./user.service.js";
import * as validators from "./user.validation.js";

import { Router } from "express";

const router = Router();

router.post("/logout", authentication(), userService.logout);
router.get(
  "/",
  validation(validators.logout),
  auth({ accessRoles: endPoint.profile }),
  userService.profile
);

router.patch(
  "/",
  authentication(),
  validation(validators.updateBasicInfo),
  userService.updateBasicInfo
);

router.patch(
  "/password",
  authentication(),
  validation(validators.updatePassword),
  userService.updatePassword
);

router.patch(
  "/profile-image",
  authentication(),
  cloudFileUpload({
    validation: fileValidation.image,
  }).single("image"),
  validation(validators.profileImage),
  userService.profileImage
);

// router.patch(
//   "/profile-image",
//   authentication(),
//   localFileUpload({
//     customPath: "User",
//     validation: fileValidation.image,
//   }).single("image"),
//   validation(validators.profileImage),
//   userService.profileImage
// );

router.patch(
  "/profile-cover-images",
  authentication(),
  cloudFileUpload({
    validation: [...fileValidation.image, fileValidation.document[0]],
  }).array("images", 2),
  // .fields([
  //   { name: "images", maxCount: 2 },
  //   { name: "certificates", maxCount: 1 },
  // ]),
  validation(validators.profileCoverImage),
  userService.profileCoverImage
);

router.patch(
  "/:userId/restore-account",
  auth({ accessRoles: endPoint.restoreAccount }),
  validation(validators.restoreAccount),
  userService.restoreAccount
);

router.delete(
  "/:userId",
  auth({ accessRoles: endPoint.deleteAccount }),
  validation(validators.deleteAccount),
  userService.deleteAccount
);

router.delete(
  "{/:userId}/freeze-account",
  authentication(),
  validation(validators.freezeAccount),
  userService.freezeAccount
);

router.get(
  "/refresh-token",
  authentication({ tokenType: tokenTypeEnum.refresh }),
  userService.getNewLoginCredentials
);
router.get(
  "/:userId",
  validation(validators.shareProfile),
  userService.shareProfile
);
export default router;

import fs from "node:fs";
import path from "node:path";
import multer from "multer";

export const fileValidation = {
  image: ["image/jpeg", "image/png", "image/gif"],
  document: [
    "application/pdf",
    "application/json",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ],
};
export const localFileUpload = ({
  customPath = "general",
  validation = [],
} = {}) => {
  let basePath = `uploads/${customPath}`;

  const storage = multer.diskStorage({
    destination: function (req, file, callBack) {
      if (req.user?._id) {
        basePath += `/${req.user._id}`;
      }
      const fullPath = path.resolve(`./src/${basePath}`);
      if (!fs.existsSync(fullPath)) {
        fs.mkdirSync(fullPath, { recursive: true });
      }
      req.basePath = basePath;
      callBack(null, path.resolve(fullPath));
    },
    filename: function (req, file, callBack) {
      const uniqueFileName =
        file.originalname + "__" + Math.random() + "__" + Date.now();
      file.finalPath = basePath + "/" + uniqueFileName;
      callBack(null, uniqueFileName);
    },
  });

  const fileFilter = function (req, file, callBack) {
    if (validation.includes(file.mimetype)) {
      return callBack(null, true);
    }
    return callBack("invalid file format", false);
  };
  return multer({
    dest: "./temp",
    fileFilter,
    storage,
  });
};

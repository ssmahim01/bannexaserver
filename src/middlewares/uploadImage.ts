import multer from "multer";
import path from "path";
import { Request } from "express";

const storage = multer.memoryStorage();

const imageFileFilter = (
  _req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback,
) => {
  const allowedExtensions =
    /\.(jpeg|jpg|png|webp)$/i;

  const allowedMimeTypes =
    /^image\/(jpeg|jpg|png|webp)$/i;

  const extname =
    allowedExtensions.test(
      path.extname(file.originalname),
    );

  const mimetype =
    allowedMimeTypes.test(
      file.mimetype,
    );

  if (extname && mimetype) {
    return cb(null, true);
  }

  return cb(
    new Error(
      "Only JPEG, JPG, PNG, and WebP images are allowed!",
    ),
  );
};

export const uploadImage = multer({
  storage,

  limits: {
    fileSize: 5 * 1024 * 1024,
  },

  fileFilter: imageFileFilter,
});
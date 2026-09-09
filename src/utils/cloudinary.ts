import cloudinary from "../config/cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export function getSignedDownloadUrl(publicId: string) {
  return cloudinary.utils.private_download_url(publicId, "png", {
    type: "upload",
    expires_at: Math.floor(Date.now() / 1000) + 60 * 5,
  });
}

export function uploadToCloudinaryBuffer(
  buffer: Buffer,
  folder = "bannexa-posts",
) {
  return new Promise<any>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      },
    );

    stream.end(buffer);
  });
}
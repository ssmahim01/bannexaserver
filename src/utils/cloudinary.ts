import cloudinary from "cloudinary";

export function getSignedDownloadUrl(publicId: string) {
  return cloudinary.v2.utils.private_download_url(
    publicId,
    "png",
    {
      expires_at: Math.floor(Date.now() / 1000) + 60, 
    }
  );
}
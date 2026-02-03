import { v2 as cloudinary } from "cloudinary";

export function buildBannerUrl(
  basePublicId: string,
  layers: any[],
  width: number,
  height: number
) {
  const overlays = layers.map((layer) => {
    if (layer.type === "text") {
      return {
        overlay: {
          font_family: "NotoSansBengali",
          font_size: layer.fontSize,
          text: layer.text,
        },
        color: layer.color,
        gravity: "north_west",
        x: layer.x,
        y: layer.y,
      };
    }

    if (layer.type === "image") {
      return {
        overlay: layer.publicId,
        width: layer.width,
        height: layer.height,
        gravity: "north_west",
        x: layer.x,
        y: layer.y,
      };
    }
  });

  return cloudinary.url(basePublicId, {
    width,
    height,
    crop: "fill",
    transformation: overlays,
    secure: true,
    format: "png",
  });
}
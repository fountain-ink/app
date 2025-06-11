"use client";

import Image, { ImageProps } from "next/image";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { dataUrl } from "@/lib/utils/image-optimization";

interface OptimizedImageProps extends Omit<ImageProps, "placeholder"> {
  fallbackSrc?: string;
  aspectRatio?: "square" | "video" | "4/3" | "16/9";
}

export function OptimizedImage({
  src,
  alt,
  className,
  fallbackSrc = "/images/placeholder-tile.svg",
  aspectRatio,
  width,
  height,
  fill,
  sizes,
  priority = false,
  quality = 85,
  onLoad,
  onError,
  ...props
}: OptimizedImageProps) {
  const [imgSrc, setImgSrc] = useState(src);
  const [isLoading, setIsLoading] = useState(true);

  const aspectRatioClass = aspectRatio
    ? {
        square: "aspect-square",
        video: "aspect-video",
        "4/3": "aspect-[4/3]",
        "16/9": "aspect-[16/9]",
      }[aspectRatio]
    : "";

  const handleLoad = (result: any) => {
    setIsLoading(false);
    onLoad?.(result);
  };

  const handleError = (error: any) => {
    setImgSrc(fallbackSrc);
    onError?.(error);
  };

  const blurDataURL = width && height ? dataUrl(Number(width), Number(height)) : undefined;

  return (
    <div className={cn("relative overflow-hidden", aspectRatioClass, fill && "w-full h-full")}>
      <Image
        src={imgSrc}
        alt={alt}
        className={cn(
          "duration-700 ease-in-out",
          isLoading ? "opacity-0" : "opacity-100",
          className
        )}
        width={width}
        height={height}
        fill={fill}
        sizes={sizes}
        priority={priority}
        loading={priority ? "eager" : "lazy"}
        quality={quality}
        placeholder={blurDataURL ? "blur" : "empty"}
        blurDataURL={blurDataURL}
        onLoad={handleLoad}
        onError={handleError}
        {...props}
      />
    </div>
  );
}
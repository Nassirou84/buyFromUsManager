import { Product } from '@/types/product';

// The photo flagged `isCover`, otherwise the first one.
export const getCoverPhotoUrl = (product?: Product): string | undefined => {
  const photos = product?.photos ?? [];
  return (photos.find((p) => p?.isCover) ?? photos[0])?.url;
};

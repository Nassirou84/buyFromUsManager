import axios from "@/utils/axios";
import { useMutation } from '@tanstack/react-query';

// Uploads the file to the bucket and returns its public URL, which is then saved as the banner's `imageUrl`.
const uploadBannerImage = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append('file', file);
  const response = await axios.post<{ imageUrl: string }>('/admin/banner/upload-image', formData);
  return response.data.imageUrl;
}

const useUploadBannerImage = () => useMutation({
  mutationFn: uploadBannerImage
});

export { uploadBannerImage };
export default useUploadBannerImage;

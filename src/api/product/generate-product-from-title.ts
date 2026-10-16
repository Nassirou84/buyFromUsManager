import axios from '@/utils/axios';

const generateProductFromTitle = async (productData: any) => {
  const response = await axios.post('/gemini/generate-product-content-from-title', productData);
  return response.data;
};

export default generateProductFromTitle;
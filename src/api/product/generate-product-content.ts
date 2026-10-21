import axios from '@/utils/axios';

const generateProductContent = async (productData: any) => {
  const response = await axios.post('/gemini/generate-product-content', productData);
  return response.data;
};

export default generateProductContent;
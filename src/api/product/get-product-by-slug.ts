import { cache } from 'react';
import axios from '@/utils/axios';
import { isAxiosError } from 'axios';
import https from 'https';

const httpsAgent = new https.Agent({
  rejectUnauthorized: process.env.NODE_ENV === 'production',
});

export const getProductBySlug = cache(async (slug: string) => {
  try {
    const encodedSlug = encodeURIComponent(slug);

    const response = await axios.get(`/products?slug=${encodedSlug}`,
      {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        httpsAgent,
      },
    );

    return response.data[0] || null;
  } catch (error) {
    if (isAxiosError(error)) {
      if (error.response?.status === 404) {
        return null;
      }
      console.error(
        `Axios Error [${error.response?.status || 'Network Error'}]:`,
        error.response?.data || error.message
      );
    }

    throw error;
  }
});
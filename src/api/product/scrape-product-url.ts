import { Product } from "@/types/product";
import axios from "axios";
const SCRAPPER_HOST = process.env.NEXT_PUBLIC_SCRAPPER_HOST;

const scrapeProductUrl = async (url: string): Promise<Product> => {
  const sanitizedUrl = new URL(url).toString();

  const response = await axios.get(`${SCRAPPER_HOST}/scrapper`, { params: { url: sanitizedUrl } });
  return response.data;
};

export default scrapeProductUrl;
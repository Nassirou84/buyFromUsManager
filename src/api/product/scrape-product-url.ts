import { Product } from "@/types/product";
import axios from "@/utils/axios";

const scrapeProductUrl = async (url: string): Promise<Product> => {
  const sanitizedUrl = new URL(url).toString();

  const response = await axios.get("/on-demand-scrape", { params: { url: sanitizedUrl } });
  return response.data;
};

export default scrapeProductUrl;
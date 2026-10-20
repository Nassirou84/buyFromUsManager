export type FaqElementType = 'title' | 'paragraph' | 'list' | 'image' | 'video';

export interface FaqBlockElement {
  id: string;
  type: FaqElementType;
  title?: string;
  level?: string;
  text?: string;
  items?: string[];
  imageUrl?: string;
  imageAlt?: string;
  imageDimensions?: string;
  videoUrl?: string;
  videoDuration?: string;
  videoFormat?: string;
}

export interface FaqItem {
  id: string;
  order: number;
  question: string;
  elements: FaqBlockElement[];
  published: boolean;
  highlight: boolean;
  tags: string[];
  cta?: { label: string; url: string } | null;
  satisfactionRate: number;
}

export interface FaqCategory {
  id: string;
  slug: string;
  title: string;
  icon: string;
  accordionBehavior: 'multi-open' | 'strict' | 'expanded';
  targetPages: string[];
  displayOrder: number;
  faqsCount: number;
  items: FaqItem[];
}

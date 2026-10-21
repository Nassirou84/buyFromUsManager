import { BannerItem } from '@/types/marketing';

export const INITIAL_BANNERS: BannerItem[] = [
  {
    id: 'banner-1',
    priority: 1,
    title: 'The Architecture of Everyday Wardrobes',
    targetUrl: '/collections/autumn-atelier',
    deviceTarget: 'desktop_mobile',
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCQSAaXc5WM3nKCqLNmHcOOmuGbSP1siKxhXV6y-ynh-i2U-bXePQI4k0XuouauMmACm62L4WjY7dCJxnT4BOjpbGhLtCE_9M8Rlgq5Xj21pWtlTuHU88vQzguuZdp5VCIgR8vqWjbAhJ1hQINASoT9WHf0cg13mFU1jAFVVSFqpUZksr_AoWFCwEXUh6lsxmg4bW5aw4PSR3Wb-xWuuuHvfBKGMJ6YlO5Sdf-cFc25zAfr6FyqXoOa',
    altText:
      'High-fashion studio photograph of an autumn tailored wool trench coat draped gracefully on a minimalist mannequin, neutral architectural tones, soft directional lighting from left, high contrast textures, luxury catalog aesthetic.',
    scheduleLabel: 'Active (Oct 01 - Nov 15)',
    isLive: true,
  },
  {
    id: 'banner-2',
    priority: 2,
    title: 'Private Atelier Member Drop',
    targetUrl: '/collections/private-preview',
    deviceTarget: 'desktop',
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCcPd_ppxq6V4eEP4Ec5Vuiltb9YGUe9N-djhexlSw0U2iLqZRb4c88T439MXNOabqIwAczJZVSs5jAkUyIENNq9RxPVOLRjQ6f2eYucqi4X5lAler65xxSejRAMtG8KEFktbW72cDcijaHN7_dpLDNGSUey0jcw7F1wHyVMQtV80UDsGlpqwfrq4rhuzpYwhTLsXpUiUzIqn8i55CwSnwJUAWkIcYX9j5vZPo5vhCYYarCzIo08bdv',
    altText:
      'Intricate close-up shot of folded mulberry silk scarves in warm terra-cotta, amber, and midnight blue patterns on a brushed marble tabletop, soft specular highlights, clean editorial still life photography.',
    scheduleLabel: 'Scheduled (Starts Nov 01)',
    isLive: true,
  },
  {
    id: 'banner-3',
    priority: 3,
    title: 'Handcrafted Weekender Pre-Orders',
    targetUrl: '/products/calfskin-weekender',
    deviceTarget: 'mobile',
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCD8C3ptqtUXS2_2oIlZ8AZz_J6hav-or5merqfNm_Q3J0c8tnlBwAzxIsuUrMM4rkRQtk1CPxIStkhkumu2GApTBfuunO_TLiJKM0sGPmyPu6MkFz0o0eeThn0ANKstCVAVZCVxdK8zAnk9r_fSZma9JwhH6bhhAJQA-UcpQPc9pftxw4wtEQHy0oz3y2ZQHg5q24ADgvHR6xayfW8fvubitneMVlYEYIPrBDS3gCvutKDzo8TwqGL',
    altText:
      'Artisanal deep cognac full-grain calfskin leather weekender bag standing upright in an airy brutalist gallery setting, morning sunlight casting warm linear shadows, subtle dust motes, boutique product presentation.',
    scheduleLabel: 'Expires Oct 28, 23:59 EST',
    isLive: false,
  },
  {
    id: 'banner-4',
    priority: 4,
    title: 'Minimalist Cashmere Knitwear Showcase',
    targetUrl: '/collections/pure-cashmere',
    deviceTarget: 'desktop_mobile',
    imageUrl:
      'https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=800&q=80',
    altText: 'Neutral tone cashmere crewneck sweater flat lay with fine knit details.',
    scheduleLabel: 'Upcoming (Starts Nov 15)',
    isLive: false,
  },
];

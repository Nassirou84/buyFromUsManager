// Accepts a full Iconify id ("mdi:home") or a bare Material name ("shopping_bag").

export const toIconifyName = (name: string) =>
  name.includes(':') ? name : `material-symbols:${name.replace(/_/g, '-')}`;

export const AVAILABLE_ICONS = [
  'fluent:phone-laptop-16-regular',
  'ic:baseline-laptop',
  'lsicon:pad-outline',
  'codicon:game',
  'boxicons:car',
  'temaki:fashion-accessories',
  'reicon:cosmetic'
];

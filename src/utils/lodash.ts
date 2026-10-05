import User from "@/types/user";
import FingerprintJS from '@fingerprintjs/fingerprintjs';

function formatWithSeparator(
  value: number | string,
  separator: string = ',',
  decimalSeparator: string = '.'
): string {
  const str = typeof value === 'number' ? value.toString() : value;

  if (!str || str === '-') return str;

  const parts = str.split('.');
  let integerPart = parts[0];
  const decimalPart = parts[1] || '';

  const isNegative = integerPart.startsWith('-');
  if (isNegative) {
    integerPart = integerPart.slice(1);
  }

  const formattedInteger = integerPart.replace(
    /\B(?=(\d{3})+(?!\d))/g,
    separator
  );

  let result = isNegative ? '-' + formattedInteger : formattedInteger;

  if (decimalPart) {
    result += decimalSeparator + decimalPart;
  }

  return result;
}

function formatWithCurrency(amount: number): string {
  return `${formatWithSeparator(amount)} ${process.env.NEXT_PUBLIC_APP_CURRENCY}`;
}

function makeTrackingSteps(currentStatus: string): { status: string; completed: boolean; current: boolean; description: string }[] {
  function getDescriptionForStatus(status: string): string {
    switch (status) {
      case 'placed':
        return 'Votre commande a été passée.';
      case 'processing':
        return 'Votre commande est en cours de traitement.';
      case 'in_transit':
        return 'Votre commande a été expédiée vers votre pays.';
      case 'arrived_in_facility':
        return 'Votre commande est arrivée au centre de traitement.';
      case 'out_for_delivery':
        return 'Votre commande est en cours de livraison.';
      case 'delivered':
        return 'Votre commande a été livrée.';
      default:
        return '';
    }
  }

  const statusOrders = [
    'placed',
    'processing',
    'in_transit',
    'arrived_in_facility',
    'out_for_delivery',
    'delivered'
  ];

  const trackingSteps: { status: string; completed: boolean; current: boolean; description: string }[] = [];

  const currentIndex = statusOrders.indexOf(currentStatus);

  statusOrders.forEach((status, index) => {
    trackingSteps.push({
      status,
      completed: index <= currentIndex,
      current: index == currentIndex,
      description: getDescriptionForStatus(status)
    });
  });

  return trackingSteps;
}

const formatUserAddress = (user: User | null): string => {
  if (!user) return '';
  if (user.street && user.city && user.state && user.country) {
    return `${user.street}, ${user.city}, ${user.state}, ${user.country}`;
  }
  return '';
}

export type FingerprintComponents = {
  userAgent: string;
  language: string;
  platform: string;
  timeZone: string;
  visitorId: string;
};

const getFingerprint = async (): Promise<FingerprintComponents> => {
  const fp = await FingerprintJS.load();
  const result = await fp.get();
  const navigator = window.navigator;
  const components = {
    userAgent: navigator.userAgent,
    language: navigator.language,
    platform: navigator.platform,
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    visitorId: result.visitorId,
  };
  return components;
};

export { formatWithSeparator, formatWithCurrency, makeTrackingSteps, formatUserAddress, getFingerprint };
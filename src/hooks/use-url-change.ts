'use client';
import { useEffect, useRef } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

interface UrlChangeInfo {
  currentUrl: string;
  previousUrl: string | null;
  pathname: string;
  searchParams: string;
  isPopState?: boolean;
}

type UrlChangeCallback = (info: UrlChangeInfo) => void;

export function useUrlChange(callback: UrlChangeCallback): void {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const previousUrlRef = useRef<string | null>(null);
  const callbackRef = useRef(callback);

  // Update callback ref if it changes
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  // Handle navigation changes
  useEffect(() => {
    const currentUrl = `${pathname}${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;

    if (previousUrlRef.current !== currentUrl) {
      callbackRef.current({
        currentUrl,
        previousUrl: previousUrlRef.current,
        pathname,
        searchParams: searchParams.toString(),
        isPopState: false
      });
      previousUrlRef.current = currentUrl;
    }
  }, [pathname, searchParams]);

  // Handle popstate (back/forward)
  useEffect(() => {
    const handlePopState = (): void => {
      const newUrl = `${window.location.pathname}${window.location.search}`;
      callbackRef.current({
        currentUrl: newUrl,
        previousUrl: previousUrlRef.current,
        pathname: window.location.pathname,
        searchParams: window.location.search.substring(1),
        isPopState: true
      });
      previousUrlRef.current = newUrl;
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);
}
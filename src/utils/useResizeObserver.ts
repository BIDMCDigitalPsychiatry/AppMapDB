import { useEffect } from 'react';

const isAvailable = typeof ResizeObserver !== 'undefined';

export default function useResizeObserver(scrollElement: HTMLElement | undefined, callback: (elements) => void, fallback = false) {
  useEffect(() => {
    const observer = isAvailable && scrollElement ? new ResizeObserver(elements => callback(elements)) : undefined;
    isAvailable && scrollElement && observer?.observe(scrollElement);
    !isAvailable && fallback && window?.addEventListener('resize', callback); // If resize observer isn't available, then default to the window resize event
    return () => {
      isAvailable && scrollElement && observer?.unobserve(scrollElement);
      !isAvailable && fallback && window?.addEventListener('resize', callback); // If resize observer isn't available, then default to the window resize event
    };
  }, [callback, scrollElement, fallback]);
}

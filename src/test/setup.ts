import '@testing-library/jest-dom';

class MockIntersectionObserver {
  readonly root: Element | Document | null = null;
  readonly rootMargin: string = '';
  readonly thresholds: ReadonlyArray<number> = [];
  observe = () => null;
  unobserve = () => null;
  disconnect = () => null;
  takeRecords = () => [];
}

if (typeof window !== 'undefined') {
  Object.defineProperty(window, 'IntersectionObserver', {
    writable: true,
    configurable: true,
    value: MockIntersectionObserver,
  });
}

if (typeof global !== 'undefined') {
  Object.defineProperty(global, 'IntersectionObserver', {
    writable: true,
    configurable: true,
    value: MockIntersectionObserver,
  });
}

// Console utilities to suppress known harmless errors in development

// Override console.error to filter out known harmless warnings
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

// List of error patterns to suppress (only in development)
const SUPPRESSED_PATTERNS = [
  // Known harmless React warnings
  'Warning: validateDOMNesting',
  'Warning: Each child in a list should have a unique "key" prop',
  // API-related warnings that we handle gracefully
  'Failed to fetch data for',
  'Stock symbol',
  'not found or unavailable',
  'API error for',
  'using mock data',
  // Yahoo Finance API 404s (handled gracefully)
  'Yahoo Finance API responded with 404',
];

// Function to check if an error should be suppressed
const shouldSuppressError = (message: string): boolean => {
  if (process.env.NODE_ENV === 'production') {
    return false; // Never suppress in production
  }
  
  return SUPPRESSED_PATTERNS.some(pattern => 
    message.includes(pattern)
  );
};

// Enhanced console.error that filters noise
console.error = (...args: unknown[]) => {
  const message = args.join(' ');
  
  if (!shouldSuppressError(message)) {
    originalConsoleError.apply(console, args);
  }
};

// Enhanced console.warn that filters noise
console.warn = (...args: unknown[]) => {
  const message = args.join(' ');
  
  if (!shouldSuppressError(message)) {
    originalConsoleWarn.apply(console, args);
  }
};

// Export utilities for manual error handling
export const logError = (message: string, error?: Error, context?: unknown) => {
  if (process.env.NODE_ENV === 'development') {
    originalConsoleError('[FinBoard Error]:', message, error, context);
  }
};

export const logWarning = (message: string, context?: unknown) => {
  if (process.env.NODE_ENV === 'development') {
    originalConsoleWarn('[FinBoard Warning]:', message, context);
  }
};

export const logInfo = (message: string, context?: unknown) => {
  if (process.env.NODE_ENV === 'development') {
    console.log('[FinBoard Info]:', message, context);
  }
};

// Restore original console methods (for debugging)
export const restoreConsole = () => {
  console.error = originalConsoleError;
  console.warn = originalConsoleWarn;
};

const consoleUtils = {
  logError,
  logWarning,
  logInfo,
  restoreConsole,
};

export default consoleUtils;

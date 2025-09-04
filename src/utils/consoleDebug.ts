// Console Error Detection Utility
// Add this to identify console issues

// Only run on client side
if (typeof window !== "undefined") {
  console.log("🔍 Console Detection Utility Loaded");

  interface ConsoleLog {
    type: "error" | "warn" | "log";
    args: unknown[];
    timestamp: number;
  }

  // Store original console methods
  const originalError = console.error;
  const originalWarn = console.warn;

  // Track console messages
  const consoleLogs: ConsoleLog[] = [];

  // Override console.error to catch React warnings
  console.error = (...args: unknown[]) => {
    consoleLogs.push({ type: "error", args, timestamp: Date.now() });
    originalError.apply(console, args);
  };

  // Override console.warn to catch React warnings
  console.warn = (...args: unknown[]) => {
    consoleLogs.push({ type: "warn", args, timestamp: Date.now() });
    originalWarn.apply(console, args);
  };

  // Function to get recent console messages
  (window as unknown as Record<string, unknown>).getConsoleLogs = () => {
    return consoleLogs.slice(-20); // Last 20 messages
  };

  // Function to clear console log history
  (window as unknown as Record<string, unknown>).clearConsoleLogs = () => {
    consoleLogs.length = 0;
  };

  console.log(
    "✅ Console detection setup complete. Use window.getConsoleLogs() to see recent messages."
  );
}

export {};

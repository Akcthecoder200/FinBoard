// Data Persistence Hooks
// Integrates browser storage with Redux state management for automatic persistence

"use client";

import React, { useEffect, useCallback, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../store";
import { setWidgets, Widget } from "../store/slices/widgetsSlice";
import { storageService } from "../services/browserStorage";

export interface PersistenceConfig {
  autoSave?: boolean;
  saveInterval?: number; // milliseconds
  onError?: (error: Error) => void;
  onSave?: (data: unknown) => void;
  onLoad?: (data: unknown) => void;
}

export interface StorageStatus {
  isSupported: boolean;
  isLoading: boolean;
  lastSaved: Date | null;
  lastLoaded: Date | null;
  hasError: boolean;
  errorMessage: string | null;
  storageUsage: {
    used: number;
    available: number;
    total: number;
    percentage: number;
  };
}

// Enhanced widget persistence hook
export const useWidgetPersistence = (config: PersistenceConfig = {}) => {
  const {
    autoSave = true,
    saveInterval = 1000,
    onError,
    onSave,
    onLoad,
  } = config;

  const dispatch = useDispatch();
  const widgets = useSelector((state: RootState) => state.widgets.widgets);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSavedDataRef = useRef<string>("");

  // Load widgets from storage on mount
  useEffect(() => {
    const loadWidgets = () => {
      try {
        // Only load on client side to avoid SSR hydration mismatch
        if (typeof window === "undefined") return;

        const storedWidgets = storageService.getItem<Widget[]>("widgets");
        if (storedWidgets && Array.isArray(storedWidgets)) {
          dispatch(setWidgets(storedWidgets));
          onLoad?.(storedWidgets);
        }
      } catch (error) {
        console.error("Failed to load widgets from storage:", error);
        onError?.(error as Error);
      }
    };

    // Delay loading to ensure client-side hydration is complete
    const timeoutId = setTimeout(loadWidgets, 100);
    return () => clearTimeout(timeoutId);
  }, [dispatch, onLoad, onError]);

  // Save widgets to storage with debouncing
  const saveWidgets = useCallback(() => {
    try {
      const currentData = JSON.stringify(widgets);

      // Only save if data has changed
      if (currentData === lastSavedDataRef.current) {
        return;
      }

      const success = storageService.setItem("widgets", widgets);
      if (success) {
        lastSavedDataRef.current = currentData;
        onSave?.(widgets);
      } else {
        throw new Error("Failed to save to storage");
      }
    } catch (error) {
      console.error("Failed to save widgets to storage:", error);
      onError?.(error as Error);
    }
  }, [widgets, onSave, onError]);

  // Auto-save with debouncing
  useEffect(() => {
    if (!autoSave) return;

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(saveWidgets, saveInterval);

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [widgets, autoSave, saveInterval, saveWidgets]);

  // Manual save function
  const forceSave = useCallback(() => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    saveWidgets();
  }, [saveWidgets]);

  return {
    forceSave,
    isAutoSaving: autoSave,
  };
};

// Layout persistence hook
export const useLayoutPersistence = () => {
  const saveLayout = useCallback((layout: Record<string, unknown>) => {
    try {
      storageService.setItem("layout", layout);
    } catch (error) {
      console.error("Failed to save layout:", error);
    }
  }, []);

  const loadLayout = useCallback(() => {
    try {
      return storageService.getItem("layout") || {};
    } catch (error) {
      console.error("Failed to load layout:", error);
      return {};
    }
  }, []);

  return {
    saveLayout,
    loadLayout,
  };
};

// Settings persistence hook
export const useSettingsPersistence = () => {
  const saveSettings = useCallback((settings: Record<string, unknown>) => {
    try {
      storageService.setItem("settings", settings);
    } catch (error) {
      console.error("Failed to save settings:", error);
    }
  }, []);

  const loadSettings = useCallback(() => {
    try {
      return storageService.getItem("settings") || {};
    } catch (error) {
      console.error("Failed to load settings:", error);
      return {};
    }
  }, []);

  return {
    saveSettings,
    loadSettings,
  };
};

// Storage status hook
export const useStorageStatus = (): StorageStatus => {
  const [status, setStatus] = React.useState<StorageStatus>({
    isSupported: false,
    isLoading: true,
    lastSaved: null,
    lastLoaded: null,
    hasError: false,
    errorMessage: null,
    storageUsage: {
      used: 0,
      available: 0,
      total: 0,
      percentage: 0,
    },
  });

  useEffect(() => {
    const checkStorageStatus = () => {
      try {
        // Only check on client side
        if (typeof window === "undefined") {
          setStatus((prev) => ({
            ...prev,
            isLoading: false,
            isSupported: false,
          }));
          return;
        }

        // Check if localStorage is supported
        const isSupported = "localStorage" in window;

        // Get storage usage
        const storageUsage = storageService.getStorageInfo();

        setStatus((prev) => ({
          ...prev,
          isSupported,
          isLoading: false,
          storageUsage,
          hasError: false,
          errorMessage: null,
        }));
      } catch (error) {
        setStatus((prev) => ({
          ...prev,
          isLoading: false,
          hasError: true,
          errorMessage:
            error instanceof Error ? error.message : "Unknown storage error",
        }));
      }
    };

    // Initial check with delay to avoid SSR issues
    const timeoutId = setTimeout(checkStorageStatus, 100);

    // Update storage usage periodically
    const interval = setInterval(checkStorageStatus, 30000); // Every 30 seconds

    return () => {
      clearTimeout(timeoutId);
      clearInterval(interval);
    };
  }, []);

  return status;
};

// Backup/Export hook
export const useBackupManager = () => {
  const downloadBackup = useCallback((filename?: string) => {
    try {
      return storageService.downloadBackup(filename);
    } catch (error) {
      console.error("Failed to download backup:", error);
      return false;
    }
  }, []);

  const uploadBackup = useCallback(async (file: File) => {
    try {
      return await storageService.uploadBackup(file);
    } catch (error) {
      console.error("Failed to upload backup:", error);
      return false;
    }
  }, []);

  const exportData = useCallback(() => {
    try {
      return storageService.exportData();
    } catch (error) {
      console.error("Failed to export data:", error);
      return null;
    }
  }, []);

  const importData = useCallback(
    (backupData: Parameters<typeof storageService.importData>[0]) => {
      try {
        return storageService.importData(backupData);
      } catch (error) {
        console.error("Failed to import data:", error);
        return false;
      }
    },
    []
  );

  const clearAllData = useCallback(() => {
    try {
      return storageService.clear();
    } catch (error) {
      console.error("Failed to clear data:", error);
      return false;
    }
  }, []);

  return {
    downloadBackup,
    uploadBackup,
    exportData,
    importData,
    clearAllData,
  };
};

// Session state recovery hook
export const useSessionRecovery = () => {
  const saveSessionState = useCallback((state: Record<string, unknown>) => {
    try {
      storageService.setItem("session_state", state, false); // Use sessionStorage
    } catch (error) {
      console.error("Failed to save session state:", error);
    }
  }, []);

  const loadSessionState = useCallback(() => {
    try {
      return storageService.getItem("session_state", false) || {};
    } catch (error) {
      console.error("Failed to load session state:", error);
      return {};
    }
  }, []);

  const clearSessionState = useCallback(() => {
    try {
      storageService.removeItem("session_state", false);
    } catch (error) {
      console.error("Failed to clear session state:", error);
    }
  }, []);

  // Auto-save session state on page visibility change
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Page is being hidden, save current state
        const currentState = {
          timestamp: Date.now(),
          url: window.location.pathname,
          scrollPosition: window.scrollY,
        };
        saveSessionState(currentState);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Save state on beforeunload
    const handleBeforeUnload = () => {
      const currentState = {
        timestamp: Date.now(),
        url: window.location.pathname,
        scrollPosition: window.scrollY,
      };
      saveSessionState(currentState);
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [saveSessionState]);

  return {
    saveSessionState,
    loadSessionState,
    clearSessionState,
  };
};

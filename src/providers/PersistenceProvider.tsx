// Persistence Provider
// Manages automatic data persistence across the entire application

"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import {
  useWidgetPersistence,
  useLayoutPersistence,
  useSettingsPersistence,
  useStorageStatus,
  useBackupManager,
} from "../hooks/usePersistence";

interface PersistenceContextType {
  // Storage status
  storageStatus: ReturnType<typeof useStorageStatus>;

  // Manual controls
  forceSave: () => void;
  isAutoSaving: boolean;

  // Layout controls
  saveLayout: (layout: Record<string, unknown>) => void;
  loadLayout: () => Record<string, unknown>;

  // Settings controls
  saveSettings: (settings: Record<string, unknown>) => void;
  loadSettings: () => Record<string, unknown>;

  // Backup management
  downloadBackup: (filename?: string) => boolean;
  uploadBackup: (file: File) => Promise<boolean>;
  exportData: () => unknown;
  importData: (data: unknown) => boolean;
  clearAllData: () => boolean;

  // State
  isPersistenceEnabled: boolean;
  lastSyncTime: Date | null;
  pendingChanges: boolean;
}

const PersistenceContext = createContext<PersistenceContextType | undefined>(
  undefined
);

export interface PersistenceProviderProps {
  children: React.ReactNode;
  autoSave?: boolean;
  saveInterval?: number;
  onError?: (error: Error) => void;
  onSave?: (data: unknown) => void;
  onLoad?: (data: unknown) => void;
}

export const PersistenceProvider: React.FC<PersistenceProviderProps> = ({
  children,
  autoSave = true,
  saveInterval = 1000,
  onError,
  onSave,
  onLoad,
}) => {
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [pendingChanges, setPendingChanges] = useState(false);
  const [isPersistenceEnabled, setIsPersistenceEnabled] = useState(true);

  // Initialize all persistence hooks
  const { forceSave, isAutoSaving } = useWidgetPersistence({
    autoSave: autoSave && isPersistenceEnabled,
    saveInterval,
    onError,
    onSave: (data) => {
      setLastSyncTime(new Date());
      setPendingChanges(false);
      onSave?.(data);
    },
    onLoad,
  });

  const { saveLayout, loadLayout } = useLayoutPersistence();
  const { saveSettings, loadSettings } = useSettingsPersistence();
  const storageStatus = useStorageStatus();
  const backupManager = useBackupManager();

  // Monitor storage support and disable persistence if not available
  useEffect(() => {
    setIsPersistenceEnabled(
      storageStatus.isSupported && !storageStatus.hasError
    );
  }, [storageStatus.isSupported, storageStatus.hasError]);

  // Enhanced save layout with timestamp
  const enhancedSaveLayout = React.useCallback(
    (layout: Record<string, unknown>) => {
      const layoutWithMeta = {
        ...layout,
        lastModified: new Date().toISOString(),
        version: "1.0",
      };
      saveLayout(layoutWithMeta);
      setLastSyncTime(new Date());
    },
    [saveLayout]
  );

  // Enhanced save settings with timestamp
  const enhancedSaveSettings = React.useCallback(
    (settings: Record<string, unknown>) => {
      const settingsWithMeta = {
        ...settings,
        lastModified: new Date().toISOString(),
        version: "1.0",
      };
      saveSettings(settingsWithMeta);
      setLastSyncTime(new Date());
    },
    [saveSettings]
  );

  // Enhanced force save with feedback
  const enhancedForceSave = React.useCallback(() => {
    try {
      forceSave();
      setLastSyncTime(new Date());
      setPendingChanges(false);
    } catch (error) {
      console.error("Force save failed:", error);
      onError?.(error as Error);
    }
  }, [forceSave, onError]);

  // Wrapper for import data to handle type compatibility
  const enhancedImportData = React.useCallback(
    (data: unknown) => {
      try {
        return backupManager.importData(
          data as Parameters<typeof backupManager.importData>[0]
        );
      } catch (error) {
        console.error("Import data failed:", error);
        return false;
      }
    },
    [backupManager]
  );

  const contextValue: PersistenceContextType = {
    storageStatus,
    forceSave: enhancedForceSave,
    isAutoSaving,
    saveLayout: enhancedSaveLayout,
    loadLayout: () => loadLayout() as Record<string, unknown>,
    saveSettings: enhancedSaveSettings,
    loadSettings: () => loadSettings() as Record<string, unknown>,
    downloadBackup: backupManager.downloadBackup,
    uploadBackup: backupManager.uploadBackup,
    exportData: backupManager.exportData,
    importData: enhancedImportData,
    clearAllData: backupManager.clearAllData,
    isPersistenceEnabled,
    lastSyncTime,
    pendingChanges,
  };

  return (
    <PersistenceContext.Provider value={contextValue}>
      {children}
    </PersistenceContext.Provider>
  );
};

// Hook to use persistence context
export const usePersistence = (): PersistenceContextType => {
  const context = useContext(PersistenceContext);
  if (!context) {
    throw new Error("usePersistence must be used within a PersistenceProvider");
  }
  return context;
};

// Storage status component for debugging/admin
export const StorageStatusDisplay: React.FC = () => {
  const { storageStatus } = usePersistence();

  if (!storageStatus.isSupported) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <svg
              className="h-5 w-5 text-red-400"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">
              Storage Not Available
            </h3>
            <p className="text-sm text-red-700">
              Data persistence is disabled. Your changes will not be saved.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (storageStatus.hasError) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <svg
              className="h-5 w-5 text-yellow-400"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-yellow-800">
              Storage Warning
            </h3>
            <p className="text-sm text-yellow-700">
              {storageStatus.errorMessage}
            </p>
          </div>
        </div>
      </div>
    );
  }

  const { storageUsage } = storageStatus;
  const progressBarClass =
    storageUsage.percentage > 90
      ? "bg-red-500"
      : storageUsage.percentage > 70
      ? "bg-yellow-500"
      : "bg-green-500";
  const textColorClass =
    storageUsage.percentage > 90
      ? "text-red-600"
      : storageUsage.percentage > 70
      ? "text-yellow-600"
      : "text-green-600";

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <h3 className="text-sm font-medium text-gray-900 mb-2">Storage Status</h3>
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Used:</span>
          <span className="font-medium">
            {(storageUsage.used / 1024).toFixed(1)} KB
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Available:</span>
          <span className="font-medium">
            {(storageUsage.available / 1024 / 1024).toFixed(1)} MB
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Usage:</span>
          <span className={`font-medium ${textColorClass}`}>
            {storageUsage.percentage.toFixed(1)}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`${progressBarClass} h-2 rounded-full transition-all duration-300`}
            style={{ width: `${storageUsage.percentage}%` }}
          />
        </div>
      </div>
    </div>
  );
};

// Persistence control panel component
export const PersistenceControls: React.FC = () => {
  const {
    forceSave,
    downloadBackup,
    uploadBackup,
    clearAllData,
    isPersistenceEnabled,
    lastSyncTime,
    pendingChanges,
  } = usePersistence();

  const [isUploading, setIsUploading] = useState(false);

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const success = await uploadBackup(file);
      if (success) {
        alert("Backup imported successfully!");
        window.location.reload(); // Reload to reflect changes
      } else {
        alert("Failed to import backup. Please check the file format.");
      }
    } catch (error) {
      alert("Error importing backup: " + (error as Error).message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleClearData = () => {
    if (
      window.confirm(
        "Are you sure you want to clear all data? This action cannot be undone."
      )
    ) {
      clearAllData();
      window.location.reload();
    }
  };

  const handleClearTestWidgets = () => {
    if (typeof window !== "undefined") {
      // Get current widgets from localStorage
      const stored = localStorage.getItem("finboard_widgets");
      if (stored) {
        try {
          const widgets = JSON.parse(stored);
          // Filter out test widgets
          const cleanWidgets = widgets.filter(
            (widget: {
              id: string;
              title: string;
              config?: { testData?: boolean };
            }) =>
              !widget.id.includes("test-widget") &&
              !widget.title.includes("Test Widget") &&
              !widget.title.includes("Data Persistence") &&
              !widget.config?.testData
          );

          // Save cleaned widgets back
          localStorage.setItem(
            "finboard_widgets",
            JSON.stringify(cleanWidgets)
          );
          alert("Test widgets removed successfully!");
          window.location.reload();
        } catch (error) {
          console.error("Error clearing test widgets:", error);
          alert("Error removing test widgets");
        }
      }
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <h3 className="text-sm font-medium text-gray-900 mb-4">
        Data Management
      </h3>

      {/* Status */}
      <div className="mb-4 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-600">Status:</span>
          <span
            className={`font-medium ${
              isPersistenceEnabled ? "text-green-600" : "text-red-600"
            }`}
          >
            {isPersistenceEnabled ? "Enabled" : "Disabled"}
          </span>
        </div>
        {lastSyncTime && (
          <div className="flex justify-between">
            <span className="text-gray-600">Last Sync:</span>
            <span className="font-medium">
              {lastSyncTime.toLocaleTimeString()}
            </span>
          </div>
        )}
        <div className="flex justify-between">
          <span className="text-gray-600">Changes:</span>
          <span
            className={`font-medium ${
              pendingChanges ? "text-yellow-600" : "text-green-600"
            }`}
          >
            {pendingChanges ? "Pending" : "Saved"}
          </span>
        </div>
      </div>

      {/* Controls */}
      <div className="space-y-2">
        <button
          onClick={forceSave}
          disabled={!isPersistenceEnabled}
          className="w-full px-3 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Force Save
        </button>

        <button
          onClick={() => downloadBackup()}
          className="w-full px-3 py-2 text-sm bg-green-600 text-white rounded-md hover:bg-green-700"
        >
          Download Backup
        </button>

        <div className="relative">
          <input
            type="file"
            accept=".json"
            onChange={handleFileUpload}
            disabled={isUploading}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
          />
          <button
            disabled={isUploading}
            className="w-full px-3 py-2 text-sm bg-yellow-600 text-white rounded-md hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isUploading ? "Importing..." : "Import Backup"}
          </button>
        </div>

        <button
          onClick={handleClearTestWidgets}
          className="w-full px-3 py-2 text-sm bg-orange-600 text-white rounded-md hover:bg-orange-700"
        >
          Clear Test Widgets
        </button>

        <button
          onClick={handleClearData}
          className="w-full px-3 py-2 text-sm bg-red-600 text-white rounded-md hover:bg-red-700"
        >
          Clear All Data
        </button>
      </div>
    </div>
  );
};

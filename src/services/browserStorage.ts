// Browser Storage Service
// Comprehensive data persistence with localStorage and sessionStorage integration

"use client";

export interface StorageConfig {
  prefix?: string;
  useCompression?: boolean;
  enableEncryption?: boolean;
  maxSize?: number; // in MB
}

export interface StoredData<T = unknown> {
  data: T;
  timestamp: number;
  version: string;
  checksum?: string;
}

export interface BackupData {
  widgets: unknown[];
  layout: Record<string, unknown>;
  settings: Record<string, unknown>;
  metadata: {
    exportDate: string;
    version: string;
    appVersion: string;
  };
}

class BrowserStorageService {
  private prefix: string;
  private useCompression: boolean;
  private enableEncryption: boolean;
  private maxSize: number;
  private version: string = "1.0.0";

  constructor(config: StorageConfig = {}) {
    this.prefix = config.prefix || "finboard_";
    this.useCompression = config.useCompression || false;
    this.enableEncryption = config.enableEncryption || false;
    this.maxSize = config.maxSize || 10; // 10MB default
  }

  // Check if storage is available
  private isStorageAvailable(type: "localStorage" | "sessionStorage"): boolean {
    if (typeof window === "undefined") return false;

    try {
      const storage = window[type];
      const test = "__storage_test__";
      storage.setItem(test, test);
      storage.removeItem(test);
      return true;
    } catch {
      return false;
    }
  }

  // Get storage instance
  private getStorage(persistent = true): Storage | null {
    if (typeof window === "undefined") return null;

    const storageType = persistent ? "localStorage" : "sessionStorage";
    return this.isStorageAvailable(storageType) ? window[storageType] : null;
  }

  // Generate key with prefix
  private getKey(key: string): string {
    return `${this.prefix}${key}`;
  }

  // Simple compression (can be enhanced with actual compression libraries)
  private compress(data: string): string {
    if (!this.useCompression) return data;
    // Simple run-length encoding for demo
    return data.replace(/(.)\1+/g, (match, char) => `${char}${match.length}`);
  }

  private decompress(data: string): string {
    if (!this.useCompression) return data;
    // Reverse run-length encoding
    return data.replace(/(.)\d+/g, (match, char) => {
      const count = parseInt(match.slice(1));
      return char.repeat(count);
    });
  }

  // Simple checksum for data integrity
  private generateChecksum(data: string): string {
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      const char = data.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString(16);
  }

  // Store data
  setItem<T>(key: string, data: T, persistent = true): boolean {
    try {
      const storage = this.getStorage(persistent);
      if (!storage) return false;

      const storedData: StoredData<T> = {
        data,
        timestamp: Date.now(),
        version: this.version,
      };

      const serialized = JSON.stringify(storedData);
      const compressed = this.compress(serialized);

      // Add checksum for integrity
      storedData.checksum = this.generateChecksum(compressed);
      const finalData = this.compress(JSON.stringify(storedData));

      // Check size limits
      const sizeInMB = new Blob([finalData]).size / (1024 * 1024);
      if (sizeInMB > this.maxSize) {
        console.warn(
          `Data size (${sizeInMB.toFixed(2)}MB) exceeds limit (${
            this.maxSize
          }MB)`
        );
        return false;
      }

      storage.setItem(this.getKey(key), finalData);
      return true;
    } catch (error) {
      console.error("Storage setItem error:", error);
      return false;
    }
  }

  // Retrieve data
  getItem<T>(key: string, persistent = true): T | null {
    try {
      const storage = this.getStorage(persistent);
      if (!storage) return null;

      const raw = storage.getItem(this.getKey(key));
      if (!raw) return null;

      const decompressed = this.decompress(raw);
      const parsed: StoredData<T> = JSON.parse(decompressed);

      // Verify checksum if available
      if (parsed.checksum) {
        const dataWithoutChecksum = { ...parsed };
        delete dataWithoutChecksum.checksum;
        const recompressed = this.compress(JSON.stringify(dataWithoutChecksum));
        const currentChecksum = this.generateChecksum(recompressed);

        if (currentChecksum !== parsed.checksum) {
          console.warn("Data integrity check failed for:", key);
        }
      }

      return parsed.data;
    } catch (error) {
      console.error("Storage getItem error:", error);
      return null;
    }
  }

  // Remove item
  removeItem(key: string, persistent = true): boolean {
    try {
      const storage = this.getStorage(persistent);
      if (!storage) return false;

      storage.removeItem(this.getKey(key));
      return true;
    } catch (error) {
      console.error("Storage removeItem error:", error);
      return false;
    }
  }

  // Clear all items with prefix
  clear(persistent = true): boolean {
    try {
      const storage = this.getStorage(persistent);
      if (!storage) return false;

      const keysToRemove: string[] = [];
      for (let i = 0; i < storage.length; i++) {
        const key = storage.key(i);
        if (key && key.startsWith(this.prefix)) {
          keysToRemove.push(key);
        }
      }

      keysToRemove.forEach((key) => storage.removeItem(key));
      return true;
    } catch (error) {
      console.error("Storage clear error:", error);
      return false;
    }
  }

  // Get all keys with prefix
  getKeys(persistent = true): string[] {
    try {
      const storage = this.getStorage(persistent);
      if (!storage) return [];

      const keys: string[] = [];
      for (let i = 0; i < storage.length; i++) {
        const key = storage.key(i);
        if (key && key.startsWith(this.prefix)) {
          keys.push(key.replace(this.prefix, ""));
        }
      }
      return keys;
    } catch (error) {
      console.error("Storage getKeys error:", error);
      return [];
    }
  }

  // Get storage usage info
  getStorageInfo(persistent = true): {
    used: number;
    available: number;
    total: number;
    percentage: number;
  } {
    try {
      const storage = this.getStorage(persistent);
      if (!storage) return { used: 0, available: 0, total: 0, percentage: 0 };

      let used = 0;
      for (let i = 0; i < storage.length; i++) {
        const key = storage.key(i);
        if (key) {
          const value = storage.getItem(key);
          used += key.length + (value?.length || 0);
        }
      }

      // Estimate total available storage (typically 5-10MB for localStorage)
      const total = 10 * 1024 * 1024; // 10MB estimate
      const available = total - used;
      const percentage = (used / total) * 100;

      return {
        used: used / 1024, // KB
        available: available / 1024, // KB
        total: total / 1024, // KB
        percentage: Math.round(percentage * 100) / 100,
      };
    } catch (error) {
      console.error("Storage info error:", error);
      return { used: 0, available: 0, total: 0, percentage: 0 };
    }
  }

  // Export all data for backup
  exportData(): BackupData | null {
    try {
      const widgets = this.getItem("widgets") || [];
      const layout = this.getItem("layout") || {};
      const settings = this.getItem("settings") || {};

      return {
        widgets: Array.isArray(widgets) ? widgets : [],
        layout: layout as Record<string, unknown>,
        settings: settings as Record<string, unknown>,
        metadata: {
          exportDate: new Date().toISOString(),
          version: this.version,
          appVersion: "1.0.0",
        },
      };
    } catch (error) {
      console.error("Export data error:", error);
      return null;
    }
  }

  // Import data from backup
  importData(backupData: BackupData): boolean {
    try {
      // Validate backup data structure
      if (!backupData.metadata || !backupData.widgets) {
        throw new Error("Invalid backup data structure");
      }

      // Version compatibility check
      if (backupData.metadata.version !== this.version) {
        console.warn("Version mismatch - attempting migration");
      }

      // Import data
      this.setItem("widgets", backupData.widgets);
      this.setItem("layout", backupData.layout);
      this.setItem("settings", backupData.settings);

      return true;
    } catch (error) {
      console.error("Import data error:", error);
      return false;
    }
  }

  // Download backup as file
  downloadBackup(filename?: string): boolean {
    try {
      const backupData = this.exportData();
      if (!backupData) return false;

      const blob = new Blob([JSON.stringify(backupData, null, 2)], {
        type: "application/json",
      });

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename || `finboard-backup-${Date.now()}.json`;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      URL.revokeObjectURL(url);
      return true;
    } catch (error) {
      console.error("Download backup error:", error);
      return false;
    }
  }

  // Upload and import backup from file
  uploadBackup(file: File): Promise<boolean> {
    return new Promise((resolve) => {
      try {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const content = e.target?.result as string;
            const backupData: BackupData = JSON.parse(content);
            const success = this.importData(backupData);
            resolve(success);
          } catch (error) {
            console.error("Parse backup error:", error);
            resolve(false);
          }
        };
        reader.onerror = () => resolve(false);
        reader.readAsText(file);
      } catch (error) {
        console.error("Upload backup error:", error);
        resolve(false);
      }
    });
  }
}

// Create default instance
export const storageService = new BrowserStorageService({
  prefix: "finboard_",
  useCompression: false,
  enableEncryption: false,
  maxSize: 10,
});

export default BrowserStorageService;

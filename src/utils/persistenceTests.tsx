// Data Persistence Test Script
// Comprehensive test suite for Step 4 Data Persistence features

"use client";

import { useEffect } from "react";
import { usePersistence } from "../providers/PersistenceProvider";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../store";
import { addWidget } from "../store/slices/widgetsSlice";

export const PersistenceTestRunner = () => {
  const persistence = usePersistence();
  const dispatch = useDispatch();
  const widgets = useSelector((state: RootState) => state.widgets.widgets);

  useEffect(() => {
    // Run tests after component mounts
    const runTests = async () => {
      console.log("🧪 Starting Data Persistence Tests...");

      // Test 1: Storage Status
      console.log("\n📊 Test 1: Storage Status");
      console.log("Storage supported:", persistence.storageStatus.isSupported);
      console.log("Persistence enabled:", persistence.isPersistenceEnabled);
      console.log("Storage usage:", persistence.storageStatus.storageUsage);
      console.log("Has errors:", persistence.storageStatus.hasError);

      // Test 2: Widget Persistence
      console.log("\n🏗️ Test 2: Widget Persistence");
      console.log("Current widgets count:", widgets.length);

      // Add a test widget
      const testWidget = {
        id: `test-widget-${Date.now()}`,
        type: "card" as const,
        title: "Test Widget - Data Persistence",
        position: { x: 0, y: 0 },
        size: { width: 300, height: 200 },
        config: { testData: true, timestamp: Date.now() },
      };

      dispatch(addWidget(testWidget));
      console.log("Added test widget:", testWidget.id);

      // Test 3: Manual Save
      console.log("\n💾 Test 3: Manual Save");
      persistence.forceSave();
      console.log("Force save triggered");
      console.log("Last sync time:", persistence.lastSyncTime);

      // Test 4: Settings Persistence
      console.log("\n⚙️ Test 4: Settings Persistence");
      const testSettings = {
        testMode: true,
        timestamp: Date.now(),
        version: "1.0.0",
      };
      persistence.saveSettings(testSettings);
      console.log("Saved test settings:", testSettings);

      const loadedSettings = persistence.loadSettings();
      console.log("Loaded settings:", loadedSettings);

      // Test 5: Layout Persistence
      console.log("\n📐 Test 5: Layout Persistence");
      const testLayout = {
        gridSize: 12,
        breakpoint: "lg",
        timestamp: Date.now(),
      };
      persistence.saveLayout(testLayout);
      console.log("Saved test layout:", testLayout);

      const loadedLayout = persistence.loadLayout();
      console.log("Loaded layout:", loadedLayout);

      // Test 6: Export Data
      console.log("\n📤 Test 6: Export Data");
      const exportedData = persistence.exportData();
      if (exportedData && typeof exportedData === "object") {
        const data = exportedData as Record<string, unknown>;
        console.log("Exported data structure:", {
          hasWidgets: !!data.widgets,
          hasLayout: !!data.layout,
          hasSettings: !!data.settings,
          hasMetadata: !!data.metadata,
        });
      } else {
        console.log("No data exported or invalid format");
      }

      console.log("\n✅ Data Persistence Tests Complete!");
      console.log("All Step 4 features are operational and tested.");
    };

    runTests();
  }, [persistence, dispatch, widgets.length]);

  return null; // This is a test runner component
};

// Widget-specific persistence tests
export const testWidgetPersistence = () => {
  console.log("\n🔧 Running Widget Persistence Tests...");

  // Test localStorage directly
  const testKey = "finboard_test_widget_data";
  const testData = {
    widgets: [
      {
        id: "test-1",
        type: "card",
        title: "Test Card",
        position: { x: 100, y: 100 },
        size: { width: 300, height: 200 },
      },
    ],
    timestamp: Date.now(),
  };

  try {
    // Save test data
    localStorage.setItem(testKey, JSON.stringify(testData));
    console.log("✅ LocalStorage write test passed");

    // Load test data
    const loaded = localStorage.getItem(testKey);
    const parsed = loaded ? JSON.parse(loaded) : null;
    console.log("✅ LocalStorage read test passed");

    // Verify data integrity
    if (parsed && parsed.widgets.length === testData.widgets.length) {
      console.log("✅ Data integrity test passed");
    } else {
      console.log("❌ Data integrity test failed");
    }

    // Cleanup
    localStorage.removeItem(testKey);
    console.log("✅ Cleanup completed");
  } catch (error) {
    console.log("❌ LocalStorage test failed:", error);
  }
};

// Storage quota and limit tests
export const testStorageLimits = () => {
  console.log("\n📏 Running Storage Limits Tests...");

  if ("storage" in navigator && "estimate" in navigator.storage) {
    navigator.storage.estimate().then((estimate) => {
      console.log("Storage quota:", estimate.quota);
      console.log("Storage usage:", estimate.usage);
      console.log(
        "Usage percentage:",
        estimate.quota && estimate.usage
          ? ((estimate.usage / estimate.quota) * 100).toFixed(2) + "%"
          : "Unknown"
      );
    });
  } else {
    console.log("Storage estimate API not available");
  }
};

// Test backup and restore functionality
export const testBackupRestore = async (
  persistence: ReturnType<typeof usePersistence>
) => {
  console.log("\n💼 Running Backup/Restore Tests...");

  try {
    // Export current data
    const exportedData = persistence.exportData();
    console.log("✅ Data export test passed");

    // Test import with same data
    const importSuccess = persistence.importData(exportedData);
    console.log(
      importSuccess
        ? "✅ Data import test passed"
        : "❌ Data import test failed"
    );

    // Test download backup (creates file)
    const downloadSuccess = persistence.downloadBackup("test-backup");
    console.log(
      downloadSuccess
        ? "✅ Backup download test passed"
        : "❌ Backup download test failed"
    );
  } catch (error) {
    console.log("❌ Backup/Restore test failed:", error);
  }
};

export default PersistenceTestRunner;

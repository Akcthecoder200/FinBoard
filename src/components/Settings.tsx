// Settings Component
// Comprehensive settings panel with persistence controls and data management

"use client";

import React, { useState, useEffect } from "react";
import { usePersistence } from "../providers/PersistenceProvider";
import {
  StorageStatusDisplay,
  PersistenceControls,
} from "../providers/PersistenceProvider";

interface SettingsTab {
  id: string;
  label: string;
  icon: React.ReactNode;
}

const settingsTabs: SettingsTab[] = [
  {
    id: "general",
    label: "General",
    icon: (
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
        />
      </svg>
    ),
  },
  {
    id: "data",
    label: "Data & Storage",
    icon: (
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4"
        />
      </svg>
    ),
  },
  {
    id: "appearance",
    label: "Appearance",
    icon: (
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z"
        />
      </svg>
    ),
  },
];

export interface SettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Settings: React.FC<SettingsProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState("general");
  const { saveSettings, loadSettings } = usePersistence();

  const [settings, setSettings] = useState(() => {
    // Return default settings on server side
    if (typeof window === "undefined") {
      return {
        autoSave: true,
        theme: "system",
        refreshInterval: 30,
        enableNotifications: true,
        compactMode: false,
      };
    }

    const loaded = loadSettings();
    return {
      autoSave: (loaded.autoSave as boolean) ?? true,
      theme: (loaded.theme as string) ?? "system",
      refreshInterval: (loaded.refreshInterval as number) ?? 30,
      enableNotifications: (loaded.enableNotifications as boolean) ?? true,
      compactMode: (loaded.compactMode as boolean) ?? false,
    };
  });

  // Load settings on client side after mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const loaded = loadSettings();
      setSettings({
        autoSave: (loaded.autoSave as boolean) ?? true,
        theme: (loaded.theme as string) ?? "system",
        refreshInterval: (loaded.refreshInterval as number) ?? 30,
        enableNotifications: (loaded.enableNotifications as boolean) ?? true,
        compactMode: (loaded.compactMode as boolean) ?? false,
      });
    }
  }, [loadSettings]);

  // Save settings when they change
  const updateSetting = (key: string, value: unknown) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    saveSettings(newSettings);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="absolute right-0 top-0 h-full w-full max-w-2xl bg-white shadow-xl">
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
            <h2 className="text-lg font-semibold text-gray-900">Settings</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <div className="flex flex-1 overflow-hidden">
            {/* Sidebar */}
            <div className="w-64 border-r border-gray-200 bg-gray-50">
              <nav className="mt-5 px-2">
                <div className="space-y-1">
                  {settingsTabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`${
                        activeTab === tab.id
                          ? "bg-blue-100 border-blue-500 text-blue-700"
                          : "border-transparent text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                      } group w-full flex items-center px-2 py-2 text-sm font-medium border-l-4 rounded-md`}
                    >
                      <span className="mr-3 flex-shrink-0">{tab.icon}</span>
                      {tab.label}
                    </button>
                  ))}
                </div>
              </nav>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
              <div className="p-6">
                {/* General Tab */}
                {activeTab === "general" && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-4">
                        General Settings
                      </h3>

                      <div className="space-y-4">
                        {/* Auto Save */}
                        <div className="flex items-center justify-between">
                          <div>
                            <label className="text-sm font-medium text-gray-700">
                              Auto Save
                            </label>
                            <p className="text-sm text-gray-500">
                              Automatically save changes as you make them
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() =>
                              updateSetting("autoSave", !settings.autoSave)
                            }
                            className={`${
                              settings.autoSave ? "bg-blue-600" : "bg-gray-200"
                            } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
                          >
                            <span
                              className={`${
                                settings.autoSave
                                  ? "translate-x-5"
                                  : "translate-x-0"
                              } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
                            />
                          </button>
                        </div>

                        {/* Refresh Interval */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Data Refresh Interval (seconds)
                          </label>
                          <select
                            value={settings.refreshInterval}
                            onChange={(e) =>
                              updateSetting(
                                "refreshInterval",
                                parseInt(e.target.value)
                              )
                            }
                            className="mt-1 block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                          >
                            <option value={5}>5 seconds</option>
                            <option value={10}>10 seconds</option>
                            <option value={30}>30 seconds</option>
                            <option value={60}>1 minute</option>
                            <option value={300}>5 minutes</option>
                          </select>
                        </div>

                        {/* Notifications */}
                        <div className="flex items-center justify-between">
                          <div>
                            <label className="text-sm font-medium text-gray-700">
                              Enable Notifications
                            </label>
                            <p className="text-sm text-gray-500">
                              Get notified about important changes
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() =>
                              updateSetting(
                                "enableNotifications",
                                !settings.enableNotifications
                              )
                            }
                            className={`${
                              settings.enableNotifications
                                ? "bg-blue-600"
                                : "bg-gray-200"
                            } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
                          >
                            <span
                              className={`${
                                settings.enableNotifications
                                  ? "translate-x-5"
                                  : "translate-x-0"
                              } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
                            />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Data & Storage Tab */}
                {activeTab === "data" && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-4">
                        Data & Storage
                      </h3>

                      <div className="space-y-6">
                        {/* Storage Status */}
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 mb-3">
                            Storage Status
                          </h4>
                          <StorageStatusDisplay />
                        </div>

                        {/* Persistence Controls */}
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 mb-3">
                            Data Management
                          </h4>
                          <PersistenceControls />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Appearance Tab */}
                {activeTab === "appearance" && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-4">
                        Appearance
                      </h3>

                      <div className="space-y-4">
                        {/* Theme */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Theme
                          </label>
                          <select
                            value={settings.theme}
                            onChange={(e) =>
                              updateSetting("theme", e.target.value)
                            }
                            className="mt-1 block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                          >
                            <option value="light">Light</option>
                            <option value="dark">Dark</option>
                            <option value="system">System</option>
                          </select>
                        </div>

                        {/* Compact Mode */}
                        <div className="flex items-center justify-between">
                          <div>
                            <label className="text-sm font-medium text-gray-700">
                              Compact Mode
                            </label>
                            <p className="text-sm text-gray-500">
                              Use smaller spacing and elements
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() =>
                              updateSetting(
                                "compactMode",
                                !settings.compactMode
                              )
                            }
                            className={`${
                              settings.compactMode
                                ? "bg-blue-600"
                                : "bg-gray-200"
                            } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
                          >
                            <span
                              className={`${
                                settings.compactMode
                                  ? "translate-x-5"
                                  : "translate-x-0"
                              } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
                            />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;

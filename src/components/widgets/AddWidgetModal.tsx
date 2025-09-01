"use client";

import { useState } from "react";
import { useDispatch } from "react-redux";
import { addWidget } from "@/store/slices/widgetsSlice";
import { Widget } from "@/store/slices/widgetsSlice";

interface AddWidgetModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface WidgetFormData {
  name: string;
  apiUrl: string;
  refreshInterval: number;
  displayType: "card" | "table" | "chart";
  selectedFields: string[];
  description: string;
}

const AVAILABLE_FIELDS = [
  { id: "symbol", label: "Symbol", description: "Stock ticker symbol" },
  { id: "price", label: "Current Price", description: "Latest stock price" },
  { id: "change", label: "Price Change", description: "Price change amount" },
  { id: "percent", label: "Percent Change", description: "Percentage change" },
  { id: "volume", label: "Volume", description: "Trading volume" },
  {
    id: "marketCap",
    label: "Market Cap",
    description: "Market capitalization",
  },
  { id: "high", label: "52W High", description: "52-week high price" },
  { id: "low", label: "52W Low", description: "52-week low price" },
];

const REFRESH_INTERVALS = [
  { value: 5, label: "5 seconds" },
  { value: 15, label: "15 seconds" },
  { value: 30, label: "30 seconds" },
  { value: 60, label: "1 minute" },
  { value: 300, label: "5 minutes" },
  { value: 900, label: "15 minutes" },
];

export function AddWidgetModal({ isOpen, onClose }: AddWidgetModalProps) {
  const dispatch = useDispatch();
  const [formData, setFormData] = useState<WidgetFormData>({
    name: "",
    apiUrl: "https://api.example.com/stocks",
    refreshInterval: 30,
    displayType: "card",
    selectedFields: ["symbol", "price", "change"],
    description: "",
  });

  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;

  const handleInputChange = (
    field: keyof WidgetFormData,
    value: string | number | string[]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleFieldToggle = (fieldId: string) => {
    setFormData((prev) => ({
      ...prev,
      selectedFields: prev.selectedFields.includes(fieldId)
        ? prev.selectedFields.filter((f) => f !== fieldId)
        : [...prev.selectedFields, fieldId],
    }));
  };

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleSubmit = () => {
    const newWidget: Widget = {
      id: `widget-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: formData.displayType,
      title: formData.name || `${formData.displayType} Widget`,
      position: { x: 0, y: 0 },
      size: { width: 1, height: 1 },
      config: {
        apiUrl: formData.apiUrl,
        refreshInterval: formData.refreshInterval,
        selectedFields: formData.selectedFields,
        description: formData.description,
        symbol: "AAPL", // Default symbol
      },
    };

    dispatch(addWidget(newWidget));

    // Reset form and close modal
    setFormData({
      name: "",
      apiUrl: "https://api.example.com/stocks",
      refreshInterval: 30,
      displayType: "card",
      selectedFields: ["symbol", "price", "change"],
      description: "",
    });
    setCurrentStep(1);
    onClose();
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return formData.name.trim().length > 0;
      case 2:
        return formData.apiUrl.trim().length > 0;
      case 3:
        return formData.selectedFields.length > 0;
      case 4:
        return true;
      default:
        return false;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div>
            <h2 className="text-xl font-semibold text-foreground">
              Add New Widget
            </h2>
            <p className="text-sm text-muted-foreground">
              Configure your dashboard widget
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-secondary rounded-lg transition-colors"
          >
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
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Progress Steps */}
        <div className="px-6 py-4 bg-secondary/20">
          <div className="flex items-center justify-between">
            {Array.from({ length: totalSteps }, (_, i) => (
              <div key={i} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                    i + 1 <= currentStep
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-muted-foreground"
                  }`}
                >
                  {i + 1}
                </div>
                {i < totalSteps - 1 && (
                  <div
                    className={`w-16 h-0.5 mx-2 transition-colors ${
                      i + 1 < currentStep ? "bg-primary" : "bg-secondary"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="mt-2 text-sm text-muted-foreground">
            Step {currentStep} of {totalSteps}:{" "}
            {currentStep === 1
              ? "Widget Details"
              : currentStep === 2
              ? "Data Source"
              : currentStep === 3
              ? "Display Options"
              : "Review & Create"}
          </div>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {/* Step 1: Widget Details */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Widget Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  placeholder="e.g., Stock Portfolio Tracker"
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Description (Optional)
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    handleInputChange("description", e.target.value)
                  }
                  placeholder="Brief description of what this widget displays..."
                  rows={3}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                />
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                <div className="flex items-start gap-3">
                  <div className="text-blue-500 mt-0.5">
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
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100">
                      Widget Name Tips
                    </h4>
                    <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                      Choose a descriptive name that clearly identifies the
                      widget&apos;s purpose on your dashboard.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Data Source */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  API URL *
                </label>
                <input
                  type="url"
                  value={formData.apiUrl}
                  onChange={(e) => handleInputChange("apiUrl", e.target.value)}
                  placeholder="https://api.example.com/stocks"
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background focus:ring-2 focus:ring-primary focus:border-transparent"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Enter the API endpoint that provides your financial data
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Refresh Interval
                </label>
                <select
                  value={formData.refreshInterval}
                  onChange={(e) =>
                    handleInputChange("refreshInterval", Number(e.target.value))
                  }
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  {REFRESH_INTERVALS.map((interval) => (
                    <option key={interval.value} value={interval.value}>
                      {interval.label}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-muted-foreground mt-1">
                  How often should the widget update its data?
                </p>
              </div>

              <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-lg">
                <div className="flex items-start gap-3">
                  <div className="text-amber-500 mt-0.5">
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
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.896-.833-2.664 0L3.232 16c-.77.833.192 2.5 1.732 2.5z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-amber-900 dark:text-amber-100">
                      API Configuration
                    </h4>
                    <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                      Make sure your API supports CORS and returns JSON data.
                      Test the URL in your browser first.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Display Options */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-foreground mb-3">
                  Display Type *
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    {
                      type: "card",
                      icon: "💰",
                      title: "Card",
                      desc: "Summary cards",
                    },
                    {
                      type: "table",
                      icon: "📊",
                      title: "Table",
                      desc: "Data table",
                    },
                    {
                      type: "chart",
                      icon: "📈",
                      title: "Chart",
                      desc: "Visual chart",
                    },
                  ].map((option) => (
                    <button
                      key={option.type}
                      onClick={() =>
                        handleInputChange("displayType", option.type)
                      }
                      className={`p-4 border rounded-lg text-center transition-all ${
                        formData.displayType === option.type
                          ? "border-primary bg-primary/5 text-primary"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <div className="text-2xl mb-2">{option.icon}</div>
                      <div className="font-medium">{option.title}</div>
                      <div className="text-xs text-muted-foreground">
                        {option.desc}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-3">
                  Select Fields to Display *
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {AVAILABLE_FIELDS.map((field) => (
                    <label
                      key={field.id}
                      className={`flex items-start gap-3 p-3 border rounded-lg cursor-pointer transition-all ${
                        formData.selectedFields.includes(field.id)
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={formData.selectedFields.includes(field.id)}
                        onChange={() => handleFieldToggle(field.id)}
                        className="mt-0.5"
                      />
                      <div>
                        <div className="font-medium text-sm">{field.label}</div>
                        <div className="text-xs text-muted-foreground">
                          {field.description}
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Selected: {formData.selectedFields.length} field(s)
                </p>
              </div>
            </div>
          )}

          {/* Step 4: Review */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div className="bg-secondary/20 p-4 rounded-lg">
                <h3 className="font-medium text-foreground mb-3">
                  Review Your Widget
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Name:</span>
                    <span className="font-medium">{formData.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Type:</span>
                    <span className="font-medium capitalize">
                      {formData.displayType}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">API URL:</span>
                    <span className="font-mono text-xs bg-background px-2 py-1 rounded">
                      {formData.apiUrl}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Refresh:</span>
                    <span className="font-medium">
                      {
                        REFRESH_INTERVALS.find(
                          (i) => i.value === formData.refreshInterval
                        )?.label
                      }
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Fields:</span>
                    <span className="font-medium">
                      {formData.selectedFields.length} selected
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                <div className="flex items-start gap-3">
                  <div className="text-green-500 mt-0.5">
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
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-green-900 dark:text-green-100">
                      Ready to Create
                    </h4>
                    <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                      Your widget configuration looks good! Click &quot;Add
                      Widget&quot; to add it to your dashboard.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between p-6 border-t border-border">
          <div className="flex gap-2">
            {currentStep > 1 && (
              <button
                onClick={handlePrevious}
                className="px-4 py-2 text-muted-foreground hover:text-foreground border border-border rounded-lg hover:bg-secondary transition-colors"
              >
                Previous
              </button>
            )}
          </div>

          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              Cancel
            </button>
            {currentStep < totalSteps ? (
              <button
                onClick={handleNext}
                disabled={!isStepValid()}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
              >
                Add Widget
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Comprehensive Loading and Error State Components
// Provides consistent UI patterns for different loading and error scenarios

"use client";

import React from "react";

// Loading States
interface LoadingSpinnerProps {
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  color?: "primary" | "secondary" | "success" | "warning" | "error";
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = "md",
  color = "primary",
  className = "",
}) => {
  const sizeClasses = {
    xs: "w-3 h-3",
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8",
    xl: "w-12 h-12",
  };

  const colorClasses = {
    primary: "border-primary",
    secondary: "border-secondary",
    success: "border-green-500",
    warning: "border-yellow-500",
    error: "border-red-500",
  };

  return (
    <div
      className={`animate-spin rounded-full border-b-2 ${sizeClasses[size]} ${colorClasses[color]} ${className}`}
    />
  );
};

interface LoadingDotsProps {
  size?: "xs" | "sm" | "md" | "lg";
  color?: "primary" | "secondary" | "muted";
  className?: string;
}

export const LoadingDots: React.FC<LoadingDotsProps> = ({
  size = "md",
  color = "primary",
  className = "",
}) => {
  const sizeClasses = {
    xs: "w-1 h-1",
    sm: "w-1.5 h-1.5",
    md: "w-2 h-2",
    lg: "w-3 h-3",
  };

  const colorClasses = {
    primary: "bg-primary",
    secondary: "bg-secondary",
    muted: "bg-muted-foreground",
  };

  return (
    <div className={`flex space-x-1 ${className}`}>
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className={`${sizeClasses[size]} ${colorClasses[color]} rounded-full animate-pulse`}
          style={{
            animationDelay: `${i * 0.2}s`,
            animationDuration: "1.4s",
          }}
        />
      ))}
    </div>
  );
};

interface LoadingSkeletonProps {
  lines?: number;
  height?: "sm" | "md" | "lg";
  className?: string;
}

export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({
  lines = 3,
  height = "md",
  className = "",
}) => {
  const heightClasses = {
    sm: "h-3",
    md: "h-4",
    lg: "h-6",
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className={`bg-muted rounded animate-pulse ${heightClasses[height]}`}
          style={{ width: `${100 - Math.random() * 30}%` }}
        />
      ))}
    </div>
  );
};

interface LoadingCardProps {
  title?: boolean;
  avatar?: boolean;
  lines?: number;
  className?: string;
}

export const LoadingCard: React.FC<LoadingCardProps> = ({
  title = true,
  avatar = false,
  lines = 3,
  className = "",
}) => {
  return (
    <div className={`bg-card border border-border rounded-lg p-4 ${className}`}>
      <div className="animate-pulse">
        <div className="flex items-center space-x-3 mb-4">
          {avatar && <div className="w-10 h-10 bg-muted rounded-full" />}
          {title && <div className="h-4 bg-muted rounded w-1/3" />}
        </div>
        <div className="space-y-2">
          {Array.from({ length: lines }).map((_, i) => (
            <div
              key={i}
              className="h-3 bg-muted rounded"
              style={{ width: `${100 - Math.random() * 40}%` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

// Loading States for specific contexts
interface WidgetLoadingProps {
  icon?: string;
  title?: string;
  subtitle?: string;
  showProgress?: boolean;
  progress?: number;
  className?: string;
}

export const WidgetLoading: React.FC<WidgetLoadingProps> = ({
  icon = "📊",
  title = "Loading data...",
  subtitle,
  showProgress = false,
  progress = 0,
  className = "",
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center h-32 space-y-3 ${className}`}
    >
      <div className="relative">
        <LoadingSpinner size="lg" />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-lg opacity-50">{icon}</span>
        </div>
      </div>
      <div className="text-center space-y-1">
        <div className="text-sm font-medium text-muted-foreground">{title}</div>
        {subtitle && (
          <div className="text-xs text-muted-foreground/60">{subtitle}</div>
        )}
        {showProgress && (
          <div className="w-32 bg-muted rounded-full h-1">
            <div
              className="bg-primary h-1 rounded-full transition-all duration-300"
              style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

// Error States
interface ErrorDisplayProps {
  icon?: string;
  title: string;
  message?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  severity?: "error" | "warning" | "info";
  className?: string;
}

export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({
  icon,
  title,
  message,
  action,
  severity = "error",
  className = "",
}) => {
  const severityConfig = {
    error: {
      icon: "❌",
      bgColor: "bg-red-50 dark:bg-red-900/30",
      borderColor: "border-red-200 dark:border-red-800",
      iconColor: "text-red-600 dark:text-red-400",
      textColor: "text-red-800 dark:text-red-200",
      buttonColor:
        "bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-900/40",
    },
    warning: {
      icon: "⚠️",
      bgColor: "bg-yellow-50 dark:bg-yellow-900/30",
      borderColor: "border-yellow-200 dark:border-yellow-800",
      iconColor: "text-yellow-600 dark:text-yellow-400",
      textColor: "text-yellow-800 dark:text-yellow-200",
      buttonColor:
        "bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300 hover:bg-yellow-200 dark:hover:bg-yellow-900/40",
    },
    info: {
      icon: "ℹ️",
      bgColor: "bg-blue-50 dark:bg-blue-900/30",
      borderColor: "border-blue-200 dark:border-blue-800",
      iconColor: "text-blue-600 dark:text-blue-400",
      textColor: "text-blue-800 dark:text-blue-200",
      buttonColor:
        "bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-900/40",
    },
  };

  const config = severityConfig[severity];
  const displayIcon = icon || config.icon;

  return (
    <div
      className={`${config.bgColor} border ${config.borderColor} rounded-lg p-4 ${className}`}
    >
      <div className="flex items-start space-x-3">
        <div className={`flex-shrink-0 ${config.iconColor} text-xl`}>
          {displayIcon}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className={`text-sm font-medium ${config.textColor}`}>{title}</h3>
          {message && (
            <p className={`mt-1 text-sm ${config.textColor} opacity-90`}>
              {message}
            </p>
          )}
          {action && (
            <button
              onClick={action.onClick}
              className={`mt-3 inline-flex items-center px-3 py-1 text-xs font-medium rounded-md transition-colors ${config.buttonColor}`}
            >
              {action.label}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

interface WidgetErrorProps {
  error: string;
  onRetry?: () => void;
  onDismiss?: () => void;
  className?: string;
}

export const WidgetError: React.FC<WidgetErrorProps> = ({
  error,
  onRetry,
  onDismiss,
  className = "",
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center h-32 space-y-3 ${className}`}
    >
      <div className="flex items-center justify-center w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full">
        <span className="text-red-600 dark:text-red-400 text-xl">⚠️</span>
      </div>
      <div className="text-center space-y-2 max-w-xs">
        <div className="text-sm font-medium text-red-600 dark:text-red-400">
          Failed to load data
        </div>
        <div className="text-xs text-muted-foreground">{error}</div>
        <div className="flex items-center justify-center gap-2">
          {onRetry && (
            <button
              onClick={onRetry}
              className="inline-flex items-center gap-1 px-3 py-1 text-xs bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-md hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
            >
              <span className="w-3 h-3">🔄</span>
              Retry
            </button>
          )}
          {onDismiss && (
            <button
              onClick={onDismiss}
              className="inline-flex items-center gap-1 px-3 py-1 text-xs bg-gray-50 dark:bg-gray-900/20 text-gray-600 dark:text-gray-400 rounded-md hover:bg-gray-100 dark:hover:bg-gray-900/40 transition-colors"
            >
              Dismiss
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// Empty States
interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon = "📭",
  title,
  description,
  action,
  className = "",
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center py-12 space-y-4 ${className}`}
    >
      <div className="flex items-center justify-center w-16 h-16 bg-muted rounded-full">
        <span className="text-2xl opacity-50">{icon}</span>
      </div>
      <div className="text-center space-y-2 max-w-sm">
        <h3 className="text-lg font-medium text-muted-foreground">{title}</h3>
        {description && (
          <p className="text-sm text-muted-foreground/60">{description}</p>
        )}
        {action && (
          <button
            onClick={action.onClick}
            className="inline-flex items-center px-4 py-2 mt-4 text-sm font-medium text-primary bg-primary/10 rounded-lg hover:bg-primary/20 transition-colors"
          >
            {action.label}
          </button>
        )}
      </div>
    </div>
  );
};

interface WidgetEmptyProps {
  icon?: string;
  title?: string;
  subtitle?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export const WidgetEmpty: React.FC<WidgetEmptyProps> = ({
  icon = "📊",
  title = "No data available",
  subtitle = "Check your configuration or try refreshing",
  action,
  className = "",
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center h-32 space-y-3 ${className}`}
    >
      <div className="flex items-center justify-center w-12 h-12 bg-muted rounded-full">
        <span className="text-xl opacity-50">{icon}</span>
      </div>
      <div className="text-center space-y-1">
        <div className="text-sm font-medium text-muted-foreground">{title}</div>
        <div className="text-xs text-muted-foreground/60">{subtitle}</div>
        {action && (
          <button
            onClick={action.onClick}
            className="inline-flex items-center px-3 py-1 mt-2 text-xs bg-muted text-muted-foreground rounded-md hover:bg-muted/80 transition-colors"
          >
            {action.label}
          </button>
        )}
      </div>
    </div>
  );
};

// Status Indicators
interface StatusBadgeProps {
  status: "loading" | "success" | "error" | "warning" | "idle";
  label?: string;
  pulse?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  label,
  pulse = false,
  size = "md",
  className = "",
}) => {
  const statusConfig = {
    loading: { color: "bg-yellow-500", icon: "⏳", label: "Loading" },
    success: { color: "bg-green-500", icon: "✅", label: "Success" },
    error: { color: "bg-red-500", icon: "❌", label: "Error" },
    warning: { color: "bg-orange-500", icon: "⚠️", label: "Warning" },
    idle: { color: "bg-gray-500", icon: "⭕", label: "Idle" },
  };

  const sizeClasses = {
    sm: "w-2 h-2 text-xs",
    md: "w-3 h-3 text-sm",
    lg: "w-4 h-4 text-base",
  };

  const config = statusConfig[status];
  const displayLabel = label || config.label;

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div
        className={`${sizeClasses[size].split(" ").slice(0, 2).join(" ")} ${
          config.color
        } rounded-full ${pulse ? "animate-pulse" : ""}`}
      />
      {displayLabel && (
        <span
          className={`${sizeClasses[size].split(" ")[2]} text-muted-foreground`}
        >
          {displayLabel}
        </span>
      )}
    </div>
  );
};

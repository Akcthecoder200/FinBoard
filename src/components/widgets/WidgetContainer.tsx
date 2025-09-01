'use client';

import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store';
import { removeWidget, clearAllWidgets } from '@/store/slices/widgetsSlice';
import { WidgetCard } from './WidgetCard';
import { AddWidgetModal } from './AddWidgetModal';
import { useState } from 'react';

interface WidgetContainerProps {
  className?: string;
}

export function WidgetContainer({ className = '' }: WidgetContainerProps) {
  const dispatch = useDispatch();
  const widgets = useSelector((state: RootState) => state.widgets.widgets);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleRemoveWidget = (widgetId: string) => {
    dispatch(removeWidget(widgetId));
  };

  const handleClearAll = () => {
    if (confirm('Are you sure you want to remove all widgets? This action cannot be undone.')) {
      dispatch(clearAllWidgets());
    }
  };

  return (
    <div className={`${className}`}>
      {/* Add Widget Section */}
      <div className="bg-card border border-border rounded-lg p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h4 className="font-semibold text-foreground">Add New Widget</h4>
            <p className="text-sm text-muted-foreground">Configure widgets with custom data sources and display options</p>
          </div>
          <div className="text-2xl">🎛️</div>
        </div>
        
        <div className="text-center">
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-3 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span className="font-medium">Add New Widget</span>
          </button>
          <p className="text-xs text-muted-foreground mt-2">
            Create custom widgets with API integration and field selection
          </p>
        </div>
      </div>

      {/* Widgets Display */}
      {widgets.length === 0 ? (
        <div className="bg-card border-2 border-dashed border-border rounded-lg p-12 text-center">
          <div className="text-6xl mb-4 opacity-50">📊</div>
          <h3 className="text-xl font-semibold text-foreground mb-2">Your Dashboard is Empty</h3>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Start building your personalized finance dashboard by creating your first widget 
            with custom data sources and display options.
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm hover:bg-primary/90 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create Your First Widget
          </button>
        </div>
      ) : (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold text-foreground">Active Widgets ({widgets.length})</h4>
            <div className="text-sm text-muted-foreground">
              Drag and drop coming in next step
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {widgets.map((widget) => (
              <WidgetCard
                key={widget.id}
                widget={widget}
                onRemove={() => handleRemoveWidget(widget.id)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Widget Statistics */}
      {widgets.length > 0 && (
        <div className="mt-6 p-4 bg-secondary/30 rounded-lg">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-4">
              <span className="text-muted-foreground">
                Total widgets: <span className="font-mono text-foreground font-semibold">{widgets.length}</span>
              </span>
              <span className="text-muted-foreground">
                Types: <span className="font-mono text-foreground">
                  {Array.from(new Set(widgets.map(w => w.type))).join(', ')}
                </span>
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-muted-foreground">
                Dashboard utilization: <span className="text-primary font-semibold">
                  {Math.min(100, Math.round((widgets.length / 12) * 100))}%
                </span>
              </span>
              <button
                onClick={handleClearAll}
                className="px-3 py-1 text-xs bg-red-100 hover:bg-red-200 dark:bg-red-900/30 dark:hover:bg-red-900/50 text-red-700 dark:text-red-400 rounded-md transition-colors"
                title="Clear all widgets"
              >
                Clear All
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Widget Modal */}
      <AddWidgetModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </div>
  );
}

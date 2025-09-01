import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface Widget {
  id: string;
  type: "table" | "chart" | "card" | "stock" | "crypto" | "market-overview" | "portfolio";
  title: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
  config?: Record<string, unknown>;
}

interface WidgetsState {
  widgets: Widget[];
  isDragEnabled: boolean;
}

// Helper function to load widgets from localStorage
const loadWidgetsFromStorage = (): Widget[] => {
  if (typeof window === "undefined") return []; // SSR safety

  try {
    const stored = localStorage.getItem("finboard-widgets");
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.warn("Failed to load widgets from localStorage:", error);
    return [];
  }
};

// Helper function to save widgets to localStorage
const saveWidgetsToStorage = (widgets: Widget[]) => {
  if (typeof window === "undefined") return; // SSR safety

  try {
    localStorage.setItem("finboard-widgets", JSON.stringify(widgets));
  } catch (error) {
    console.warn("Failed to save widgets to localStorage:", error);
  }
};

const initialState: WidgetsState = {
  widgets: [],
  isDragEnabled: false,
};

const widgetsSlice = createSlice({
  name: "widgets",
  initialState,
  reducers: {
    // New action to hydrate widgets from localStorage
    hydrateWidgets: (state) => {
      state.widgets = loadWidgetsFromStorage();
    },
    addWidget: (state, action: PayloadAction<Widget>) => {
      state.widgets.push(action.payload);
      saveWidgetsToStorage(state.widgets);
    },
    removeWidget: (state, action: PayloadAction<string>) => {
      state.widgets = state.widgets.filter(
        (widget) => widget.id !== action.payload
      );
      saveWidgetsToStorage(state.widgets);
    },
    updateWidget: (state, action: PayloadAction<Widget>) => {
      const index = state.widgets.findIndex(
        (widget) => widget.id === action.payload.id
      );
      if (index !== -1) {
        state.widgets[index] = action.payload;
        saveWidgetsToStorage(state.widgets);
      }
    },
    reorderWidgets: (state, action: PayloadAction<Widget[]>) => {
      state.widgets = action.payload;
      saveWidgetsToStorage(state.widgets);
    },
    setDragEnabled: (state, action: PayloadAction<boolean>) => {
      state.isDragEnabled = action.payload;
    },
    // Action to clear all widgets
    clearAllWidgets: (state) => {
      state.widgets = [];
      saveWidgetsToStorage(state.widgets);
    },
  },
});

export const {
  hydrateWidgets,
  addWidget,
  removeWidget,
  updateWidget,
  reorderWidgets,
  setDragEnabled,
  clearAllWidgets,
} = widgetsSlice.actions;

export default widgetsSlice.reducer;

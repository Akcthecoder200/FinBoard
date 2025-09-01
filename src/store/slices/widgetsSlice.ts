import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Widget {
  id: string;
  type: 'table' | 'chart' | 'card';
  title: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
  config?: Record<string, unknown>;
}

interface WidgetsState {
  widgets: Widget[];
  isDragEnabled: boolean;
}

const initialState: WidgetsState = {
  widgets: [],
  isDragEnabled: false,
};

const widgetsSlice = createSlice({
  name: 'widgets',
  initialState,
  reducers: {
    addWidget: (state, action: PayloadAction<Widget>) => {
      state.widgets.push(action.payload);
    },
    removeWidget: (state, action: PayloadAction<string>) => {
      state.widgets = state.widgets.filter(widget => widget.id !== action.payload);
    },
    updateWidget: (state, action: PayloadAction<Widget>) => {
      const index = state.widgets.findIndex(widget => widget.id === action.payload.id);
      if (index !== -1) {
        state.widgets[index] = action.payload;
      }
    },
    reorderWidgets: (state, action: PayloadAction<Widget[]>) => {
      state.widgets = action.payload;
    },
    setDragEnabled: (state, action: PayloadAction<boolean>) => {
      state.isDragEnabled = action.payload;
    },
  },
});

export const { addWidget, removeWidget, updateWidget, reorderWidgets, setDragEnabled } = widgetsSlice.actions;
export default widgetsSlice.reducer;

// Widget Cleanup Utility
// Removes test widgets and cleans up storage

"use client";

import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../store";
import { removeWidget } from "../store/slices/widgetsSlice";

export const WidgetCleanup = () => {
  const dispatch = useDispatch();
  const widgets = useSelector((state: RootState) => state.widgets.widgets);

  useEffect(() => {
    // Remove any test widgets on mount
    const testWidgets = widgets.filter(
      (widget) =>
        widget.id.includes("test-widget") ||
        widget.title.includes("Test Widget") ||
        widget.title.includes("Data Persistence") ||
        widget.config?.testData === true
    );

    if (testWidgets.length > 0) {
      console.log(`Found ${testWidgets.length} test widgets, removing...`);
      testWidgets.forEach((widget) => {
        dispatch(removeWidget(widget.id));
      });
      console.log("Test widgets removed successfully");
    }
  }, [dispatch, widgets]);

  return null; // This is a cleanup utility component
};

export default WidgetCleanup;

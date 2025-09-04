import React, { useState, useRef, useCallback, useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  ReferenceArea,
} from "recharts";

interface ChartAnnotation {
  id: string;
  type: "line" | "area" | "point" | "text";
  x?: number | string;
  y?: number;
  x1?: number | string;
  y1?: number;
  x2?: number | string;
  y2?: number;
  color: string;
  label?: string;
  description?: string;
  timestamp: number;
}

interface ChartDataPoint {
  [key: string]: string | number;
}

interface TooltipProps {
  active?: boolean;
  payload?: TooltipPayload[];
  label?: string;
}

interface TooltipPayload {
  name: string;
  value: number;
  color: string;
}

interface CustomDotProps {
  cx?: number;
  cy?: number;
  payload?: ChartDataPoint;
}

interface AnnotatedChartProps {
  data: ChartDataPoint[];
  dataKey: string;
  xKey?: string;
  height?: number;
  onAnnotationAdd?: (annotation: ChartAnnotation) => void;
  onAnnotationUpdate?: (annotation: ChartAnnotation) => void;
  onAnnotationDelete?: (annotationId: string) => void;
  annotations?: ChartAnnotation[];
  enableDrawing?: boolean;
  showGrid?: boolean;
  showTooltip?: boolean;
}

const AnnotatedChart: React.FC<AnnotatedChartProps> = ({
  data,
  dataKey,
  xKey = "date",
  height = 400,
  onAnnotationAdd,
  onAnnotationUpdate,
  onAnnotationDelete,
  annotations = [],
  enableDrawing = true,
  showGrid = true,
  showTooltip = true,
}) => {
  const [drawingMode, setDrawingMode] = useState<
    "line" | "area" | "point" | "text"
  >("line");
  const [selectedAnnotation, setSelectedAnnotation] = useState<string | null>(
    null
  );
  const [isMouseOver, setIsMouseOver] = useState(false);
  const chartRef = useRef<HTMLDivElement>(null);

  // Annotation colors - memoized to prevent useCallback dependency issues
  const ANNOTATION_COLORS = useMemo(
    () => [
      "#3b82f6", // blue
      "#10b981", // green
      "#f59e0b", // yellow
      "#ef4444", // red
      "#8b5cf6", // purple
      "#06b6d4", // cyan
      "#84cc16", // lime
    ],
    []
  );

  // Generate unique ID for annotations
  const generateId = () =>
    `annotation_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  const handleMouseEnter = () => setIsMouseOver(true);
  const handleMouseLeave = () => {
    setIsMouseOver(false);
  };

  // Handle chart click - simplified typing
  const handleChartClick = useCallback(
    (e: Record<string, unknown>) => {
      if (!enableDrawing || !e || !e.activeLabel) return;

      const activePayload = e.activePayload as
        | Array<{ value: number }>
        | undefined;

      const newAnnotation: ChartAnnotation = {
        id: generateId(),
        type: drawingMode,
        color: ANNOTATION_COLORS[annotations.length % ANNOTATION_COLORS.length],
        timestamp: Date.now(),
        label: `${
          drawingMode.charAt(0).toUpperCase() + drawingMode.slice(1)
        } Annotation`,
        description: `Added at ${new Date().toLocaleTimeString()}`,
      };

      if (drawingMode === "line") {
        // Horizontal line at clicked Y value
        newAnnotation.y = activePayload?.[0]?.value || 0;
      } else if (drawingMode === "point") {
        // Point at exact click location
        newAnnotation.x = e.activeLabel as string;
        newAnnotation.y = activePayload?.[0]?.value || 0;
      } else if (drawingMode === "text") {
        // Text annotation
        newAnnotation.x = e.activeLabel as string;
        newAnnotation.y = activePayload?.[0]?.value || 0;
        newAnnotation.label =
          prompt("Enter annotation text:") || "Text Annotation";
      }

      onAnnotationAdd?.(newAnnotation);
    },
    [
      drawingMode,
      enableDrawing,
      annotations.length,
      onAnnotationAdd,
      ANNOTATION_COLORS,
    ]
  );

  // Delete annotation
  const deleteAnnotation = (annotationId: string) => {
    onAnnotationDelete?.(annotationId);
    setSelectedAnnotation(null);
  };

  // Update annotation
  const updateAnnotation = (
    annotation: ChartAnnotation,
    updates: Partial<ChartAnnotation>
  ) => {
    const updatedAnnotation = { ...annotation, ...updates };
    onAnnotationUpdate?.(updatedAnnotation);
  };

  // Custom dot for point annotations
  const CustomDot = (props: CustomDotProps) => {
    const { cx, cy, payload } = props;
    if (!payload) return null;

    const pointAnnotations = annotations.filter(
      (ann) => ann.type === "point" && ann.x === payload[xKey]
    );

    if (pointAnnotations.length === 0) return null;

    return (
      <g>
        {pointAnnotations.map((annotation) => (
          <g key={annotation.id}>
            <circle
              cx={cx}
              cy={cy}
              r={6}
              fill={annotation.color}
              stroke="#fff"
              strokeWidth={2}
              style={{ cursor: "pointer" }}
              onClick={() => setSelectedAnnotation(annotation.id)}
            />
            {annotation.label && (
              <text
                x={cx}
                y={(cy || 0) - 15}
                textAnchor="middle"
                fill={annotation.color}
                fontSize={12}
                fontWeight="bold"
              >
                {annotation.label}
              </text>
            )}
          </g>
        ))}
      </g>
    );
  };

  // Custom tooltip with annotation info
  const CustomTooltip = ({ active, payload, label }: TooltipProps) => {
    if (!active || !payload || !payload.length || !showTooltip) return null;

    const relevantAnnotations = annotations.filter(
      (ann) =>
        (ann.type === "point" && ann.x === label) ||
        (ann.type === "text" && ann.x === label)
    );

    return (
      <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
        <p className="text-sm font-medium mb-2">{`${xKey}: ${label}`}</p>
        {payload.map((entry, index) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {`${entry.name}: ${entry.value.toFixed(2)}`}
          </p>
        ))}
        {relevantAnnotations.length > 0 && (
          <div className="mt-2 pt-2 border-t border-border">
            <p className="text-xs text-muted-foreground mb-1">Annotations:</p>
            {relevantAnnotations.map((ann) => (
              <div
                key={ann.id}
                className="text-xs"
                style={{ color: ann.color }}
              >
                <strong>{ann.label}</strong>
                {ann.description && (
                  <p className="text-muted-foreground">{ann.description}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="w-full bg-card rounded-lg border p-4">
      {/* Annotation Toolbar */}
      {enableDrawing && (
        <div className="flex items-center gap-2 mb-4 p-3 bg-muted/50 rounded-lg">
          <span className="text-sm font-medium">Drawing Mode:</span>
          {(["line", "point", "text"] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setDrawingMode(mode)}
              className={`px-3 py-1 text-xs rounded-md transition-colors ${
                drawingMode === mode
                  ? "bg-primary text-primary-foreground"
                  : "bg-background text-foreground hover:bg-muted"
              }`}
            >
              {mode.charAt(0).toUpperCase() + mode.slice(1)}
            </button>
          ))}

          <div className="h-4 w-px bg-border mx-2" />

          <span className="text-sm text-muted-foreground">
            Click on chart to add {drawingMode} annotation
          </span>

          {annotations.length > 0 && (
            <>
              <div className="h-4 w-px bg-border mx-2" />
              <button
                onClick={() => {
                  annotations.forEach((ann) => deleteAnnotation(ann.id));
                }}
                className="px-3 py-1 text-xs rounded-md bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Clear All ({annotations.length})
              </button>
            </>
          )}
        </div>
      )}

      {/* Chart Container */}
      <div
        ref={chartRef}
        style={{ height }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            onClick={handleChartClick}
            style={{ cursor: enableDrawing ? "crosshair" : "default" }}
          >
            {showGrid && (
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            )}
            <XAxis dataKey={xKey} className="text-xs" tick={{ fontSize: 12 }} />
            <YAxis
              className="text-xs"
              tick={{ fontSize: 12 }}
              tickFormatter={(value) => value.toFixed(2)}
            />
            <Tooltip content={<CustomTooltip />} />

            {/* Main Line */}
            <Line
              type="monotone"
              dataKey={dataKey}
              stroke="#3b82f6"
              strokeWidth={2}
              dot={<CustomDot />}
              activeDot={{
                r: 6,
                stroke: "#3b82f6",
                strokeWidth: 2,
                fill: "#fff",
              }}
            />

            {/* Render Annotations */}
            {annotations.map((annotation) => {
              if (annotation.type === "line" && annotation.y !== undefined) {
                return (
                  <ReferenceLine
                    key={annotation.id}
                    y={annotation.y}
                    stroke={annotation.color}
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    label={{
                      value: annotation.label || "",
                      position: "insideTopLeft",
                      style: { fill: annotation.color, fontSize: 12 },
                    }}
                  />
                );
              }

              if (
                annotation.type === "area" &&
                annotation.y1 !== undefined &&
                annotation.y2 !== undefined
              ) {
                return (
                  <ReferenceArea
                    key={annotation.id}
                    y1={annotation.y1}
                    y2={annotation.y2}
                    fill={annotation.color}
                    fillOpacity={0.2}
                    stroke={annotation.color}
                    strokeWidth={1}
                  />
                );
              }

              return null;
            })}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Annotation List */}
      {annotations.length > 0 && (
        <div className="mt-4 p-3 bg-muted/30 rounded-lg">
          <h4 className="text-sm font-medium mb-2">
            Annotations ({annotations.length})
          </h4>
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {annotations.map((annotation) => (
              <div
                key={annotation.id}
                className={`flex items-center justify-between p-2 rounded text-xs ${
                  selectedAnnotation === annotation.id
                    ? "bg-primary/20"
                    : "bg-background"
                }`}
              >
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: annotation.color }}
                  />
                  <span className="font-medium">{annotation.label}</span>
                  <span className="text-muted-foreground">
                    ({annotation.type})
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => {
                      const newLabel = prompt("Edit label:", annotation.label);
                      if (newLabel !== null) {
                        updateAnnotation(annotation, { label: newLabel });
                      }
                    }}
                    className="px-2 py-1 text-xs rounded bg-muted hover:bg-muted/80"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => deleteAnnotation(annotation.id)}
                    className="px-2 py-1 text-xs rounded bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Drawing Indicator */}
      {isMouseOver && enableDrawing && (
        <div className="absolute top-2 right-2 text-xs text-muted-foreground bg-background/80 px-2 py-1 rounded">
          Click to add {drawingMode} annotation
        </div>
      )}
    </div>
  );
};

export default AnnotatedChart;

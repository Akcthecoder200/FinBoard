// Responsive Layout Component
// Handles multiple screen sizes and provides consistent spacing and grid layouts

"use client";

import React from "react";

interface ResponsiveGridProps {
  children: React.ReactNode;
  columns?: {
    xs?: number; // Mobile (< 640px)
    sm?: number; // Small tablet (640px - 768px)
    md?: number; // Tablet (768px - 1024px)
    lg?: number; // Desktop (1024px - 1280px)
    xl?: number; // Large desktop (1280px - 1536px)
    "2xl"?: number; // Extra large (>= 1536px)
  };
  gap?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
}

interface ResponsiveContainerProps {
  children: React.ReactNode;
  maxWidth?:
    | "none"
    | "sm"
    | "md"
    | "lg"
    | "xl"
    | "2xl"
    | "3xl"
    | "4xl"
    | "5xl"
    | "6xl"
    | "7xl";
  padding?: "none" | "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
}

interface BreakpointDisplayProps {
  children: React.ReactNode;
  show?: ("xs" | "sm" | "md" | "lg" | "xl" | "2xl")[];
  hide?: ("xs" | "sm" | "md" | "lg" | "xl" | "2xl")[];
}

// Responsive Grid Component
export const ResponsiveGrid: React.FC<ResponsiveGridProps> = ({
  children,
  columns = { xs: 1, sm: 2, md: 2, lg: 3, xl: 4, "2xl": 4 },
  gap = "md",
  className = "",
}) => {
  const gapClasses = {
    xs: "gap-2",
    sm: "gap-4",
    md: "gap-6",
    lg: "gap-8",
    xl: "gap-10",
  };

  const gridClasses = [
    "grid",
    gapClasses[gap],
    columns.xs ? `grid-cols-${columns.xs}` : "grid-cols-1",
    columns.sm ? `sm:grid-cols-${columns.sm}` : "",
    columns.md ? `md:grid-cols-${columns.md}` : "",
    columns.lg ? `lg:grid-cols-${columns.lg}` : "",
    columns.xl ? `xl:grid-cols-${columns.xl}` : "",
    columns["2xl"] ? `2xl:grid-cols-${columns["2xl"]}` : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return <div className={gridClasses}>{children}</div>;
};

// Responsive Container Component
export const ResponsiveContainer: React.FC<ResponsiveContainerProps> = ({
  children,
  maxWidth = "7xl",
  padding = "md",
  className = "",
}) => {
  const maxWidthClasses = {
    none: "",
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    "2xl": "max-w-2xl",
    "3xl": "max-w-3xl",
    "4xl": "max-w-4xl",
    "5xl": "max-w-5xl",
    "6xl": "max-w-6xl",
    "7xl": "max-w-7xl",
  };

  const paddingClasses = {
    none: "",
    xs: "px-2 py-1",
    sm: "px-4 py-2",
    md: "px-6 py-4",
    lg: "px-8 py-6",
    xl: "px-12 py-8",
  };

  const containerClasses = [
    "mx-auto w-full",
    maxWidthClasses[maxWidth],
    paddingClasses[padding],
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return <div className={containerClasses}>{children}</div>;
};

// Breakpoint Display Component
export const BreakpointDisplay: React.FC<BreakpointDisplayProps> = ({
  children,
  show,
  hide,
}) => {
  let classes = "";

  if (show) {
    // Default to hidden, then show on specified breakpoints
    classes = "hidden";
    show.forEach((breakpoint) => {
      switch (breakpoint) {
        case "xs":
          classes += " block sm:hidden";
          break;
        case "sm":
          classes += " sm:block md:hidden";
          break;
        case "md":
          classes += " md:block lg:hidden";
          break;
        case "lg":
          classes += " lg:block xl:hidden";
          break;
        case "xl":
          classes += " xl:block 2xl:hidden";
          break;
        case "2xl":
          classes += " 2xl:block";
          break;
      }
    });
  }

  if (hide) {
    // Default to shown, then hide on specified breakpoints
    classes = "block";
    hide.forEach((breakpoint) => {
      switch (breakpoint) {
        case "xs":
          classes += " sm:block";
          break;
        case "sm":
          classes += " sm:hidden md:block";
          break;
        case "md":
          classes += " md:hidden lg:block";
          break;
        case "lg":
          classes += " lg:hidden xl:block";
          break;
        case "xl":
          classes += " xl:hidden 2xl:block";
          break;
        case "2xl":
          classes += " 2xl:hidden";
          break;
      }
    });
  }

  return <div className={classes}>{children}</div>;
};

// Stack Component for vertical layouts
interface StackProps {
  children: React.ReactNode;
  spacing?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl";
  align?: "start" | "center" | "end" | "stretch";
  className?: string;
}

export const Stack: React.FC<StackProps> = ({
  children,
  spacing = "md",
  align = "stretch",
  className = "",
}) => {
  const spacingClasses = {
    xs: "space-y-1",
    sm: "space-y-2",
    md: "space-y-4",
    lg: "space-y-6",
    xl: "space-y-8",
    "2xl": "space-y-12",
  };

  const alignClasses = {
    start: "items-start",
    center: "items-center",
    end: "items-end",
    stretch: "items-stretch",
  };

  const stackClasses = [
    "flex flex-col",
    spacingClasses[spacing],
    alignClasses[align],
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return <div className={stackClasses}>{children}</div>;
};

// Flex Component for horizontal layouts
interface FlexProps {
  children: React.ReactNode;
  direction?: "row" | "col" | "row-reverse" | "col-reverse";
  wrap?: "wrap" | "nowrap" | "wrap-reverse";
  justify?: "start" | "end" | "center" | "between" | "around" | "evenly";
  align?: "start" | "end" | "center" | "baseline" | "stretch";
  gap?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
}

export const Flex: React.FC<FlexProps> = ({
  children,
  direction = "row",
  wrap = "nowrap",
  justify = "start",
  align = "center",
  gap = "md",
  className = "",
}) => {
  const directionClasses = {
    row: "flex-row",
    col: "flex-col",
    "row-reverse": "flex-row-reverse",
    "col-reverse": "flex-col-reverse",
  };

  const wrapClasses = {
    wrap: "flex-wrap",
    nowrap: "flex-nowrap",
    "wrap-reverse": "flex-wrap-reverse",
  };

  const justifyClasses = {
    start: "justify-start",
    end: "justify-end",
    center: "justify-center",
    between: "justify-between",
    around: "justify-around",
    evenly: "justify-evenly",
  };

  const alignClasses = {
    start: "items-start",
    end: "items-end",
    center: "items-center",
    baseline: "items-baseline",
    stretch: "items-stretch",
  };

  const gapClasses = {
    xs: "gap-1",
    sm: "gap-2",
    md: "gap-4",
    lg: "gap-6",
    xl: "gap-8",
  };

  const flexClasses = [
    "flex",
    directionClasses[direction],
    wrapClasses[wrap],
    justifyClasses[justify],
    alignClasses[align],
    gapClasses[gap],
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return <div className={flexClasses}>{children}</div>;
};

// Responsive Text Component
interface ResponsiveTextProps {
  children: React.ReactNode;
  size?: {
    xs?:
      | "xs"
      | "sm"
      | "base"
      | "lg"
      | "xl"
      | "2xl"
      | "3xl"
      | "4xl"
      | "5xl"
      | "6xl";
    sm?:
      | "xs"
      | "sm"
      | "base"
      | "lg"
      | "xl"
      | "2xl"
      | "3xl"
      | "4xl"
      | "5xl"
      | "6xl";
    md?:
      | "xs"
      | "sm"
      | "base"
      | "lg"
      | "xl"
      | "2xl"
      | "3xl"
      | "4xl"
      | "5xl"
      | "6xl";
    lg?:
      | "xs"
      | "sm"
      | "base"
      | "lg"
      | "xl"
      | "2xl"
      | "3xl"
      | "4xl"
      | "5xl"
      | "6xl";
    xl?:
      | "xs"
      | "sm"
      | "base"
      | "lg"
      | "xl"
      | "2xl"
      | "3xl"
      | "4xl"
      | "5xl"
      | "6xl";
  };
  weight?:
    | "thin"
    | "light"
    | "normal"
    | "medium"
    | "semibold"
    | "bold"
    | "extrabold"
    | "black";
  align?: "left" | "center" | "right" | "justify";
  className?: string;
}

export const ResponsiveText: React.FC<ResponsiveTextProps> = ({
  children,
  size = { xs: "base" },
  weight = "normal",
  align = "left",
  className = "",
}) => {
  const weightClasses = {
    thin: "font-thin",
    light: "font-light",
    normal: "font-normal",
    medium: "font-medium",
    semibold: "font-semibold",
    bold: "font-bold",
    extrabold: "font-extrabold",
    black: "font-black",
  };

  const alignClasses = {
    left: "text-left",
    center: "text-center",
    right: "text-right",
    justify: "text-justify",
  };

  const textClasses = [
    size.xs ? `text-${size.xs}` : "text-base",
    size.sm ? `sm:text-${size.sm}` : "",
    size.md ? `md:text-${size.md}` : "",
    size.lg ? `lg:text-${size.lg}` : "",
    size.xl ? `xl:text-${size.xl}` : "",
    weightClasses[weight],
    alignClasses[align],
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return <div className={textClasses}>{children}</div>;
};

// Utility hook for getting current breakpoint
export const useBreakpoint = () => {
  const [breakpoint, setBreakpoint] = React.useState<
    "xs" | "sm" | "md" | "lg" | "xl" | "2xl"
  >("xs");

  React.useEffect(() => {
    const updateBreakpoint = () => {
      const width = window.innerWidth;
      if (width >= 1536) setBreakpoint("2xl");
      else if (width >= 1280) setBreakpoint("xl");
      else if (width >= 1024) setBreakpoint("lg");
      else if (width >= 768) setBreakpoint("md");
      else if (width >= 640) setBreakpoint("sm");
      else setBreakpoint("xs");
    };

    updateBreakpoint();
    window.addEventListener("resize", updateBreakpoint);
    return () => window.removeEventListener("resize", updateBreakpoint);
  }, []);

  const isMobile = breakpoint === "xs" || breakpoint === "sm";
  const isTablet = breakpoint === "md";
  const isDesktop =
    breakpoint === "lg" || breakpoint === "xl" || breakpoint === "2xl";

  return {
    breakpoint,
    isMobile,
    isTablet,
    isDesktop,
    width: {
      xs: breakpoint === "xs",
      sm: breakpoint === "sm",
      md: breakpoint === "md",
      lg: breakpoint === "lg",
      xl: breakpoint === "xl",
      "2xl": breakpoint === "2xl",
    },
  };
};

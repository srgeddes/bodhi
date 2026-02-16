"use client";

import { useMemo, useCallback } from "react";
import { Responsive, WidthProvider } from "react-grid-layout";
import { useDashboardStore } from "@/store/dashboard.store";
import { WidgetContainer } from "@/features/dashboard/components/WidgetContainer";

import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";

const ResponsiveGridLayout = WidthProvider(Responsive);

export function DashboardGrid() {
  const rawLayout = useDashboardStore((s) => s.layout);
  const isEditing = useDashboardStore((s) => s.isEditing);
  const updateLayout = useDashboardStore((s) => s.updateLayout);

  // Deduplicate layout items to prevent duplicate key errors
  const layout = useMemo(() => {
    const seen = new Set<string>();
    return rawLayout.filter((item) => {
      if (seen.has(item.i)) return false;
      seen.add(item.i);
      return true;
    });
  }, [rawLayout]);

  const layouts = useMemo(
    () => ({
      lg: layout,
      md: layout.map((item) => ({
        ...item,
        w: Math.min(item.w, 6),
      })),
      sm: layout.map((item) => ({
        ...item,
        w: 12,
        x: 0,
      })),
    }),
    [layout],
  );

  const handleLayoutChange = useCallback(
    (currentLayout: ReactGridLayout.Layout[]) => {
      // Only keep items that exist in our widget set
      const validIds = new Set(layout.map((l) => l.i));
      const updated = currentLayout
        .filter((item) => validIds.has(item.i))
        .map((item) => ({
          i: item.i,
          x: item.x,
          y: item.y,
          w: item.w,
          h: item.h,
          minW: layout.find((l) => l.i === item.i)?.minW,
          minH: layout.find((l) => l.i === item.i)?.minH,
        }));
      updateLayout(updated);
    },
    [layout, updateLayout],
  );

  return (
    <ResponsiveGridLayout
      layouts={layouts}
      breakpoints={{ lg: 1200, md: 768, sm: 0 }}
      cols={{ lg: 12, md: 6, sm: 1 }}
      rowHeight={60}
      isDraggable={true}
      isResizable={true}
      onLayoutChange={handleLayoutChange}
      draggableHandle=".drag-handle"
      containerPadding={[0, 0]}
      margin={[16, 16]}
      useCSSTransforms
    >
      {layout.map((item) => (
        <div key={item.i} className="h-full">
          <WidgetContainer widgetId={item.i} isEditing={isEditing} />
        </div>
      ))}
    </ResponsiveGridLayout>
  );
}

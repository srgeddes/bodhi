"use client";

import { useMemo } from "react";
import { Responsive, WidthProvider } from "react-grid-layout";
import { BaseWidget } from "@/features/widgets/base/BaseWidget";
import { WidgetRenderer } from "@/features/dashboard/components/WidgetRenderer";
import { widgetRegistry } from "@/features/widgets/registry";
import { PageContainer } from "@/components/layout";
import { useDemoDashboardStore } from "@/store/demo-dashboard.store";

import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";

const ResponsiveGridLayout = WidthProvider(Responsive);

export default function DemoPage() {
  const layout = useDemoDashboardStore((s) => s.layout);
  const widgets = useDemoDashboardStore((s) => s.widgets);

  const layouts = useMemo(
    () => ({
      lg: layout,
      md: layout.map((item) => ({ ...item, w: Math.min(item.w, 6) })),
      sm: layout.map((item) => ({ ...item, w: 12, x: 0 })),
    }),
    [layout]
  );

  return (
    <PageContainer>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-foreground">Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Sample financial overview with demo data
        </p>
      </div>

      <ResponsiveGridLayout
        layouts={layouts}
        breakpoints={{ lg: 1200, md: 768, sm: 0 }}
        cols={{ lg: 12, md: 6, sm: 1 }}
        rowHeight={60}
        isDraggable={false}
        isResizable={false}
        containerPadding={[0, 0]}
        margin={[16, 16]}
        useCSSTransforms
      >
        {layout.map((item) => {
          const config = widgets.find((w) => w.id === item.i);
          if (!config) return <div key={item.i} />;
          const meta = widgetRegistry[config.type];
          const title = meta?.title ?? "Widget";

          return (
            <div key={item.i}>
              <BaseWidget title={title} icon={meta?.icon}>
                <WidgetRenderer type={config.type} settings={config.settings} />
              </BaseWidget>
            </div>
          );
        })}
      </ResponsiveGridLayout>
    </PageContainer>
  );
}

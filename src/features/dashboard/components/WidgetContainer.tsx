"use client";

import { BaseWidget } from "@/features/widgets/base/BaseWidget";
import { WidgetRenderer } from "@/features/dashboard/components/WidgetRenderer";
import { widgetRegistry } from "@/features/widgets/registry";
import { useDashboardStore } from "@/store/dashboard.store";

interface WidgetContainerProps {
  widgetId: string;
  isEditing: boolean;
}

export function WidgetContainer({ widgetId, isEditing }: WidgetContainerProps) {
  const widgets = useDashboardStore((s) => s.widgets);
  const removeWidget = useDashboardStore((s) => s.removeWidget);

  const config = widgets.find((w) => w.id === widgetId);
  if (!config) return null;

  const meta = widgetRegistry[config.type];
  const title = config.title || meta?.title || "Widget";

  return (
    <BaseWidget
      title={title}
      icon={meta?.icon}
      isEditing={isEditing}
      onRemove={() => removeWidget(widgetId)}
    >
      <WidgetRenderer type={config.type} settings={config.settings} />
    </BaseWidget>
  );
}

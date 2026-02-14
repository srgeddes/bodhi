"use client";

import { widgetRegistry } from "@/features/widgets/registry";
import { EmptyState } from "@/components/feedback";

interface WidgetRendererProps {
  type: string;
  settings?: Record<string, unknown>;
}

export function WidgetRenderer({ type, settings }: WidgetRendererProps) {
  const meta = widgetRegistry[type];

  if (!meta) {
    return (
      <EmptyState
        title="Unknown Widget"
        description={`Widget type "${type}" is not registered.`}
      />
    );
  }

  const Component = meta.component;
  return <Component settings={settings} />;
}

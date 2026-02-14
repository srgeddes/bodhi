"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { BorderBeam } from "@/components/ui/border-beam";
import { widgetRegistry, widgetTypes } from "@/features/widgets/registry";
import { useDashboardStore } from "@/store/dashboard.store";
import { toast } from "sonner";

interface WidgetLibraryProps {
  open: boolean;
  onClose: () => void;
}

export function WidgetLibrary({ open, onClose }: WidgetLibraryProps) {
  const addWidget = useDashboardStore((s) => s.addWidget);
  const widgets = useDashboardStore((s) => s.widgets);
  const [hoveredType, setHoveredType] = useState<string | null>(null);

  const activeTypes = new Set(widgets.map((w) => w.type));

  const handleAdd = (type: string) => {
    const meta = widgetRegistry[type];
    if (!meta) return;
    addWidget(type, meta.title);
    toast.success("Widget added");
  };

  return (
    <Sheet open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <SheetContent side="right" className="w-full max-w-md p-0">
        <SheetHeader className="border-b border-border px-6 py-4">
          <SheetTitle>Widget Library</SheetTitle>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-5rem)]">
          <div className="space-y-3 p-6">
            {widgetTypes.map((type) => {
              const meta = widgetRegistry[type];
              const isActive = activeTypes.has(type);
              const isHovered = hoveredType === type;
              const Icon = meta.icon;

              return (
                <Card
                  key={type}
                  className="relative flex items-center gap-4 p-4 overflow-hidden"
                  onMouseEnter={() => setHoveredType(type)}
                  onMouseLeave={() => setHoveredType(null)}
                >
                  {isHovered && !isActive && <BorderBeam size={80} duration={3} />}
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">
                      {meta.title}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {meta.description}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => handleAdd(type)}
                    disabled={isActive}
                    variant={isActive ? "secondary" : "default"}
                  >
                    {isActive ? (
                      "Active"
                    ) : (
                      <span className="flex items-center gap-1">
                        <Plus className="h-3.5 w-3.5" />
                        Add
                      </span>
                    )}
                  </Button>
                </Card>
              );
            })}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}

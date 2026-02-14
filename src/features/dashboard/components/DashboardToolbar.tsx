"use client";

import { Plus, GripVertical, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDashboardStore } from "@/store/dashboard.store";
import { toast } from "sonner";

interface DashboardToolbarProps {
  onOpenLibrary: () => void;
}

export function DashboardToolbar({ onOpenLibrary }: DashboardToolbarProps) {
  const isEditing = useDashboardStore((s) => s.isEditing);
  const toggleEditing = useDashboardStore((s) => s.toggleEditing);
  const resetLayout = useDashboardStore((s) => s.resetLayout);

  const handleReset = () => {
    resetLayout();
    toast.success("Dashboard reset");
  };

  return (
    <div className="flex items-center gap-2">
      <Button variant="outline" size="sm" onClick={onOpenLibrary}>
        <Plus className="h-4 w-4" />
        Add Widget
      </Button>

      <Button
        variant={isEditing ? "default" : "outline"}
        size="sm"
        onClick={toggleEditing}
      >
        <GripVertical className="h-4 w-4" />
        {isEditing ? "Done" : "Edit Layout"}
      </Button>

      {isEditing && (
        <Button variant="outline" size="sm" onClick={handleReset}>
          <RotateCcw className="h-4 w-4" />
          Reset
        </Button>
      )}
    </div>
  );
}

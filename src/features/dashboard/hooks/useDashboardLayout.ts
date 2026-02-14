"use client";

import { useDashboardStore } from "@/store/dashboard.store";

export function useDashboardLayout() {
  const {
    layout,
    widgets,
    isEditing,
    addWidget,
    removeWidget,
    updateLayout,
    toggleEditing,
    resetLayout,
  } = useDashboardStore();

  return {
    layout,
    widgets,
    isEditing,
    addWidget,
    removeWidget,
    updateLayout,
    toggleEditing,
    resetLayout,
  };
}

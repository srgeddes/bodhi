"use client";

import { Badge } from "@/components/ui/badge";

const categoryColors: Record<string, string> = {
  // Custom categories
  "Food & Dining": "bg-chart-1/15 text-chart-1",
  "Housing": "bg-chart-2/15 text-chart-2",
  "Transportation": "bg-chart-3/15 text-chart-3",
  "Shopping": "bg-chart-4/15 text-chart-4",
  "Entertainment": "bg-chart-5/15 text-chart-5",
  "Health & Fitness": "bg-chart-6/15 text-chart-6",
  "Income": "bg-primary/15 text-primary",
  // Provider categories
  "accommodation": "bg-chart-2/15 text-chart-2",
  "advertising": "bg-chart-7/15 text-chart-7",
  "bar": "bg-chart-5/15 text-chart-5",
  "charity": "bg-primary/15 text-primary",
  "clothing": "bg-chart-4/15 text-chart-4",
  "dining": "bg-chart-1/15 text-chart-1",
  "education": "bg-chart-6/15 text-chart-6",
  "electronics": "bg-chart-7/15 text-chart-7",
  "entertainment": "bg-chart-5/15 text-chart-5",
  "fuel": "bg-chart-3/15 text-chart-3",
  "general": "bg-muted text-muted-foreground",
  "groceries": "bg-chart-1/15 text-chart-1",
  "health": "bg-chart-6/15 text-chart-6",
  "home": "bg-chart-2/15 text-chart-2",
  "income": "bg-primary/15 text-primary",
  "insurance": "bg-chart-7/15 text-chart-7",
  "investment": "bg-chart-3/15 text-chart-3",
  "loan": "bg-chart-5/15 text-chart-5",
  "office": "bg-chart-7/15 text-chart-7",
  "phone": "bg-chart-7/15 text-chart-7",
  "service": "bg-chart-4/15 text-chart-4",
  "shopping": "bg-chart-4/15 text-chart-4",
  "software": "bg-chart-7/15 text-chart-7",
  "sport": "bg-chart-6/15 text-chart-6",
  "tax": "bg-chart-5/15 text-chart-5",
  "transport": "bg-chart-3/15 text-chart-3",
  "transportation": "bg-chart-3/15 text-chart-3",
  "utilities": "bg-chart-2/15 text-chart-2",
};

function formatCategoryLabel(category: string): string {
  // Capitalize first letter of each word for lowercase categories
  return category.replace(/\b\w/g, (c) => c.toUpperCase());
}

interface CategoryBadgeProps {
  category: string;
}

export function CategoryBadge({ category }: CategoryBadgeProps) {
  const colorClass = categoryColors[category] ?? "bg-muted text-muted-foreground";

  return (
    <Badge variant="secondary" className={`${colorClass} border-0 text-xs font-normal`}>
      {formatCategoryLabel(category)}
    </Badge>
  );
}

"use client";

import { useState, useMemo } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { institutions, type Institution } from "@/config/institutions";

const filterTabs = [
  { label: "All", value: "all" },
  { label: "Banking", value: "depository" },
  { label: "Credit Cards", value: "credit" },
  { label: "Investments", value: "investment" },
  { label: "Loans", value: "loan" },
] as const;

interface InstitutionPickerProps {
  onOpen: () => void;
  ready: boolean;
}

export function InstitutionPicker({ onOpen, ready }: InstitutionPickerProps) {
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState<string>("all");

  const filtered = useMemo(() => {
    let result = institutions;
    if (activeFilter !== "all") {
      result = result.filter((i) =>
        i.types.includes(activeFilter as Institution["types"][number])
      );
    }
    if (search) {
      const q = search.toLowerCase();
      result = result.filter((i) => i.name.toLowerCase().includes(q));
    }
    return result;
  }, [search, activeFilter]);

  const handleInstitutionClick = () => {
    if (ready) {
      onOpen();
    }
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search institutions..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      <div className="flex flex-wrap gap-2">
        {filterTabs.map((tab) => (
          <Button
            key={tab.value}
            variant={activeFilter === tab.value ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveFilter(tab.value)}
          >
            {tab.label}
          </Button>
        ))}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {filtered.map((institution) => (
          <Card
            key={institution.name}
            className="flex flex-col items-center gap-2 p-4 cursor-pointer hover:bg-accent/50 transition-colors"
            onClick={handleInstitutionClick}
          >
            <img
              src={`https://img.logo.dev/${institution.domain}?token=${process.env.NEXT_PUBLIC_LOGO_DEV_TOKEN ?? "demo"}&size=60`}
              alt={institution.name}
              className="h-10 w-10 rounded-lg"
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
            <span className="text-xs font-medium text-foreground text-center leading-tight">
              {institution.name}
            </span>
          </Card>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-8">
          <p className="text-sm text-muted-foreground mb-3">
            No matching institutions found
          </p>
          <Button size="sm" onClick={handleInstitutionClick} disabled={!ready}>
            Connect other institution
          </Button>
        </div>
      )}
    </div>
  );
}

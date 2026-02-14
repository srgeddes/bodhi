"use client";

import { motion } from "motion/react";
import { BorderBeam } from "@/components/ui/border-beam";

/** Fake mini bar chart rendered with CSS */
function MiniBarChart({ bars, color }: { bars: number[]; color: string }) {
  return (
    <div className="flex items-end gap-1 h-full">
      {bars.map((h, i) => (
        <div
          key={i}
          className="flex-1 rounded-sm transition-all"
          style={{ height: `${h}%`, backgroundColor: color, opacity: 0.8 }}
        />
      ))}
    </div>
  );
}

/** Fake area/line chart rendered with an SVG polyline */
function MiniLineChart({ color }: { color: string }) {
  const points = "0,28 15,24 30,30 50,14 65,18 80,8 100,12";
  return (
    <svg viewBox="0 0 100 36" className="h-full w-full" preserveAspectRatio="none">
      <defs>
        <linearGradient id={`grad-${color.replace("#", "")}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon
        points={`0,36 ${points} 100,36`}
        fill={`url(#grad-${color.replace("#", "")})`}
      />
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

/** Fake donut chart */
function MiniDonut() {
  const segments = [
    { pct: 35, color: "var(--chart-1)" },
    { pct: 25, color: "var(--chart-2)" },
    { pct: 20, color: "var(--chart-3)" },
    { pct: 12, color: "var(--chart-4)" },
    { pct: 8, color: "var(--chart-5)" },
  ];
  let offset = 0;
  return (
    <svg viewBox="0 0 36 36" className="h-full w-full">
      {segments.map((seg, i) => {
        const dash = seg.pct;
        const gap = 100 - dash;
        const o = offset;
        offset += dash;
        return (
          <circle
            key={i}
            r="15.9"
            cx="18"
            cy="18"
            fill="none"
            stroke={seg.color}
            strokeWidth="3.5"
            strokeDasharray={`${dash} ${gap}`}
            strokeDashoffset={-o}
            strokeLinecap="round"
            opacity="0.85"
          />
        );
      })}
    </svg>
  );
}

function WidgetCard({
  title,
  stat,
  statColor,
  children,
}: {
  title: string;
  stat?: string;
  statColor?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col rounded-lg border border-border/60 bg-card overflow-hidden">
      <div className="flex items-center justify-between px-3 py-2 border-b border-border/40">
        <span className="text-[10px] font-medium text-muted-foreground">{title}</span>
        <div className="flex gap-0.5">
          <div className="h-1 w-1 rounded-full bg-muted-foreground/30" />
          <div className="h-1 w-1 rounded-full bg-muted-foreground/30" />
          <div className="h-1 w-1 rounded-full bg-muted-foreground/30" />
        </div>
      </div>
      <div className="flex-1 p-3">
        {stat && (
          <p className="text-sm font-bold mb-2 tabular-nums" style={{ color: statColor }}>
            {stat}
          </p>
        )}
        <div className="h-[52px]">{children}</div>
      </div>
    </div>
  );
}

export function DashboardPreview() {
  return (
    <motion.div
      className="relative mx-auto w-full max-w-4xl"
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1, delay: 2.6, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Glow behind the frame */}
      <div className="absolute -inset-4 rounded-3xl bg-primary/8 blur-2xl" />

      {/* Main frame */}
      <div className="relative rounded-xl border border-border/60 bg-card/80 backdrop-blur-sm overflow-hidden shadow-xl shadow-black/5">
        <BorderBeam
          size={200}
          duration={10}
          colorFrom="var(--primary)"
          colorTo="var(--chart-2)"
          borderWidth={1}
        />

        {/* Browser-style top bar */}
        <div className="flex items-center gap-2 px-4 py-2.5 border-b border-border/50 bg-muted/30">
          <div className="flex gap-1.5">
            <div className="h-2.5 w-2.5 rounded-full bg-red-400/60" />
            <div className="h-2.5 w-2.5 rounded-full bg-yellow-400/60" />
            <div className="h-2.5 w-2.5 rounded-full bg-green-400/60" />
          </div>
          <div className="flex-1 flex justify-center">
            <div className="h-5 w-48 rounded-md bg-muted/60 flex items-center justify-center">
              <span className="text-[9px] text-muted-foreground/60 tracking-wide">trellis.app/dashboard</span>
            </div>
          </div>
          <div className="w-12" /> {/* Balance the dots */}
        </div>

        {/* App layout: sidebar + content */}
        <div className="flex min-h-[300px]">
          {/* Sidebar */}
          <div className="hidden sm:flex w-12 flex-col items-center gap-3 border-r border-border/40 bg-muted/20 py-4">
            <div className="h-6 w-6 rounded-md bg-primary/20" />
            <div className="mt-2 space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className={`h-4 w-4 rounded-md ${i === 1 ? "bg-primary/30" : "bg-muted-foreground/15"}`}
                />
              ))}
            </div>
          </div>

          {/* Main content */}
          <div className="flex-1 p-4 sm:p-5">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="h-3.5 w-20 rounded bg-foreground/80 mb-1.5" />
                <div className="h-2 w-36 rounded bg-muted-foreground/30" />
              </div>
              <div className="flex gap-2">
                <div className="h-6 w-14 rounded-md bg-muted" />
                <div className="h-6 w-6 rounded-md bg-primary/20" />
              </div>
            </div>

            {/* Widget grid */}
            <div className="grid grid-cols-2 gap-3">
              <WidgetCard title="Net Worth" stat="$47,230" statColor="var(--success-text)">
                <MiniLineChart color="var(--chart-1)" />
              </WidgetCard>

              <WidgetCard title="Spending by Category">
                <div className="flex items-center gap-3">
                  <div className="h-[52px] w-[52px]">
                    <MiniDonut />
                  </div>
                  <div className="space-y-1.5 flex-1">
                    {["Food", "Housing", "Transport"].map((cat, i) => (
                      <div key={cat} className="flex items-center gap-1.5">
                        <div
                          className="h-1.5 w-1.5 rounded-full"
                          style={{ backgroundColor: `var(--chart-${i + 1})` }}
                        />
                        <span className="text-[8px] text-muted-foreground">{cat}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </WidgetCard>

              <WidgetCard title="Income vs Expenses" stat="$2,140" statColor="var(--success-text)">
                <MiniBarChart
                  bars={[65, 45, 70, 50, 80, 55, 75, 40, 85, 60, 72, 48]}
                  color="var(--chart-1)"
                />
              </WidgetCard>

              <WidgetCard title="Account Balances" stat="$24,830" statColor="var(--foreground)">
                <div className="space-y-2">
                  {[
                    { name: "Checking", w: "75%" },
                    { name: "Savings", w: "90%" },
                    { name: "Credit Card", w: "35%" },
                  ].map((acct) => (
                    <div key={acct.name} className="space-y-0.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[8px] text-muted-foreground">{acct.name}</span>
                        <div className="h-1.5 w-6 rounded bg-muted" />
                      </div>
                      <div className="h-1 w-full rounded-full bg-muted">
                        <div
                          className="h-full rounded-full bg-foreground/20"
                          style={{ width: acct.w }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </WidgetCard>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

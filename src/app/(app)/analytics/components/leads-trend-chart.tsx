// SimpleCRM — leads-trend-chart.tsx
"use client";

import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import { format } from "date-fns";
import { useTranslations } from "next-intl";
import type { LeadOverTimeEntry } from "@/modules/analytics/leads-over-time";

export const STATUS_COLORS: Record<string, string> = {
  NEW: "#3b82f6",
  FRESH: "#10b981",
  CONTACTED: "#a855f7",
  QUALIFIED: "#f59e0b",
  CONVERTED: "#059669",
  NO_RESPOND: "#6b7280",
  LOST: "#ef4444",
};

interface TooltipPayloadItem {
  payload: {
    date: string;
    count: number;
    NEW?: number;
    CONTACTED?: number;
    NO_RESPOND?: number;
    CONVERTED?: number;
    LOST?: number;
  };
}

interface LeadsTrendChartProps {
  data: LeadOverTimeEntry[];
}

export function LeadsTrendChart({ data }: LeadsTrendChartProps) {
  const t = useTranslations("analytics");
  const status = useTranslations("status");

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h2 className="text-lg mb-2 font-semibold">{t("newLeadsLast30")}</h2>
      <ResponsiveContainer width="100%" height={260}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
          <XAxis 
            dataKey="date" 
            fontSize={11} 
            tickFormatter={(dateStr, index) => 
              index % 5 === 0 ? format(new Date(dateStr), "MMM d") : ""
            }
          />
          <YAxis fontSize={11} allowDecimals={false} />
          <Tooltip 
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null;
              const itemData = (payload as unknown as TooltipPayloadItem[])[0].payload;
              return (
                <div className="bg-white border border-neutral-200 rounded-lg p-3 shadow-md text-[12px] min-w-[150px]">
                  <div className="font-semibold text-neutral-800 pb-1.5 mb-1.5 border-b border-neutral-100">
                    {format(new Date(itemData.date), "MMM d, yyyy")}
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between gap-3">
                      <span className="flex items-center gap-1.5 text-neutral-600">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: STATUS_COLORS.NEW }} />
                        {status.has("NEW") ? status("NEW") : "New"}
                      </span>
                      <span className="font-semibold">{itemData.NEW ?? 0}</span>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <span className="flex items-center gap-1.5 text-neutral-600">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: STATUS_COLORS.CONTACTED }} />
                        {status.has("CONTACTED") ? status("CONTACTED") : "Contacted"}
                      </span>
                      <span className="font-semibold">{itemData.CONTACTED ?? 0}</span>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <span className="flex items-center gap-1.5 text-neutral-600">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: STATUS_COLORS.NO_RESPOND }} />
                        {status.has("NO_RESPOND") ? status("NO_RESPOND") : "No Response"}
                      </span>
                      <span className="font-semibold">{itemData.NO_RESPOND ?? 0}</span>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <span className="flex items-center gap-1.5 text-neutral-600">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: STATUS_COLORS.CONVERTED }} />
                        {status.has("CONVERTED") ? status("CONVERTED") : "Converted"}
                      </span>
                      <span className="font-semibold">{itemData.CONVERTED ?? 0}</span>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <span className="flex items-center gap-1.5 text-neutral-600">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: STATUS_COLORS.LOST }} />
                        {status.has("LOST") ? status("LOST") : "Lost"}
                      </span>
                      <span className="font-semibold">{itemData.LOST ?? 0}</span>
                    </div>
                    <div className="flex items-center justify-between gap-3 pt-1.5 mt-1 border-t border-neutral-100 font-bold text-neutral-900">
                      <span>Total</span>
                      <span>{itemData.count ?? 0}</span>
                    </div>
                  </div>
                </div>
              );
            }}
          />
          <Legend 
            verticalAlign="top" 
            align="right"
            iconType="circle"
            iconSize={7}
            wrapperStyle={{ paddingBottom: '8px', fontSize: '11px' }}
          />
          <Line type="monotone" name={status.has("NEW") ? status("NEW") : "New"} dataKey="NEW" stroke={STATUS_COLORS.NEW} strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
          <Line type="monotone" name={status.has("CONTACTED") ? status("CONTACTED") : "Contacted"} dataKey="CONTACTED" stroke={STATUS_COLORS.CONTACTED} strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
          <Line type="monotone" name={status.has("NO_RESPOND") ? status("NO_RESPOND") : "No Response"} dataKey="NO_RESPOND" stroke={STATUS_COLORS.NO_RESPOND} strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
          <Line type="monotone" name={status.has("CONVERTED") ? status("CONVERTED") : "Converted"} dataKey="CONVERTED" stroke={STATUS_COLORS.CONVERTED} strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
          <Line type="monotone" name={status.has("LOST") ? status("LOST") : "Lost"} dataKey="LOST" stroke={STATUS_COLORS.LOST} strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

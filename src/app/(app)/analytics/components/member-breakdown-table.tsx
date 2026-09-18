// SimpleCRM — member-breakdown-table.tsx
"use client";

import { useTranslations } from "next-intl";
import type { MemberStat } from "@/modules/analytics/analytics.service";
import { STATUS_COLORS } from "./leads-trend-chart";

export const SCHEMA_LEAD_STATUSES = [
  "NEW",
  "CONTACTED",
  "NO_RESPOND",
  "CONVERTED",
  "LOST",
] as const;

interface MemberBreakdownTableProps {
  byMember: MemberStat[];
}

export function MemberBreakdownTable({ byMember }: MemberBreakdownTableProps) {
  const t = useTranslations("analytics");
  const status = useTranslations("status");

  return (
    <div className="mt-6 bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
      <div className="p-6 border-b border-gray-100">
        <h2 className="text-lg font-semibold text-neutral-900">{t("memberBreakdown")}</h2>
        <p className="text-sm text-neutral-500 mt-1">{t("memberBreakdownDescription")}</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-start border-collapse text-sm">
          <thead>
            <tr className="bg-neutral-50/75 border-b border-gray-100 text-neutral-500 font-medium text-xs uppercase tracking-wider">
              <th className="py-3.5 px-6">{t("member")}</th>
              <th className="py-3.5 px-4 text-center">{t("total")}</th>
              {SCHEMA_LEAD_STATUSES.map((st) => (
                <th key={st} className="py-3.5 px-4 text-center whitespace-nowrap">
                  <div className="inline-flex items-center gap-1.5 justify-center">
                    <span
                      className="w-2 h-2 rounded-full inline-block shrink-0"
                      style={{ backgroundColor: STATUS_COLORS[st] }}
                    />
                    <span>{status.has(st) ? status(st) : st}</span>
                  </div>
                </th>
              ))}
              <th className="py-3.5 px-4 text-center whitespace-nowrap">{t("leadsByStatus")}</th>
              <th className="py-3.5 px-6 text-end">{t("conversion")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-neutral-700 font-medium">
            {byMember.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-10 text-center text-neutral-400 text-sm">
                  {t("noActiveMembers")}
                </td>
              </tr>
            ) : (
              byMember.map((member) => {
                const convColor =
                  member.conversionRate > 30
                    ? "text-green-600 font-semibold"
                    : member.conversionRate < 10
                    ? "text-red-500 font-semibold"
                    : "text-neutral-700 font-medium";
                return (
                  <tr key={member.memberId} className="hover:bg-neutral-50/50 transition-colors">
                    <td className="py-4 px-6 flex items-center gap-3.5 font-semibold text-neutral-900">
                      <div className="w-8 h-8 rounded-full bg-neutral-900 text-white flex items-center justify-center text-xs font-bold shadow-sm">
                        {member.avatarInitials || member.memberName[0]?.toUpperCase() || "?"}
                      </div>
                      {member.memberName}
                    </td>
                    <td className="py-4 px-4 text-center font-bold text-neutral-900">{member.total}</td>
                    {SCHEMA_LEAD_STATUSES.map((st) => {
                      const count = member.statusCounts?.[st] ?? 0;
                      return (
                        <td key={st} className="py-4 px-4 text-center">
                          <span className={count > 0 ? "font-semibold text-neutral-800" : "text-neutral-300"}>
                            {count}
                          </span>
                        </td>
                      );
                    })}
                    <td className="py-4 px-4 text-center">
                      <div className="flex items-center justify-center">
                        <div className="flex h-2 w-28 overflow-hidden rounded-full bg-neutral-100">
                          {member.total === 0 ? (
                            <div className="w-full bg-neutral-100" />
                          ) : (
                            SCHEMA_LEAD_STATUSES.map((st) => {
                              const count = member.statusCounts?.[st] ?? 0;
                              if (count === 0) return null;
                              const widthPct = (count / member.total) * 100;
                              const stLabel = status.has(st) ? status(st) : st;
                              return (
                                <div
                                  key={st}
                                  style={{ width: `${widthPct}%`, backgroundColor: STATUS_COLORS[st] }}
                                  title={`${stLabel}: ${count} (${widthPct.toFixed(0)}%)`}
                                />
                              );
                            })
                          )}
                        </div>
                      </div>
                    </td>
                    <td className={`py-4 px-6 text-end ${convColor}`}>
                      {member.conversionRate}%
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

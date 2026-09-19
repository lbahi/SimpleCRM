// SimpleCRM — two-month-calendar.tsx
"use client";

import React, { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { addMonths, subMonths, isSameDay, format, isAfter, isBefore } from "date-fns";
import { DateRangeState } from "./date-range-utils";

interface TwoMonthCalendarProps {
  range: DateRangeState;
  onRangeChange: (range: DateRangeState) => void;
}

const DAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

function MonthGrid({
  month,
  range,
  onDayClick,
}: {
  month: Date;
  range: DateRangeState;
  onDayClick: (date: Date) => void;
}) {
  const year = month.getFullYear();
  const monthIdx = month.getMonth();
  const firstDayOfWeek = new Date(year, monthIdx, 1).getDay();
  const totalDays = new Date(year, monthIdx + 1, 0).getDate();

  const cells = [];
  for (let i = 0; i < firstDayOfWeek; i++) {
    cells.push(<div key={`empty-${i}`} className="h-7 w-7" />);
  }

  for (let d = 1; d <= totalDays; d++) {
    const current = new Date(year, monthIdx, d);
    const isStart = range.from && isSameDay(current, range.from);
    const isEnd = range.to && isSameDay(current, range.to);
    const isSingle = isStart && isEnd;
    const inBetween =
      range.from &&
      range.to &&
      isAfter(current, range.from) &&
      isBefore(current, range.to);

    let cellClass =
      "h-7 w-7 text-xs flex items-center justify-center font-medium transition-colors cursor-pointer ";

    if (isSingle) {
      cellClass += "bg-[#2563EB] text-white rounded-md";
    } else if (isStart) {
      cellClass += "bg-[#2563EB] text-white rounded-l-md rounded-r-none";
    } else if (isEnd) {
      cellClass += "bg-[#2563EB] text-white rounded-r-md rounded-l-none";
    } else if (inBetween) {
      cellClass += "bg-blue-50 text-blue-900 rounded-none";
    } else {
      cellClass += "text-neutral-700 hover:bg-neutral-100 rounded-md";
    }

    cells.push(
      <button
        key={d}
        type="button"
        onClick={() => onDayClick(current)}
        className={cellClass}
      >
        {d}
      </button>
    );
  }

  return (
    <div className="w-52">
      <div className="text-center text-xs font-semibold text-neutral-800 mb-2">
        {format(month, "MMMM yyyy")}
      </div>
      <div className="grid grid-cols-7 gap-y-1 text-center mb-1">
        {DAYS.map((day) => (
          <div key={day} className="text-[10px] font-semibold text-neutral-400">
            {day}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-y-1 text-center">{cells}</div>
    </div>
  );
}

export function TwoMonthCalendar({ range, onRangeChange }: TwoMonthCalendarProps) {
  const [baseMonth, setBaseMonth] = useState<Date>(() => range.from || new Date());
  const nextMonth = addMonths(baseMonth, 1);

  React.useEffect(() => {
    if (range.from) {
      setBaseMonth(range.from);
    }
  }, [range.from]);

  const handleDayClick = (date: Date) => {
    if (!range.from || (range.from && range.to)) {
      onRangeChange({ from: date, to: undefined });
    } else if (range.from && !range.to) {
      if (isBefore(date, range.from)) {
        onRangeChange({ from: date, to: undefined });
      } else {
        onRangeChange({ from: range.from, to: date });
      }
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between px-1">
        <button
          type="button"
          onClick={() => setBaseMonth((prev) => subMonths(prev, 1))}
          className="p-1 rounded-md text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900 transition-colors"
          aria-label="Previous month"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <span className="text-xs text-neutral-400">Pick start & end date</span>
        <button
          type="button"
          onClick={() => setBaseMonth((prev) => addMonths(prev, 1))}
          className="p-1 rounded-md text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900 transition-colors"
          aria-label="Next month"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-6 items-start">
        <MonthGrid
          month={baseMonth}
          range={range}
          onDayClick={handleDayClick}
        />
        <div className="h-[1px] w-full sm:h-auto sm:w-[1px] bg-neutral-200 self-stretch" />
        <MonthGrid
          month={nextMonth}
          range={range}
          onDayClick={handleDayClick}
        />
      </div>
    </div>
  );
}

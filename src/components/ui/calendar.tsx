// SimpleCRM — calendar.tsx
"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface CalendarProps {
  mode?: "single";
  selected?: Date;
  onSelect?: (date: Date | undefined) => void;
  initialFocus?: boolean;
  className?: string;
  disabled?: (date: Date) => boolean;
}

export function Calendar({
  mode = "single",
  selected,
  onSelect,
  initialFocus,
  className,
  disabled,
}: CalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };
  
  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };
  
  const daysInMonth = getDaysInMonth(currentMonth);
  const firstDay = getFirstDayOfMonth(currentMonth);
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  
  const handlePreviousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };
  
  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };
  
  const handleDateClick = (day: number) => {
    const newDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    if (disabled?.(newDate)) return;
    onSelect?.(newDate);
  };
  
  const renderDays = () => {
    const daysArray = [];
    
    // Add empty cells for days before month starts
    for (let i = 0; i < firstDay; i++) {
      daysArray.push(<div key={`empty-${i}`} className="h-8" />);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
      const isSelected = selected && 
        selected.getDate() === day &&
        selected.getMonth() === currentMonth.getMonth() &&
        selected.getFullYear() === currentMonth.getFullYear();
      
      const isDisabled = disabled?.(date);
      
      daysArray.push(
        <Button
          key={day}
          variant={isSelected ? "default" : "ghost"}
          className={cn("h-8 w-8 p-0", isDisabled && "opacity-30 cursor-not-allowed")}
          onClick={() => handleDateClick(day)}
          disabled={isDisabled}
        >
          {day}
        </Button>
      );
    }
    
    return daysArray;
  };
  
  return (
    <div className={cn("p-3 space-y-4", className)}>
      <div className="flex items-center justify-between">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={handlePreviousMonth}
          aria-label="Previous month"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div className="font-medium">
          {currentMonth.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={handleNextMonth}
          aria-label="Next month"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium">
        {days.map((day) => (
          <div key={day} className="text-muted-foreground">
            {day}
          </div>
        ))}
      </div>
      
      <div className="grid grid-cols-7 gap-1">
        {renderDays()}
      </div>
    </div>
  );
}

// SimpleCRM — custom-dropdown.tsx
"use client";

import * as React from "react";
import { ChevronDown, Check, Search } from "lucide-react";
import { Popover as PopoverPrimitive } from "@base-ui/react/popover";
import { cn } from "@/lib/utils";

interface DropdownOption {
  value: string;
  label: string;
  avatar?: string;
}

interface CustomDropdownProps {
  options: DropdownOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  showSearch?: boolean;
  className?: string;
}

export function CustomDropdown({
  options,
  value,
  onChange,
  placeholder = "Select...",
  showSearch = false,
  className,
}: CustomDropdownProps) {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");

  const filteredOptions = options.filter((opt) =>
    opt.label.toLowerCase().includes(search.toLowerCase())
  );

  const selectedOption = options.find((opt) => opt.value === value);

  return (
    <PopoverPrimitive.Root open={open} onOpenChange={setOpen}>
      <PopoverPrimitive.Trigger
        className={cn(
          "h-[36px] px-3 rounded-lg border border-neutral-200 bg-white text-[13px] text-neutral-700 flex items-center justify-between gap-2 hover:border-neutral-300 hover:bg-neutral-50 focus:ring-2 focus:ring-neutral-900/10 outline-none transition-all w-full",
          className
        )}
      >
        <span className="flex items-center gap-2 truncate">
          {selectedOption?.avatar && (
            <div className="size-6 rounded-full bg-neutral-100 flex items-center justify-center text-[10px] font-bold text-neutral-500 shrink-0">
              {selectedOption.avatar}
            </div>
          )}
          {selectedOption?.label || placeholder}
        </span>
        <ChevronDown size={14} className="text-neutral-400 shrink-0" />
      </PopoverPrimitive.Trigger>

      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Positioner align="start" sideOffset={4} className="z-[120]">
          <PopoverPrimitive.Popup
            className="bg-white border border-neutral-200 rounded-xl shadow-[0_8px_24px_rgba(0,0,0,0.10)] p-1 min-w-[180px] animate-in fade-in-0 zoom-in-95 duration-150"
          >
            {showSearch && options.length > 5 && (
              <div className="px-3 py-2 border-b border-neutral-100 mb-1 flex items-center gap-2">
                <Search size={14} className="text-neutral-400" />
                <input
                  autoFocus
                  className="w-full bg-transparent border-none outline-none text-[13px] text-neutral-700 placeholder:text-neutral-400"
                  placeholder="Search..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            )}

            <div className="max-h-[240px] overflow-y-auto">
              {filteredOptions.length === 0 && (
                <div className="px-3 py-4 text-center text-[13px] text-neutral-400">
                  No results found
                </div>
              )}
              {filteredOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => {
                    onChange(opt.value);
                    setOpen(false);
                    setSearch("");
                  }}
                  className={cn(
                    "w-full h-8 px-3 rounded-lg flex items-center justify-between gap-2 text-[13px] text-neutral-700 hover:bg-neutral-100 transition-colors duration-100",
                    value === opt.value && "bg-neutral-100 font-medium"
                  )}
                >
                  <div className="flex items-center gap-2 truncate">
                    {opt.avatar && (
                      <div className="size-6 rounded-full bg-neutral-100 flex items-center justify-center text-[10px] font-bold text-neutral-500 shrink-0">
                        {opt.avatar}
                      </div>
                    )}
                    <span className="truncate">{opt.label}</span>
                  </div>
                  {value === opt.value && <Check size={14} className="text-neutral-900 shrink-0" />}
                </button>
              ))}
            </div>
          </PopoverPrimitive.Popup>
        </PopoverPrimitive.Positioner>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  );
}

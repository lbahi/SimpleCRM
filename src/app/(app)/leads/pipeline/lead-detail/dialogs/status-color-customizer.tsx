// SimpleCRM — status-color-customizer.tsx
"use client";

import { useState, useEffect } from "react";
import { Palette, RotateCcw } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { STATUS_CONFIG } from "../../cells/status-cell";

const DEFAULT_COLORS: Record<string, string> = {
  "NEW": "#E6F9F3",
  "NO_RESPOND": "#FEF3C7",
  "CONTACTED": "#E8F2FB",
  "CONVERTED": "#FDEAEA",
  "LOST": "#EEEDFB",
};

interface StatusColorCustomizerProps {
  trigger: React.ReactNode;
}

export function StatusColorCustomizer({ trigger }: StatusColorCustomizerProps) {
  const [open, setOpen] = useState(false);
  const [colors, setColors] = useState<Record<string, string>>(DEFAULT_COLORS);

  useEffect(() => {
    // Load colors from localStorage
    const saved = localStorage.getItem("simpleCRM_statusColors");
    if (saved) {
      try {
        setColors(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load status colors:", e);
      }
    }
  }, []);

  const handleColorChange = (status: string, color: string) => {
    const newColors = { ...colors, [status]: color };
    setColors(newColors);
  };

  const saveColors = () => {
    localStorage.setItem("simpleCRM_statusColors", JSON.stringify(colors));
    // Dispatch custom event to notify other components
    window.dispatchEvent(new CustomEvent("statusColorsUpdated", { detail: colors }));
    setOpen(false);
  };

  const resetToDefaults = () => {
    setColors(DEFAULT_COLORS);
    localStorage.removeItem("simpleCRM_statusColors");
    // Dispatch event to notify other components
    window.dispatchEvent(new CustomEvent("statusColorsUpdated", { detail: DEFAULT_COLORS }));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger>
        {trigger}
      </DialogTrigger>
      <DialogContent className="max-w-md rounded-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Palette className="w-4 h-4" />
            Customize status colors
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {Object.entries(STATUS_CONFIG).map(([key, config]) => (
            <div key={key} className="flex items-center justify-between py-2">
              <div className="flex items-center gap-3">
                <div
                  className="w-6 h-6 rounded-full border"
                  style={{
                    backgroundColor: colors[key] || DEFAULT_COLORS[key],
                    borderColor: colors[key] || DEFAULT_COLORS[key],
                  }}
                />
                <span className="text-sm font-medium">{config.label}</span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={colors[key] || DEFAULT_COLORS[key]}
                  onChange={(e) => handleColorChange(key, e.target.value)}
                  className="w-8 h-8 rounded cursor-pointer border-0"
                  style={{
                    WebkitAppearance: "none",
                    appearance: "none",
                    background: "transparent",
                    cursor: "pointer",
                  }}
                />
                <span className="text-xs text-muted-foreground font-mono">
                  {colors[key] || DEFAULT_COLORS[key]}
                </span>
              </div>
            </div>
          ))}
          
          <div className="flex items-center justify-between pt-4 border-t">
            <Button
              variant="ghost"
              size="sm"
              onClick={resetToDefaults}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              <RotateCcw className="w-3 h-3 mr-1" />
              Reset to defaults
            </Button>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={saveColors}
              >
                Save
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

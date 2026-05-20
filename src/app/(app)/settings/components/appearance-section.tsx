// SimpleCRM — appearance-section
"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Upload, Trash2, Palette, RotateCcw, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function AppearanceSection() {
  const t = useTranslations("settings");
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [brandColor, setBrandColor] = useState<string>("#171717");
  const [isLoading, setIsLoading] = useState(true);

  // File Upload States
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isSavingColor, setIsSavingColor] = useState(false);

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((d) => {
        if (d.logoUrl) setLogoUrl(d.logoUrl);
        if (d.brandColor) setBrandColor(d.brandColor);
      })
      .catch((err) => console.error("Error loading settings:", err))
      .finally(() => setIsLoading(false));
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error(t("logoHelp"));
      return;
    }

    const allowedTypes = ["image/png", "image/jpeg", "image/jpg", "image/svg+xml"];
    if (!allowedTypes.includes(file.type)) {
      toast.error(t("logoHelp"));
      return;
    }

    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleSaveLogo = async () => {
    if (!selectedFile) return;
    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("logo", selectedFile);

      const res = await fetch("/api/settings/logo", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error();

      const data = await res.json();
      setLogoUrl(data.logoUrl);
      setSelectedFile(null);
      setPreviewUrl(null);
      toast.success(t("logoUpdated"));
    } catch {
      toast.error(t("uploadFailed"));
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveLogo = async () => {
    try {
      const res = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ logoUrl: null }),
      });

      if (!res.ok) throw new Error();

      setLogoUrl(null);
      setSelectedFile(null);
      setPreviewUrl(null);
      toast.success(t("logoRemoved"));
    } catch {
      toast.error(t("removeLogoFailed"));
    }
  };

  const handleSaveColor = async () => {
    if (!/^#[0-9A-Fa-f]{6}$/.test(brandColor)) {
      toast.error(t("invalidColor"));
      return;
    }

    setIsSavingColor(true);
    try {
      const res = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brandColor }),
      });

      if (!res.ok) throw new Error();

      toast.success(t("brandColorUpdated"));
    } catch {
      toast.error(t("brandColorFailed"));
    } finally {
      setIsSavingColor(false);
    }
  };

  const handleResetColor = () => {
    setBrandColor("#171717");
  };

  if (isLoading) {
    return (
      <Card className="shadow-sm border border-neutral-200">
        <CardContent className="h-48 flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-neutral-400" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-sm border border-neutral-200 bg-white rounded-xl">
      <CardHeader className="border-b border-neutral-100 pb-4">
        <div className="flex items-center gap-2">
          <Palette className="h-5 w-5 text-neutral-600" />
          <div>
            <CardTitle className="text-lg font-semibold text-neutral-900">{t("appearance")}</CardTitle>
            <CardDescription className="text-neutral-500">
              {t("appearanceDescription")}
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6 space-y-8 divide-y divide-neutral-100">
        {/* Subsection A: Logo */}
        <div className="space-y-4">
          <div>
            <h4 className="text-[14px] font-semibold text-neutral-900">{t("logoUpload")}</h4>
            <p className="text-xs text-neutral-500 mt-0.5">
              {t("logoDescription")}
            </p>
          </div>

          <div className="flex items-start gap-6">
            <div className="flex-shrink-0">
              {previewUrl || logoUrl ? (
                <img
                  src={previewUrl || logoUrl || undefined}
                  alt="Logo"
                  className="w-[120px] h-[64px] object-contain rounded-lg border border-neutral-200 bg-neutral-50 p-2"
                />
              ) : (
                <div className="w-[120px] h-[64px] rounded-lg border border-dashed border-neutral-200 bg-neutral-50 flex items-center justify-center">
                  <span className="text-xs text-neutral-400 font-medium">{t("noLogo")}</span>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <label className="cursor-pointer inline-flex items-center justify-center rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-xs font-semibold hover:bg-neutral-50 hover:text-neutral-900 transition-colors h-9 gap-2 shadow-sm text-neutral-700">
                  <Upload className="h-3.5 w-3.5" />
                  <span>{t("uploadLogo")}</span>
                  <input
                    type="file"
                    accept=".png,.jpg,.jpeg,.svg"
                    className="sr-only"
                    onChange={handleFileChange}
                  />
                </label>

                {logoUrl && !previewUrl && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleRemoveLogo}
                    className="h-9 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                    {t("remove")}
                  </Button>
                )}
              </div>
              <p className="text-[11px] text-neutral-400">
                {t("logoHelp")}
              </p>
            </div>
          </div>

          {previewUrl && (
            <div className="flex items-center gap-3 bg-neutral-50 p-3 rounded-lg border border-neutral-200 max-w-md animate-in fade-in duration-200">
              <span className="text-xs text-neutral-600 font-medium">{t("newLogoSelected")}</span>
              <Button
                size="sm"
                onClick={handleSaveLogo}
                disabled={isUploading}
                className="ml-auto h-8 rounded-lg bg-neutral-950 text-white hover:bg-black font-semibold text-xs transition-all px-4"
              >
                {isUploading ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
                ) : null}
                {t("saveLogo")}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                disabled={isUploading}
                onClick={() => {
                  setSelectedFile(null);
                  setPreviewUrl(null);
                }}
                className="h-8 rounded-lg text-neutral-500 hover:text-neutral-700 hover:bg-neutral-200/50 text-xs px-3"
              >
                {t("cancel")}
              </Button>
            </div>
          )}
        </div>

        {/* Subsection B: Brand Color */}
        <div className="pt-6 space-y-4">
          <div>
            <h4 className="text-[14px] font-semibold text-neutral-900">{t("brandColor")}</h4>
            <p className="text-xs text-neutral-500 mt-0.5">
              {t("brandColorDescription")}
            </p>
          </div>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6 bg-neutral-50/50 border border-neutral-200/60 p-4 rounded-xl max-w-2xl">
            {/* Color Input Circle wrapper */}
            <div className="flex items-center gap-3">
              <label className="relative cursor-pointer shrink-0">
                <input
                  type="color"
                  value={brandColor}
                  onChange={(e) => setBrandColor(e.target.value)}
                  className="sr-only"
                />
                <div
                  style={{ backgroundColor: brandColor }}
                  className="size-9 rounded-full border-2 border-white shadow-sm ring-1 ring-neutral-300 transition-transform active:scale-95"
                />
              </label>

              {/* Hex Text Input */}
              <input
                type="text"
                value={brandColor}
                maxLength={7}
                onChange={(e) => {
                  const val = e.target.value;
                  if (/^#[0-9A-Fa-f]{0,6}$/.test(val)) {
                    setBrandColor(val);
                  }
                }}
                className="w-24 h-9 bg-white border border-neutral-200 focus:border-neutral-900 focus:outline-none transition-all rounded-lg text-[13px] font-mono text-center shadow-sm"
              />
            </div>

            {/* Live Button Preview */}
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-xs text-neutral-400 font-medium me-1 select-none">{t("preview")}</span>
              <button
                style={{ backgroundColor: brandColor }}
                className="px-4 py-2 rounded-lg text-white text-[13px] font-semibold pointer-events-none shadow-sm transition-all duration-300"
              >
                {t("submit")}
              </button>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 sm:ml-auto">
              <button
                type="button"
                onClick={handleResetColor}
                className="text-xs font-semibold text-neutral-500 hover:text-neutral-800 transition-colors flex items-center gap-1.5"
              >
                <RotateCcw className="h-3 w-3" />
                {t("resetDefault")}
              </button>

              <Button
                size="sm"
                onClick={handleSaveColor}
                disabled={isSavingColor}
                className="h-9 rounded-lg bg-neutral-950 text-white hover:bg-black font-semibold text-xs px-4"
              >
                {isSavingColor ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
                ) : null}
                {t("saveColor")}
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

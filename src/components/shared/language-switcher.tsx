// SimpleCRM — language-switcher
"use client";

import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Check, Globe, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export function LanguageSwitcher() {
  const locale = useLocale();
  const t = useTranslations("language");
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);

  const handleLanguageChange = async (newLocale: string) => {
    if (newLocale === locale) return;
    setIsPending(true);
    try {
      const res = await fetch("/api/locale", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ locale: newLocale }),
      });
      if (res.ok) {
        document.cookie = `locale=${newLocale};path=/;max-age=31536000`;
        router.refresh();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsPending(false);
      setOpen(false);
    }
  };

  const languages = [
    { code: "en", label: "EN", name: t("en") },
    { code: "fr", label: "FR", name: t("fr") },
    { code: "ar", label: "ع", name: t("ar") },
  ];

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none transition-all disabled:cursor-not-allowed disabled:opacity-70"
        disabled={isPending}
      >
        {isPending ? (
          <Loader2 className="h-4 w-4 animate-spin text-gray-500" />
        ) : (
          <Globe className="h-4 w-4 text-gray-400" />
        )}
        <span>{languages.find((l) => l.code === locale)?.label || locale}</span>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-40 p-1.5 rounded-xl shadow-xl border-gray-100 bg-white">
        <div className="flex flex-col gap-0.5">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => handleLanguageChange(lang.code)}
              className={cn(
                "flex items-center justify-between w-full px-3 py-2 text-xs font-semibold rounded-lg transition-all text-left",
                lang.code === locale
                  ? "bg-gray-50 text-black font-bold"
                  : "text-gray-500 hover:bg-gray-50/50 hover:text-black"
              )}
            >
              <span>{lang.name}</span>
              {lang.code === locale && <Check className="h-3.5 w-3.5 text-black shrink-0" />}
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}

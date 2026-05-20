// SimpleCRM — login-form
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff } from "lucide-react";

export function LoginForm() {
  const router = useRouter();
  const t = useTranslations("auth");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || t("loginFailed"));
        return;
      }
      router.push("/leads");
      router.refresh();
    } catch {
      setError(t("invalidCredentials"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-sm rounded-xl border border-gray-200 bg-white p-8 shadow-xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">{t("welcomeBack")}</h1>
        <p className="text-sm text-gray-500 mt-1">{t("subtext")}</p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label
            htmlFor="email"
            className="text-xs font-bold uppercase tracking-wider text-gray-500"
          >
            {t("emailAddress")}
          </label>
          <Input
            id="email"
            type="email"
            placeholder="admin@simplecrm.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            autoFocus
            className="h-11 border-gray-200 focus:border-black focus:ring-black transition-all"
          />
        </div>

        <div className="space-y-2">
          <label
            htmlFor="password"
            className="text-xs font-bold uppercase tracking-wider text-gray-500"
          >
            {t("passwordLabel")}
          </label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              className="h-11 pe-10 border-gray-200 focus:border-black focus:ring-black transition-all"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute end-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black transition-colors focus:outline-none"
              aria-label={showPassword ? t("hidePassword") : t("showPassword")}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>

        {error && (
          <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 border border-red-100 animate-in fade-in slide-in-from-top-1">
            {error}
          </div>
        )}

        <button 
          type="submit" 
          disabled={loading}
          className="w-full h-11 bg-black text-white rounded-lg font-bold hover:bg-gray-800 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-black/10"
        >
          {loading ? t("verifying") : t("signIn")}
        </button>
      </form>
    </div>
  );
}


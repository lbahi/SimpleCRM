// SimpleCRM — login page (server shell)
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { LanguageSwitcher } from "@/components/shared/language-switcher";
import { LoginForm } from "./login-form";

export default async function LoginPage() {
  const session = await getSession();
  if (session) redirect("/leads");

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-background px-4">
      <div className="absolute end-4 top-4">
        <LanguageSwitcher />
      </div>
      <LoginForm />
    </div>
  );
}

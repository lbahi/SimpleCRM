// SimpleCRM — i18n request
import { getRequestConfig } from "next-intl/server";
import { cookies } from "next/headers";

const locales = ["en", "fr", "ar"] as const;

export default getRequestConfig(async () => {
  const cookieStore = await cookies();
  const cookieLocale =
    cookieStore.get("locale")?.value ?? cookieStore.get("NEXT_LOCALE")?.value;
  const locale: (typeof locales)[number] = locales.includes(
    cookieLocale as (typeof locales)[number],
  )
    ? (cookieLocale as (typeof locales)[number])
    : "en";

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});

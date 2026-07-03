"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, BookOpen, BrainCircuit, Database } from "lucide-react";
import { getLocaleFromPath, localizedPath, uiText, withoutLocalePrefix, type Locale } from "@/lib/i18n";

const navItems = [
  { href: "/", key: "guess", icon: BrainCircuit },
  { href: "/analytics", key: "analytics", icon: BarChart3 },
  { href: "/dashboard", key: "data", icon: Database },
  { href: "/methodology", key: "method", icon: BookOpen }
] as const;

export function SiteHeader() {
  const pathname = usePathname();
  const locale = getLocaleFromPath(pathname);
  const text = uiText[locale];
  const nextLocale: Locale = locale === "zh" ? "en" : "zh";
  const basePath = withoutLocalePrefix(pathname);

  return (
    <header className="site-header">
      <Link href={localizedPath("/", locale)} className="brand" aria-label="Character Discovery Engine home">
        <span className="brand-mark">CD</span>
        <span>
          <strong>{text.brandTitle}</strong>
          <small>{text.brandSubtitle}</small>
        </span>
      </Link>
      <nav className="nav-links" aria-label="Primary navigation">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link href={localizedPath(item.href, locale)} key={item.href}>
              <Icon size={17} aria-hidden="true" />
              {text.nav[item.key]}
            </Link>
          );
        })}
        <Link href={localizedPath(basePath, nextLocale)}>{text.switchLanguage}</Link>
      </nav>
    </header>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { BarChart3, BookOpen, BrainCircuit, Database } from "lucide-react";
import "./globals.css";

export const metadata: Metadata = {
  title: "Character Discovery Engine",
  description: "An explainable adaptive guessing system for game characters."
};

const navItems = [
  { href: "/", label: "Guess", icon: BrainCircuit },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/dashboard", label: "Data", icon: Database },
  { href: "/methodology", label: "Method", icon: BookOpen }
];

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <header className="site-header">
          <Link href="/" className="brand" aria-label="Character Discovery Engine home">
            <span className="brand-mark">CD</span>
            <span>
              <strong>Character Discovery</strong>
              <small>Explainable guessing engine</small>
            </span>
          </Link>
          <nav className="nav-links" aria-label="Primary navigation">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link href={item.href} key={item.href}>
                  <Icon size={17} aria-hidden="true" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </header>
        <main>{children}</main>
      </body>
    </html>
  );
}

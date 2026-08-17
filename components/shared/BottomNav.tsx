"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, Library } from "lucide-react";

const TABS = [
  { href: "/", label: "Beranda", icon: Home },
  { href: "/search", label: "Cari", icon: Search },
  { href: "/library", label: "Pustaka", icon: Library },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="border-t border-base-800 bg-base-900/95 backdrop-blur-xl safe-bottom">
      <div className="flex items-center justify-around py-2">
        {TABS.map(({ href, label, icon: Icon }) => {
          const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className="press flex flex-col items-center gap-1 rounded-2xl px-6 py-1.5"
            >
              <Icon
                size={22}
                strokeWidth={active ? 2.4 : 1.8}
                className={active ? "text-base-50" : "text-base-500"}
              />
              <span
                className={`text-[11px] font-medium transition-colors ${
                  active ? "text-base-50" : "text-base-500"
                }`}
              >
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

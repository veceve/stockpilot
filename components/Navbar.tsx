"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname();

  const menus = [
    { name: "📊 Dashboard", href: "/" },
    { name: "📦 持仓", href: "/holdings" },
    { name: "💹 交易", href: "/trades" },
    { name: "⚖️ 仓位", href: "/plans" },
    { name: "🎯 目标价", href: "/targets" },
    { name: "📝 投资日志", href: "/journal" },
  ];

  return (
    <div className="bg-white shadow rounded-xl mb-6 px-4 py-3">
      <div className="flex flex-wrap gap-2">
        {menus.map((m) => {
          const active = pathname === m.href;

          return (
            <Link
              key={m.href}
              href={m.href}
              className={`px-4 py-2 rounded-lg text-sm transition
                ${
                  active
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 hover:bg-gray-200"
                }`}
            >
              {m.name}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
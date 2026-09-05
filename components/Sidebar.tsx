"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  IconWallet,
  IconTargetArrow,
  IconArrowsExchange,
  IconTrendingUp,
  IconRocket,
  IconReceipt2,
  IconLogout,
} from "@tabler/icons-react";
import ThemeToggle from "./ThemeToggle";

const NAV_ITEMS = [
  { href: "/patrimoine", label: "Patrimoine", icon: IconWallet },
  { href: "/allocation", label: "Allocation cible", icon: IconTargetArrow },
  { href: "/cashflow", label: "Cashflow", icon: IconArrowsExchange },
  { href: "/investments", label: "Investments", icon: IconTrendingUp },
  { href: "/game-plan", label: "Game plan", icon: IconRocket },
  { href: "/depenses", label: "Dépenses", icon: IconReceipt2 },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <aside className="flex h-screen w-56 shrink-0 flex-col justify-between border-r hairline px-4 py-6">
      <div>
        <div className="mb-8 px-2 text-sm font-medium tracking-tight">Patrimoine</div>
        <nav className="flex flex-col gap-0.5">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-2.5 rounded px-2 py-2 text-sm transition-opacity ${
                  active ? "text-foreground" : "text-muted hover:opacity-70"
                }`}
              >
                <Icon size={17} stroke={1.5} />
                {label}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="flex items-center justify-between px-2">
        <button
          type="button"
          onClick={logout}
          aria-label="Se déconnecter"
          className="flex h-8 w-8 items-center justify-center text-muted transition-opacity hover:opacity-70"
        >
          <IconLogout size={18} stroke={1.5} />
        </button>
        <ThemeToggle />
      </div>
    </aside>
  );
}

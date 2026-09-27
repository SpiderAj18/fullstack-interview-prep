"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Wallet,
  Tags,
  ArrowLeftRight,
  PiggyBank,
  UserRound,
  Menu,
  LogOut,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLogout, useMe } from "@/features/auth/hooks";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setSidebarOpen, toggleSidebar } from "@/store/uiSlice";
import { cn } from "@/lib/utils";

const primaryNav = [
  { href: "/dashboard", label: "Home", icon: LayoutDashboard },
  { href: "/transactions", label: "Activity", icon: ArrowLeftRight },
  { href: "/accounts", label: "Accounts", icon: Wallet },
  { href: "/budgets", label: "Budgets", icon: PiggyBank },
] as const;

const secondaryNav = [
  { href: "/categories", label: "Categories", icon: Tags },
  { href: "/profile", label: "Profile", icon: UserRound },
] as const;

const allNav = [...primaryNav, ...secondaryNav];

function NavLink({
  href,
  label,
  icon: Icon,
  active,
  onClick,
  compact = false,
}: {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  active: boolean;
  onClick?: () => void;
  compact?: boolean;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
        compact && "flex-col gap-1 px-2 py-2 text-[11px]",
        active
          ? compact
            ? "text-primary"
            : "bg-white/10 text-white shadow-inner"
          : compact
            ? "text-muted-foreground"
            : "text-sidebar-muted hover:bg-white/5 hover:text-white",
      )}
      aria-current={active ? "page" : undefined}
    >
      <span
        className={cn(
          "flex items-center justify-center rounded-lg transition-colors",
          compact && "h-8 w-8",
          compact && active && "bg-accent text-accent-foreground",
        )}
      >
        <Icon className={cn("h-4 w-4", compact && "h-[18px] w-[18px]")} />
      </span>
      <span className={cn(!compact && "truncate")}>{label}</span>
    </Link>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const sidebarOpen = useAppSelector((state) => state.ui.sidebarOpen);
  const { data: user } = useMe();
  const logout = useLogout();

  const closeSidebar = () => dispatch(setSidebarOpen(false));

  return (
    <div className="min-h-dvh">
      <div className="flex min-h-dvh">
        <aside
          className={cn(
            "fixed inset-y-0 left-0 z-50 flex w-[17rem] flex-col bg-sidebar text-sidebar-foreground shadow-2xl transition-transform duration-300 ease-out lg:static lg:translate-x-0 lg:shadow-none",
            sidebarOpen ? "translate-x-0" : "-translate-x-full",
          )}
        >
          <div className="flex h-16 items-center justify-between border-b border-white/10 px-5 pt-safe">
            <div>
              <div className="text-lg font-bold tracking-tight">Expense</div>
              <div className="text-[11px] uppercase tracking-[0.18em] text-sidebar-muted">
                Tracker
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="text-sidebar-foreground hover:bg-white/10 lg:hidden"
              onClick={closeSidebar}
              aria-label="Close menu"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          <nav className="flex-1 space-y-1 overflow-y-auto p-3">
            {allNav.map((item) => (
              <NavLink
                key={item.href}
                {...item}
                active={pathname.startsWith(item.href)}
                onClick={() => {
                  if (window.innerWidth < 1024) closeSidebar();
                }}
              />
            ))}
          </nav>

          <div className="border-t border-white/10 p-4 pb-safe">
            <div className="mb-3 truncate text-sm">
              <div className="font-medium text-white">{user?.name || "Account"}</div>
              <div className="truncate text-xs text-sidebar-muted">{user?.email}</div>
            </div>
            <Button
              variant="outline"
              className="w-full border-white/15 bg-transparent text-sidebar-foreground hover:bg-white/10"
              onClick={() => logout.mutate()}
              disabled={logout.isPending}
            >
              <LogOut className="h-4 w-4" />
              {logout.isPending ? "Signing out…" : "Sign out"}
            </Button>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-30 border-b border-border/70 bg-[var(--surface-elevated)] backdrop-blur-xl pt-safe">
            <div className="flex h-14 items-center justify-between gap-3 px-4 sm:h-16 sm:px-6">
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="lg:hidden"
                  onClick={() => dispatch(toggleSidebar())}
                  aria-label="Open menu"
                >
                  <Menu className="h-5 w-5" />
                </Button>
                <div className="min-w-0 lg:hidden">
                  <div className="truncate text-sm font-semibold">
                    {user?.name || "Expense Tracker"}
                  </div>
                </div>
              </div>
              <div className="hidden items-center gap-3 sm:flex">
                <div className="text-right text-sm">
                  <div className="font-medium">{user?.name || "Account"}</div>
                  <div className="text-muted-foreground">{user?.email}</div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="hidden lg:inline-flex"
                  onClick={() => logout.mutate()}
                  disabled={logout.isPending}
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </Button>
              </div>
              <Button asChild size="sm" className="sm:hidden">
                <Link href="/transactions">Add</Link>
              </Button>
            </div>
          </header>

          <main className="flex-1 px-4 py-5 pb-28 sm:px-6 sm:py-6 lg:pb-8">{children}</main>
        </div>
      </div>

      {sidebarOpen ? (
        <button
          className="fixed inset-0 z-40 bg-slate-950/45 backdrop-blur-[2px] animate-fade-in lg:hidden"
          aria-label="Close sidebar overlay"
          onClick={closeSidebar}
        />
      ) : null}

      <nav
        className="fixed inset-x-0 bottom-0 z-40 border-t border-border/70 bg-[var(--surface-elevated)] backdrop-blur-xl lg:hidden pb-safe"
        aria-label="Primary"
      >
        <div className="mx-auto grid max-w-lg grid-cols-4 gap-1 px-2 pt-1">
          {primaryNav.map((item) => (
            <NavLink
              key={item.href}
              {...item}
              compact
              active={pathname.startsWith(item.href)}
            />
          ))}
        </div>
      </nav>
    </div>
  );
}

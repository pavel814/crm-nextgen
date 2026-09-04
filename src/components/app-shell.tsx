import { Link, useRouterState } from "@tanstack/react-router";
import {
  Bell,
  CalendarDays,
  Clock,
  CreditCard,
  Download,
  Home,
  LogOut,
  Package,
  Search,
  Settings,
  Sparkles,
  Users,
  Users2,
} from "lucide-react";
import type { ReactNode } from "react";

const nav = [
  { title: "Сегодня", to: "/today", icon: Home },
  { title: "Календарь", to: "/calendar", icon: CalendarDays },
  { title: "Клиенты", to: "/clients", icon: Users },
  { title: "Услуги", to: "/services", icon: Sparkles },
  { title: "Пакеты", to: "/packages", icon: Package },
  { title: "Финансы", to: "/finance", icon: CreditCard },
  { title: "Импорт", to: "/import", icon: Download },
  { title: "Команда", to: "/", icon: Users2 },
  { title: "Рабочие часы", to: "/working-hours", icon: Clock },
  { title: "Настройки", to: "/settings", icon: Settings },
] as const;

export function AppShell({
  eyebrow,
  title,
  description,
  actions,
  children,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="flex min-h-screen w-full bg-background">
      <aside className="sticky top-0 hidden h-screen w-[268px] shrink-0 flex-col bg-ink px-4 py-6 text-ink-foreground lg:flex">
        <div className="flex items-center gap-3 px-2">
          <span className="grid size-11 place-items-center rounded-2xl bg-lime text-lg font-bold text-primary-foreground">
            С
          </span>
          <span className="leading-tight">
            <span className="block font-display text-lg font-bold">Собрано</span>
            <span className="text-[11px] tracking-[0.22em] text-ink-muted">CRM</span>
          </span>
        </div>

        <nav className="mt-8 flex-1 space-y-1 overflow-y-auto">
          {nav.map((item) => {
            const active = pathname === item.to;
            return (
              <Link
                key={item.title}
                to={item.to}
                className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors ${
                  active
                    ? "bg-white/10 font-semibold text-ink-foreground"
                    : "text-ink-muted hover:bg-white/5 hover:text-ink-foreground"
                }`}
              >
                <span
                  className={`h-5 w-[3px] rounded-full transition-colors ${active ? "bg-lime" : "bg-transparent"}`}
                />
                <item.icon className="size-4" />
                {item.title}
              </Link>
            );
          })}
        </nav>

        <div className="mt-6 rounded-2xl bg-white/5 p-4">
          <div className="flex items-center justify-between">
            <span className="font-display text-sm font-bold">Пилот</span>
            <span className="rounded-full bg-lime/20 px-2 py-0.5 text-[11px] font-semibold text-lime">
              Пробный
            </span>
          </div>
          <p className="mt-1 text-xs text-ink-muted">Осталось 14 дней</p>
          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10">
            <div className="h-full w-1/3 rounded-full bg-lime" />
          </div>
          <Link
            to="/settings"
            className="mt-3 flex items-center gap-1 text-xs font-semibold text-ink-foreground hover:text-lime"
          >
            Управление тарифом →
          </Link>
        </div>

        <button className="mt-4 flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm text-ink-muted transition-colors hover:bg-white/5 hover:text-ink-foreground">
          <LogOut className="size-4" /> Выйти
        </button>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex flex-wrap items-center gap-4 border-b border-border bg-background/85 px-6 py-4 backdrop-blur">
          <div className="min-w-0">
            <p className="eyebrow">Рабочее пространство</p>
            <p className="truncate font-display text-lg font-bold">Школа хороших собак</p>
          </div>
          <label className="ml-auto flex h-10 w-full max-w-sm items-center gap-2 rounded-xl border border-border bg-card px-3 text-sm text-muted-foreground focus-within:ring-2 focus-within:ring-ring md:w-auto md:flex-1">
            <Search className="size-4" />
            <input
              placeholder="Поиск по клиентам, записям…"
              className="w-full bg-transparent text-foreground outline-none placeholder:text-muted-foreground"
            />
            <kbd className="hidden rounded-md bg-muted px-1.5 py-0.5 text-[10px] font-semibold md:block">
              ⌘K
            </kbd>
          </label>
          <button className="relative grid size-10 place-items-center rounded-xl border border-border bg-card transition-colors hover:bg-muted">
            <Bell className="size-4" />
            <span className="absolute -right-1 -top-1 grid size-4 place-items-center rounded-full bg-lime text-[10px] font-bold text-primary-foreground">
              1
            </span>
          </button>
          <div className="flex items-center gap-2 rounded-xl border border-border bg-card px-2 py-1.5">
            <span className="grid size-8 place-items-center rounded-lg bg-ink text-sm font-bold text-ink-foreground">
              А
            </span>
            <span className="hidden leading-tight sm:block">
              <span className="block text-sm font-semibold">Анна Соболева</span>
              <span className="text-xs text-muted-foreground">Владелец</span>
            </span>
          </div>
        </header>

        <main className="mx-auto w-full max-w-[1180px] flex-1 px-6 py-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="eyebrow">{eyebrow}</p>
              <h1 className="mt-1 text-3xl font-bold">{title}</h1>
              {description ? (
                <p className="mt-2 max-w-xl text-sm text-muted-foreground">{description}</p>
              ) : null}
            </div>
            {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
          </div>
          <div className="mt-8">{children}</div>
        </main>
      </div>
    </div>
  );
}

import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Check, Copy, Plus, RotateCcw, Trash2, Zap } from "lucide-react";

import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DAYS,
  defaultSchedule,
  setCrmState,
  useCrmState,
  type DayKey,
  type Schedule,
} from "@/lib/crm-store";

export const Route = createFileRoute("/working-hours")({
  head: () => ({
    meta: [
      { title: "Рабочие часы — Собрано CRM" },
      {
        name: "description",
        content:
          "Настройте рабочее расписание сотрудников: интервалы, выходные и доступные слоты онлайн-записи.",
      },
      { property: "og:title", content: "Рабочие часы — Собрано CRM" },
      {
        property: "og:description",
        content: "Интервалы, выходные и слоты онлайн-записи для каждого сотрудника школы.",
      },
    ],
  }),
  component: WorkingHoursPage,
});

const PRESETS: { label: string; days: DayKey[]; from: string; to: string }[] = [
  { label: "Пн–Пт 09:00–18:00", days: ["mon", "tue", "wed", "thu", "fri"], from: "09:00", to: "18:00" },
  { label: "Пн–Сб 10:00–20:00", days: ["mon", "tue", "wed", "thu", "fri", "sat"], from: "10:00", to: "20:00" },
  { label: "Выходные 11:00–16:00", days: ["sat", "sun"], from: "11:00", to: "16:00" },
];

const minutes = (t: string) => {
  const [h, m] = t.split(":").map(Number);
  return (h || 0) * 60 + (m || 0);
};

function WorkingHoursPage() {
  const { members, schedules, settings } = useCrmState();
  const [memberId, setMemberId] = useState(members[0]?.id ?? "");
  const activeId = schedules[memberId] ? memberId : (members[0]?.id ?? "");
  const schedule = schedules[activeId] ?? defaultSchedule();

  const patch = (updater: (s: Schedule) => Schedule) =>
    setCrmState((prev) => ({
      ...prev,
      schedules: { ...prev.schedules, [activeId]: updater(prev.schedules[activeId] ?? defaultSchedule()) },
    }));

  const totalHours = DAYS.reduce((sum, d) => {
    const day = schedule[d.key];
    if (!day.enabled) return sum;
    return (
      sum +
      day.intervals.reduce((s, i) => s + Math.max(0, minutes(i.to) - minutes(i.from)) / 60, 0)
    );
  }, 0);

  const slots = Math.floor((totalHours * 60) / settings.slotStep);
  const workingDays = DAYS.filter((d) => schedule[d.key].enabled).length;

  const applyPreset = (preset: (typeof PRESETS)[number]) => {
    patch((s) => {
      const next = { ...s };
      DAYS.forEach((d) => {
        const on = preset.days.includes(d.key);
        next[d.key] = on
          ? { enabled: true, intervals: [{ id: `${d.key}-1`, from: preset.from, to: preset.to }] }
          : { ...next[d.key], enabled: false };
      });
      return next;
    });
    toast.success(`Применён шаблон: ${preset.label}`);
  };

  const copyToAll = (from: DayKey) => {
    patch((s) => {
      const src = s[from];
      const next = { ...s };
      DAYS.forEach((d) => {
        if (d.key === from) return;
        next[d.key] = {
          enabled: src.enabled,
          intervals: src.intervals.map((i, idx) => ({ ...i, id: `${d.key}-${idx + 1}` })),
        };
      });
      return next;
    });
    toast.success("Расписание скопировано на все дни");
  };

  const invalid = DAYS.some(
    (d) => schedule[d.key].enabled && schedule[d.key].intervals.some((i) => minutes(i.to) <= minutes(i.from)),
  );

  return (
    <AppShell
      eyebrow="Расписание"
      title="Рабочие часы"
      description="Эти интервалы определяют доступные слоты публичной онлайн-записи и подсказки в календаре."
      actions={
        <>
          <Button
            variant="outline"
            className="rounded-xl"
            onClick={() => {
              patch(() => defaultSchedule());
              toast.info("Расписание сброшено к стандартному");
            }}
          >
            <RotateCcw className="size-4" /> Сбросить
          </Button>
          <Button
            className="rounded-xl"
            onClick={() =>
              invalid
                ? toast.error("Проверьте интервалы: окончание раньше начала")
                : toast.success("Рабочие часы сохранены")
            }
          >
            <Check className="size-4" /> Сохранить
          </Button>
        </>
      }
    >
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <div className="surface p-5">
            <div className="flex flex-wrap items-end gap-4">
              <div className="min-w-[240px] flex-1 space-y-2">
                <p className="eyebrow">Сотрудник</p>
                <Select value={activeId} onValueChange={setMemberId}>
                  <SelectTrigger className="h-11 rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {members.map((m) => (
                      <SelectItem key={m.id} value={m.id}>
                        {m.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-4">
                <div>
                  <p className="eyebrow">Часов в неделю</p>
                  <p className="font-display text-2xl font-bold">{totalHours.toFixed(1)}</p>
                </div>
                <div>
                  <p className="eyebrow">Слотов</p>
                  <p className="font-display text-2xl font-bold">{slots}</p>
                </div>
                <div>
                  <p className="eyebrow">Рабочих дней</p>
                  <p className="font-display text-2xl font-bold">{workingDays}</p>
                </div>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              {PRESETS.map((p) => (
                <Button
                  key={p.label}
                  variant="secondary"
                  size="sm"
                  className="rounded-full"
                  onClick={() => applyPreset(p)}
                >
                  <Zap className="size-3.5" /> {p.label}
                </Button>
              ))}
            </div>
          </div>

          <div className="surface divide-y divide-border">
            {DAYS.map((d) => {
              const day = schedule[d.key];
              return (
                <div key={d.key} className="flex flex-col gap-3 p-5 sm:flex-row sm:items-start">
                  <div className="flex w-full items-center gap-3 sm:w-[190px]">
                    <Switch
                      checked={day.enabled}
                      onCheckedChange={(v) =>
                        patch((s) => ({ ...s, [d.key]: { ...s[d.key], enabled: v } }))
                      }
                    />
                    <div>
                      <p className="font-semibold">{d.long}</p>
                      <p className="text-xs text-muted-foreground">
                        {day.enabled ? `${day.intervals.length} интервал(а)` : "Выходной"}
                      </p>
                    </div>
                  </div>

                  <div className="flex-1 space-y-2">
                    {day.enabled ? (
                      day.intervals.map((i) => {
                        const bad = minutes(i.to) <= minutes(i.from);
                        return (
                          <div key={i.id} className="flex flex-wrap items-center gap-2">
                            <Input
                              type="time"
                              value={i.from}
                              aria-label={`${d.long}: начало`}
                              className={`h-10 w-[130px] rounded-xl ${bad ? "border-destructive" : ""}`}
                              onChange={(e) =>
                                patch((s) => ({
                                  ...s,
                                  [d.key]: {
                                    ...s[d.key],
                                    intervals: s[d.key].intervals.map((x) =>
                                      x.id === i.id ? { ...x, from: e.target.value } : x,
                                    ),
                                  },
                                }))
                              }
                            />
                            <span className="text-muted-foreground">—</span>
                            <Input
                              type="time"
                              value={i.to}
                              aria-label={`${d.long}: окончание`}
                              className={`h-10 w-[130px] rounded-xl ${bad ? "border-destructive" : ""}`}
                              onChange={(e) =>
                                patch((s) => ({
                                  ...s,
                                  [d.key]: {
                                    ...s[d.key],
                                    intervals: s[d.key].intervals.map((x) =>
                                      x.id === i.id ? { ...x, to: e.target.value } : x,
                                    ),
                                  },
                                }))
                              }
                            />
                            <Button
                              variant="ghost"
                              size="icon"
                              className="rounded-xl text-muted-foreground"
                              aria-label="Удалить интервал"
                              onClick={() =>
                                patch((s) => ({
                                  ...s,
                                  [d.key]: {
                                    ...s[d.key],
                                    intervals:
                                      s[d.key].intervals.length > 1
                                        ? s[d.key].intervals.filter((x) => x.id !== i.id)
                                        : s[d.key].intervals,
                                  },
                                }))
                              }
                            >
                              <Trash2 className="size-4" />
                            </Button>
                          </div>
                        );
                      })
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        День закрыт для записи — клиенты не увидят свободных слотов.
                      </p>
                    )}
                  </div>

                  <div className="flex gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-xl"
                      disabled={!day.enabled}
                      onClick={() =>
                        patch((s) => ({
                          ...s,
                          [d.key]: {
                            ...s[d.key],
                            intervals: [
                              ...s[d.key].intervals,
                              {
                                id: `${d.key}-${Date.now()}`,
                                from: "18:00",
                                to: "20:00",
                              },
                            ],
                          },
                        }))
                      }
                    >
                      <Plus className="size-4" /> Интервал
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="rounded-xl"
                      onClick={() => copyToAll(d.key)}
                    >
                      <Copy className="size-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <aside className="space-y-4">
          <div className="surface p-5">
            <h2 className="font-display text-lg font-bold">Как это работает</h2>
            <ul className="mt-3 space-y-3 text-sm text-muted-foreground">
              {[
                `Слоты строятся в часовом поясе ${settings.timezone}`,
                "Занятые записи исключаются автоматически",
                "Учитывается длительность услуги",
                `Шаг сетки — ${settings.slotStep} минут`,
              ].map((t) => (
                <li key={t} className="flex gap-2">
                  <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                  <span>{t}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl bg-ink p-5 text-ink-foreground">
            <p className="eyebrow text-ink-muted">Загрузка недели</p>
            <p className="mt-2 font-display text-3xl font-bold">{Math.min(100, Math.round((totalHours / 60) * 100))}%</p>
            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-lime transition-all"
                style={{ width: `${Math.min(100, (totalHours / 60) * 100)}%` }}
              />
            </div>
            <p className="mt-3 text-sm text-ink-muted">
              {totalHours.toFixed(1)} ч доступно для записи · {slots} слотов
            </p>
          </div>
        </aside>
      </div>
    </AppShell>
  );
}

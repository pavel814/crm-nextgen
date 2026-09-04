import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Bell, Building2, Check, Copy, CreditCard, Globe, Link2, Save } from "lucide-react";

import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { setCrmState, useCrmState, type Settings } from "@/lib/crm-store";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Настройки — Собрано CRM" },
      {
        name: "description",
        content:
          "Организация, публичная запись, уведомления и тариф — все настройки школы в одном разделе.",
      },
      { property: "og:title", content: "Настройки — Собрано CRM" },
      {
        property: "og:description",
        content: "Организация, публичная онлайн-запись, напоминания и тариф в Собрано CRM.",
      },
    ],
  }),
  component: SettingsPage,
});

const TIMEZONES = ["Europe/Minsk", "Europe/Warsaw", "Europe/Moscow", "Europe/Vilnius"];
const CURRENCIES = ["BYN", "EUR", "USD", "PLN"];
const STEPS = [15, 20, 30, 60];

function SettingsPage() {
  const { settings } = useCrmState();
  const [dirty, setDirty] = useState(false);

  const set = <K extends keyof Settings>(key: K, value: Settings[K]) => {
    setCrmState((prev) => ({ ...prev, settings: { ...prev.settings, [key]: value } }));
    setDirty(true);
  };

  const toggles: { key: keyof Settings; title: string; hint: string }[] = [
    {
      key: "notifyNewBooking",
      title: "Новая запись",
      hint: "Письмо и push администратору при новой заявке",
    },
    { key: "notifyCancel", title: "Отмена записи", hint: "Сообщать, когда клиент отменяет занятие" },
    {
      key: "notifyPackageEnds",
      title: "Пакет заканчивается",
      hint: "Предупреждать за одно занятие до конца пакета",
    },
    { key: "smsFallback", title: "SMS-дублирование", hint: "Если письмо не доставлено — отправим SMS" },
    { key: "weeklyDigest", title: "Недельный отчёт", hint: "Сводка по выручке и занятиям в понедельник" },
  ];

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(`https://${settings.bookingLink}`);
      toast.success("Ссылка скопирована");
    } catch {
      toast.error("Не удалось скопировать");
    }
  };

  return (
    <AppShell
      eyebrow="Организация"
      title="Настройки"
      description="Данные школы, правила онлайн-записи и уведомления. Изменения применяются сразу."
      actions={
        <Button
          className="rounded-xl"
          onClick={() => {
            setDirty(false);
            toast.success("Настройки сохранены");
          }}
        >
          <Save className="size-4" /> {dirty ? "Сохранить изменения" : "Сохранено"}
        </Button>
      }
    >
      <Tabs defaultValue="org">
        <TabsList className="h-11 rounded-xl bg-secondary p-1">
          <TabsTrigger value="org" className="rounded-lg px-4">
            <Building2 className="size-4" /> Организация
          </TabsTrigger>
          <TabsTrigger value="booking" className="rounded-lg px-4">
            <Globe className="size-4" /> Онлайн-запись
          </TabsTrigger>
          <TabsTrigger value="notify" className="rounded-lg px-4">
            <Bell className="size-4" /> Уведомления
          </TabsTrigger>
          <TabsTrigger value="plan" className="rounded-lg px-4">
            <CreditCard className="size-4" /> Тариф
          </TabsTrigger>
        </TabsList>

        <TabsContent value="org" className="mt-6">
          <div className="surface max-w-2xl space-y-5 p-6">
            <div className="space-y-2">
              <Label htmlFor="org">Название организации</Label>
              <Input
                id="org"
                className="h-11 rounded-xl"
                value={settings.orgName}
                onChange={(e) => set("orgName", e.target.value)}
              />
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Часовой пояс</Label>
                <Select value={settings.timezone} onValueChange={(v) => set("timezone", v)}>
                  <SelectTrigger className="h-11 rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TIMEZONES.map((t) => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Валюта</Label>
                <Select value={settings.currency} onValueChange={(v) => set("currency", v)}>
                  <SelectTrigger className="h-11 rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CURRENCIES.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Шаг сетки записи</Label>
              <div className="flex gap-2">
                {STEPS.map((s) => (
                  <Button
                    key={s}
                    variant={settings.slotStep === s ? "default" : "outline"}
                    className="rounded-xl"
                    onClick={() => set("slotStep", s)}
                  >
                    {s} мин
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="booking" className="mt-6">
          <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
            <div className="surface space-y-5 p-6">
              <div className="space-y-2">
                <Label htmlFor="link">Публичная ссылка</Label>
                <div className="flex gap-2">
                  <div className="flex h-11 flex-1 items-center gap-2 rounded-xl border border-border px-3">
                    <Link2 className="size-4 text-muted-foreground" />
                    <input
                      id="link"
                      value={settings.bookingLink}
                      onChange={(e) => set("bookingLink", e.target.value)}
                      className="w-full bg-transparent text-sm outline-none"
                    />
                  </div>
                  <Button variant="outline" className="rounded-xl" onClick={copyLink}>
                    <Copy className="size-4" /> Копировать
                  </Button>
                </div>
              </div>

              <SettingRow
                title="Публичная запись включена"
                hint="Клиенты видят свободные слоты и записываются сами"
                checked={settings.publicBooking}
                onChange={(v) => set("publicBooking", v)}
              />
              <SettingRow
                title="Автоподтверждение"
                hint="Записи сразу получают статус «Подтверждена»"
                checked={settings.autoConfirm}
                onChange={(v) => set("autoConfirm", v)}
              />
              <SettingRow
                title="Напоминания клиентам"
                hint="Автоматическое сообщение перед занятием"
                checked={settings.remindersEnabled}
                onChange={(v) => set("remindersEnabled", v)}
              />
              {settings.remindersEnabled ? (
                <div className="space-y-2">
                  <Label>За сколько часов напомнить</Label>
                  <div className="flex gap-2">
                    {[2, 6, 12, 24, 48].map((h) => (
                      <Button
                        key={h}
                        variant={settings.reminderHours === h ? "default" : "outline"}
                        className="rounded-xl"
                        onClick={() => set("reminderHours", h)}
                      >
                        {h} ч
                      </Button>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>

            <aside className="surface h-fit p-6">
              <p className="eyebrow">Предпросмотр</p>
              <h2 className="mt-2 font-display text-lg font-bold">{settings.orgName}</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {settings.publicBooking
                  ? "Страница записи доступна клиентам"
                  : "Страница записи скрыта"}
              </p>
              <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                <li className="flex gap-2">
                  <Check className="mt-0.5 size-4 text-primary" /> Шаг {settings.slotStep} мин
                </li>
                <li className="flex gap-2">
                  <Check className="mt-0.5 size-4 text-primary" /> {settings.timezone}
                </li>
                <li className="flex gap-2">
                  <Check className="mt-0.5 size-4 text-primary" /> Цены в {settings.currency}
                </li>
              </ul>
              <Button
                variant="outline"
                className="mt-5 w-full rounded-xl"
                onClick={() => toast.info(`Откроется https://${settings.bookingLink}`)}
              >
                Открыть страницу записи
              </Button>
            </aside>
          </div>
        </TabsContent>

        <TabsContent value="notify" className="mt-6">
          <div className="surface max-w-2xl divide-y divide-border p-2">
            {toggles.map((t) => (
              <div key={t.key} className="p-4">
                <SettingRow
                  title={t.title}
                  hint={t.hint}
                  checked={Boolean(settings[t.key])}
                  onChange={(v) => set(t.key, v as never)}
                />
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="plan" className="mt-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-2xl bg-ink p-6 text-ink-foreground">
              <p className="eyebrow text-ink-muted">Текущий тариф</p>
              <h2 className="mt-2 font-display text-2xl font-bold">Пилот · пробный период</h2>
              <p className="mt-2 text-sm text-ink-muted">
                Осталось 14 дней. Все функции открыты, ограничение — 1 филиал.
              </p>
              <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/10">
                <div className="h-full w-1/3 rounded-full bg-lime" />
              </div>
              <Button
                className="mt-5 w-full rounded-xl"
                onClick={() => toast.success("Заявка на переход в «Профи» отправлена")}
              >
                Перейти на «Профи»
              </Button>
            </div>
            <div className="surface p-6">
              <p className="eyebrow">Что даёт «Профи»</p>
              <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                {[
                  "Неограниченные сотрудники и филиалы",
                  "SMS и Telegram-напоминания",
                  "Экспорт финансов в Excel и API",
                  "Приоритетная поддержка",
                ].map((t) => (
                  <li key={t} className="flex gap-2">
                    <Check className="mt-0.5 size-4 text-primary" /> {t}
                  </li>
                ))}
              </ul>
              <Button
                variant="outline"
                className="mt-5 w-full rounded-xl"
                onClick={() => toast.info("Счёт отправлен на email владельца")}
              >
                Запросить счёт
              </Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </AppShell>
  );
}

function SettingRow({
  title,
  hint,
  checked,
  onChange,
}: {
  title: string;
  hint: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <p className="font-semibold">{title}</p>
        <p className="text-sm text-muted-foreground">{hint}</p>
      </div>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}

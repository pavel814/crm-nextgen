import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  Clock,
  Mail,
  MoreHorizontal,
  Pause,
  Play,
  Search,
  Send,
  ShieldCheck,
  Trash2,
  UserPlus,
} from "lucide-react";

import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  avatarColor,
  defaultSchedule,
  ROLE_HINTS,
  ROLE_LABELS,
  setCrmState,
  useCrmState,
  type Member,
  type Role,
} from "@/lib/crm-store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Команда — Собрано CRM" },
      {
        name: "description",
        content:
          "Управляйте доступом сотрудников, ролями и приглашениями в команде школы в Собрано CRM.",
      },
      { property: "og:title", content: "Команда — Собрано CRM" },
      {
        property: "og:description",
        content: "Роли, приглашения и доступ сотрудников в одном разделе Собрано CRM.",
      },
    ],
  }),
  component: TeamPage,
});

const statusStyles: Record<Member["status"], string> = {
  active: "bg-lime-soft text-primary-foreground",
  invited: "bg-secondary text-secondary-foreground",
  paused: "bg-muted text-muted-foreground",
};

const statusLabels: Record<Member["status"], string> = {
  active: "Активен",
  invited: "Приглашён",
  paused: "На паузе",
};

function TeamPage() {
  const { members } = useCrmState();
  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<Role | "all">("all");
  const [inviteOpen, setInviteOpen] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", role: "trainer" as Role });

  const filtered = useMemo(
    () =>
      members.filter(
        (m) =>
          (roleFilter === "all" || m.role === roleFilter) &&
          (m.name.toLowerCase().includes(query.toLowerCase()) ||
            m.email.toLowerCase().includes(query.toLowerCase())),
      ),
    [members, query, roleFilter],
  );

  const stats = [
    { label: "Всего в команде", value: members.length },
    { label: "Активных", value: members.filter((m) => m.status === "active").length },
    { label: "Ждут приглашения", value: members.filter((m) => m.status === "invited").length },
    { label: "Тренеров", value: members.filter((m) => m.role === "trainer").length },
  ];

  const invite = () => {
    if (!form.name.trim() || !form.email.trim()) {
      toast.error("Заполните имя и email");
      return;
    }
    const id = `m${Date.now()}`;
    setCrmState((prev) => ({
      ...prev,
      members: [
        ...prev.members,
        {
          id,
          name: form.name.trim(),
          email: form.email.trim(),
          role: form.role,
          status: "invited",
          color: avatarColor(form.name),
        },
      ],
      schedules: { ...prev.schedules, [id]: defaultSchedule() },
    }));
    toast.success(`Приглашение отправлено на ${form.email.trim()}`);
    setForm({ name: "", email: "", role: "trainer" });
    setInviteOpen(false);
  };

  const updateMember = (id: string, patch: Partial<Member>) =>
    setCrmState((prev) => ({
      ...prev,
      members: prev.members.map((m) => (m.id === id ? { ...m, ...patch } : m)),
    }));

  const removeMember = (member: Member) => {
    if (member.role === "owner") {
      toast.error("Владельца нельзя удалить");
      return;
    }
    setCrmState((prev) => ({ ...prev, members: prev.members.filter((m) => m.id !== member.id) }));
    toast.success(`${member.name} удалён из команды`);
  };

  return (
    <AppShell
      eyebrow="Доступ и роли"
      title="Команда"
      description="Кто работает в школе, что каждому доступно и кто ещё не принял приглашение."
      actions={
        <>
          <Button
            variant="outline"
            className="rounded-xl"
            onClick={() => {
              const pending = members.filter((m) => m.status === "invited");
              if (!pending.length) {
                toast.info("Все приглашения уже приняты");
                return;
              }
              toast.success(`Напоминание отправлено: ${pending.length}`);
            }}
          >
            <Send className="size-4" /> Напомнить приглашённым
          </Button>
          <Button className="rounded-xl" onClick={() => setInviteOpen(true)}>
            <UserPlus className="size-4" /> Пригласить
          </Button>
        </>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="surface p-5">
            <p className="eyebrow">{s.label}</p>
            <p className="mt-2 font-display text-3xl font-bold">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 surface p-2">
        <div className="flex flex-wrap items-center gap-2 p-3">
          <label className="flex h-10 flex-1 min-w-[220px] items-center gap-2 rounded-xl border border-border px-3 text-sm focus-within:ring-2 focus-within:ring-ring">
            <Search className="size-4 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Имя или email"
              className="w-full bg-transparent outline-none placeholder:text-muted-foreground"
            />
          </label>
          <Select value={roleFilter} onValueChange={(v) => setRoleFilter(v as Role | "all")}>
            <SelectTrigger className="h-10 w-[200px] rounded-xl">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все роли</SelectItem>
              {(Object.keys(ROLE_LABELS) as Role[]).map((r) => (
                <SelectItem key={r} value={r}>
                  {ROLE_LABELS[r]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="divide-y divide-border">
          {filtered.map((member) => (
            <div key={member.id} className="flex flex-wrap items-center gap-4 px-4 py-4">
              <span
                className="grid size-12 shrink-0 place-items-center rounded-2xl font-display text-lg font-bold text-primary-foreground"
                style={{ backgroundColor: member.color }}
              >
                {member.name.slice(0, 1)}
              </span>
              <div className="min-w-[180px] flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-semibold">{member.name}</p>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${statusStyles[member.status]}`}
                  >
                    {statusLabels[member.status]}
                  </span>
                  {member.role === "owner" ? (
                    <span className="flex items-center gap-1 text-[11px] font-semibold text-muted-foreground">
                      <ShieldCheck className="size-3.5" /> Владелец
                    </span>
                  ) : null}
                </div>
                <p className="text-sm text-muted-foreground">{member.email}</p>
              </div>

              <Select
                value={member.role}
                disabled={member.role === "owner"}
                onValueChange={(v) => {
                  updateMember(member.id, { role: v as Role });
                  toast.success(`${member.name}: роль «${ROLE_LABELS[v as Role]}»`);
                }}
              >
                <SelectTrigger className="h-10 w-[200px] rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(ROLE_LABELS) as Role[])
                    .filter((r) => r !== "owner")
                    .map((r) => (
                      <SelectItem key={r} value={r}>
                        <span className="flex flex-col">
                          <span className="font-medium">{ROLE_LABELS[r]}</span>
                          <span className="text-xs text-muted-foreground">{ROLE_HINTS[r]}</span>
                        </span>
                      </SelectItem>
                    ))}
                  {member.role === "owner" ? (
                    <SelectItem value="owner">Владелец</SelectItem>
                  ) : null}
                </SelectContent>
              </Select>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon" className="rounded-xl">
                    <MoreHorizontal className="size-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>{member.name}</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => toast.success(`Письмо отправлено на ${member.email}`)}
                  >
                    <Mail className="size-4" /> Написать
                  </DropdownMenuItem>
                  {member.status === "invited" ? (
                    <DropdownMenuItem
                      onClick={() => {
                        updateMember(member.id, { status: "active" });
                        toast.success(`${member.name} активирован`);
                      }}
                    >
                      <Play className="size-4" /> Активировать
                    </DropdownMenuItem>
                  ) : member.status === "active" ? (
                    <DropdownMenuItem
                      onClick={() => {
                        updateMember(member.id, { status: "paused" });
                        toast.info(`${member.name} на паузе`);
                      }}
                    >
                      <Pause className="size-4" /> Приостановить доступ
                    </DropdownMenuItem>
                  ) : (
                    <DropdownMenuItem
                      onClick={() => {
                        updateMember(member.id, { status: "active" });
                        toast.success(`${member.name} снова активен`);
                      }}
                    >
                      <Play className="size-4" /> Вернуть доступ
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={() => toast.info("Расписание: раздел «Рабочие часы»")}>
                    <Clock className="size-4" /> Рабочие часы
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem variant="destructive" onClick={() => removeMember(member)}>
                    <Trash2 className="size-4" /> Удалить
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ))}
          {!filtered.length ? (
            <p className="px-4 py-10 text-center text-sm text-muted-foreground">
              Никого не нашли — измените фильтры или пригласите сотрудника.
            </p>
          ) : null}
        </div>
      </div>

      <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Пригласить в команду</DialogTitle>
            <DialogDescription>
              Сотрудник получит письмо со ссылкой и сразу увидит доступный ему раздел.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="invite-name">Имя</Label>
              <Input
                id="invite-name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Например, Ольга Ким"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="invite-email">Email</Label>
              <Input
                id="invite-email"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="trainer@school.by"
              />
            </div>
            <div className="space-y-2">
              <Label>Роль</Label>
              <Select value={form.role} onValueChange={(v) => setForm({ ...form, role: v as Role })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(ROLE_LABELS) as Role[])
                    .filter((r) => r !== "owner")
                    .map((r) => (
                      <SelectItem key={r} value={r}>
                        {ROLE_LABELS[r]}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">{ROLE_HINTS[form.role]}</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" className="rounded-xl" onClick={() => setInviteOpen(false)}>
              Отмена
            </Button>
            <Button className="rounded-xl" onClick={invite}>
              Отправить приглашение
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}

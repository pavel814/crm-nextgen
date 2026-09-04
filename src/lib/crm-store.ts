import { useEffect, useState } from "react";

export type Role = "owner" | "admin" | "trainer" | "viewer";

export type Member = {
  id: string;
  name: string;
  email: string;
  role: Role;
  status: "active" | "invited" | "paused";
  color: string;
};

export type DayKey = "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun";

export type Interval = { id: string; from: string; to: string };

export type Schedule = Record<DayKey, { enabled: boolean; intervals: Interval[] }>;

export type Settings = {
  orgName: string;
  timezone: string;
  currency: string;
  slotStep: number;
  bookingLink: string;
  publicBooking: boolean;
  autoConfirm: boolean;
  remindersEnabled: boolean;
  reminderHours: number;
  notifyNewBooking: boolean;
  notifyCancel: boolean;
  notifyPackageEnds: boolean;
  smsFallback: boolean;
  weeklyDigest: boolean;
};

export type CrmState = {
  members: Member[];
  schedules: Record<string, Schedule>;
  settings: Settings;
};

export const DAYS: { key: DayKey; short: string; long: string }[] = [
  { key: "mon", short: "Пн", long: "Понедельник" },
  { key: "tue", short: "Вт", long: "Вторник" },
  { key: "wed", short: "Ср", long: "Среда" },
  { key: "thu", short: "Чт", long: "Четверг" },
  { key: "fri", short: "Пт", long: "Пятница" },
  { key: "sat", short: "Сб", long: "Суббота" },
  { key: "sun", short: "Вс", long: "Воскресенье" },
];

export const ROLE_LABELS: Record<Role, string> = {
  owner: "Владелец",
  admin: "Администратор",
  trainer: "Тренер",
  viewer: "Наблюдатель",
};

export const ROLE_HINTS: Record<Role, string> = {
  owner: "Полный доступ, тариф и удаление данных",
  admin: "Клиенты, записи, финансы и настройки",
  trainer: "Свой календарь, клиенты и занятия",
  viewer: "Только просмотр отчётов",
};

const AVATAR_COLORS = ["#A3C644", "#7C9CF5", "#F0A868", "#E4739B", "#5CC8A8", "#B08CF0"];

export const avatarColor = (seed: string) =>
  AVATAR_COLORS[
    Math.abs([...seed].reduce((a, c) => a + c.charCodeAt(0), 0)) % AVATAR_COLORS.length
  ];

export const defaultSchedule = (): Schedule =>
  DAYS.reduce((acc, d) => {
    acc[d.key] = {
      enabled: d.key !== "sat" && d.key !== "sun",
      intervals: [{ id: `${d.key}-1`, from: "09:00", to: "18:00" }],
    };
    return acc;
  }, {} as Schedule);

const initialState: CrmState = {
  members: [
    {
      id: "m1",
      name: "Анна Соболева",
      email: "anna@sobrano.crm",
      role: "owner",
      status: "active",
      color: avatarColor("Анна Соболева"),
    },
    {
      id: "m2",
      name: "Игорь Литвин",
      email: "igor@sobrano.crm",
      role: "trainer",
      status: "active",
      color: avatarColor("Игорь Литвин"),
    },
    {
      id: "m3",
      name: "Мария Кот",
      email: "maria@sobrano.crm",
      role: "admin",
      status: "invited",
      color: avatarColor("Мария Кот"),
    },
  ],
  schedules: {
    m1: defaultSchedule(),
    m2: defaultSchedule(),
    m3: defaultSchedule(),
  },
  settings: {
    orgName: "Школа хороших собак",
    timezone: "Europe/Minsk",
    currency: "BYN",
    slotStep: 30,
    bookingLink: "sobrano.crm/dogs-school",
    publicBooking: true,
    autoConfirm: false,
    remindersEnabled: true,
    reminderHours: 24,
    notifyNewBooking: true,
    notifyCancel: true,
    notifyPackageEnds: true,
    smsFallback: false,
    weeklyDigest: true,
  },
};

const KEY = "sobrano-crm-state-v1";
let state: CrmState = initialState;
let hydrated = false;
const listeners = new Set<() => void>();

function hydrate() {
  if (hydrated || typeof window === "undefined") return;
  hydrated = true;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (raw) state = { ...initialState, ...(JSON.parse(raw) as CrmState) };
  } catch {
    /* ignore */
  }
}

function persist() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* ignore */
  }
}

export function setCrmState(updater: (prev: CrmState) => CrmState) {
  state = updater(state);
  persist();
  listeners.forEach((l) => l());
}

export function useCrmState(): CrmState {
  const [, force] = useState(0);
  useEffect(() => {
    hydrate();
    const l = () => force((n) => n + 1);
    listeners.add(l);
    l();
    return () => listeners.delete(l);
  }, []);
  return state;
}

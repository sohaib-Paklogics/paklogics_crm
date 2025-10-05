// utils/timeAgo.ts
export function timeAgo(input: Date | string | number) {
  const d = new Date(input);
  const diffSec = Math.round((Date.now() - d.getTime()) / 1000);

  const rtf = new Intl.RelativeTimeFormat(undefined, { numeric: "auto" });
  const ranges: [Intl.RelativeTimeFormatUnit, number][] = [
    ["year", 60 * 60 * 24 * 365],
    ["month", 60 * 60 * 24 * 30],
    ["week", 60 * 60 * 24 * 7],
    ["day", 60 * 60 * 24],
    ["hour", 60 * 60],
    ["minute", 60],
    ["second", 1],
  ];

  for (const [unit, secondsInUnit] of ranges) {
    const delta = Math.floor(diffSec / secondsInUnit);
    if (Math.abs(delta) >= 1) return rtf.format(-delta, unit);
  }
  return rtf.format(0, "second");
}

// for calendar display and manipulation
// all functions here assume local timezone of user
// for simplicity, we are not using any date libraries like date-fns or moment.js
export const monthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
export const userTZ = Intl.DateTimeFormat().resolvedOptions().timeZone || "Asia/Karachi";

export const startOfMonth = (d: Date) => new Date(d.getFullYear(), d.getMonth(), 1);
export const endOfMonth = (d: Date) => new Date(d.getFullYear(), d.getMonth() + 1, 0);
export const startOfWeek = (d: Date) => {
  const day = d.getDay(); // 0=Sun
  const diff = d.getDate() - day;
  return new Date(d.getFullYear(), d.getMonth(), diff);
};
export const endOfWeek = (d: Date) => {
  const s = startOfWeek(d);
  return new Date(s.getFullYear(), s.getMonth(), s.getDate() + 6);
};
export const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0);
export const endOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);

export const getDaysInMonth = (date: Date) => {
  const start = startOfMonth(date);
  const end = endOfMonth(date);
  const days: (Date | null)[] = [];
  for (let i = 0; i < start.getDay(); i++) days.push(null); // leading blanks
  for (let day = 1; day <= end.getDate(); day++) days.push(new Date(date.getFullYear(), date.getMonth(), day));
  return days;
};

export const getDaysInWeek = (date: Date) => {
  const s = startOfWeek(date);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(s);
    d.setDate(s.getDate() + i);
    return d;
  });
};

export const fmtTime = (iso: string) =>
  new Date(iso).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: userTZ,
  });

const sameYMD = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

export const isToday = (d: Date) => sameYMD(d, new Date());

export const dateKey = (d: Date) => {
  // yyyy-mm-dd
  const m = `${d.getMonth() + 1}`.padStart(2, "0");
  const day = `${d.getDate()}`.padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
};
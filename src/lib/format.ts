export const initials = (name?: string | null) =>
  (name ?? "")
    .split(" ")
    .map((s) => s[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase() || "?";

export const roleLabel = (r: string) =>
  ({
    super_admin: "Super Admin",
    hr_manager: "HR Manager",
    dept_manager: "Department Manager",
    employee: "Employee",
  }[r] ?? r);

export const fmtDate = (d?: string | null) =>
  d ? new Date(d).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" }) : "—";

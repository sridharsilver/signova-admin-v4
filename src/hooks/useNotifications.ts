import { useState } from "react";

export interface Notification {
  id: string;
  type: string;
  title: string;
  body: string | null;
  link: string | null;
  read_at: string | null;
  created_at: string;
}

const mockNotifications: Notification[] = [
  { id: "n1", type: "leave", title: "Leave approved", body: "Your annual leave request has been approved.", link: null, read_at: null, created_at: new Date().toISOString() },
  { id: "n2", type: "announcement", title: "New policy update", body: "Remote work policy has been updated.", link: null, read_at: new Date().toISOString(), created_at: new Date(Date.now() - 86400000).toISOString() },
  { id: "n3", type: "document", title: "Document uploaded", body: "Employee Handbook v3 has been uploaded.", link: null, read_at: null, created_at: new Date(Date.now() - 172800000).toISOString() },
];

export function useNotifications() {
  const [items, setItems] = useState<Notification[]>(mockNotifications);

  const markAllRead = () => {
    setItems((prev) => prev.map((i) => ({ ...i, read_at: i.read_at ?? new Date().toISOString() })));
  };

  const unread = items.filter((i) => !i.read_at).length;
  return { items, unread, markAllRead, refresh: () => setItems(mockNotifications) };
}

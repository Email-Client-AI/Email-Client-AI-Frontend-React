import api from "../libs/axios";
import type { CategoryType, Email, EmailPageResponse } from "../types/email";

export const getListEmails = async (
  page: number = 1,
  size: number = 10,
  category: CategoryType
): Promise<EmailPageResponse> => {
  const res = await api.get<EmailPageResponse>(
    `/emails?page=${page}&size=${size}&category=${category.toUpperCase()}`
  );
  return res.data;
};

export const getEmailById = async (id: string): Promise<Email> => {
  const res = await api.get<Email>(`/emails/details/${id}`);
  return res.data;
};

export function formatReceivedDate(dateString: string): string {
  const now = new Date();
  const received = new Date(dateString);
  const diffMs = now.getTime() - received.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 60) return "Just now";
  if (diffMin < 60) return `${diffMin} minute${diffMin > 1 ? "s" : ""} ago`;
  if (diffHour < 24)
    return `${diffHour} hour${diffHour > 1 ? "s" : ""} ago`;
  if (diffDay === 1) return "Yesterday";
  if (diffDay < 7) return `${diffDay} days ago`;

  // If more than a week, show date like normal email
  return received.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric"
  });
}

export function formatFullDateTime(dateString: string): string {
  const date = new Date(dateString);

  return date.toLocaleString(undefined, {
    weekday: "short",   // Tue
    month: "short",     // Dec
    day: "numeric",     // 2
    year: "numeric",    // 2025
    hour: "2-digit",    // 10
    minute: "2-digit",  // 30
    hour12: true        // AM/PM
  });
}


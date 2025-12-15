import api from "../libs/axios";
import type { CategoryType, Email, EmailPageResponse, SendEmailRequest, Thread, Suggestion } from "../types/email";

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

export const getAllEmails = async (category: CategoryType): Promise<Email[]> => {
    if (['todo', 'inprogress', 'done', 'snoozed', 'removed'].includes(category)) {
        return getEmailsByStatus(category);
    }
    const res = await api.get<Email[]>(`/emails/all?category=${category.toUpperCase()}`);
    return res.data;
};

export const groupEmailsByThread = (emails: Email[]): Thread[] => {
    const threads: { [key: string]: Thread } = {};
    emails.forEach((email) => {
        if (!threads[email.threadId]) {
            threads[email.threadId] = {
                id: email.threadId,
                emails: [],
            };
        }
        threads[email.threadId].emails.push(email);
    });
    return Object.values(threads);
};

export const getAllEmailsAndGroupByThread = async (category: CategoryType): Promise<Thread[]> => {
    const emails = await getAllEmails(category);
    return groupEmailsByThread(emails);
};

export const getEmailById = async (id: string): Promise<Email> => {
  const res = await api.get<Email>(`/emails/details/${id}`);
  return res.data;
};

export const getAllEmailsByThread = async (threadId: string): Promise<Email[]> => {
    const res = await api.get<Email[]>(`/emails/thread/${threadId}`);
    return res.data;
};

export const sendEmail = async (payload: SendEmailRequest): Promise<void> => {
  await api.post("/emails/send", payload);
};

export const getEmailsByStatus = async (status: string): Promise<Email[]> => {
  const res = await api.get<Email[]>(`/emails/all?status=${status.toUpperCase()}`);
  return res.data;
};

export const updateEmailStatus = async (id: string, status: string): Promise<void> => {
  await api.patch(`/emails/${id}/status/${status.toUpperCase()}`);
};

export const snoozeEmail = async (id: string, until?: Date): Promise<void> => {
  await api.post(`/emails/${id}/snooze`, { until });
};

export const unsnoozeEmail = async (id: string): Promise<void> => {
  await api.post(`/emails/${id}/unsnooze`);
};

export const formatFileSize = (bytes?: number): string => {
  if (bytes === undefined || bytes === null) return '';
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};

// API Call to download attachment
export const downloadAttachment = async (emailId: string, attachmentId: string, fileName: string): Promise<void> => {
  try {
    // NOTE: Adjust the endpoint path to match your Backend Controller
    // Example: @GetMapping("/attachments/{id}")
    const response = await api.get(`/emails/${emailId}/attachments/${attachmentId}`, {
      responseType: 'blob', // Important: response must be treated as a file
    });

    // Create a temporary URL for the blob
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', fileName); // Force download with original filename
    document.body.appendChild(link);
    link.click();
    
    // Cleanup
    link.remove();
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Download failed", error);
    throw error;
  }
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


export const summarizeEmail = async (threadId: string): Promise<string> => {
  const res = await api.get<string>(`/emails/summarize`, {
    params: { threadId }
  });
  return res.data;
};

export const suggestEmails = async (query: string): Promise<Suggestion[]> => {
  const res = await api.get<Suggestion[]>(`/emails/suggest`, {
    params: { q: query }
  });
  return res.data;
};

export const searchEmails = async (query: string): Promise<Email[]> => {
  const res = await api.get<Email[]>(`/emails/search`, {
    params: { q: query }
  });
  return res.data;
};

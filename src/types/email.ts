export interface Email {
  id: string;
  gmailEmailId: string;
  userId: string;
  threadId: string;
  snippet: string;
  subject: string;
  senderEmail: string;
  receivedDate: string; // if you want Date: use Date and convert via new Date()
  bodyHtml: string;
  bodyText: string | null;
  recipientEmails: string[];
  labels: string[];
  attachments: EmailAttachment[];
}

export interface EmailAttachment {
    id: string;
    fileName?: string;
    mimeType?: string;
    size?: number;
    gmailAttachmentId?: string;
}

export interface EmailPageResponse {
  total: number;
  totalPages: number;
  currentPage: number;
  totalOverDue: number;
  emails: Email[];
}


export const CategoryType = {
  INBOX: "inbox",
  SENT: "sent",
  DRAFT: "draft",
  TRASH: "trash",
  SPAM: "spam",
  IMPORTANT: "important",
}

export type CategoryType = (typeof CategoryType)[keyof typeof CategoryType];
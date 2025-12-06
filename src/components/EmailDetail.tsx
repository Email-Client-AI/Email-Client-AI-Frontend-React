import React, { useMemo } from 'react';
import type { Thread, Email, EmailAttachment } from '../types/email';
import { formatFullDateTime, downloadAttachment, formatFileSize } from '../services/email-services';
import { useCompose } from '../contexts/ComposeContext';
import { toastService } from '../services/toast-services';

interface EmailDetailProps {
  thread?: Thread;
}

const EmailDetail: React.FC<EmailDetailProps> = ({ thread }) => {
  const { openCompose } = useCompose();

  // Sort emails by date (Oldest to Newest for conversation flow)
  const sortedEmails = useMemo(() => {
    if (!thread || !thread.emails) return [];
    return [...thread.emails].sort((a, b) =>
      new Date(a.receivedDate).getTime() - new Date(b.receivedDate).getTime()
    );
  }, [thread]);

  if (!thread || sortedEmails.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-background-light dark:bg-background-dark text-gray-500 dark:text-gray-400">
        <p>No conversation selected</p>
      </div>
    );
  }

  const mainSubject = sortedEmails[0].subject;

  // --- DOWNLOAD LOGIC ---
  const handleDownloadClick = async (emailId: string, attachmentId: string, fileName: string) => {
    try {
      // Assuming 'id' is what the backend needs. If it needs gmailAttachmentId, swap it here.
      await downloadAttachment(emailId, attachmentId, fileName);
    } catch (error) {
      toastService.error("Failed to download attachment.");
    }
  };

  // --- REPLY LOGIC ---
  const handleReply = (targetEmail: Email) => {
    let newSubject = targetEmail.subject;
    if (!newSubject.startsWith("Re:")) {
      newSubject = `Re: ${newSubject}`;
    }

    const dateStr = new Date(targetEmail.receivedDate).toLocaleString(undefined, {
      weekday: 'short', year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });

    const quoteHtml = `
      <p></p><p></p>
      <div class="gmail_quote">
          On ${dateStr}, ${targetEmail.senderEmail} wrote:
          <blockquote style="margin: 0 0 0 .8ex; border-left: 1px #ccc solid; padding-left: 1ex;">
              ${targetEmail.bodyHtml || targetEmail.bodyText || ""}
          </blockquote>
      </div>
    `;

    openCompose({
      to: targetEmail.senderEmail,
      subject: newSubject,
      body: quoteHtml,
      replyToId: targetEmail.id
    });
  };

  // --- FORWARD LOGIC ---
  const handleForward = (targetEmail: Email) => {
    let newSubject = targetEmail.subject;
    if (!newSubject.startsWith("Fwd:")) {
      newSubject = `Fwd: ${newSubject}`;
    }

    const dateStr = new Date(targetEmail.receivedDate).toLocaleString(undefined, {
      weekday: 'short', year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });

    const forwardHtml = `
      <p></p><p></p>
      <div class="gmail_quote">
          ---------- Forwarded message ---------<br>
          From: <strong>${targetEmail.senderEmail}</strong><br>
          Date: ${dateStr}<br>
          Subject: ${targetEmail.subject}<br>
          To: ${targetEmail.recipientEmails.join(', ')}<br>
          <br>
          ${targetEmail.bodyHtml || targetEmail.bodyText || ""}
      </div>
    `;

    openCompose({
      to: "",
      subject: newSubject,
      body: forwardHtml,
      forwardEmailId: targetEmail.id
    });
  };

  return (
    <main className="flex-1 flex flex-col overflow-y-auto bg-background-light dark:bg-background-dark">
      {/* Thread Header */}
      <div className="flex items-center justify-between border-b border-gray-200 p-6 dark:border-gray-800 sticky top-0 bg-background-light dark:bg-background-dark z-10">
        <h1 className="text-2xl font-bold truncate pr-4 text-gray-900 dark:text-gray-100">{mainSubject}</h1>
        <div className="flex items-center space-x-2 text-gray-500 dark:text-gray-400 shrink-0">
          <span className="text-sm border px-2 py-1 rounded bg-gray-100 dark:bg-gray-800 dark:border-gray-700">
            {sortedEmails.length} Messages
          </span>
          <button className="hover:text-primary p-2">
            <span className="material-icons-outlined text-xl">star_outline</span>
          </button>
        </div>
      </div>

      {/* Emails Conversation List */}
      <div className="flex-1 p-6 space-y-8">
        {sortedEmails.map((email: Email, index: number) => (
          <div
            key={email.id}
            className={`border rounded-lg p-6 shadow-sm transition-all ${index === sortedEmails.length - 1
              ? 'bg-white dark:bg-gray-900 border-primary/20 ring-1 ring-primary/10'
              : 'bg-gray-50/50 dark:bg-gray-800/30 border-gray-200 dark:border-gray-700'
              }`}
          >
            {/* Individual Email Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-700 dark:text-blue-300 font-bold text-sm">
                  {email.senderEmail.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-gray-100 text-sm">
                    {email.senderEmail}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    To: {email.recipientEmails.join(", ")}
                  </p>
                </div>
              </div>

              {/* Right Side: Date + Actions */}
              <div className="flex items-center space-x-3">
                <span className="text-xs text-gray-500 dark:text-gray-400 block">
                  {formatFullDateTime(email.receivedDate)}
                </span>
                <button
                  onClick={() => handleReply(email)}
                  className="p-1.5 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
                  title="Reply"
                >
                  <span className="material-icons-outlined text-lg">reply</span>
                </button>
                <button
                  onClick={() => handleForward(email)}
                  className="p-1.5 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
                  title="Forward"
                >
                  <span className="material-icons-outlined text-lg">forward</span>
                </button>
              </div>
            </div>

            {/* Individual Email Body */}
            <div className="prose prose-sm max-w-none text-gray-700 dark:prose-invert dark:text-gray-300 overflow-hidden break-words">
              {email.bodyHtml ? (
                <div dangerouslySetInnerHTML={{ __html: email.bodyHtml }} />
              ) : (
                <p className="whitespace-pre-wrap">{email.snippet || "Loading content..."}</p>
              )}
            </div>

            {/* Attachments Section (Updated) */}
            {email.attachments && email.attachments.length > 0 && (
              <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                <p className="text-xs font-bold text-gray-500 mb-3 uppercase tracking-wider">
                  Attachments ({email.attachments.length})
                </p>
                <div className="flex flex-wrap gap-3">
                  {email.attachments.map(att => (
                    <button
                      key={att.id}
                      onClick={() => handleDownloadClick(email.id, att.id, att.fileName || "unnamed")}
                      className="group flex items-center space-x-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-md px-3 py-2 hover:border-primary hover:shadow-sm transition-all text-left max-w-[250px]"
                      title={`Download ${att.fileName}`}
                    >
                      {/* Icon based on generic type */}
                      <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-full group-hover:bg-blue-50 dark:group-hover:bg-blue-900/30 transition-colors">
                        <span className="material-icons-outlined text-gray-500 group-hover:text-primary text-xl">
                          description
                        </span>
                      </div>

                      <div className="overflow-hidden">
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-200 truncate">
                          {att.fileName || "Unnamed File"}
                        </p>
                        <p className="text-xs text-gray-400 dark:text-gray-500">
                          {formatFileSize(att.size)}
                        </p>
                      </div>

                      {/* Download Icon on Hover */}
                      <span className="material-icons-outlined text-gray-400 group-hover:text-primary opacity-0 group-hover:opacity-100 transition-opacity text-lg ml-auto">
                        download
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Footer Actions */}
      <div className="border-t border-gray-200 p-6 dark:border-gray-800 bg-background-light dark:bg-background-dark">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => handleReply(sortedEmails[sortedEmails.length - 1])}
            className="flex items-center space-x-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700"
          >
            <span className="material-icons-outlined text-base">reply</span>
            <span>Reply</span>
          </button>
          <button
            onClick={() => handleForward(sortedEmails[sortedEmails.length - 1])}
            className="flex items-center space-x-2 rounded-md border border-gray-300 bg-background-light px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            <span className="material-icons-outlined text-base">forward</span>
            <span>Forward</span>
          </button>
        </div>
      </div>
    </main>
  );
};

export default EmailDetail;
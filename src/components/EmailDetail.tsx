import React, { useMemo } from 'react';
import type { Thread, Email } from '../types/email';
import { formatFullDateTime } from '../services/email-services';

interface EmailDetailProps {
  thread?: Thread;
}

const EmailDetail: React.FC<EmailDetailProps> = ({ thread }) => {
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

  // Use the subject from the first email in the thread as the main subject
  const mainSubject = sortedEmails[0].subject;

  return (
    <main className="flex-1 flex flex-col overflow-y-auto bg-background-light dark:bg-background-dark">
      {/* Thread Header */}
      <div className="flex items-center justify-between border-b border-gray-200 p-6 dark:border-gray-800 sticky top-0 bg-background-light dark:bg-background-dark z-10">
        <h1 className="text-2xl font-bold truncate pr-4">{mainSubject}</h1>
        <div className="flex items-center space-x-2 text-gray-500 dark:text-gray-400 shrink-0">
          <span className="text-sm border px-2 py-1 rounded bg-gray-100 dark:bg-gray-800 dark:border-gray-700">
            {sortedEmails.length} Messages
          </span>
          <button className="hover:text-primary p-2">
            <span className="material-icons-outlined text-xl">star_outline</span>
          </button>
        </div>
      </div>

      <div className="flex-1 p-6 space-y-8">
        {sortedEmails.map((email: Email, index: number) => (
          <div
            key={email.id}
            className={`border rounded-lg p-6 shadow-sm transition-all ${
              // Highlight the last email slightly to show it's the latest
              index === sortedEmails.length - 1
                ? 'bg-white dark:bg-gray-900 border-primary/20 ring-1 ring-primary/10'
                : 'bg-gray-50/50 dark:bg-gray-800/30 border-gray-200 dark:border-gray-700'
              }`}
          >
            {/* Individual Email Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                {/* Avatar Placeholder */}
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
              <div className="text-right">
                <span className="text-xs text-gray-500 dark:text-gray-400 block">
                  {formatFullDateTime(email.receivedDate)}
                </span>
              </div>
            </div>

            {/* Individual Email Body */}
            <div className="prose prose-sm max-w-none text-gray-700 dark:prose-invert dark:text-gray-300 overflow-hidden">
              {/* Check if bodyHtml exists, otherwise show a placeholder or snippet */}
              {email.bodyHtml ? (
                <div dangerouslySetInnerHTML={{ __html: email.bodyHtml }} />
              ) : (
                <p className="whitespace-pre-wrap">{email.snippet || "Loading content..."}</p>
              )}
            </div>

            {/* Attachments (Optional UI) */}
            {email.attachments && email.attachments.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <p className="text-xs font-medium text-gray-500 mb-2">Attachments ({email.attachments.length})</p>
                <div className="flex flex-wrap gap-2">
                  {email.attachments.map(att => (
                    <span key={att.id} className="text-xs bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded">
                      {att.fileName}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Footer Actions (Reply to Thread) */}
      <div className="border-t border-gray-200 p-6 dark:border-gray-800 bg-background-light dark:bg-background-dark">
        <div className="flex items-center space-x-2">
          <button className="flex items-center space-x-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700">
            <span className="material-icons-outlined text-base">reply_all</span>
            <span>Reply All</span>
          </button>
          <button className="flex items-center space-x-2 rounded-md border border-gray-300 bg-background-light px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700">
            <span className="material-icons-outlined text-base">forward</span>
            <span>Forward</span>
          </button>
        </div>
      </div>
    </main>
  );
};

export default EmailDetail;
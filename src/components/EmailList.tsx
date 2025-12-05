import React from 'react';
import SidebarItem from './SideBarItem';
import type { Thread } from '../types/email';

interface EmailListProps {
  threads: Thread[]; // Changed from Email[] to Thread[]
  activeThreadId: string;
  onThreadSelect: (id: string) => void;

  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const EmailList: React.FC<EmailListProps> = ({
  threads,
  activeThreadId,
  onThreadSelect,

  page,
  totalPages,
  onPageChange
}) => {
  return (
    <aside className="w-96 shrink-0 overflow-y-auto border-r border-gray-200 bg-background-light dark:border-gray-800 dark:bg-background-dark flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800 shrink-0 sticky top-0 bg-inherit z-10">
        <h2 className="text-lg font-semibold">Inbox</h2>

        {/* Pagination */}
        {totalPages > 0 && (
          <div className="flex items-center gap-2">
            <button
              disabled={page === 0}
              onClick={() => onPageChange(page - 1)}
              className="px-2 py-1 text-sm border rounded disabled:opacity-40 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              Prev
            </button>

            <span className="text-sm font-medium">
              {page + 1} / {totalPages}
            </span>

            <button
              disabled={page >= totalPages - 1}
              onClick={() => onPageChange(page + 1)}
              className="px-2 py-1 text-sm border rounded disabled:opacity-40 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              Next
            </button>
          </div>
        )}
      </div>

      <ul className="flex-1">
        {threads.map((thread) => {
          // Find the most recent email to display in the sidebar preview
          // Assuming the backend might not return them sorted, we sort here just in case,
          // or pick the last one if we assume they are appended.
          // Let's sort to be safe: Latest date first for the sidebar snippet.
          const latestEmail = [...thread.emails].sort(
            (a, b) => new Date(b.receivedDate).getTime() - new Date(a.receivedDate).getTime()
          )[0];

          if (!latestEmail) return null;

          return (
            <SidebarItem
              key={thread.id}
              email={latestEmail} // Pass the latest email to represent the thread
              active={activeThreadId === thread.id}
              onClick={() => onThreadSelect(thread.id)}
            />
          );
        })}
      </ul>
    </aside>
  );
};

export default EmailList;
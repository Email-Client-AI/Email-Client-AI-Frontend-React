import React from 'react';
import SidebarItem from './SideBarItem';
import type { Email } from '../types/email';

interface EmailListProps {
  emails: Email[];
  activeEmailId: string;
  onEmailSelect: (id: string) => void;

  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const EmailList: React.FC<EmailListProps> = ({
  emails,
  activeEmailId,
  onEmailSelect,

  page,
  totalPages,
  onPageChange
}) => {
  return (
    <aside className="w-96 shrink-0 overflow-y-auto border-r border-gray-200 bg-background-light dark:border-gray-800 dark:bg-background-dark">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
        <h2 className="text-lg font-semibold">Inbox</h2>

        {/* Pagination */}
        {totalPages != 0 && (
          <div className="flex items-center gap-2">
            <button
              disabled={page === 1}
              onClick={() => onPageChange(page - 1)}
              className="px-2 py-1 text-sm border rounded disabled:opacity-40"
            >
              Prev
            </button>

            <span className="text-sm font-medium">
              {page} / {totalPages}
            </span>

            <button
              disabled={page === totalPages}
              onClick={() => onPageChange(page + 1)}
              className="px-2 py-1 text-sm border rounded disabled:opacity-40"
            >
              Next
            </button>
          </div>
        )}
      </div>

      <ul>
        {emails.map((email) => (
          <SidebarItem
            key={email.id}
            email={email}
            active={activeEmailId === email.id}
            onClick={() => onEmailSelect(email.id)}
          />
        ))}
      </ul>
    </aside>
  );
};

export default EmailList;

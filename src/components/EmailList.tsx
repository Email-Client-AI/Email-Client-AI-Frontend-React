import React from 'react';
import SidebarItem from './SideBarItem';

interface Email {
  id: number;
  name: string;
  time: string;
  subject: string;
  snippet: string;
}

interface EmailListProps {
  emails: Email[];
  activeEmail: number;
  onEmailSelect: (id: number) => void;
}

const EmailList: React.FC<EmailListProps> = ({ emails, activeEmail, onEmailSelect }) => {
  return (
    <aside className="w-96 shrink-0 overflow-y-auto border-r border-gray-200 bg-background-light dark:border-gray-800 dark:bg-background-dark">
      <div className="flex items-center justify-between p-4">
        <h2 className="text-lg font-semibold">Inbox</h2>
        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
          2 Unread
        </span>
      </div>
      <ul>
        {emails.map((email) => (
          <SidebarItem
            key={email.id}
            {...email}
            active={activeEmail === email.id}
            onClick={() => onEmailSelect(email.id)}
          />
        ))}
      </ul>
    </aside>
  );
};

export default EmailList;

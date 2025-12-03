import React from 'react';

interface SidebarItemProps {
  name: string;
  time: string;
  subject: string;
  snippet: string;
  active: boolean;
  onClick: () => void;
}

const SidebarItem: React.FC<SidebarItemProps> = ({ 
  name, 
  time, 
  subject, 
  snippet, 
  active, 
  onClick 
}) => {
  return (
    <li
      onClick={onClick}
      className={`border-l-4 p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer ${
        active
          ? "border-primary bg-blue-50 dark:bg-gray-900"
          : "border-transparent"
      }`}
    >
      <div className="flex items-start space-x-3">
        <div className="flex-1 overflow-hidden">
          <div className="flex items-baseline justify-between">
            <p className={`truncate font-semibold ${active ? "text-gray-900 dark:text-gray-100" : "text-gray-700 dark:text-gray-300"}`}>
              {name}
            </p>
            <p className={`text-xs ${active ? "font-medium text-primary" : "text-gray-500 dark:text-gray-400"}`}>
              {time}
            </p>
          </div>
          <p className="truncate text-sm font-semibold text-gray-900 dark:text-gray-100">
            {subject}
          </p>
          <p className="truncate text-sm text-gray-600 dark:text-gray-400">
            {snippet}
          </p>
        </div>
      </div>
    </li>
  );
}

export default SidebarItem;
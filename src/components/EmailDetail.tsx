import React from 'react';
import type { Email } from '../types/email';
import { formatFullDateTime } from '../services/email-services';

interface EmailDetailProps {
  email?: Email;
}

const EmailDetail: React.FC<EmailDetailProps> = ({ email }) => {
  // In a real app, we might fetch the full email body based on the ID.
  // For now, we'll use the static content from the original Dashboard, 
  // but ideally this component should receive the full email data.
  // Since the original code had hardcoded body, I will keep it hardcoded for now
  // but make it clear it belongs to the selected email context if possible.
  // However, the prompt asked to extract component, so I will move the main content here.
  if(!email) {
    return <div className="flex-1 flex flex-col overflow-y-auto bg-background-light dark:bg-background-dark">
    <p className="text-center text-gray-500 dark:text-gray-400">No email selected</p>
    </div>;
  }

  return (
    <main className="flex-1 flex flex-col overflow-y-auto bg-background-light dark:bg-background-dark">
      <div className="flex items-center justify-between border-b border-gray-200 p-6 dark:border-gray-800">
        <h1 className="text-2xl font-bold">{email.subject}</h1>
        <div className="flex items-center space-x-4 text-gray-500 dark:text-gray-400">
          <span className="text-sm">{formatFullDateTime(email.receivedDate)}</span>
          <button className="hover:text-primary">
            <span className="material-icons-outlined text-xl">star_outline</span>
          </button>
          <button className="hover:text-primary">
            <span className="material-icons-outlined text-xl">reply</span>
          </button>
        </div>
      </div>
      
      <div className="flex-1 p-6">
        <div className="flex items-center space-x-4 border-b border-gray-200 pb-6 dark:border-gray-800">
          
          <div>
            <p className="font-semibold text-gray-900 dark:text-gray-100">
              {email.senderEmail}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              To: {email.recipientEmails.join(", ")}
            </p>
          </div>
        </div>

        {/* Email Body */}
        <div className="prose prose-sm max-w-none py-8 text-gray-700 dark:prose-invert dark:text-gray-300">
          <div
            className="prose prose-sm max-w-none py-8 text-gray-700 dark:prose-invert dark:text-gray-300"
            dangerouslySetInnerHTML={{ __html: email.bodyHtml }}
          />
        </div>

        {/* Attachments */}
        {/* <div className="mt-8">
          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">
            Attachments
          </h3>
          <div className="mt-2 flex space-x-4">
            <div className="flex items-center space-x-2 rounded-md border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-800">
              <span className="material-icons-outlined text-primary">
                description
              </span>
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {email.attachments[0].fileName}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {email.attachments[0].size}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2 rounded-md border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-800">
              <span className="material-icons-outlined text-primary">
                description
              </span>
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {email.attachments[1].fileName}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {email.attachments[1].size}
                </p>
              </div>
            </div>
          </div>
        </div> */}
      </div>

      {/* Footer Actions */}
      <div className="border-t border-gray-200 p-6 dark:border-gray-800">
        <div className="flex items-center space-x-2">
          <button className="flex items-center space-x-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700">
            <span className="material-icons-outlined text-base">reply</span>
            <span>Reply</span>
          </button>
          <button className="flex items-center space-x-2 rounded-md border border-gray-300 bg-background-light px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700">
            <span className="material-icons-outlined text-base">
              forward
            </span>
            <span>Forward</span>
          </button>
        </div>
      </div>
    </main>
  );
};

export default EmailDetail;

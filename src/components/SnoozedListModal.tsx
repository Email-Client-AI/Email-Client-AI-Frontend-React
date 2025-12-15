import React, { useEffect, useState } from "react";
import { EmailStatus, type Email } from "../types/email";
import { getEmailsByStatus, unsnoozeEmail } from "../services/email-services";
import { formatReceivedDate } from "../services/email-services";

interface SnoozedListModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const SnoozedListModal: React.FC<SnoozedListModalProps> = ({ isOpen, onClose }) => {
    const [emails, setEmails] = useState<Email[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const fetchSnoozedEmails = async () => {
        setIsLoading(true);
        try {
            const data = await getEmailsByStatus(EmailStatus.SNOOZED);
            setEmails(data);
        } catch (error) {
            console.error("Failed to fetch snoozed emails", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (isOpen) {
            fetchSnoozedEmails();
        }
    }, [isOpen]);

    const handleUnsnooze = async (id: string) => {
        try {
            await unsnoozeEmail(id);
            // Remove from local list
            setEmails((prev) => prev.filter((e) => e.id !== id));
        } catch (error) {
            console.error("Failed to unsnooze email", error);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="flex h-[80vh] w-full max-w-2xl flex-col rounded-lg bg-white shadow-xl dark:bg-gray-800">
                <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4 dark:border-gray-700">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                        Snoozed Emails
                    </h3>
                    <button
                        onClick={onClose}
                        className="rounded-full p-1 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
                    >
                        <span className="material-icons-outlined">close</span>
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6">
                    {isLoading ? (
                        <div className="flex justify-center py-8">
                            <span className="text-gray-500">Loading...</span>
                        </div>
                    ) : emails.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                            <span className="material-icons-outlined mb-2 text-4xl text-gray-300">
                                snooze
                            </span>
                            <p>No snoozed emails found</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {emails.map((email) => (
                                <div
                                    key={email.id}
                                    className="flex items-center justify-between rounded-lg border border-gray-200 p-4 dark:border-gray-700"
                                >
                                    <div className="flex-1 pr-4">
                                        <div className="mb-1 flex items-center gap-2">
                                            <span className="font-semibold text-gray-900 dark:text-gray-100">
                                                {email.senderEmail}
                                            </span>
                                            <span className="text-xs text-gray-500">
                                                {formatReceivedDate(email.receivedDate)}
                                            </span>
                                        </div>
                                        <h4 className="text-sm font-medium text-gray-800 dark:text-gray-200">
                                            {email.subject}
                                        </h4>
                                        <p className="line-clamp-1 text-xs text-gray-500 dark:text-gray-400">
                                            {email.snippet}
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => handleUnsnooze(email.id)}
                                        className="shrink-0 rounded-md bg-white px-3 py-1.5 text-sm font-medium text-gray-700 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-200 dark:ring-gray-600 dark:hover:bg-gray-600"
                                    >
                                        Unsnooze
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SnoozedListModal;

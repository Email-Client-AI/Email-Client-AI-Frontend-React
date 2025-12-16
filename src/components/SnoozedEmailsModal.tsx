import React, { useEffect, useState } from "react";
import type { Email } from "../types/email";
import {
    getVisibleStatuses,
    getEmailsByStatus,
    unsnoozeEmail,
    formatReceivedDate,
    getAllStatuses,
} from "../services/email-services";

interface SnoozedEmailsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const SnoozedEmailsModal: React.FC<SnoozedEmailsModalProps> = ({ isOpen, onClose }) => {
    const [emails, setEmails] = useState<Email[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchSnoozedEmails = async () => {
        setLoading(true);
        try {
            // 1. Find "Snoozed" status ID
            const statuses = await getAllStatuses();
            console.log(statuses);
            const snoozedStatus = statuses.find(
                (s) => s.name.toLowerCase() === "snoozed"
            );

            if (snoozedStatus) {
                // 2. Fetch emails for that status
                const result = await getEmailsByStatus(snoozedStatus.id);
                setEmails(result);
            } else {
                console.warn("Snoozed status not found");
                setEmails([]);
            }
        } catch (error) {
            console.error("Failed to fetch snoozed emails", error);
        } finally {
            setLoading(false);
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
            // Refresh list
            fetchSnoozedEmails();
        } catch (error) {
            console.error("Failed to unsnooze email", error);
        }
    };

    const handleOpenEmail = (threadId: string) => {
        const gmailLink = `https://mail.google.com/mail/u/0/#inbox/${threadId}`;
        window.open(gmailLink, "_blank");
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="flex h-[80vh] w-[600px] flex-col rounded-lg bg-white shadow-xl dark:bg-gray-800">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-gray-200 p-4 dark:border-gray-700">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                        Snoozed Emails
                    </h2>
                    <button
                        onClick={onClose}
                        className="rounded-full p-1 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                        <span className="material-icons-outlined">close</span>
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-4">
                    {loading ? (
                        <div className="flex h-full items-center justify-center">
                            <span className="text-gray-500">Loading...</span>
                        </div>
                    ) : emails.length === 0 ? (
                        <div className="flex h-full items-center justify-center text-gray-500">
                            No snoozed emails found.
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {emails.map((email) => (
                                <div
                                    key={email.id}
                                    className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800"
                                >
                                    <div className="mb-2 flex items-start justify-between">
                                        <div>
                                            <div className="font-semibold text-gray-900 dark:text-gray-100">
                                                {email.senderEmail}
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                {formatReceivedDate(email.receivedDate)}
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleUnsnooze(email.id)}
                                                className="rounded px-2 py-1 text-xs font-medium text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20"
                                            >
                                                Unsnooze
                                            </button>
                                            <button
                                                onClick={() => handleOpenEmail(email.threadId)}
                                                className="rounded px-2 py-1 text-xs font-medium text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
                                            >
                                                Open
                                            </button>
                                        </div>
                                    </div>
                                    <h4 className="mb-1 text-sm font-medium text-gray-800 dark:text-gray-200">
                                        {email.subject}
                                    </h4>
                                    <p className="line-clamp-2 text-xs text-gray-500 dark:text-gray-400">
                                        {email.snippet}
                                    </p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SnoozedEmailsModal;

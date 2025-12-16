import React, { useState } from "react";
import type { Email } from "../types/email";
import { formatReceivedDate, summarizeEmail } from "../services/email-services";

interface KanbanCardProps {
    email: Email;
    onRemove: (id: string) => void;
    onSnooze: (id: string) => void;
}

const KanbanCard: React.FC<KanbanCardProps> = ({ email, onRemove, onSnooze }) => {
    const [showSummary, setShowSummary] = useState(false);
    const [summary, setSummary] = useState<string | null>(null);
    const [loadingSummary, setLoadingSummary] = useState(false);
    const [showMenu, setShowMenu] = useState(false);

    const handleOpenEmail = () => {
        // Construct Gmail link
        // Using threadId or gmailEmailId. Usually opening by threadId is safer for context.
        // Format: https://mail.google.com/mail/u/0/#inbox/threadId
        const gmailLink = `https://mail.google.com/mail/u/0/#inbox/${email.threadId}`;
        window.open(gmailLink, "_blank");
    };

    const handleSummarize = async () => {
        if (showSummary) {
            setShowSummary(false);
            return;
        }

        setShowSummary(true);
        if (!summary) {
            setLoadingSummary(true);
            try {
                const result = await summarizeEmail(email.threadId);
                setSummary(result);
            } catch (error) {
                console.error("Failed to summarize email", error);
                setSummary("Failed to load summary.");
            } finally {
                setLoadingSummary(false);
            }
        }
    };

    return (
        <div className="relative border-b border-gray-200 bg-white p-4 transition-shadow hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700/50">
            {/* Header */}
            <div className="mb-2 flex items-start justify-between">
                <div className="flex flex-col">
                    <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                        {email.senderEmail}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                        {formatReceivedDate(email.receivedDate)}
                    </span>
                </div>

                {/* Menu Trigger */}
                <div className="relative">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            setShowMenu(!showMenu);
                        }}
                        className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700"
                    >
                        <span className="material-icons-outlined text-lg">more_horiz</span>
                    </button>

                    {/* Dropdown Menu */}
                    {showMenu && (
                        <div className="absolute right-0 top-8 z-10 w-32 rounded-md border border-gray-200 bg-white py-1 shadow-lg dark:border-gray-700 dark:bg-gray-800">
                            <button
                                onClick={() => {
                                    setShowMenu(false);
                                    onSnooze(email.id);
                                }}
                                className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700"
                            >
                                Snooze
                            </button>
                            <button
                                onClick={() => {
                                    setShowMenu(false);
                                    onRemove(email.id);
                                }}
                                className="block w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700"
                            >
                                Remove
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Body */}
            <h4 className="mb-1 text-sm font-medium text-gray-800 dark:text-gray-200 line-clamp-1">
                {email.subject}
            </h4>
            <p className="mb-3 text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
                {email.snippet}
            </p>

            {/* Summary Section */}
            {showSummary && (
                <div className="mb-3 rounded bg-blue-50 p-2 text-xs text-blue-800 dark:bg-blue-900/30 dark:text-blue-200">
                    {loadingSummary ? (
                        <span className="flex items-center gap-2">
                            <span className="animate-spin h-3 w-3 border-2 border-blue-600 border-t-transparent rounded-full"></span>
                            Generating summary...
                        </span>
                    ) : (
                        <strong>AI Summary: {summary}</strong>
                    )}
                </div>
            )}

            {/* Footer Actions */}
            <div className="flex items-center justify-between gap-2">
                <button
                    onClick={handleSummarize}
                    className="flex items-center gap-1 rounded px-2 py-1 text-xs font-medium text-primary hover:bg-blue-50 dark:hover:bg-blue-900/20"
                >
                    <span className="material-icons-outlined text-[16px]">auto_awesome</span>
                    {showSummary ? "Hide Summary" : "Summarize"}
                </button>
                <button
                    onClick={handleOpenEmail}
                    className="rounded border border-gray-300 px-2 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                    Open Email
                </button>
            </div>

            {/* Overlay to close menu when clicking outside */}
            {showMenu && (
                <div
                    className="fixed inset-0 z-0"
                    onClick={() => setShowMenu(false)}
                />
            )}
        </div>
    );
};

export default KanbanCard;

import React from "react";
import type { Email, EmailStatus } from "../types/email";
import KanbanCard from "./KanbanCard";

interface KanbanColumnProps {
    title: string;
    status: EmailStatus | "inbox";
    emails: Email[];
    onDrop: (e: React.DragEvent, status: EmailStatus | "inbox") => void;
    onRemove: (id: string) => void;
    onSnooze: (id: string) => void;
}

const KanbanColumn: React.FC<KanbanColumnProps> = ({
    title,
    status,
    emails,
    onDrop,
    onRemove,
    onSnooze,
}) => {
    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        onDrop(e, status);
    };

    return (
        <div
            className="flex h-full flex-1 flex-col rounded-lg bg-gray-100 dark:bg-gray-900"
            onDragOver={handleDragOver}
            onDrop={handleDrop}
        >
            <div className="mb-4 flex items-center justify-between p-4 pb-0">
                <h3 className="font-semibold text-gray-700 dark:text-gray-200">{title}</h3>
                <span className="rounded-full bg-gray-200 px-2 py-0.5 text-xs font-medium text-gray-600 dark:bg-gray-700 dark:text-gray-300">
                    {emails.length}
                </span>
            </div>

            <div className="flex-1 overflow-y-auto px-0 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
                {emails.map((email) => (
                    <div
                        key={email.id}
                        draggable
                        onDragStart={(e) => {
                            e.dataTransfer.setData("emailId", email.id);
                            e.dataTransfer.effectAllowed = "move";
                        }}
                        className="mb-2 border-[0.5px]"
                    >
                        <KanbanCard email={email} onRemove={onRemove} onSnooze={onSnooze} />
                    </div>
                ))}
                {emails.length === 0 && (
                    <div className="mt-10 text-center text-sm text-gray-400">
                        No emails
                    </div>
                )}
            </div>
        </div>
    );
};

export default KanbanColumn;

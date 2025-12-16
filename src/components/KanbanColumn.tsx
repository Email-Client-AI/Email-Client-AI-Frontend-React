import React, { useState, useMemo, useRef, useEffect } from "react";
import type { Email, Status } from "../types/email";
import KanbanCard from "./KanbanCard";
import { FilterModal } from "./StatusModals";

interface KanbanColumnProps {
    status: Status;
    emails: Email[];
    onDrop: (e: React.DragEvent, statusId: number) => void;
    onRemove: (id: string) => void;
    onSnooze: (id: string) => void;
    onInsertLeft: () => void;
    onInsertRight: () => void;
    onRename: () => void;
    onDelete: () => void;
}

const KanbanColumn: React.FC<KanbanColumnProps> = ({
    status,
    emails,
    onDrop,
    onRemove,
    onSnooze,
    onInsertLeft,
    onInsertRight,
    onRename,
    onDelete,
}) => {
    const [menuOpen, setMenuOpen] = useState(false);
    const [filterOpen, setFilterOpen] = useState(false);
    const [sortDesc, setSortDesc] = useState(true); // Default newest first
    const [filters, setFilters] = useState({ unread: false, hasAttachment: false });

    const menuRef = useRef<HTMLDivElement>(null);

    // Close menu when clicking outside
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                setMenuOpen(false);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        onDrop(e, status.id);
    };

    // Filter and Sort Logic
    const displayedEmails = useMemo(() => {
        let result = [...emails];

        // Filter
        if (filters.unread) {
            result = result.filter(e => e.labels.includes("UNREAD"));
        }
        if (filters.hasAttachment) {
            result = result.filter(e => e.attachments && e.attachments.length > 0);
        }

        // Sort
        result.sort((a, b) => {
            const dateA = new Date(a.receivedDate).getTime();
            const dateB = new Date(b.receivedDate).getTime();
            return sortDesc ? dateB - dateA : dateA - dateB;
        });

        return result;
    }, [emails, filters, sortDesc]);

    return (
        <div
            className="flex h-full flex-1 flex-shrink-0 flex-col rounded-lg bg-gray-100 dark:bg-gray-900"
            onDragOver={handleDragOver}
            onDrop={handleDrop}
        >
            {/* Header */}
            <div className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center space-x-2 overflow-hidden">
                    <h3 className="font-semibold text-gray-700 dark:text-gray-200 truncate" title={status.name}>
                        {status.name}
                    </h3>
                    <span className="rounded-full bg-gray-200 px-2 py-0.5 text-xs font-medium text-gray-600 dark:bg-gray-700 dark:text-gray-300">
                        {emails.length}
                    </span>
                </div>

                <div className="flex items-center space-x-1">
                    {/* Sort Button */}
                    <button
                        onClick={() => setSortDesc(!sortDesc)}
                        className="p-1 text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                        title={sortDesc ? "Newest first" : "Oldest first"}
                    >
                        <span className="material-icons-outlined text-sm">
                            {sortDesc ? "arrow_downward" : "arrow_upward"}
                        </span>
                    </button>

                    {/* Filter Button */}
                    <button
                        onClick={() => setFilterOpen(true)}
                        className={`p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded ${filters.unread || filters.hasAttachment ? "text-primary" : "text-gray-500"
                            }`}
                        title="Filter"
                    >
                        <span className="material-icons-outlined text-sm">filter_list</span>
                    </button>

                    {/* Menu Button */}
                    <div className="relative" ref={menuRef}>
                        <button
                            onClick={() => setMenuOpen(!menuOpen)}
                            className="p-1 text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                        >
                            <span className="material-icons-outlined text-sm">more_vert</span>
                        </button>

                        {menuOpen && (
                            <div className="absolute right-0 top-full mt-1 w-40 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 z-10 dark:bg-gray-800 dark:ring-gray-700">
                                <div className="py-1">
                                    <button
                                        onClick={() => {
                                            onRename();
                                            setMenuOpen(false);
                                        }}
                                        className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700"
                                    >
                                        Rename
                                    </button>
                                    <button
                                        onClick={() => {
                                            onInsertLeft();
                                            setMenuOpen(false);
                                        }}
                                        className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700"
                                    >
                                        Insert Left
                                    </button>
                                    <button
                                        onClick={() => {
                                            onInsertRight();
                                            setMenuOpen(false);
                                        }}
                                        className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700"
                                    >
                                        Insert Right
                                    </button>
                                    <button
                                        onClick={() => {
                                            onDelete();
                                            setMenuOpen(false);
                                        }}
                                        className="block w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700"
                                    >
                                        Remove
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Email List */}
            <div className="flex-1 overflow-y-auto p-2 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
                {displayedEmails.map((email) => (
                    <div
                        key={email.id}
                        draggable
                        onDragStart={(e) => {
                            e.dataTransfer.setData("emailId", email.id);
                            e.dataTransfer.effectAllowed = "move";
                        }}
                        className="mb-2"
                    >
                        <KanbanCard email={email} onRemove={onRemove} onSnooze={onSnooze} />
                    </div>
                ))}
                {displayedEmails.length === 0 && (
                    <div className="mt-10 text-center text-sm text-gray-400">
                        No emails
                    </div>
                )}
            </div>

            <FilterModal
                isOpen={filterOpen}
                onClose={() => setFilterOpen(false)}
                onApply={(newFilters) => setFilters(newFilters)}
                currentFilters={filters}
            />
        </div>
    );
};

export default KanbanColumn;

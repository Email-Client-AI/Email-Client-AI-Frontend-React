import React, { useState, useEffect } from "react";
import type { Status } from "../types/email";

interface RenameStatusModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (newName: string) => void;
    initialName: string;
}

export const RenameStatusModal: React.FC<RenameStatusModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    initialName,
}) => {
    const [name, setName] = useState(initialName);

    useEffect(() => {
        setName(initialName);
    }, [initialName, isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="w-96 rounded-lg bg-white p-6 shadow-lg dark:bg-gray-800">
                <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100">
                    Rename Column
                </h3>
                <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="mb-4 w-full rounded-md border border-gray-300 p-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    autoFocus
                />
                <div className="flex justify-end gap-2">
                    <button
                        onClick={onClose}
                        className="rounded-md px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={() => {
                            if (name.trim()) onConfirm(name);
                            onClose();
                        }}
                        className="rounded-md bg-primary px-4 py-2 text-sm text-white hover:bg-blue-600"
                    >
                        Save
                    </button>
                </div>
            </div>
        </div>
    );
};

interface DeleteStatusModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (moveToId: number) => void;
    statuses: Status[];
    statusToDeleteId: number;
}

export const DeleteStatusModal: React.FC<DeleteStatusModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    statuses,
    statusToDeleteId,
}) => {
    // Default to the first available status that isn't the one being deleted
    const availableStatuses = statuses.filter((s) => s.id !== statusToDeleteId);
    const [moveToId, setMoveToId] = useState<number>(
        availableStatuses.length > 0 ? availableStatuses[0].id : -1
    );

    useEffect(() => {
        if (availableStatuses.length > 0) {
            setMoveToId(availableStatuses[0].id);
        }
    }, [statusToDeleteId, statuses]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="w-96 rounded-lg bg-white p-6 shadow-lg dark:bg-gray-800">
                <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100">
                    Delete Column
                </h3>
                <p className="mb-4 text-sm text-gray-600 dark:text-gray-300">
                    Emails in this column must be moved to another column.
                </p>

                {availableStatuses.length > 0 ? (
                    <div className="mb-6">
                        <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Move emails to:
                        </label>
                        <select
                            value={moveToId}
                            onChange={(e) => setMoveToId(Number(e.target.value))}
                            className="w-full rounded-md border border-gray-300 p-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                        >
                            {availableStatuses.map((s) => (
                                <option key={s.id} value={s.id}>
                                    {s.name}
                                </option>
                            ))}
                        </select>
                    </div>
                ) : (
                    <p className="mb-4 text-red-500">No other columns available to move emails to.</p>
                )}

                <div className="flex justify-end gap-2">
                    <button
                        onClick={onClose}
                        className="rounded-md px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={() => {
                            if (moveToId !== -1) onConfirm(moveToId);
                            onClose();
                        }}
                        disabled={moveToId === -1}
                        className="rounded-md bg-red-600 px-4 py-2 text-sm text-white hover:bg-red-700 disabled:opacity-50"
                    >
                        Delete
                    </button>
                </div>
            </div>
        </div>
    );
};

interface FilterModalProps {
    isOpen: boolean;
    onClose: () => void;
    onApply: (filters: { unread: boolean; hasAttachment: boolean }) => void;
    currentFilters: { unread: boolean; hasAttachment: boolean };
}

export const FilterModal: React.FC<FilterModalProps> = ({
    isOpen,
    onClose,
    onApply,
    currentFilters,
}) => {
    const [unread, setUnread] = useState(currentFilters.unread);
    const [hasAttachment, setHasAttachment] = useState(currentFilters.hasAttachment);

    useEffect(() => {
        setUnread(currentFilters.unread);
        setHasAttachment(currentFilters.hasAttachment);
    }, [currentFilters, isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="w-80 rounded-lg bg-white p-6 shadow-lg dark:bg-gray-800">
                <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100">
                    Filter Emails
                </h3>

                <div className="space-y-3">
                    <label className="flex items-center space-x-2">
                        <input
                            type="checkbox"
                            checked={unread}
                            onChange={(e) => setUnread(e.target.checked)}
                            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                        />
                        <span className="text-gray-700 dark:text-gray-300">Unread only</span>
                    </label>
                    <label className="flex items-center space-x-2">
                        <input
                            type="checkbox"
                            checked={hasAttachment}
                            onChange={(e) => setHasAttachment(e.target.checked)}
                            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                        />
                        <span className="text-gray-700 dark:text-gray-300">Has attachment</span>
                    </label>
                </div>

                <div className="mt-6 flex justify-end gap-2">
                    <button
                        onClick={onClose}
                        className="rounded-md px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={() => {
                            onApply({ unread, hasAttachment });
                            onClose();
                        }}
                        className="rounded-md bg-primary px-4 py-2 text-sm text-white hover:bg-blue-600"
                    >
                        Apply
                    </button>
                </div>
            </div>
        </div>
    );
};

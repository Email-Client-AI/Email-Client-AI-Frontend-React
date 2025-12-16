import React, { useEffect, useState, useMemo } from "react";
import { type Email, type Thread, type Status } from "../types/email";
import {
    getVisibleStatuses,
    getEmailsByStatus,
    updateEmailStatus,
    snoozeEmail,
    groupEmailsByThread,
    getAllEmailsByThread,
    createStatus,
    updateStatus,
    deleteStatus,
} from "../services/email-services";
import KanbanColumn from "../components/KanbanColumn";
import SnoozeModal from "../components/SnoozeModal";
import Header from "../components/Header";
import { ComposeProvider } from "../contexts/ComposeContext";
import ComposeModal from "../components/ComposeModal";
import EmailList from "../components/EmailList";
import EmailDetail from "../components/EmailDetail";
import { RenameStatusModal, DeleteStatusModal } from "../components/StatusModals";

const ITEMS_PER_PAGE = 10;

const KanbanBoard: React.FC = () => {
    // Kanban State
    const [statuses, setStatuses] = useState<Status[]>([]);
    const [columns, setColumns] = useState<{ [key: number]: Email[] }>({});
    const [isLoading, setIsLoading] = useState(true);
    const [snoozeModalOpen, setSnoozeModalOpen] = useState(false);
    const [selectedEmailId, setSelectedEmailId] = useState<string | null>(null);

    // Modal States
    const [renameModalOpen, setRenameModalOpen] = useState(false);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [selectedStatus, setSelectedStatus] = useState<Status | null>(null);

    // Search / Dashboard State
    const [isSearchActive, setIsSearchActive] = useState(false);
    const [searchThreads, setSearchThreads] = useState<Thread[]>([]);
    const [activeThread, setActiveThread] = useState<Thread | undefined>();
    const [page, setPage] = useState(0);

    const fetchBoardData = async () => {
        setIsLoading(true);
        try {
            // 1. Fetch Statuses
            const fetchedStatuses = await getVisibleStatuses();
            // Sort by orderIndex
            fetchedStatuses.sort((a, b) => a.orderIndex - b.orderIndex);
            setStatuses(fetchedStatuses);

            // 2. Fetch Emails for each status
            const columnData: { [key: number]: Email[] } = {};
            await Promise.all(
                fetchedStatuses.map(async (status) => {
                    const emails = await getEmailsByStatus(status.id);
                    columnData[status.id] = emails;
                })
            );
            setColumns(columnData);

        } catch (error) {
            console.error("Failed to fetch Kanban board data", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchBoardData();
    }, []);

    const handleDrop = async (e: React.DragEvent, targetStatusId: number) => {
        const emailId = e.dataTransfer.getData("emailId");
        if (!emailId) return;

        // Find source column and email
        let sourceStatusId = -1;
        let emailToMove: Email | undefined;

        for (const [statusIdStr, emails] of Object.entries(columns)) {
            const statusId = Number(statusIdStr);
            const found = emails.find((e) => e.id === emailId);
            if (found) {
                sourceStatusId = statusId;
                emailToMove = found;
                break;
            }
        }

        if (!emailToMove || sourceStatusId === targetStatusId) return;

        // Optimistic Update
        const newColumns = { ...columns };

        // Remove from source
        newColumns[sourceStatusId] = newColumns[sourceStatusId].filter((e) => e.id !== emailId);

        // Add to target
        // We need to update the email object's status as well for consistency
        // Note: We don't have the full Status object for the target here easily without looking it up,
        // but for the UI list we just need the email in the right array.
        // If we need the status object on the email, we should find it from `statuses`.
        const targetStatusObj = statuses.find(s => s.id === targetStatusId);

        const updatedEmail = {
            ...emailToMove,
            status: targetStatusObj
        };
        newColumns[targetStatusId] = [updatedEmail, ...newColumns[targetStatusId]];

        setColumns(newColumns);

        // API Call
        try {
            await updateEmailStatus(emailId, targetStatusId);
        } catch (error) {
            console.error("Failed to update status", error);
            fetchBoardData();
        }
    };

    const handleRemove = async (id: string) => {
        // Optimistic remove
        const newColumns = { ...columns };
        for (const key in newColumns) {
            const statusId = Number(key);
            newColumns[statusId] = newColumns[statusId].filter((e) => e.id !== id);
        }
        setColumns(newColumns);

        try {
            // Assuming we have a 'Removed' status or endpoint. 
            // If dynamic statuses don't include 'Removed', we might need a specific ID or endpoint.
            // For now, let's assume there's a status for it or we use a special ID if the backend supports it.
            // If the backend requires a status ID, we need to know the ID of "Removed" status.
            // Or maybe use a specific endpoint for "trash".
            // Let's assume there is a status named "Removed" or similar if we want to move it there.
            // OR if the requirement is just to remove from board (archive/trash).
            // Based on previous code: await updateEmailStatus(id, EmailStatus.REMOVED);
            // We might need to find the "Removed" status ID.
            const removedStatus = statuses.find(s => s.name.toLowerCase() === 'removed' || s.name.toLowerCase() === 'trash');
            if (removedStatus) {
                await updateEmailStatus(id, removedStatus.id);
            } else {
                console.warn("No 'Removed' status found to move email to.");
            }

        } catch (error) {
            console.error("Failed to remove email", error);
            fetchBoardData();
        }
    };

    const openSnoozeModal = (id: string) => {
        setSelectedEmailId(id);
        setSnoozeModalOpen(true);
    };

    const handleSnoozeConfirm = async (date: Date | null) => {
        if (!selectedEmailId) return;

        // Optimistic remove from board
        const newColumns = { ...columns };
        for (const key in newColumns) {
            const statusId = Number(key);
            newColumns[statusId] = newColumns[statusId].filter((e) => e.id !== selectedEmailId);
        }
        setColumns(newColumns);

        try {
            await snoozeEmail(selectedEmailId, date || undefined);
        } catch (error) {
            console.error("Failed to snooze email", error);
            fetchBoardData();
        }
    };

    // --- Status Management ---

    const handleCreateStatus = async (baseStatus: Status, position: 'left' | 'right') => {
        const newOrderIndex = position === 'left' ? baseStatus.orderIndex : baseStatus.orderIndex + 1;

        try {
            await createStatus("New Column", newOrderIndex);
            await fetchBoardData();
        } catch (error) {
            console.error("Failed to create status", error);
        }
    };




    const handleRenameStatus = async (newName: string) => {
        if (!selectedStatus) return;
        try {
            await updateStatus(selectedStatus.id, newName);
            setStatuses(prev => prev.map(s => s.id === selectedStatus.id ? { ...s, name: newName } : s));
        } catch (error) {
            console.error("Failed to rename status", error);
        }
    };

    const handleDeleteStatus = async (moveToId: number) => {
        if (!selectedStatus) return;
        try {
            await deleteStatus(selectedStatus.id, moveToId);
            await fetchBoardData();


            // Move emails locally
            // const emailsToMove = columns[selectedStatus.id] || [];
            // setColumns(prev => {
            //     const next = { ...prev };
            //     delete next[selectedStatus.id];
            //     if (next[moveToId]) {
            //         next[moveToId] = [...next[moveToId], ...emailsToMove];
            //     }
            //     return next;
            // });

            // setStatuses(prev => prev.filter(s => s.id !== selectedStatus.id));

        } catch (error) {
            console.error("Failed to delete status", error);
            // fetchBoardData(); // Revert/Refresh
        }
    };


    // --- Search Logic ---

    const handleSearchResults = (emails: Email[]) => {
        const threads = groupEmailsByThread(emails);
        setSearchThreads(threads);
        setIsSearchActive(true);
        setPage(0);

        if (threads.length > 0) {
            handleThreadSelect(threads[0].id, threads);
        } else {
            setActiveThread(undefined);
        }
    };

    const handleThreadSelect = async (threadId: string, sourceThreads = searchThreads) => {
        const threadIndex = sourceThreads.findIndex(t => t.id === threadId);
        if (threadIndex === -1) return;

        const selectedThread = sourceThreads[threadIndex];

        // Check if we need to fetch full content.
        const hasMissingBody = selectedThread.emails.some(email => !email.bodyHtml);

        if (hasMissingBody) {
            try {
                const fullEmails = await getAllEmailsByThread(threadId);
                const updatedThread = { ...selectedThread, emails: fullEmails };

                setActiveThread(updatedThread);
                setSearchThreads((prevThreads) =>
                    prevThreads.map((t) => (t.id === threadId ? updatedThread : t))
                );
            } catch (error) {
                console.error("Error fetching full thread conversation", error);
            }
        } else {
            setActiveThread(selectedThread);
        }
    };

    const paginatedThreads = useMemo(() => {
        const start = page * ITEMS_PER_PAGE;
        return searchThreads.slice(start, start + ITEMS_PER_PAGE);
    }, [searchThreads, page]);

    const totalPages = Math.ceil(searchThreads.length / ITEMS_PER_PAGE);


    return (
        <ComposeProvider>
            <div className="flex h-screen flex-col bg-background-light dark:bg-background-dark">
                <Header activeCategory="kanban" onSearch={handleSearchResults} />

                <div className="flex flex-1 flex-col overflow-hidden">
                    {/* Board Area or Search Results */}
                    {isSearchActive ? (
                        <div className="flex flex-1 overflow-hidden">
                            <EmailList
                                threads={paginatedThreads}
                                activeThreadId={activeThread?.id || ""}
                                onThreadSelect={(id) => handleThreadSelect(id)}
                                page={page}
                                totalPages={totalPages}
                                onPageChange={setPage}
                            />
                            <EmailDetail thread={activeThread} />
                        </div>
                    ) : (
                        <div className="flex flex-1 gap-6 overflow-x-auto p-6">
                            {isLoading ? (
                                <div className="flex h-full w-full items-center justify-center">
                                    <span className="text-gray-500">Loading Board...</span>
                                </div>
                            ) : (
                                <>
                                    {statuses.map((status) => (
                                        <KanbanColumn
                                            key={status.id}
                                            status={status}
                                            emails={columns[status.id] || []}
                                            onDrop={handleDrop}
                                            onRemove={handleRemove}
                                            onSnooze={openSnoozeModal}
                                            onInsertLeft={() => handleCreateStatus(status, 'left')}
                                            onInsertRight={() => handleCreateStatus(status, 'right')}
                                            onRename={() => {
                                                setSelectedStatus(status);
                                                setRenameModalOpen(true);
                                            }}
                                            onDelete={() => {
                                                setSelectedStatus(status);
                                                setDeleteModalOpen(true);
                                            }}
                                        />
                                    ))}
                                </>
                            )}
                        </div>
                    )}
                </div>

                <SnoozeModal
                    isOpen={snoozeModalOpen}
                    onClose={() => setSnoozeModalOpen(false)}
                    onConfirm={handleSnoozeConfirm}
                />

                <ComposeModal />

                {/* Status Management Modals */}
                <RenameStatusModal
                    isOpen={renameModalOpen}
                    onClose={() => setRenameModalOpen(false)}
                    onConfirm={handleRenameStatus}
                    initialName={selectedStatus?.name || ""}
                />

                <DeleteStatusModal
                    isOpen={deleteModalOpen}
                    onClose={() => setDeleteModalOpen(false)}
                    onConfirm={handleDeleteStatus}
                    statuses={statuses}
                    statusToDeleteId={selectedStatus?.id || -1}
                />
            </div>
        </ComposeProvider>
    );
};

export default KanbanBoard;

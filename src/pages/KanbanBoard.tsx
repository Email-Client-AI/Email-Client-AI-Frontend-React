import React, { useEffect, useState, useMemo } from "react";
import { EmailStatus, CategoryType, type Email, type Thread } from "../types/email";
import {
    getListEmails,
    getEmailsByStatus,
    updateEmailStatus,
    snoozeEmail,
    groupEmailsByThread,
    getAllEmailsByThread,
} from "../services/email-services";
import KanbanColumn from "../components/KanbanColumn";
import SnoozeModal from "../components/SnoozeModal";
import Header from "../components/Header";
import { ComposeProvider } from "../contexts/ComposeContext";
import ComposeModal from "../components/ComposeModal";
import EmailList from "../components/EmailList";
import EmailDetail from "../components/EmailDetail";

const ITEMS_PER_PAGE = 10;

const KanbanBoard: React.FC = () => {
    // Kanban State
    const [columns, setColumns] = useState<{
        [key: string]: Email[];
    }>({
        inbox: [],
        todo: [],
        inprogress: [],
        done: [],
    });

    const [isLoading, setIsLoading] = useState(true);
    const [snoozeModalOpen, setSnoozeModalOpen] = useState(false);
    const [selectedEmailId, setSelectedEmailId] = useState<string | null>(null);

    // Search / Dashboard State
    const [isSearchActive, setIsSearchActive] = useState(false);
    const [searchThreads, setSearchThreads] = useState<Thread[]>([]);
    const [activeThread, setActiveThread] = useState<Thread | undefined>();
    const [page, setPage] = useState(0);

    const fetchBoardData = async () => {
        setIsLoading(true);
        try {
            // Fetch all columns in parallel
            const [inboxRes, todoRes, inprogressRes, doneRes] = await Promise.all([
                getListEmails(1, 50, CategoryType.INBOX), // Fetch first 50 from Inbox
                getEmailsByStatus(EmailStatus.TODO),
                getEmailsByStatus(EmailStatus.INPROGRESS),
                getEmailsByStatus(EmailStatus.DONE),
            ]);

            // Filter Inbox to exclude emails that might have a status (if backend doesn't do it automatically)
            // For now, assuming getListEmails(INBOX) returns emails that are effectively in the inbox state
            // but we might want to filter out those that have a status set if the backend includes them.
            // Let's assume the backend handles it, or we filter client side:
            const inboxEmails = inboxRes.emails.filter(e => !e.status || (e.status as string) === 'inbox');

            setColumns({
                inbox: inboxEmails,
                todo: todoRes,
                inprogress: inprogressRes,
                done: doneRes,
            });
        } catch (error) {
            console.error("Failed to fetch Kanban board data", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchBoardData();
    }, []);

    const handleDrop = async (e: React.DragEvent, targetStatus: EmailStatus | "inbox") => {
        const emailId = e.dataTransfer.getData("emailId");
        if (!emailId) return;

        // Find source column and email
        let sourceColumn = "";
        let emailToMove: Email | undefined;

        for (const [colKey, emails] of Object.entries(columns)) {
            const found = emails.find((e) => e.id === emailId);
            if (found) {
                sourceColumn = colKey;
                emailToMove = found;
                break;
            }
        }

        if (!emailToMove || sourceColumn === targetStatus) return;

        // Optimistic Update
        const newColumns = { ...columns };

        // Remove from source
        newColumns[sourceColumn] = newColumns[sourceColumn].filter((e) => e.id !== emailId);

        // Add to target
        // We need to update the email object's status as well for consistency
        const updatedEmail = {
            ...emailToMove,
            status: targetStatus === "inbox" ? undefined : (targetStatus as EmailStatus)
        };
        newColumns[targetStatus] = [updatedEmail, ...newColumns[targetStatus]];

        setColumns(newColumns);

        // API Call
        try {
            await updateEmailStatus(emailId, targetStatus);
        } catch (error) {
            console.error("Failed to update status", error);
            // Revert on failure (could be improved with more robust rollback)
            fetchBoardData();
        }
    };

    const handleRemove = async (id: string) => {
        // Optimistic remove
        const newColumns = { ...columns };
        for (const key in newColumns) {
            newColumns[key] = newColumns[key].filter((e) => e.id !== id);
        }
        setColumns(newColumns);

        try {
            await updateEmailStatus(id, EmailStatus.REMOVED);
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
            newColumns[key] = newColumns[key].filter((e) => e.id !== selectedEmailId);
        }
        setColumns(newColumns);

        try {
            await snoozeEmail(selectedEmailId, date || undefined);
        } catch (error) {
            console.error("Failed to snooze email", error);
            fetchBoardData();
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
                                    <KanbanColumn
                                        title="Inbox"
                                        status="inbox"
                                        emails={columns.inbox}
                                        onDrop={handleDrop}
                                        onRemove={handleRemove}
                                        onSnooze={openSnoozeModal}
                                    />
                                    <KanbanColumn
                                        title="To Do"
                                        status={EmailStatus.TODO}
                                        emails={columns.todo}
                                        onDrop={handleDrop}
                                        onRemove={handleRemove}
                                        onSnooze={openSnoozeModal}
                                    />
                                    <KanbanColumn
                                        title="In Progress"
                                        status={EmailStatus.INPROGRESS}
                                        emails={columns.inprogress}
                                        onDrop={handleDrop}
                                        onRemove={handleRemove}
                                        onSnooze={openSnoozeModal}
                                    />
                                    <KanbanColumn
                                        title="Done"
                                        status={EmailStatus.DONE}
                                        emails={columns.done}
                                        onDrop={handleDrop}
                                        onRemove={handleRemove}
                                        onSnooze={openSnoozeModal}
                                    />
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
            </div>
        </ComposeProvider>
    );
};

export default KanbanBoard;

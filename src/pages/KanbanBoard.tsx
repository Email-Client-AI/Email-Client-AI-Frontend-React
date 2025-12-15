import React, { useEffect, useState } from "react";
import { EmailStatus, CategoryType, type Email } from "../types/email";
import {
    getListEmails,
    getEmailsByStatus,
    updateEmailStatus,
    snoozeEmail,
} from "../services/email-services";
import KanbanColumn from "../components/KanbanColumn";
import SnoozeModal from "../components/SnoozeModal";
import Header from "../components/Header";
import { ComposeProvider } from "../contexts/ComposeContext";
import ComposeModal from "../components/ComposeModal";

const KanbanBoard: React.FC = () => {
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

    return (
        <ComposeProvider>
            <div className="flex h-screen flex-col bg-background-light dark:bg-background-dark">
                <Header activeCategory="kanban" />

                <div className="flex flex-1 flex-col overflow-hidden">
                    {/* Board Area */}
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

import { useEffect, useState, useMemo } from "react";
import { useLocation } from "react-router-dom";

// Components
import Header from "../components/Header";
import EmailList from "../components/EmailList";
import EmailDetail from "../components/EmailDetail";
import ComposeModal from "../components/ComposeModal";

// Context
import { ComposeProvider } from "../contexts/ComposeContext";

// Services & Types
import { CategoryType, type Thread } from "../types/email";
import {
  getAllEmailsAndGroupByThread,
  getAllEmailsByThread
} from "../services/email-services";

const ITEMS_PER_PAGE = 10;

export default function Dashboard() {
  const [allThreads, setAllThreads] = useState<Thread[]>([]);
  const [activeThread, setActiveThread] = useState<Thread | undefined>();
  const [page, setPage] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const location = useLocation();

  // Determine category from URL hash or default to INBOX
  const category: CategoryType = location.hash
    ? (location.hash.replace('#', '') as CategoryType)
    : CategoryType.INBOX;

  // 1. Fetch All Emails & Group by Thread (Initial Load)
  const fetchThreads = async () => {
    setIsLoading(true);
    try {
      const threads = await getAllEmailsAndGroupByThread(category);

      // Sort threads by the latest email in them (Newest threads on top)
      const sortedThreads = threads.sort((a, b) => {
        const lastEmailA = a.emails[a.emails.length - 1];
        const lastEmailB = b.emails[b.emails.length - 1];
        const dateA = new Date(lastEmailA?.receivedDate || 0).getTime();
        const dateB = new Date(lastEmailB?.receivedDate || 0).getTime();
        return dateB - dateA;
      });

      setAllThreads(sortedThreads);
      setPage(0); // Reset pagination on category change

      // Auto-select the first thread if available
      if (sortedThreads.length > 0) {
        handleThreadSelect(sortedThreads[0].id, sortedThreads);
      } else {
        setActiveThread(undefined);
      }
    } catch (error) {
      console.error("Failed to fetch threads", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchThreads();
  }, [category]);

  // 2. Client-side Pagination Logic
  const paginatedThreads = useMemo(() => {
    const start = page * ITEMS_PER_PAGE;
    return allThreads.slice(start, start + ITEMS_PER_PAGE);
  }, [allThreads, page]);

  const totalPages = Math.ceil(allThreads.length / ITEMS_PER_PAGE);

  // 3. Handle Thread Selection & Fetch Full Conversation if needed
  const handleThreadSelect = async (threadId: string, sourceThreads = allThreads) => {
    const threadIndex = sourceThreads.findIndex(t => t.id === threadId);
    if (threadIndex === -1) return;

    const selectedThread = sourceThreads[threadIndex];

    // Check if we need to fetch full content.
    // If ANY email in the thread is missing bodyHtml, we fetch the whole thread again to be safe.
    const hasMissingBody = selectedThread.emails.some(email => !email.bodyHtml);

    if (hasMissingBody) {
      try {
        // Fetch all emails for this thread in one request (optimized)
        const fullEmails = await getAllEmailsByThread(threadId);

        // Create updated thread object
        const updatedThread = { ...selectedThread, emails: fullEmails };

        // 1. Update Active Thread immediately (so UI updates)
        setActiveThread(updatedThread);

        // 2. Update the main list in State (so we don't fetch again if clicked later)
        setAllThreads((prevThreads) =>
          prevThreads.map((t) => (t.id === threadId ? updatedThread : t))
        );

      } catch (error) {
        console.error("Error fetching full thread conversation", error);
      }
    } else {
      // Content already exists, just set active
      setActiveThread(selectedThread);
    }
  };

  return (
    <ComposeProvider>
      <div className="bg-background-light dark:bg-background-dark font-display text-gray-900 dark:text-gray-100 flex h-screen w-full flex-col">
        <Header activeCategory={category} />

        <div className="flex flex-1 overflow-hidden">
          {isLoading && allThreads.length === 0 ? (
            <div className="w-96 shrink-0 flex items-center justify-center border-r border-gray-200 dark:border-gray-800">
              <p className="text-gray-500">Loading...</p>
            </div>
          ) : (
            <EmailList
              threads={paginatedThreads}
              activeThreadId={activeThread?.id || ""}
              onThreadSelect={(id) => handleThreadSelect(id)}
              page={page}
              totalPages={totalPages}
              onPageChange={setPage}
            />
          )}

          <EmailDetail thread={activeThread} />
        </div>

        {/* The Compose Modal sits here, floating on top */}
        <ComposeModal />
      </div>
    </ComposeProvider>
  );
}
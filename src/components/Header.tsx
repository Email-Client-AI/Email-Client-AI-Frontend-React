import axios from "axios";
import React, { useState, useRef, useEffect } from "react";
import { useCompose } from "../contexts/ComposeContext";

interface HeaderProps {
  activeCategory: string;
}

const Header: React.FC<HeaderProps> = ({ activeCategory }) => {
  const [open, setOpen] = useState(false);
  const { openCompose } = useCompose(); // Use Hook
  const dropdownRef = useRef<HTMLDivElement>(null);

  const categories = [
    { id: "inbox", label: "Inbox" },
    { id: "sent", label: "Sent" },
    { id: "draft", label: "Draft" },
    { id: "spam", label: "Spam" },
    { id: "snoozed", label: "Snoozed" },
    { id: "kanban", label: "Kanban Board" },
  ];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleLogout = async () => {
    try {
      await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/auth/logout`,
        {},
        { withCredentials: true }
      );

      // Clear all local storage + session storage
      localStorage.clear();
      sessionStorage.clear();

      // Redirect
      window.location.href = "/login";
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };


  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-gray-200 bg-background-light px-6 dark:border-gray-800 dark:bg-background-dark">
      <div className="flex items-center space-x-8">
        <div className="flex items-center space-x-2 text-lg font-bold text-gray-900 dark:text-gray-100">
          <span className="material-icons-outlined text-primary">mail</span>
          <span>Mail</span>
        </div>

        {/* CATEGORY NAV */}
        <nav className="hidden items-center space-x-6 text-sm font-medium text-gray-500 dark:text-gray-400 md:flex">
          {categories.map((cat) => (
            <a
              key={cat.id}
              href={cat.id === "kanban" ? "/kanban" : `/dashboard#${cat.id}`}
              className={
                activeCategory === cat.id
                  ? "text-primary font-semibold"
                  : "hover:text-primary"
              }
            >
              {cat.label}
            </a>
          ))}
        </nav>
      </div>

      <div className="flex items-center space-x-4">
        {/* Search */}
        <div className="relative w-64">
          <span className="material-icons-outlined pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            search
          </span>
          <input
            className="w-full rounded-md border-gray-300 bg-gray-100 py-2 pl-10 pr-4 text-sm focus:border-primary focus:ring-primary dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
            placeholder="Search"
            type="text"
          />
        </div>

        <button
          onClick={() => openCompose()}
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700">
          Compose
        </button>

        {/* Avatar + Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <img
            alt="User avatar"
            onClick={() => setOpen(!open)}
            className="h-8 w-8 cursor-pointer rounded-full bg-gray-200 dark:bg-gray-700"
            src="https://www.gravatar.com/avatar/?d=mp"
          />

          {open && (
            <div className="absolute right-0 mt-2 w-36 rounded-md border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800 z-50">
              <button
                onClick={handleLogout}
                className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;

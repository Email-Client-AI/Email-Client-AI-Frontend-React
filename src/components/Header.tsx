import React from 'react';

interface HeaderProps {
  activeCategory: string;
}

const Header: React.FC<HeaderProps> = ({ activeCategory }) => {
  const categories = [
    { id: "inbox", label: "Inbox" },
    { id: "sent", label: "Sent" },
    { id: "drafts", label: "Drafts" },
    { id: "spam", label: "Spam" },
  ];

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
              href={`#${cat.id}`}
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

        <button className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700">
          Compose
        </button>

        <img
          alt="User avatar"
          className="h-8 w-8 rounded-full"
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuAGg7a7B9Km5ABks-9R91QeA3urcAwROYtVqhiouMv3gd8b9IB5FTh4nrym697jCZgG89gswxQ4LdamuT-ZVe_M2K8eDXdmgxfKmisSOgwX8R6wrYlJ3mRi3FFhTc1GfM_Y9n3Y02wFkeBjaDV6lPenFD8bRpbfciXtGfCeAYAfJuWS4glS5CuqkARRw_yIcYxs9qEqYIfegeAEdlqZR73AJAWRL7muGDME3jnIp0lCWQtefPgWMfS4NpsyMmpAWJEEISl2UFp0VVM"
        />
      </div>
    </header>
  );
};

export default Header;

import React, { useState, useRef } from "react";

interface RecipientInputProps {
    recipients: string[];
    onChange: (recipients: string[]) => void;
    onFocus?: () => void; // To trigger showing CC/BCC
    label: string;
}

const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

export const RecipientInput: React.FC<RecipientInputProps> = ({
    recipients,
    onChange,
    onFocus,
    label,
}) => {
    const [inputValue, setInputValue] = useState("");
    const [error, setError] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        // 1. Add email on Enter, Tab, or Comma
        if (["Enter", "Tab", ","].includes(e.key)) {
            e.preventDefault();
            const trimmedInput = inputValue.trim();

            if (trimmedInput && isValidEmail(trimmedInput)) {
                if (!recipients.includes(trimmedInput)) {
                    onChange([...recipients, trimmedInput]);
                }
                setInputValue("");
                setError(false);
            } else if (trimmedInput) {
                // Invalid email logic (optional: shake effect or red text)
                setError(true);
            }
        }

        // 2. Remove last email on Backspace if input is empty
        if (e.key === "Backspace" && inputValue === "" && recipients.length > 0) {
            const newRecipients = [...recipients];
            newRecipients.pop();
            onChange(newRecipients);
        }
    };

    const removeRecipient = (emailToRemove: string) => {
        onChange(recipients.filter((email) => email !== emailToRemove));
    };

    // Focus the actual input when clicking the container
    const handleContainerClick = () => {
        inputRef.current?.focus();
        if (onFocus) onFocus();
    };

    return (
        <div
            className="flex flex-wrap items-center w-full py-1 cursor-text"
            onClick={handleContainerClick}
        >
            <span className="text-gray-500 text-sm mr-2 select-none">{label}</span>

            {/* Render Chips */}
            {recipients.map((email) => (
                <div
                    key={email}
                    className="flex items-center bg-white border border-gray-300 dark:bg-gray-700 dark:border-gray-600 rounded-full px-2 py-0.5 mr-1 mb-1 shadow-sm"
                >
                    {/* Avatar (First letter) */}
                    <div className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 text-xs flex items-center justify-center mr-1.5 font-bold select-none">
                        {email.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sm text-gray-700 dark:text-gray-200 select-none">
                        {email}
                    </span>
                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation(); // Prevent container focus logic
                            removeRecipient(email);
                        }}
                        className="ml-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 focus:outline-none"
                    >
                        <span className="material-icons-outlined text-sm font-bold">close</span>
                    </button>
                </div>
            ))}

            {/* The Input Field */}
            <input
                ref={inputRef}
                value={inputValue}
                onChange={(e) => {
                    setInputValue(e.target.value);
                    setError(false);
                }}
                onKeyDown={handleKeyDown}
                onBlur={() => {
                    // Optional: Try to add if user clicks away and valid
                    const trimmed = inputValue.trim();
                    if (trimmed && isValidEmail(trimmed) && !recipients.includes(trimmed)) {
                        onChange([...recipients, trimmed]);
                        setInputValue("");
                    }
                }}
                className={`flex-1 min-w-[120px] focus:ring-0 border-none outline-none bg-transparent text-sm dark:text-white placeholder-gray-400 ${error ? "text-red-500" : ""
                    }`}
                placeholder={recipients.length === 0 ? "Recipients" : ""}
            />
        </div>
    );
};
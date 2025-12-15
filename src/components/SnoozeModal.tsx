import React, { useState } from "react";

interface SnoozeModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (date: Date | null) => void;
}

const SnoozeModal: React.FC<SnoozeModalProps> = ({ isOpen, onClose, onConfirm }) => {
    const [selectedDate, setSelectedDate] = useState<string>("");

    if (!isOpen) return null;

    const handleConfirm = () => {
        if (selectedDate) {
            onConfirm(new Date(selectedDate));
        } else {
            // "Until I unsnooze it" -> pass null
            onConfirm(null);
        }
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl dark:bg-gray-800">
                <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100">
                    Snooze Email
                </h3>

                <p className="mb-4 text-sm text-gray-600 dark:text-gray-300">
                    Select a time to bring this email back to your inbox.
                </p>

                <div className="mb-6 space-y-3">
                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Pick a date & time
                        </label>
                        <input
                            type="datetime-local"
                            className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                        />
                    </div>

                    <div className="text-center text-sm text-gray-500">- OR -</div>

                    <button
                        onClick={() => setSelectedDate("")}
                        className={`w-full rounded-md border px-4 py-2 text-sm font-medium transition-colors ${selectedDate === ""
                                ? "border-primary bg-blue-50 text-primary dark:bg-blue-900/20"
                                : "border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                            }`}
                    >
                        Until I unsnooze it manually
                    </button>
                </div>

                <div className="flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="rounded-md px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleConfirm}
                        className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                    >
                        Snooze
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SnoozeModal;

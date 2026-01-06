import React, { useState, useEffect } from "react";
import { useCompose } from "../contexts/ComposeContext";
import TiptapEditor from "./TipTapEditor";
import { RecipientInput } from "./RecipientInput";
import { sendEmail } from "../services/email-services";
import { toastService } from "../services/toast-services";

const ComposeModal: React.FC = () => {
    const { isOpen, minimized, closeCompose, toggleMinimize, composeData } = useCompose();

    const [to, setTo] = useState<string[]>([]);
    const [cc, setCc] = useState<string[]>([]);
    const [bcc, setBcc] = useState<string[]>([]);
    const [subject, setSubject] = useState("");
    const [body, setBody] = useState("");
    const [showCcBcc, setShowCcBcc] = useState(false);
    const [files, setFiles] = useState<File[]>([]);
    const [isSending, setIsSending] = useState(false);


    const parseEmails = (emailString?: string): string[] => {
        if (!emailString) return [];
        return emailString.split(',').map(e => e.trim()).filter(e => e.length > 0);
    };

    useEffect(() => {
        if (isOpen) {
            setTo(parseEmails(composeData.to));
            setSubject(composeData.subject || "");
            setBody(composeData.body || "");
            setCc([]);
            setBcc([]);
            setFiles([]);
            setShowCcBcc(false);
            setIsSending(false);
        }
    }, [isOpen, composeData]);

    if (!isOpen) return null;

    const handleSend = async () => {
        if (to.length === 0) {
            toastService.error("Please add at least one recipient.");
            return;
        }

        setIsSending(true);

        try {
            const payload = {
                to,
                cc,
                bcc,
                subject,
                bodyHtml: body,
                replyToEmailId: composeData.replyToId,
                forwardEmailId: composeData.forwardEmailId
            };

            await sendEmail(payload);

            closeCompose();
            toastService.success("Email sent successfully!");

        } catch (error) {
            console.error("Failed to send email", error);
            toastService.error("Failed to send email. Please try again.");
        } finally {
            setIsSending(false);
        }
    };


    const removeFile = (index: number) => {
        setFiles((prev) => prev.filter((_, i) => i !== index));
    };

    if (minimized) {
        return (
            <div className="fixed bottom-0 right-20 w-64 z-50 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-t-lg shadow-xl cursor-pointer" onClick={toggleMinimize}>
                <div className="flex items-center justify-between p-3 bg-gray-900 text-white rounded-t-lg">
                    <span className="font-bold truncate text-sm">{subject || "New Message"}</span>
                    <div className="flex space-x-2">
                        <button onClick={(e) => { e.stopPropagation(); toggleMinimize(); }}><span className="material-icons-outlined text-sm">open_in_full</span></button>
                        <button onClick={(e) => { e.stopPropagation(); closeCompose(); }}><span className="material-icons-outlined text-sm">close</span></button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed bottom-0 right-20 w-[800px] h-[700px] z-50 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-t-lg shadow-2xl flex flex-col font-sans">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-2 bg-gray-100 dark:bg-gray-900 rounded-t-lg border-b dark:border-gray-700 cursor-pointer" onClick={toggleMinimize}>
                <span className="font-bold text-sm text-gray-700 dark:text-gray-200">{subject || "New Message"}</span>
                <div className="flex items-center space-x-3 text-gray-500">
                    <button onClick={(e) => { e.stopPropagation(); toggleMinimize(); }} className="hover:text-gray-800 dark:hover:text-white"><span className="material-icons-outlined text-lg">minimize</span></button>
                    <button onClick={(e) => { e.stopPropagation(); closeCompose(); }} className="hover:text-gray-800 dark:hover:text-white"><span className="material-icons-outlined text-lg">close</span></button>
                </div>
            </div>

            {/* Input Fields */}
            <div className="px-4 py-2 space-y-1 border-b dark:border-gray-700 bg-white dark:bg-gray-800">
                <div className="relative border-b border-gray-100 dark:border-gray-700">
                    <RecipientInput label="To" recipients={to} onChange={setTo} onFocus={() => setShowCcBcc(true)} />
                    {!showCcBcc && (
                        <div className="absolute right-0 top-1.5 flex text-xs space-x-2 text-gray-500">
                            <span className="cursor-pointer hover:underline" onClick={() => setShowCcBcc(true)}>Cc</span>
                            <span className="cursor-pointer hover:underline" onClick={() => setShowCcBcc(true)}>Bcc</span>
                        </div>
                    )}
                </div>
                {showCcBcc && (
                    <>
                        <div className="border-b border-gray-100 dark:border-gray-700"><RecipientInput label="Cc" recipients={cc} onChange={setCc} /></div>
                        <div className="border-b border-gray-100 dark:border-gray-700"><RecipientInput label="Bcc" recipients={bcc} onChange={setBcc} /></div>
                    </>
                )}
                <input className="w-full border-none focus:ring-0 outline-none bg-transparent text-sm py-2 font-medium dark:text-white placeholder-gray-500" placeholder="Subject" value={subject} onChange={(e) => setSubject(e.target.value)} />
            </div>

            {/* Editor */}
            <div className={`flex-1 overflow-hidden flex flex-col ${isSending ? 'opacity-50 pointer-events-none' : ''}`}>
                <TiptapEditor value={body} onChange={setBody} />
            </div>

            {/* Attachments */}
            {files.length > 0 && (
                <div className="px-4 py-2 bg-gray-50 dark:bg-gray-900 border-t dark:border-gray-700 max-h-24 overflow-y-auto">
                    {files.map((file, i) => (
                        <div key={i} className="flex items-center justify-between text-xs bg-gray-200 dark:bg-gray-700 p-1 mb-1 rounded">
                            <span className="truncate max-w-[200px] dark:text-white">{file.name}</span>
                            <button onClick={() => removeFile(i)} className="text-gray-500 hover:text-red-500"><span className="material-icons-outlined text-sm">close</span></button>
                        </div>
                    ))}
                </div>
            )}

            {/* Footer */}
            <div className="p-3 flex items-center justify-between border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
                <div className="flex items-center space-x-2">
                    <button onClick={handleSend} disabled={isSending} className={`px-5 py-2 rounded-full text-sm font-bold shadow-sm transition-colors text-white ${isSending ? 'bg-blue-400 cursor-not-allowed' : 'bg-primary hover:bg-blue-700'}`}>
                        {isSending ? 'Sending...' : 'Send'}
                    </button>
                    {/* <div className="relative">
                        <button onClick={() => fileInputRef.current?.click()} disabled={isSending} className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full"><span className="material-icons-outlined">attach_file</span></button>
                        <input type="file" multiple ref={fileInputRef} className="hidden" onChange={handleFileChange} />
                    </div> */}
                </div>
                <button onClick={closeCompose} className="p-2 text-gray-500 hover:text-gray-800 dark:hover:text-gray-200"><span className="material-icons-outlined">delete</span></button>
            </div>
        </div>
    );
};

export default ComposeModal;
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Link from '@tiptap/extension-link';
import { useEffect } from 'react';

interface TiptapEditorProps {
    value: string;
    onChange: (html: string) => void;
}

const ToolbarButton = ({
    onClick,
    isActive = false,
    icon
}: {
    onClick: () => void;
    isActive?: boolean;
    icon: string
}) => (
    <button
        onClick={onClick}
        className={`p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors ${isActive ? 'bg-gray-200 dark:bg-gray-700 text-primary' : 'text-gray-600 dark:text-gray-300'
            }`}
        type="button"
    >
        <span className="material-icons-outlined text-lg">{icon}</span>
    </button>
);

const TiptapEditor: React.FC<TiptapEditorProps> = ({ value, onChange }) => {
    const editor = useEditor({
        extensions: [
            StarterKit,
            Link.configure({ openOnClick: false }),
            Placeholder.configure({
                placeholder: 'Type your message...',
            }),
        ],
        editorProps: {
            attributes: {
                class: 'prose prose-sm dark:prose-invert max-w-none focus:outline-none min-h-[150px] p-4',
            },
        },
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
    });

    // Update editor content if value changes externally (e.g. loading a reply quote)
    useEffect(() => {
        if (editor && value && editor.getHTML() !== value) {
            // Only set content if it's significantly different to avoid cursor jumps
            // For a simple compose, setting it once on mount/open is usually enough,
            // but this handles re-opening with new data.
            editor.commands.setContent(value);
        }
    }, [value, editor]);

    if (!editor) return null;

    return (
        <div className="flex flex-col h-full bg-white dark:bg-gray-800">
            {/* Toolbar */}
            <div className="flex items-center space-x-1 border-b border-gray-200 dark:border-gray-700 p-2 bg-gray-50 dark:bg-gray-900">
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    isActive={editor.isActive('bold')}
                    icon="format_bold"
                />
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    isActive={editor.isActive('italic')}
                    icon="format_italic"
                />
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleStrike().run()}
                    isActive={editor.isActive('strike')}
                    icon="strikethrough_s"
                />
                <div className="w-px h-4 bg-gray-300 dark:bg-gray-600 mx-2" />
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleBulletList().run()}
                    isActive={editor.isActive('bulletList')}
                    icon="format_list_bulleted"
                />
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleOrderedList().run()}
                    isActive={editor.isActive('orderedList')}
                    icon="format_list_numbered"
                />
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleBlockquote().run()}
                    isActive={editor.isActive('blockquote')}
                    icon="format_quote"
                />
            </div>

            {/* Editor Area */}
            <div className="flex-1 overflow-y-auto cursor-text" onClick={() => editor.chain().focus().run()}>
                <EditorContent editor={editor} />
            </div>

            {/* Global styles for placeholder */}
            <style>{`
        .ProseMirror p.is-editor-empty:first-child::before {
          color: #9ca3af;
          content: attr(data-placeholder);
          float: left;
          height: 0;
          pointer-events: none;
        }
      `}</style>
        </div>
    );
};

export default TiptapEditor;
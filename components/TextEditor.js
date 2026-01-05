'use client';

import React from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { cn } from '@/lib/utils';
import { Bold, Italic, List, ListOrdered } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function TextEditor({ content, onChange, className }) {
    const [characterCount, setCharacterCount] = React.useState(0);

    const editor = useEditor({
        immediatelyRender: false,
        extensions: [
            StarterKit,
            Placeholder.configure({
                placeholder: 'Paste your text here or start typing...',
            }),
        ],
        content,
        onUpdate: ({ editor }) => {
            const text = editor.getText();
            setCharacterCount(text.length);
            onChange?.(text);
        },
        editorProps: {
            attributes: {
                class: 'prose prose-sm sm:prose-base dark:prose-invert focus:outline-none min-h-[300px] w-full max-w-none p-4',
            },
        },
    });

    if (!editor) {
        return null;
    }

    return (
        <div className={cn("border border-border/50 rounded-lg bg-card/50 shadow-sm backdrop-blur-sm transition-all focus-within:ring-2 focus-within:ring-primary/20", className)}>
            {/* Toolbar */}
            <div className="flex items-center gap-1 p-2 border-b border-border/50 bg-muted/30 rounded-t-lg">
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    isActive={editor.isActive('bold')}
                    icon={<Bold className="w-4 h-4" />}
                />
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    isActive={editor.isActive('italic')}
                    icon={<Italic className="w-4 h-4" />}
                />
                <div className="w-px h-6 bg-border mx-1" />
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleBulletList().run()}
                    isActive={editor.isActive('bulletList')}
                    icon={<List className="w-4 h-4" />}
                />
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleOrderedList().run()}
                    isActive={editor.isActive('orderedList')}
                    icon={<ListOrdered className="w-4 h-4" />}
                />

                <div className="ml-auto text-xs text-muted-foreground font-mono">
                    <span className={cn(
                        "transition-colors",
                        characterCount > 1000 ? "text-yellow-500" : characterCount > 5000 ? "text-red-500" : "text-green-500"
                    )}>
                        {characterCount}
                    </span> chars
                </div>
            </div>

            {/* Editor */}
            <EditorContent editor={editor} className="min-h-[300px]" />
        </div>
    );
}

function ToolbarButton({ onClick, isActive, icon }) {
    return (
        <Button
            variant="ghost"
            size="sm"
            onClick={onClick}
            className={cn(
                "h-8 w-8 p-0 transition-all hover:scale-110",
                isActive ? "bg-primary/20 text-primary" : "text-muted-foreground"
            )}
        >
            {icon}
        </Button>
    )
}

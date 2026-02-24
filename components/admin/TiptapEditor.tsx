'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import { Node, mergeAttributes } from '@tiptap/core';
import { Bold, Italic, Strikethrough, Heading1, Heading2, List, ListOrdered, Quote, Undo, Redo, ImageIcon, LinkIcon, Upload, Loader2, Video as VideoIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState, useRef } from 'react';
import { uploadAssetToSanity } from '@/lib/actions/cms.actions';
import { toast } from 'sonner';

// Custom Video Extension
const Video = Node.create({
    name: 'video',
    group: 'block',
    selectable: true,
    draggable: true,
    addAttributes() {
        return {
            src: {
                default: null,
            },
        }
    },
    parseHTML() {
        return [
            { tag: 'video' },
            { tag: 'iframe' }
        ]
    },
    renderHTML({ HTMLAttributes }) {
        if (HTMLAttributes.src?.includes('youtube') || HTMLAttributes.src?.includes('vimeo')) {
            return ['iframe', mergeAttributes(HTMLAttributes, {
                frameborder: '0',
                allowfullscreen: 'true',
                class: 'w-full aspect-video rounded-lg my-4'
            })];
        }
        return ['video', mergeAttributes(HTMLAttributes, { controls: 'true', class: 'w-full rounded-lg bg-black/5 my-4 max-h-[500px]' })]
    }
});

interface TiptapEditorProps {
    value: string;
    onChange: (html: string) => void;
}

const MenuBar = ({ editor }: { editor: any }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isUploading, setIsUploading] = useState(false);

    if (!editor) {
        return null;
    }

    const setLink = () => {
        const previousUrl = editor.getAttributes('link').href || '';
        const url = window.prompt('URL', previousUrl);

        if (url === null) return;
        if (url === '') {
            editor.chain().focus().extendMarkRange('link').unsetLink().run();
            return;
        }
        editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
    };

    const isVideoUrl = (url: string) => {
        return url.match(/\.(mp4|webm|ogg)$/i) || url.includes('youtube') || url.includes('vimeo');
    };

    const addMediaByURL = () => {
        const url = window.prompt('Media URL (Image or Video)');
        if (url) {
            if (isVideoUrl(url)) {
                editor.chain().focus().insertContent({ type: 'video', attrs: { src: url } }).run();
            } else {
                editor.chain().focus().setImage({ src: url }).run();
            }
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await uploadAssetToSanity(formData);
            if (res.success && res.url) {
                if (file.type.startsWith('video/')) {
                    editor.chain().focus().insertContent({ type: 'video', attrs: { src: res.url } }).run();
                } else {
                    editor.chain().focus().setImage({ src: res.url }).run();
                }
                toast.success('Media uploaded successfully');
            } else {
                toast.error(res.error || 'Failed to upload media');
            }
        } catch (err) {
            toast.error('Error uploading media');
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    return (
        <div className="border-b border-border p-2 flex flex-wrap gap-1 bg-muted/30">
            <Button
                type="button" variant="ghost" size="sm"
                onClick={() => editor.chain().focus().toggleBold().run()}
                disabled={!editor.can().chain().focus().toggleBold().run()}
                className={editor.isActive('bold') ? 'bg-muted' : ''}
            >
                <Bold className="w-4 h-4" />
            </Button>
            <Button
                type="button" variant="ghost" size="sm"
                onClick={() => editor.chain().focus().toggleItalic().run()}
                disabled={!editor.can().chain().focus().toggleItalic().run()}
                className={editor.isActive('italic') ? 'bg-muted' : ''}
            >
                <Italic className="w-4 h-4" />
            </Button>
            <Button
                type="button" variant="ghost" size="sm"
                onClick={() => editor.chain().focus().toggleStrike().run()}
                disabled={!editor.can().chain().focus().toggleStrike().run()}
                className={editor.isActive('strike') ? 'bg-muted' : ''}
            >
                <Strikethrough className="w-4 h-4" />
            </Button>

            <div className="w-px h-6 bg-border mx-1 my-auto" />

            <Button
                type="button" variant="ghost" size="sm"
                onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                className={editor.isActive('heading', { level: 1 }) ? 'bg-muted font-bold' : 'font-bold'}
            >
                H1
            </Button>
            <Button
                type="button" variant="ghost" size="sm"
                onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                className={editor.isActive('heading', { level: 2 }) ? 'bg-muted font-bold' : 'font-bold'}
            >
                H2
            </Button>
            <Button
                type="button" variant="ghost" size="sm"
                onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                className={editor.isActive('heading', { level: 3 }) ? 'bg-muted font-bold' : 'font-bold'}
            >
                H3
            </Button>

            <div className="w-px h-6 bg-border mx-1 my-auto" />

            <Button
                type="button" variant="ghost" size="sm"
                onClick={() => editor.chain().focus().toggleBulletList().run()}
                className={editor.isActive('bulletList') ? 'bg-muted' : ''}
            >
                <List className="w-4 h-4" />
            </Button>
            <Button
                type="button" variant="ghost" size="sm"
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
                className={editor.isActive('orderedList') ? 'bg-muted' : ''}
            >
                <ListOrdered className="w-4 h-4" />
            </Button>
            <Button
                type="button" variant="ghost" size="sm"
                onClick={() => editor.chain().focus().toggleBlockquote().run()}
                className={editor.isActive('blockquote') ? 'bg-muted' : ''}
            >
                <Quote className="w-4 h-4" />
            </Button>

            <div className="w-px h-6 bg-border mx-1 my-auto" />

            <Button type="button" variant="ghost" size="sm" onClick={setLink} className={editor.isActive('link') ? 'bg-muted' : ''}>
                <LinkIcon className="w-4 h-4" />
            </Button>
            <Button type="button" variant="ghost" size="sm" onClick={addMediaByURL} title="Add Image/Video by URL" className="flex items-center gap-1">
                <ImageIcon className="w-4 h-4" />
                <span className="text-xs font-medium">URL</span>
            </Button>

            <div className="relative">
                <Button type="button" variant="ghost" size="sm" disabled={isUploading} title="Upload Image/Video" className="flex items-center gap-1">
                    {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                    <span className="text-xs font-medium">{isUploading ? '...' : 'Upload'}</span>
                </Button>
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    accept="image/*,video/*"
                    className="absolute inset-0 opacity-0 cursor-pointer w-full"
                    disabled={isUploading}
                    title="Upload Media"
                />
            </div>

            <div className="w-px h-6 bg-border mx-1 my-auto" />

            <Button
                type="button" variant="ghost" size="sm"
                onClick={() => editor.chain().focus().undo().run()}
                disabled={!editor.can().chain().focus().undo().run()}
            >
                <Undo className="w-4 h-4" />
            </Button>
            <Button
                type="button" variant="ghost" size="sm"
                onClick={() => editor.chain().focus().redo().run()}
                disabled={!editor.can().chain().focus().redo().run()}
            >
                <Redo className="w-4 h-4" />
            </Button>
        </div>
    );
};

export default function TiptapEditor({ value, onChange }: TiptapEditorProps) {
    const editor = useEditor({
        immediatelyRender: false,
        extensions: [
            StarterKit,
            Image,
            Video,
            Link.configure({
                openOnClick: false,
                HTMLAttributes: {
                    class: 'text-primary underline cursor-pointer',
                }
            })
        ],
        content: value,
        editorProps: {
            attributes: {
                class: 'prose prose-sm sm:prose-base dark:prose-invert focus:outline-none min-h-[300px] max-h-[600px] overflow-y-auto p-4 w-full max-w-none text-foreground prose-headings:text-foreground prose-p:text-foreground/80 prose-strong:text-foreground prose-li:text-foreground'
            }
        },
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        }
    });

    return (
        <div className="border border-border rounded-md overflow-hidden bg-background">
            <MenuBar editor={editor} />
            <EditorContent editor={editor} />
        </div>
    );
}

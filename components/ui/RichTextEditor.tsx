"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import Placeholder from "@tiptap/extension-placeholder";
import { useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";

import {
  BoldIcon,
  ItalicIcon,
  UnderlineIcon,
  ListIcon,
  ListOrderedIcon,
  Heading2Icon,
  Heading3Icon,
  AlignLeftIcon,
  AlignCenterIcon,
  AlignRightIcon,
  MinusIcon,
  UndoIcon,
  RedoIcon,
  RemoveFormattingIcon,
} from "lucide-react";

interface RichTextEditorProps {
  value?: string;
  onChange?: (html: string) => void;
  placeholder?: string;
  className?: string;
  minHeight?: string;
}

interface ToolbarButtonProps {
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  title: string;
  children: React.ReactNode;
}

function ToolbarButton({ onClick, active, disabled, title, children }: ToolbarButtonProps) {
  return (
    <button
      type="button"
      title={title}
      disabled={disabled}
      onMouseDown={(e) => {
        e.preventDefault(); // prevent losing focus in editor
        onClick();
      }}
      className={cn(
        "flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors",
        "hover:bg-muted hover:text-foreground",
        "disabled:opacity-30 disabled:cursor-not-allowed",
        active && "bg-primary/10 text-primary"
      )}
    >
      {children}
    </button>
  );
}

function Divider() {
  return <div className="mx-0.5 h-5 w-px bg-border" />;
}

export function RichTextEditor({
  value = "",
  onChange,
  placeholder = "Start writing…",
  className,
  minHeight = "120px",
}: RichTextEditorProps) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
        bulletList: {
          HTMLAttributes: { class: "rte-ul" },
        },
        orderedList: {
          HTMLAttributes: { class: "rte-ol" },
        },
        listItem: {
          HTMLAttributes: { class: "rte-li" },
        },
        blockquote: {
          HTMLAttributes: { class: "rte-blockquote" },
        },
        horizontalRule: {
          HTMLAttributes: { class: "rte-hr" },
        },
      }),
      Underline,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Placeholder.configure({
        placeholder,
        emptyEditorClass: "rte-empty",
      }),
    ],
    content: value || "",
    editorProps: {
      attributes: {
        class: "rte-content outline-none",
        style: `min-height: ${minHeight}`,
      },
    },
    onUpdate({ editor }) {
      const html = editor.getHTML();
      // If the content is just an empty paragraph, return empty string
      const isEmpty = editor.isEmpty;
      onChange?.(isEmpty ? "" : html);
    },
  });

  // Sync external value changes (e.g. when form resets)
  const prevValue = useCallback(() => value, [value]);
  useEffect(() => {
    if (!editor) return;
    const currentHTML = editor.getHTML();
    if (value !== currentHTML && value !== prevValue()) {
      editor.commands.setContent(value || "");
    }
  }, [value, editor, prevValue]);

  if (!editor) return null;

  return (
    <div className={cn("rounded-xl border bg-background overflow-hidden focus-within:ring-2 focus-within:ring-primary/30", className)}>
      {/* ── Toolbar ─────────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-0.5 border-b bg-muted/30 px-2 py-1.5">
        {/* History */}
        <ToolbarButton title="Undo" onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()}>
          <UndoIcon className="h-3.5 w-3.5" />
        </ToolbarButton>
        <ToolbarButton title="Redo" onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()}>
          <RedoIcon className="h-3.5 w-3.5" />
        </ToolbarButton>

        <Divider />

        {/* Text style */}
        <ToolbarButton title="Bold (⌘B)" onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive("bold")}>
          <BoldIcon className="h-3.5 w-3.5" />
        </ToolbarButton>
        <ToolbarButton title="Italic (⌘I)" onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive("italic")}>
          <ItalicIcon className="h-3.5 w-3.5" />
        </ToolbarButton>
        <ToolbarButton title="Underline (⌘U)" onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive("underline")}>
          <UnderlineIcon className="h-3.5 w-3.5" />
        </ToolbarButton>

        <Divider />

        {/* Headings */}
        <ToolbarButton title="Heading 2" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive("heading", { level: 2 })}>
          <Heading2Icon className="h-3.5 w-3.5" />
        </ToolbarButton>
        <ToolbarButton title="Heading 3" onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive("heading", { level: 3 })}>
          <Heading3Icon className="h-3.5 w-3.5" />
        </ToolbarButton>

        <Divider />

        {/* Lists */}
        <ToolbarButton title="Bullet list" onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive("bulletList")}>
          <ListIcon className="h-3.5 w-3.5" />
        </ToolbarButton>
        <ToolbarButton title="Numbered list" onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive("orderedList")}>
          <ListOrderedIcon className="h-3.5 w-3.5" />
        </ToolbarButton>

        <Divider />

        {/* Alignment */}
        <ToolbarButton title="Align left" onClick={() => editor.chain().focus().setTextAlign("left").run()} active={editor.isActive({ textAlign: "left" })}>
          <AlignLeftIcon className="h-3.5 w-3.5" />
        </ToolbarButton>
        <ToolbarButton title="Align center" onClick={() => editor.chain().focus().setTextAlign("center").run()} active={editor.isActive({ textAlign: "center" })}>
          <AlignCenterIcon className="h-3.5 w-3.5" />
        </ToolbarButton>
        <ToolbarButton title="Align right" onClick={() => editor.chain().focus().setTextAlign("right").run()} active={editor.isActive({ textAlign: "right" })}>
          <AlignRightIcon className="h-3.5 w-3.5" />
        </ToolbarButton>

        <Divider />

        {/* Divider line + clear */}
        <ToolbarButton title="Insert horizontal line" onClick={() => editor.chain().focus().setHorizontalRule().run()}>
          <MinusIcon className="h-3.5 w-3.5" />
        </ToolbarButton>
        <ToolbarButton title="Clear formatting" onClick={() => editor.chain().focus().clearNodes().unsetAllMarks().run()}>
          <RemoveFormattingIcon className="h-3.5 w-3.5" />
        </ToolbarButton>
      </div>

      {/* ── Editor ──────────────────────────────────────────────────────────── */}
      <EditorContent editor={editor} className="px-3 py-2.5 text-sm" />
    </div>
  );
}

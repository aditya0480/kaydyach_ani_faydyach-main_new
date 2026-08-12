"use client";

import { Button } from "@/components/ui/button";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { CharacterCount } from "@tiptap/extension-character-count";
import { Placeholder } from "@tiptap/extension-placeholder";
import { TextAlign } from "@tiptap/extension-text-align";
import { Underline } from "@tiptap/extension-underline";
import { Editor, EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import {
  Bold,
  Code,
  Heading1,
  Heading2,
  Heading3,
  Italic,
  List,
  ListOrdered,
  LucideIcon,
  Quote,
  Redo,
  Strikethrough,
  Underline as UnderlineIcon,
  Undo,
} from "lucide-react";
import {
  useFormContext
} from "react-hook-form";
import { IconType } from "react-icons";
import { InputFieldProps } from "./InputField";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useCallback, useEffect, useRef, useState } from "react";

import { Textarea } from "@/components/ui/textarea";
import { useMutation } from "@tanstack/react-query";
import markdown from "@wcj/markdown-to-html";
import { Bot, Sparkles } from "lucide-react";
import { toast } from "react-hot-toast";
import { generateEditorContent } from "./actions/editor.action";

const markdownRegex =
  /(^#{1,6}\s)|(^\s*[\-\*]\s)|(\[.+\]\(.+\))|([\*_]{1,2}.+[\*_]{1,2})/;

interface InputEditorV2Props extends Omit<InputFieldProps, "form" | "type"> {
  maxLength?: number;
  context?: string;
  defaultPrompt?: string;
}

// Toolbar component for rich text editing
const EditorToolbar = ({
  editor,
  isAiEnabled,
  onAiToggle,
}: {
  editor: Editor | null;
  isAiEnabled: boolean;
  onAiToggle: () => void;
}) => {
  if (!editor) return null;

  const ToolbarButton = ({
    onClick,
    isActive = false,
    disabled = false,
    icon: Icon,
    tooltip,
    isAiButton = false,
  }: {
    onClick: () => void;
    isActive?: boolean;
    disabled?: boolean;
    icon: LucideIcon | IconType;
    tooltip: string;
    isAiButton?: boolean;
  }) => {
    const handleClick = useCallback(
      (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        // Execute the command immediately
        onClick();

        // Ensure editor stays focused and force update
        requestAnimationFrame(() => {
          if (editor && editor.view) {
            editor.view.focus();
            // Force a selection update to refresh toolbar state
            editor.view.dispatch(editor.view.state.tr);
          }
        });
      },
      [onClick]
    );

    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="button"
              variant={isActive ? "default" : "ghost"}
              size="sm"
              onClick={handleClick}
              disabled={disabled}
              className={cn(
                "h-8 w-8 p-0 transition-all duration-200",
                isActive && "bg-primary text-primary-foreground",
                !isActive && "hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <Icon
                className={cn(
                  "h-4 w-4 transition-transform duration-200",
                  isAiButton && isActive && "animate-pulse"
                )}
              />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{tooltip}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  };

  return (
    <div className="rounded-t-md border-b border-gray-200 bg-gray-50/50 p-2">
      <div className="flex flex-wrap items-center gap-1">
        {/* Text Formatting */}
        <ToolbarButton
          onClick={() => {
            editor.chain().focus().toggleBold().run();
          }}
          isActive={editor.isActive("bold")}
          icon={Bold}
          tooltip="Bold (Ctrl+B)"
        />
        <ToolbarButton
          onClick={() => {
            editor.chain().focus().toggleItalic().run();
          }}
          isActive={editor.isActive("italic")}
          icon={Italic}
          tooltip="Italic (Ctrl+I)"
        />
        <ToolbarButton
          onClick={() => {
            editor.chain().focus().toggleUnderline().run();
          }}
          isActive={editor.isActive("underline")}
          icon={UnderlineIcon}
          tooltip="Underline (Ctrl+U)"
        />
        <ToolbarButton
          onClick={() => {
            editor.chain().focus().toggleStrike().run();
          }}
          isActive={editor.isActive("strike")}
          icon={Strikethrough}
          tooltip="Strikethrough"
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleCode().run()}
          isActive={editor.isActive("code")}
          icon={Code}
          tooltip="Inline Code"
        />

        <Separator orientation="vertical" className="mx-1 h-6" />

        {/* Headings */}
        <ToolbarButton
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 1 }).run()
          }
          isActive={editor.isActive("heading", { level: 1 })}
          icon={Heading1}
          tooltip="Heading 1"
        />
        <ToolbarButton
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
          isActive={editor.isActive("heading", { level: 2 })}
          icon={Heading2}
          tooltip="Heading 2"
        />
        <ToolbarButton
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 3 }).run()
          }
          isActive={editor.isActive("heading", { level: 3 })}
          icon={Heading3}
          tooltip="Heading 3"
        />

        <Separator orientation="vertical" className="mx-1 h-6" />

        {/* Lists */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          isActive={editor.isActive("bulletList")}
          icon={List}
          tooltip="Bullet List"
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          isActive={editor.isActive("orderedList")}
          icon={ListOrdered}
          tooltip="Numbered List"
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          isActive={editor.isActive("blockquote")}
          icon={Quote}
          tooltip="Quote Block"
        />

        <Separator orientation="vertical" className="mx-1 h-6" />

        {/* Actions */}
        <ToolbarButton
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          icon={Undo}
          tooltip="Undo (Ctrl+Z)"
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          icon={Redo}
          tooltip="Redo (Ctrl+Y)"
        />

        <Separator orientation="vertical" className="mx-1 h-6" />

        {/* AI Toggle Button - Always Visible */}
        <div className="relative">
          <ToolbarButton
            onClick={onAiToggle}
            isActive={isAiEnabled}
            icon={Bot}
            tooltip="🤖 AI Assistant - Click to enable AI content generation"
            isAiButton={true}
          />
          {!isAiEnabled && (
            <div className="absolute -top-1 -right-1 h-3 w-3 animate-pulse rounded-full border-2 border-background bg-primary" />
          )}
        </div>
      </div>
    </div>
  );
};

const InputEditorV2 = (props: InputEditorV2Props) => {
  const {
    label,
    name,
    placeholder,
    className,
    disabled = false, // Added default value
    description,
    required = false, // Added default value
    context,
    defaultPrompt,
  } = props;
  const form = useFormContext(); // Keep form context for now, as useController needs form.control

  const [isAiEnabled, setIsAiEnabled] = useState(true);
  const [aiPrompt, setAiPrompt] = useState(defaultPrompt || "");
  const isUpdatingRef = useRef(false);

  if (!form) {
    throw new Error("InputEditorV2 must be used within a FormProvider");
  }

  // Create editor instance outside of render function to prevent recreation
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3, 4, 5, 6],
        },
        bulletList: {
          keepMarks: true,
          keepAttributes: false,
          HTMLAttributes: {
            class: "tiptap-bullet-list",
          },
        },
        orderedList: {
          keepMarks: true,
          keepAttributes: false,
          HTMLAttributes: {
            class: "tiptap-ordered-list",
          },
        },
        blockquote: {
          HTMLAttributes: {
            class: "tiptap-blockquote",
          },
        },
        bold: {
          HTMLAttributes: {
            class: "tiptap-bold",
          },
        },
        italic: {
          HTMLAttributes: {
            class: "tiptap-italic",
          },
        },
        strike: {
          HTMLAttributes: {
            class: "tiptap-strike",
          },
        },
        code: {
          HTMLAttributes: {
            class: "tiptap-code",
          },
        },
      }),
      Underline.configure({
        HTMLAttributes: {
          class: "tiptap-underline",
        },
      }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
        alignments: ["left", "center", "right"],
      }),
      Placeholder.configure({
        placeholder: () => {
          return placeholder || "Start writing...";
        },
        emptyEditorClass: "is-editor-empty",
        showOnlyWhenEditable: true,
        includeChildren: true,
      }),
      CharacterCount.configure({
        limit: props.maxLength,
      }),
    ],
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      form.setValue(name, html, { shouldValidate: true, shouldDirty: true });
    },
    onBlur: ({ editor }) => {
      const html = editor.getHTML();
      form.setValue(name, html, { shouldValidate: true, shouldDirty: true });
    },

    editorProps: {
      attributes: {
        class: cn(
          "prose prose-sm sm:prose-base lg:prose-lg xl:prose-xl",
          "min-h-[200px] max-w-none focus:outline-none",
          "rounded-b-md border-0 p-4",
          "prose-headings:mt-4 prose-headings:mb-2",
          "prose-p:my-2 prose-ul:my-2 prose-ol:my-2",
          "prose-li:my-1 prose-blockquote:my-4"
        ),
        "data-placeholder": placeholder || "Start writing...",
      },
      handleKeyDown: (view, event) => {
        // Prevent form submission on Enter in single line mode
        if (event.key === "Enter" && event.ctrlKey) {
          return false; // Allow Ctrl+Enter to create new lines
        }
        return false;
      },
    },
  });

  // Auto-focus on mount if needed
  const handleContainerClick = useCallback(() => {
    if (editor && !editor.isFocused) {
      editor.commands.focus();
    }
  }, [editor]);

  // Initialize editor content only once on mount
  useEffect(() => {
    if (!editor) return;

    const currentValue = form.getValues(name);

    // Only set content if editor is empty and we have a value
    if (currentValue && editor.isEmpty) {
      isUpdatingRef.current = true; // Prevent onUpdate from firing during initialization

      if (markdownRegex.test(currentValue)) {
        const html = markdown(currentValue);
        if (typeof html === "string") {
          editor.commands.setContent(html);
        }
      } else {
        editor.commands.setContent(currentValue);
      }

      // Reset the flag after initialization
      setTimeout(() => {
        isUpdatingRef.current = false;
      }, 50);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor]); // Intentionally omitting form and name to prevent re-initialization  // AI content generation mutation
  const generateContentMutation = useMutation({
    mutationFn: async ({
      currentContent,
      userPrompt,
      context,
    }: {
      currentContent: string;
      userPrompt: string;
      context?: string;
    }) => {
      return await generateEditorContent({
        currentContent,
        userPrompt,
        context,
      });
    },
    onSuccess: (result) => {
      if (result.success && result.content && editor) {
        if (markdownRegex.test(result.content)) {
          const html = markdown(result.content);
          if (typeof html === "string") {
            editor.commands.setContent(html);
          }
        } else {
          editor.commands.setContent(result.content);
        }

        // Clear the AI prompt but keep AI panel open for additional requests
        setAiPrompt("");
        toast.success("Content generated successfully!");
      } else {
        toast.error(result.error || "Failed to generate content");
      }
    },
    onError: (error) => {
      console.error("Error generating content:", error);
      toast.error("An error occurred while generating content");
    },
  });

  // Handle AI content generation
  const handleGenerateContent = () => {
    if (!aiPrompt.trim() || !editor) return;

    const currentContent = editor.getHTML() || "";

    generateContentMutation.mutate({
      currentContent,
      userPrompt: aiPrompt.trim(),
      context: context,
    });
  };

  return (
    <>
      <FormField
        control={form.control}
        name={name}
        disabled={disabled}
        render={() => {
          // Remove the setOptions calls that cause cursor jumping
          // The onUpdate is already handled in the editor initialization
          return (
            <FormItem
              className={cn(
                "w-full",
                "group transition-all duration-300 ease-in-out",
                className
              )}
            >
              <FormLabel
                className={cn(
                  "text-sm font-medium transition-colors",
                  "group-hover:text-primary",
                  required &&
                  "after:ml-0.5 after:text-red-500 after:content-['*']"
                )}
              >
                {label}
              </FormLabel>
              <FormControl>
                <div
                  className={cn(
                    "overflow-hidden rounded-md border transition-all duration-200",
                    "bg-background hover:bg-accent/5",
                    disabled && "cursor-not-allowed bg-muted opacity-50"
                  )}
                  onClick={handleContainerClick}
                >
                  {/* Toolbar */}
                  <EditorToolbar
                    editor={editor}
                    isAiEnabled={isAiEnabled}
                    onAiToggle={() => setIsAiEnabled(!isAiEnabled)}
                  />

                  {/* Editor Content */}
                  <div className="relative">
                    <EditorContent
                      editor={editor}
                      className={cn(
                        "max-h-125 min-h-50 overflow-y-auto px-4 py-3",
                        "prose prose-sm max-w-none",
                        "[&_.ProseMirror]:min-h-45 [&_.ProseMirror]:outline-none",
                        // Placeholder styling is now handled in globals.css
                        // Custom TipTap styling
                        "[&_.tiptap-bold]:font-bold",
                        "[&_.tiptap-italic]:italic",
                        "[&_.tiptap-strike]:line-through",
                        "[&_.tiptap-underline]:underline",
                        "[&_.tiptap-code]:rounded [&_.tiptap-code]:bg-muted [&_.tiptap-code]:px-1 [&_.tiptap-code]:font-mono [&_.tiptap-code]:text-xs",
                        "[&_.tiptap-blockquote]:my-4 [&_.tiptap-blockquote]:border-l-4 [&_.tiptap-blockquote]:border-border [&_.tiptap-blockquote]:pl-4 [&_.tiptap-blockquote]:text-muted-foreground [&_.tiptap-blockquote]:italic",
                        "[&_.tiptap-bullet-list]:my-2 [&_.tiptap-bullet-list]:ml-6 [&_.tiptap-bullet-list]:list-disc",
                        "[&_.tiptap-ordered-list]:my-2 [&_.tiptap-ordered-list]:ml-6 [&_.tiptap-ordered-list]:list-decimal",
                        "[&_h1]:mt-6 [&_h1]:mb-4 [&_h1]:text-2xl [&_h1]:font-bold",
                        "[&_h2]:mt-5 [&_h2]:mb-3 [&_h2]:text-xl [&_h2]:font-bold",
                        "[&_h3]:mt-4 [&_h3]:mb-2 [&_h3]:text-lg [&_h3]:font-semibold",
                        "[&_p]:my-2 [&_p]:leading-relaxed",
                        "prose-editor-content"
                      )}
                    />

                    {/* Character count (optional) */}
                    {props.maxLength && (
                      <div className="absolute right-3 bottom-2 text-xs text-muted-foreground">
                        {editor?.storage.characterCount?.characters() || 0}/
                        {props.maxLength}
                      </div>
                    )}
                  </div>
                </div>
              </FormControl>

              {/* AI Prompt Input */}
              {isAiEnabled && (
                <div className="animate-in slide-in-from-top-2 mt-3 rounded-md border border-border bg-muted/50 p-3 duration-300">
                  <div className="mb-2 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium text-foreground">
                        AI Content Generation
                      </span>
                    </div>
                    {context && (
                      <div className="flex items-center gap-1 rounded-full bg-accent px-2 py-1">
                        <div className="h-2 w-2 animate-pulse rounded-full bg-primary" />
                        <span className="text-xs font-medium text-accent-foreground">
                          Context Enabled
                        </span>
                      </div>
                    )}
                  </div>
                  {context && (
                    <div className="mb-3 rounded border border-border bg-background p-2 text-xs text-muted-foreground">
                      <span className="font-medium text-foreground">
                        Context:{" "}
                      </span>
                      <span className="italic">
                        {context.length > 100
                          ? `${context.substring(0, 100)}...`
                          : context}
                      </span>
                    </div>
                  )}
                  <Textarea
                    placeholder={
                      context
                        ? "Describe what you want to generate (AI will use the provided context)... Press Enter to generate."
                        : "Describe what you want to generate... Press Enter to generate."
                    }
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleGenerateContent();
                      }
                    }}
                    className="min-h-20 resize-none"
                    disabled={disabled}
                  />
                  <div className="mt-2 flex justify-end">
                    <Button
                      type="button"
                      size="sm"
                      onClick={handleGenerateContent}
                      disabled={
                        !aiPrompt.trim() ||
                        disabled ||
                        generateContentMutation.isPending
                      }
                      className="text-xs"
                    >
                      <Sparkles
                        className={cn(
                          "mr-1 h-3 w-3",
                          generateContentMutation.isPending && "animate-spin"
                        )}
                      />
                      {generateContentMutation.isPending
                        ? "Generating..."
                        : "Generate"}
                    </Button>
                  </div>
                  <div className="mt-2 text-xs text-muted-foreground">
                    Press{" "}
                    <kbd className="rounded border bg-background px-1.5 py-0.5 font-mono text-xs">
                      Enter
                    </kbd>{" "}
                    to generate,{" "}
                    <kbd className="rounded border bg-background px-1.5 py-0.5 font-mono text-xs">
                      Shift+Enter
                    </kbd>{" "}
                    for new line
                  </div>
                </div>
              )}

              {/* Description and validation */}
              <div className="space-y-1">
                {description && (
                  <p className="text-xs text-muted-foreground">{description}</p>
                )}
                <FormMessage className="animate-in fade-in-50 text-xs font-medium text-destructive" />
              </div>
            </FormItem>
          );
        }}
      />

      {/* Data handler for form synchronization */}
    </>
  );
};

export default InputEditorV2;

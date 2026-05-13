// SimpleCRM — lead-notes-section.tsx
import { useState, useRef, useEffect } from "react";
import { formatDistanceToNow } from "date-fns";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { MessageSquare } from "lucide-react";

interface NoteAuthor {
  avatarInitials: string;
  name: string;
}

interface NoteItem {
  id: string;
  author: NoteAuthor;
  createdAt: string | Date;
  body?: string;
  content?: string;
}

interface LeadNotesSectionProps {
  notes: NoteItem[];
  onAddNote: (body: string) => Promise<void>;
  isSample?: boolean;
}

export function LeadNotesSection({ notes, onAddNote, isSample }: LeadNotesSectionProps) {
  const [body, setBody] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleInput = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  useEffect(() => {
    handleInput();
  }, [body]);

  const handleSubmit = async () => {
    if (!body.trim() || isSample) return;
    setIsSubmitting(true);
    await onAddNote(body.trim());
    setBody("");
    setIsSubmitting(false);
    if (textareaRef.current) {
      textareaRef.current.style.height = "80px";
    }
  };

  return (
    <div className="flex h-full w-full flex-col border-r border-border bg-card">
      <div className="shrink-0 border-b border-border p-6">
        <h3 className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
          Notes
        </h3>
        <div className="rounded-xl border border-neutral-200 bg-white p-3 shadow-sm focus-within:ring-1 focus-within:ring-blue-500 focus-within:border-blue-500 transition-all">
          <textarea
            ref={textareaRef}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            onInput={handleInput}
            disabled={isSample || isSubmitting}
            placeholder={isSample ? "Sample leads cannot save notes." : "Write a note..."}
            className="w-full min-h-[80px] resize-none outline-none text-[13px] placeholder:text-neutral-400 disabled:opacity-50"
          />
          <div className="flex justify-end mt-2">
            <Button
              size="sm"
              disabled={!body.trim() || isSubmitting || isSample}
              onClick={handleSubmit}
              className="h-8 px-4 text-[13px] bg-neutral-900 text-white hover:bg-neutral-800"
            >
              Add note
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 pt-4 custom-scrollbar">
        {notes.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-neutral-400 py-8">
            <MessageSquare className="h-8 w-8 mb-2 opacity-20" />
            <span className="text-[13px]">No notes yet</span>
          </div>
        ) : (
          <div className="space-y-3">
            {notes.map((note) => (
              <div key={note.id} className="rounded-lg bg-neutral-50 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Avatar className="h-6 w-6">
                    <AvatarFallback className="bg-neutral-200 text-[10px] text-neutral-600 font-medium">
                      {note.author.avatarInitials}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-[13px] font-medium text-neutral-900">
                    {note.author.name}
                  </span>
                  <span className="text-[13px] text-neutral-400">·</span>
                  <span className="text-[11px] text-neutral-500">
                    {formatDistanceToNow(new Date(note.createdAt), { addSuffix: true })}
                  </span>
                </div>
                <p className="text-[13px] text-neutral-700 whitespace-pre-wrap leading-relaxed">
                  {note.body ?? note.content}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

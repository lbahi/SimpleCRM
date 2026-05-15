import { useState, useRef, useEffect } from "react";
import { formatDistanceToNow } from "date-fns";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { MessageSquare, Send } from "lucide-react";

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
      textareaRef.current.style.height = "40px";
    }
  };

  return (
    <div className="px-6 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h3 className="text-[11px] font-bold uppercase tracking-widest text-neutral-400">Notes</h3>
        <span className="text-[11px] font-medium text-neutral-400">{notes.length} notes</span>
      </div>

      <div className="mb-8 rounded-2xl border border-neutral-200 bg-white p-2 shadow-sm focus-within:ring-2 focus-within:ring-neutral-900/5 focus-within:border-neutral-900 transition-all">
        <textarea
          ref={textareaRef}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          onInput={handleInput}
          disabled={isSample || isSubmitting}
          placeholder={isSample ? "Sample leads cannot save notes." : "Add a private note..."}
          className="w-full min-h-[40px] px-3 py-2 resize-none outline-none text-[13px] text-neutral-700 placeholder:text-neutral-400 disabled:opacity-50"
        />
        <div className="flex justify-end pt-1">
          <Button
            size="sm"
            disabled={!body.trim() || isSubmitting || isSample}
            onClick={handleSubmit}
            className="h-8 rounded-xl bg-neutral-900 text-white hover:bg-neutral-800 gap-2"
          >
            <Send size={13} />
            Post note
          </Button>
        </div>
      </div>

      <div className="space-y-6">
        {notes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-neutral-300">
            <MessageSquare className="h-10 w-10 mb-2 opacity-20" />
            <span className="text-[13px] font-medium">No notes recorded for this lead</span>
          </div>
        ) : (
          notes.map((note) => (
            <div key={note.id} className="flex gap-4 group">
              <div className="h-8 w-8 rounded-full bg-neutral-100 flex items-center justify-center text-[10px] font-bold text-neutral-500 flex-shrink-0">
                {note.author.avatarInitials}
              </div>
              <div className="flex flex-col gap-1.5 flex-1 pt-1">
                <div className="flex items-center gap-2">
                  <span className="text-[13px] font-bold text-neutral-900">{note.author.name}</span>
                  <span className="text-[11px] text-neutral-400">
                    {formatDistanceToNow(new Date(note.createdAt), { addSuffix: true })}
                  </span>
                </div>
                <div className="text-[13px] text-neutral-700 leading-relaxed bg-white border border-neutral-100 rounded-2xl px-4 py-3 shadow-sm group-hover:border-neutral-200 transition-colors">
                  {note.body ?? note.content}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

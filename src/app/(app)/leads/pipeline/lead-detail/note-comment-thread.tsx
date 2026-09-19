// SimpleCRM — note-comment-thread
"use client";

import React, { useState, useCallback } from "react";
import { formatDistanceToNow } from "date-fns";
import { Send, MessageSquare, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NoteCommentEditForm } from "./note-comment-edit-form";

interface CommentAuthor {
  id: string;
  name: string;
  avatarInitials: string;
}

interface NoteComment {
  id: string;
  body: string;
  createdAt: string | Date;
  author: CommentAuthor;
}

interface NoteCommentThreadProps {
  leadId: string;
  noteId: string;
  isSample?: boolean;
}

export function NoteCommentThread({ leadId, noteId, isSample }: NoteCommentThreadProps) {
  const [open, setOpen] = useState(false);
  const [comments, setComments] = useState<NoteComment[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const loadComments = useCallback(async () => {
    if (loaded) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/leads/${leadId}/notes/${noteId}/comments`);
      if (res.ok) {
        const data = await res.json() as { comments: NoteComment[]; currentUserId: string };
        setComments(data.comments);
        setCurrentUserId(data.currentUserId);
        setLoaded(true);
      }
    } finally {
      setLoading(false);
    }
  }, [leadId, noteId, loaded]);

  const handleToggle = async () => {
    const next = !open;
    setOpen(next);
    if (next) await loadComments();
  };

  const handleSubmit = async () => {
    if (!body.trim() || isSample || submitting) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/leads/${leadId}/notes/${noteId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: body.trim() }),
      });
      if (res.ok) {
        const newComment = await res.json() as NoteComment;
        setComments((prev) => [...prev, newComment]);
        setBody("");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleSaveEdit = async (commentId: string, newBody: string) => {
    const res = await fetch(`/api/leads/${leadId}/notes/${noteId}/comments`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ commentId, body: newBody }),
    });
    if (res.ok) {
      const updated = await res.json() as NoteComment;
      setComments((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
      setEditingId(null);
    }
  };

  return (
    <div className="mt-2 pl-1">
      <button
        onClick={handleToggle}
        className="flex items-center gap-1.5 text-[11px] font-medium text-neutral-400 hover:text-neutral-600 transition-colors"
      >
        <MessageSquare size={12} />
        {open
          ? "Hide replies"
          : comments.length > 0 || loaded
          ? `${comments.length} ${comments.length === 1 ? "reply" : "replies"}`
          : "Reply"}
      </button>

      {open && (
        <div className="mt-3 space-y-3 border-l-2 border-neutral-100 pl-4">
          {loading && (
            <span className="text-[12px] text-neutral-400">Loading…</span>
          )}

          {comments.map((c) => {
            const isOwn = currentUserId === c.author.id;
            const isEditing = editingId === c.id;

            return (
              <div key={c.id} className="flex gap-2.5 group/comment">
                <div className="h-6 w-6 rounded-full bg-neutral-100 flex items-center justify-center text-[9px] font-bold text-neutral-500 flex-shrink-0 mt-0.5">
                  {c.author.avatarInitials}
                </div>
                <div className="flex flex-col gap-0.5 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[12px] font-bold text-neutral-800">
                      {c.author.name}
                    </span>
                    <span className="text-[10px] text-neutral-400">
                      {formatDistanceToNow(new Date(c.createdAt), { addSuffix: true })}
                    </span>
                    {isOwn && !isEditing && (
                      <button
                        onClick={() => setEditingId(c.id)}
                        className="ml-auto p-1 rounded-md text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-all"
                        title="Edit comment"
                      >
                        <Pencil size={11} />
                      </button>
                    )}
                  </div>

                  {isEditing ? (
                    <NoteCommentEditForm
                      comment={c}
                      onSave={handleSaveEdit}
                      onCancel={() => setEditingId(null)}
                    />
                  ) : (
                    <div className="text-[12px] text-neutral-600 leading-relaxed bg-neutral-50 border border-neutral-100 rounded-xl px-3 py-2">
                      {c.body}
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {!isSample && (
            <div className="flex gap-2 pt-1">
              <input
                value={body}
                onChange={(e) => setBody(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit();
                  }
                }}
                disabled={submitting}
                placeholder="Write a reply…"
                className="flex-1 text-[12px] px-3 py-1.5 rounded-xl border border-neutral-200 bg-white outline-none placeholder:text-neutral-400 focus:border-neutral-400 transition-colors disabled:opacity-50"
              />
              <Button
                size="sm"
                disabled={!body.trim() || submitting}
                onClick={handleSubmit}
                className="h-8 rounded-xl bg-neutral-900 text-white hover:bg-neutral-800 gap-1.5 px-3"
              >
                <Send size={11} />
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

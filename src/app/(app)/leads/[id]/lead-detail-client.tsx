"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  ArrowLeft, 
  Phone, 
  Mail, 
  Calendar, 
  User as UserIcon, 
  Tag, 
  Trash2,
  CheckCircle2,
  Send,
  History,
  MessageSquare,
  Plus,
  Bell,
  Check,
  FileText
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import type { LeadWithRelations } from "@/modules/leads/leads.types";
import { toast } from "sonner";
import { CreateReminderDialog } from "./create-reminder-dialog";

interface LeadDetailClientProps {
  initialLead: LeadWithRelations;
}

const STATUS_STYLES: Record<string, string> = {
  NEW: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  CONTACTED: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  QUALIFIED: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  CONVERTED: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  LOST: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

export function LeadDetailClient({ initialLead }: LeadDetailClientProps) {
  const router = useRouter();
  const [lead, setLead] = useState(initialLead);
  const [timeline, setTimeline] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [newNote, setNewNote] = useState("");
  const [activeTab, setActiveTab] = useState("activity");
  const [showReminderDialog, setShowReminderDialog] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [newSubject, setNewSubject] = useState("");
  const [sendingEmail, setSendingEmail] = useState(false);

  const fetchTimeline = async () => {
    try {
      const res = await fetch(`/api/leads/${lead.id}/activity`);
      if (res.ok) {
        const data = await res.json();
        setTimeline(data);
      }
    } catch (error) {
      console.error("Failed to fetch timeline", error);
    }
  };

  const fetchMessages = async () => {
    try {
      const res = await fetch(`/api/leads/${lead.id}/messages`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data);
      }
    } catch (error) {
      console.error("Failed to fetch messages", error);
    }
  };

  const fetchLeadData = async () => {
    try {
      const res = await fetch(`/api/leads/${lead.id}`);
      if (res.ok) {
        const data = await res.json();
        setLead(data);
      }
    } catch (error) {
      console.error("Failed to fetch lead data", error);
    }
  };

  useEffect(() => {
    if (activeTab === "activity") {
      fetchTimeline();
    } else if (activeTab === "emails") {
      fetchMessages();
    }
  }, [activeTab]);

  const handleStatusChange = async (newStatus: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/leads/${lead.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) throw new Error("Failed to update status");

      const updated = await res.json();
      setLead(updated);
      toast.success(`Status updated to ${newStatus.toLowerCase()}`);
      fetchTimeline();
    } catch (error) {
      toast.error("Failed to update status");
    } finally {
      setLoading(false);
    }
  };

  const handleAddNote = async () => {
    if (!newNote.trim()) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/leads/${lead.id}/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newNote }),
      });

      if (!res.ok) throw new Error("Failed to add note");

      const note = await res.json();
      setLead({
        ...lead,
        notes: [note, ...lead.notes],
      });
      setNewNote("");
      toast.success("Note added");
      fetchTimeline();
    } catch (error) {
      toast.error("Failed to add note");
    } finally {
      setLoading(false);
    }
  };

  const handleSendEmail = async () => {
    if (!newSubject.trim() || !newMessage.trim()) return;
    
    setSendingEmail(true);
    try {
      const res = await fetch(`/api/leads/${lead.id}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject: newSubject, body: newMessage }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to send email");
      }

      toast.success("Email sent!");
      setNewSubject("");
      setNewMessage("");
      fetchMessages();
      fetchTimeline();
    } catch (error: any) {
      toast.error(error.message || "Failed to send email");
    } finally {
      setSendingEmail(false);
    }
  };

  const handleDismissReminder = async (id: string) => {
    try {
      const res = await fetch(`/api/reminders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "dismiss" }),
      });

      if (!res.ok) throw new Error("Failed to dismiss reminder");

      toast.success("Reminder dismissed");
      fetchLeadData();
      fetchTimeline();
    } catch (error) {
      toast.error("Failed to dismiss reminder");
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this lead?")) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/leads/${lead.id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete lead");

      toast.success("Lead deleted");
      router.push("/leads");
    } catch (error) {
      toast.error("Failed to delete lead");
      setLoading(false);
    }
  };

  const isOverdue = (date: Date | string) => {
    return new Date(date) < new Date();
  };

  return (
    <div className="space-y-6">
      {/* Top Navigation / Actions */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            className="-ml-2"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h2 className="text-2xl font-bold tracking-tight">{lead.name}</h2>
            <div className="flex items-center gap-2 mt-1">
              <Badge className={cn("rounded-full", STATUS_STYLES[lead.status])}>
                {lead.status}
              </Badge>
              <span className="text-sm text-muted-foreground">
                Added {new Date(lead.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => handleStatusChange("CONTACTED")} disabled={loading}>
            Mark Contacted
          </Button>
          <Button size="sm" onClick={() => handleStatusChange("QUALIFIED")} disabled={loading}>
            <CheckCircle2 className="mr-2 h-4 w-4" />
            Qualify
          </Button>
          <Button variant="destructive" size="sm" onClick={handleDelete} disabled={loading}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Details */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3 text-sm">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span className="font-mono">{lead.phone}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span>{lead.email || "No email provided"}</span>
              </div>
              <Separator />
              <div className="flex items-center gap-3 text-sm">
                <UserIcon className="h-4 w-4 text-muted-foreground" />
                <div className="flex items-center gap-2">
                  {lead.assignedTo ? (
                    <>
                      <Avatar className="h-5 w-5">
                        <AvatarFallback className="text-[8px]">
                          {lead.assignedTo.avatarInitials}
                        </AvatarFallback>
                      </Avatar>
                      <span>{lead.assignedTo.name}</span>
                    </>
                  ) : (
                    <span className="text-muted-foreground italic">Unassigned</span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>Sources: {lead.sources?.length ? lead.sources.map((s: any) => s.form?.name || s.source).join(", ") : "Unknown"}</span>
              </div>
            </CardContent>
          </Card>


        </div>

        {/* Right Column: Tabs (Activity/Reminders) */}
        <div className="lg:col-span-2 space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="activity">
                <History className="mr-2 h-4 w-4" />
                Activity
              </TabsTrigger>
              <TabsTrigger value="emails">
                <Mail className="mr-2 h-4 w-4" />
                Emails
              </TabsTrigger>
              <TabsTrigger value="reminders">
                <Calendar className="mr-2 h-4 w-4" />
                Reminders
              </TabsTrigger>
              <TabsTrigger value="form-answers">
                <FileText className="mr-2 h-4 w-4" />
                Form Answers
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="activity" className="mt-4 space-y-6">
              {/* Add Note Section */}
              <div className="space-y-3">
                <Textarea
                  placeholder="Add a private note..."
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  className="min-h-[100px] resize-none"
                />
                <div className="flex justify-end">
                  <Button size="sm" onClick={handleAddNote} disabled={loading || !newNote.trim()}>
                    <Send className="mr-2 h-4 w-4" />
                    Add Note
                  </Button>
                </div>
              </div>

              {/* Activity Timeline */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold flex items-center gap-2">
                  <History className="h-4 w-4" />
                  Activity History
                </h3>
                
                <div className="relative pl-6 space-y-6 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-border">
                  {timeline.length === 0 ? (
                    <p className="text-sm text-muted-foreground italic pl-2">No activity recorded yet.</p>
                  ) : (
                    timeline.map((item) => (
                      <div key={item.id} className="relative">
                        <div className="absolute -left-[23px] top-1 h-3 w-3 rounded-full border-2 border-background bg-primary" />
                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium">{item.content}</p>
                            <span className="text-[10px] text-muted-foreground">
                              {new Date(item.createdAt).toLocaleString()}
                            </span>
                          </div>
                          {item.user && (
                            <div className="flex items-center gap-1.5">
                              <span className="text-[10px] text-muted-foreground italic">by {item.user.name}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <Separator />

              {/* Internal Notes List */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Internal Notes
                </h3>
                
                {lead.notes.length === 0 ? (
                  <p className="text-sm text-muted-foreground italic">No internal notes added.</p>
                ) : (
                  <div className="space-y-3">
                    {lead.notes.map((note) => (
                      <Card key={note.id} className="bg-muted/30">
                        <CardContent className="pt-4 pb-3">
                          <p className="text-sm whitespace-pre-wrap mb-2">{note.body}</p>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                              <Avatar className="h-4 w-4">
                                <AvatarFallback className="text-[6px]">
                                  {note.author.avatarInitials}
                                </AvatarFallback>
                              </Avatar>
                              <span>{note.author.name}</span>
                            </div>
                            <span className="text-[10px] text-muted-foreground">
                              {new Date(note.createdAt).toLocaleString()}
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="emails" className="mt-4 space-y-6">
              <div className="space-y-4">
                <h3 className="text-sm font-semibold flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Compose Email
                </h3>
                
                {lead.email ? (
                  <div className="space-y-3 bg-muted/30 p-4 rounded-lg border">
                    <input 
                      type="text" 
                      placeholder="Subject" 
                      className="w-full text-sm bg-transparent border-b border-border pb-2 focus:outline-none focus:border-primary transition-colors"
                      value={newSubject}
                      onChange={(e) => setNewSubject(e.target.value)}
                    />
                    <Textarea
                      placeholder={`Write email to ${lead.email}...`}
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      className="min-h-[120px] resize-none border-0 focus-visible:ring-0 px-0 bg-transparent"
                    />
                    <div className="flex justify-end pt-2 border-t border-border">
                      <Button 
                        size="sm" 
                        onClick={handleSendEmail} 
                        disabled={sendingEmail || !newSubject.trim() || !newMessage.trim()}
                      >
                        <Send className="mr-2 h-4 w-4" />
                        {sendingEmail ? "Sending..." : "Send Email"}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground italic p-4 bg-muted/30 rounded-lg border">
                    Please add an email address to this lead to send emails.
                  </div>
                )}
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-sm font-semibold flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Email Thread
                </h3>
                
                {messages.length === 0 ? (
                  <p className="text-sm text-muted-foreground italic">No emails exchanged yet.</p>
                ) : (
                  <div className="space-y-4">
                    {messages.map((msg) => (
                      <Card key={msg.id} className={msg.direction === "INBOUND" ? "bg-muted/30 border-primary/20" : "bg-card"}>
                        <CardContent className="pt-4 pb-4">
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex flex-col">
                              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">
                                {msg.direction === "INBOUND" ? "From Lead" : "Sent"}
                              </span>
                              <span className="text-sm font-semibold">{msg.subject}</span>
                            </div>
                            <span className="text-[10px] text-muted-foreground">
                              {new Date(msg.createdAt).toLocaleString()}
                            </span>
                          </div>
                          <p className="text-sm whitespace-pre-wrap text-muted-foreground">{msg.body}</p>
                          {msg.direction === "OUTBOUND" && msg.sender && (
                            <div className="mt-3 text-[10px] text-muted-foreground flex items-center gap-1.5">
                              <Avatar className="h-4 w-4">
                                <AvatarFallback className="text-[6px]">
                                  {msg.sender.avatarInitials}
                                </AvatarFallback>
                              </Avatar>
                              <span>Sent by {msg.sender.name}</span>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="reminders" className="mt-4 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold flex items-center gap-2">
                  <Bell className="h-4 w-4" />
                  Pending Reminders
                </h3>
                <Button size="sm" variant="outline" onClick={() => setShowReminderDialog(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Set Reminder
                </Button>
              </div>

              {lead.reminders.length === 0 ? (
                <Card>
                  <CardContent className="py-8 text-center text-muted-foreground italic">
                    <p>No pending reminders for this lead.</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-3">
                  {lead.reminders.map((reminder) => (
                    <Card key={reminder.id} className={cn("overflow-hidden", isOverdue(reminder.dueAt) && "border-destructive/50")}>
                      <CardContent className="p-4 flex items-center justify-between">
                        <div className="space-y-1">
                          <p className="text-sm font-semibold">{reminder.note || "No note"}</p>
                          <p className={cn(
                            "text-[10px] font-medium",
                            isOverdue(reminder.dueAt) ? "text-destructive" : "text-muted-foreground"
                          )}>
                            Due: {new Date(reminder.dueAt).toLocaleString()}
                            {isOverdue(reminder.dueAt) && " (Overdue)"}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-green-600 hover:text-green-700 hover:bg-green-100"
                          onClick={() => handleDismissReminder(reminder.id)}
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="form-answers" className="mt-4 space-y-4">
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Custom Form Answers
              </h3>

              {!lead.customData || Object.keys(lead.customData as object).length === 0 ? (
                <Card>
                  <CardContent className="py-8 text-center text-muted-foreground italic">
                    <p>No custom form answers available for this lead.</p>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="pt-6 space-y-4">
                    {Object.entries(lead.customData as object).map(([question, answer], index) => (
                      <div key={index} className="space-y-1">
                        <p className="text-sm font-medium text-muted-foreground">{question}</p>
                        <p className="text-base">
                          {Array.isArray(answer) ? answer.join(", ") : (answer === true ? "Yes" : answer === false ? "No" : String(answer))}
                        </p>
                        {index < Object.keys(lead.customData as object).length - 1 && <Separator className="mt-4" />}
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <CreateReminderDialog
        leadId={lead.id}
        open={showReminderDialog}
        onClose={() => setShowReminderDialog(false)}
        onCreated={() => {
          setShowReminderDialog(false);
          fetchLeadData();
          fetchTimeline();
        }}
      />
    </div>
  );
}

// SimpleCRM — embed-code-dialog
"use client";

import { useState, useEffect } from "react";
import { Check, Copy } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CaptureForm } from "@prisma/client";

interface EmbedCodeDialogProps {
  form: CaptureForm;
  open: boolean;
  onClose: () => void;
}

export function EmbedCodeDialog({ form, open, onClose }: EmbedCodeDialogProps) {
  const [publicUrl, setPublicUrl] = useState("");
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedEmbed, setCopiedEmbed] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setPublicUrl(`${window.location.origin}/form/${form.slug}`);
    }
  }, [form.slug]);

  const embedCode = `<iframe 
  src="${publicUrl}" 
  width="100%" 
  height="600" 
  frameborder="0"
  style="border:none;border-radius:12px;">
</iframe>`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(publicUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleCopyEmbed = () => {
    navigator.clipboard.writeText(embedCode);
    setCopiedEmbed(true);
    setTimeout(() => setCopiedEmbed(false), 2000);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md rounded-2xl p-6">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-neutral-900">Embed this form</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="link" className="mt-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="link">Link</TabsTrigger>
            <TabsTrigger value="embed">Embed</TabsTrigger>
          </TabsList>

          <TabsContent value="link" className="space-y-4 pt-4">
            <div className="space-y-2">
              <label className="text-[12px] font-semibold uppercase tracking-wider text-neutral-400">Public URL</label>
              <div className="flex gap-2">
                <input
                  readOnly
                  value={publicUrl}
                  className="flex-1 h-10 px-3 rounded-lg bg-neutral-50 border border-neutral-200 text-sm outline-none"
                />
                <Button onClick={handleCopyLink} className="shrink-0 w-24">
                  {copiedLink ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4 mr-2" />}
                  {copiedLink ? "Copied" : "Copy"}
                </Button>
              </div>
            </div>
            <p className="text-[13px] text-neutral-500">
              Share this link directly with your leads via email, message, or social media.
            </p>
          </TabsContent>

          <TabsContent value="embed" className="space-y-4 pt-4">
            <div className="space-y-2">
              <label className="text-[12px] font-semibold uppercase tracking-wider text-neutral-400">iFrame Snippet</label>
              <div className="space-y-3">
                <textarea
                  readOnly
                  value={embedCode}
                  className="w-full h-32 p-3 rounded-lg bg-neutral-50 border border-neutral-200 text-[12px] font-mono outline-none resize-none"
                />
                <Button onClick={handleCopyEmbed} className="w-full">
                  {copiedEmbed ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
                  {copiedEmbed ? "Copied to clipboard" : "Copy embed code"}
                </Button>
              </div>
            </div>
            <p className="text-[13px] text-neutral-500">
              Paste this code into your website's HTML to embed the form directly.
            </p>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

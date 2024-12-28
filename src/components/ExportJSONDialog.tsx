"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Dialogs } from "@/stores/dialogStore";
import useDialog from "@/hooks/useDialog";
import { useCollaborationStore } from "@/hooks/useCollaborationStore";
import { Clipboard, Download } from "lucide-react";
import { Textarea } from "./ui/textarea";
import { useToast } from "@/hooks/use-toast";

export default function ExportJSONDialog() {
  const { open, setOpen } = useDialog(Dialogs.ExportJSON);
  const diagram = useCollaborationStore((s) => s.diagram);
  const { toast } = useToast();

  if (!diagram) {
    return;
  }

  const code = JSON.stringify(diagram, null, 4);

  const downloadJSON = () => {
    const blob = new Blob([code], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${diagram.name.toLowerCase().replaceAll(" ", "-")}.json`;
    a.click();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Export JSON</DialogTitle>
          <DialogDescription>
            Export the current diagram as JSON.
          </DialogDescription>
        </DialogHeader>

        <Textarea value={code} readOnly rows={20} className="resize-none" />

        <DialogFooter>
          <div className="flex w-full flex-col gap-2">
            <Button
              variant="outline"
              className="w-full"
              onClick={() => {
                navigator.clipboard.writeText(code);
                toast({
                  title: "Copied to clipboard",
                  description:
                    "The JSON code has been copied to your clipboard.",
                });
              }}
            >
              Copy <Clipboard />
            </Button>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => downloadJSON()}
            >
              Download <Download />
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

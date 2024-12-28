"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Button } from "./ui/button";

import { useAppStore } from "@/stores/appStore";
import { useShallow } from "zustand/react/shallow";
import { Dialogs } from "@/stores/dialogStore";
import useDialog from "@/hooks/useDialog";
import { ScrollArea } from "@radix-ui/react-scroll-area";
import DiagramOption from "./DiagramOption";
import { useRef } from "react";
import { diagramSchema } from "@/types/Diagram";
import { useToast } from "@/hooks/use-toast";

export default function OpenDiagramDialog() {
  const { open, setOpen } = useDialog(Dialogs.OpenDiagram);

  const { diagrams, createDiagram, addDiagram } = useAppStore(
    useShallow((state) => ({
      diagrams: state.diagrams,
      createDiagram: state.createDiagram,
      addDiagram: state.addDiagram,
    })),
  );

  const diagramsKeys = Object.keys(diagrams);
  const uploadRef = useRef<HTMLInputElement>(null);

  const { toast } = useToast();

  const importJSON = (file: File) => {
    const reader = new FileReader();

    reader.addEventListener("load", () => {
      if (typeof reader.result !== "string") {
        return;
      }

      try {
        const rawDiagram = JSON.parse(reader.result);
        const diagram = diagramSchema.parse(rawDiagram);

        addDiagram(diagram);

        toast({
          title: "Diagram imported",
          description: "The diagram was imported successfully.",
        });
      } catch (e) {
        console.warn(e);
        toast({
          title: "Error importing diagram",
          description: "The JSON diagram is not valid.",
        });
      }
    });

    reader.readAsText(file);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="flex max-h-full p-0 sm:max-h-[90%]">
        <ScrollArea className="w-full overflow-y-auto p-6">
          <DialogHeader>
            <DialogTitle>Open a Diagram</DialogTitle>
            <DialogDescription>
              Open a diagram to start your design.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-2 py-4">
            {diagramsKeys.length > 0 ? (
              diagramsKeys.map((key) => (
                <DiagramOption key={key} diagramId={key} />
              ))
            ) : (
              <div className="text-center font-bold">
                No diagrams found, create a new one.
              </div>
            )}
          </div>
          <DialogFooter>
            <div className="flex w-full flex-col gap-2">
              <Button
                onClick={() => uploadRef.current?.click()}
                variant="outline"
              >
                Import from JSON
              </Button>
              <input
                ref={uploadRef}
                type="file"
                className="hidden"
                accept="application/json"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    importJSON(e.target.files[0]);
                  }
                  if (uploadRef.current) {
                    uploadRef.current.value = "";
                  }
                }}
              />
              <Button className="w-full" onClick={() => createDiagram()}>
                Create a new diagram
              </Button>
            </div>
          </DialogFooter>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

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

export default function OpenDiagramDialog() {
  const { open, setOpen } = useDialog(Dialogs.OpenDiagram);

  const { diagrams, createDiagram } = useAppStore(
    useShallow((state) => ({
      diagrams: state.diagrams,
      createDiagram: state.createDiagram,
      deleteDiagram: state.deleteDiagram,
      openDiagram: state.openDiagram,
    })),
  );

  const diagramsKeys = Object.keys(diagrams);

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
            <Button className="w-full" onClick={() => createDiagram()}>
              Create a new diagram
            </Button>
          </DialogFooter>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

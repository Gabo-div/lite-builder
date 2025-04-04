import { File } from "lucide-react";
import { Button } from "./ui/button";
import { Dialogs, useDialogStore } from "@/stores/dialogStore";
import { useCollaborationStore } from "@/hooks/useCollaborationStore";

export default function Welcome() {
  const diagram = useCollaborationStore((s) => s.diagram);
  const setOpenDialog = useDialogStore((state) => state.setDialogOpen);

  if (diagram) {
    return null;
  }

  return (
    <div className="absolute left-1/2 top-1/2 z-10 flex w-max -translate-x-1/2 -translate-y-1/2 flex-col items-center">
      <h1 className="text-4xl font-bold md:text-5xl">Lite Builder</h1>
      <p className="text-lg text-zinc-400 md:text-xl">
        Open a diagram to start your design
      </p>
      <div className="mt-4 flex w-full flex-col">
        <Button onClick={() => setOpenDialog(Dialogs.OpenDiagram)}>
          <File />
          Open Diagram
        </Button>
      </div>
    </div>
  );
}

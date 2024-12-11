import useDialog from "@/hooks/useDialog";
import { useAppStore } from "@/stores/appStore";
import { Dialogs } from "@/stores/dialogStore";
import { useShallow } from "zustand/react/shallow";
import { Button } from "./ui/button";
import { Pencil, Save, Trash } from "lucide-react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useState } from "react";
import { Input } from "./ui/input";

interface Props {
  diagramId: string;
}

export default function DiagramOption({ diagramId }: Props) {
  const { setOpen } = useDialog(Dialogs.OpenDiagram);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const { diagrams, openDiagram, deleteDiagram, editDiagramName } = useAppStore(
    useShallow((state) => ({
      diagrams: state.diagrams,
      deleteDiagram: state.deleteDiagram,
      openDiagram: state.openDiagram,
      editDiagramName: state.editDiagramName,
    })),
  );

  const diagram = diagrams[diagramId];

  const [value, setValue] = useState(diagram.name);

  const onSelect = () => {
    openDiagram(diagramId);
    setOpen(false);
  };

  const onToggleEditing = () => {
    if (!isEditing) {
      setValue(diagram.name);
      setIsEditing(true);
    } else {
      editDiagramName(diagramId, value);
      setIsEditing(false);
    }
  };

  return (
    <>
      <div className="flex w-full items-center rounded-md border px-4 py-3 text-sm">
        <div>
          {isEditing ? (
            <Input
              value={value}
              onChange={(e) => setValue(e.target.value)}
              disabled={!isEditing}
              autoFocus
            />
          ) : (
            <p className="border border-transparent px-3">{diagram.name}</p>
          )}
        </div>

        <div className="ml-auto flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={onToggleEditing}>
            {isEditing ? <Save /> : <Pencil />}
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setDeleteOpen(true)}
          >
            <Trash />
          </Button>
          <Button variant="outline" onClick={() => onSelect()}>
            Open
          </Button>
        </div>
      </div>
      <AlertDialog
        open={deleteOpen}
        onOpenChange={(open) => setDeleteOpen(open)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your
              diagram.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                deleteDiagram(diagramId);
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

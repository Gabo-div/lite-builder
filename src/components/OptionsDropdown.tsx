import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "./ui/button";
import { Code, File, Image as ImageIcon, Menu } from "lucide-react";
import { Dialogs, useDialogStore } from "@/stores/dialogStore";
import { useCollaborationStore } from "@/hooks/useCollaborationStore";

export default function OptionsDropdown() {
  const setOpenDialog = useDialogStore((state) => state.setDialogOpen);
  const isGuest = useCollaborationStore((state) => state.isGuest);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <Menu />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="start"
          sideOffset={20}
          className="bg-zinc-900 p-2"
        >
          {!isGuest ? (
            <DropdownMenuItem
              onClick={() => setOpenDialog(Dialogs.OpenDiagram)}
            >
              <File />
              Diagrams
            </DropdownMenuItem>
          ) : null}

          <DropdownMenuItem onClick={() => setOpenDialog(Dialogs.ExportImage)}>
            <ImageIcon />
            Export as image
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setOpenDialog(Dialogs.ExportJSON)}>
            <Code />
            Export as JSON
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "./ui/button";
import { File, Image as ImageIcon, Menu } from "lucide-react";
import { Dialogs, useDialogStore } from "@/stores/dialogStore";

export default function OptionsDropdown() {
  const setOpenDialog = useDialogStore((state) => state.setDialogOpen);

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
          <DropdownMenuItem onClick={() => setOpenDialog(Dialogs.OpenDiagram)}>
            <File />
            Diagrams
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setOpenDialog(Dialogs.ExportImage)}>
            <ImageIcon />
            Export as image
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}

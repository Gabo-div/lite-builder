import { Button } from "./ui/button";
import {
  Forward,
  LayoutDashboard,
  Minus,
  Plus,
  Scan,
  Table2,
} from "lucide-react";
import { Separator } from "./ui/separator";
import { InfoPopover } from "./InfoPopover";
import OptionsDropdown from "./OptionsDropdown";

import { useOnViewportChange, useReactFlow, Viewport } from "@xyflow/react";
import { useState } from "react";
import useDiagram from "@/hooks/useDiagram";
import { Dialogs, useDialogStore } from "@/stores/dialogStore";
import { cn } from "@/lib/utils";
import { useCollaborationStore } from "@/hooks/useCollaborationStore";
import { useShallow } from "zustand/react/shallow";

export default function Buttons() {
  const setOpenDialog = useDialogStore((state) => state.setDialogOpen);
  const { fitView, zoomIn, zoomOut, zoomTo } = useReactFlow();
  const { onLayout } = useDiagram();

  const { state, isGuest, mode, diagram } = useCollaborationStore(
    useShallow((s) => ({
      state: s.state,
      isGuest: s.isGuest,
      mode: s.mode,
      diagram: s.diagram,
    })),
  );

  const [zoom, setZoom] = useState(1);

  useOnViewportChange({
    onChange: (viewport: Viewport) => setZoom(viewport.zoom),
  });

  if (!diagram) {
    return null;
  }

  return (
    <>
      <div className="pointer-events-none fixed left-0 top-0 z-10 flex w-full items-start justify-between p-2">
        <div className="pointer-events-auto rounded-md bg-zinc-900 p-1">
          <OptionsDropdown />
        </div>
        <h1 className="pointer-events-auto text-lg font-bold">
          {diagram.name}
        </h1>
        <div className="flex flex-col gap-2">
          <div className="pointer-events-auto flex flex-col gap-2 rounded-md bg-zinc-900 p-1">
            <InfoPopover />
            <Separator />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setOpenDialog(Dialogs.CreateTable)}
              disabled={isGuest && mode === "READ"}
            >
              <Table2 />
            </Button>
            <Separator />
            <Button
              variant="ghost"
              size="icon"
              onClick={onLayout}
              disabled={isGuest && mode === "READ"}
            >
              <LayoutDashboard />
            </Button>
          </div>

          <div
            className={cn(
              "pointer-events-auto flex flex-col gap-2 rounded-md bg-zinc-900 p-1",
              state === "connected" && "bg-blue-700",
            )}
          >
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setOpenDialog(Dialogs.ShareDiagram)}
              className={state === "connected" ? "hover:bg-blue-500" : ""}
            >
              <Forward />
            </Button>
          </div>
        </div>
      </div>

      <div className="pointer-events-none fixed bottom-0 left-0 flex w-full items-center justify-end p-2">
        <div className="pointer-events-auto flex rounded-md bg-zinc-900 p-1">
          <Button variant="ghost" size="icon" onClick={() => zoomOut()}>
            <Minus />
          </Button>
          <Button
            variant="ghost"
            onClick={() => zoomTo(1)}
            className="text-zinc-300"
          >
            {(zoom * 100).toFixed()}%
          </Button>
          <Button variant="ghost" size="icon" onClick={() => zoomIn()}>
            <Plus />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => fitView()}>
            <Scan />
          </Button>
        </div>
      </div>
    </>
  );
}

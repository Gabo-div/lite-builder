import { Button } from "./ui/button";
import { LayoutDashboard, Minus, Plus, Scan } from "lucide-react";
import { Separator } from "./ui/separator";
import CreateTableDialog from "./CreateTableDialog";
import { InfoPopover } from "./InfoPopover";
import OptionsDropdown from "./OptionsDropdown";

import { useOnViewportChange, useReactFlow, Viewport } from "@xyflow/react";
import { useShallow } from "zustand/react/shallow";
import { useAppStore } from "@/stores/appStore";
import { useState } from "react";
import useDiagram from "@/hooks/useDiagram";

export default function Buttons() {
  const { fitView, zoomIn, zoomOut, zoomTo } = useReactFlow();
  const { onLayout } = useDiagram();

  const { currentDiagram, diagrams } = useAppStore(
    useShallow((s) => ({
      currentDiagram: s.currentDiagram,
      diagrams: s.diagrams,
    })),
  );

  const [zoom, setZoom] = useState(1);

  useOnViewportChange({
    onChange: (viewport: Viewport) => setZoom(viewport.zoom),
  });

  if (!currentDiagram) {
    return null;
  }

  return (
    <>
      <div className="pointer-events-none fixed left-0 top-0 z-10 flex w-full items-start justify-between p-2">
        <div className="pointer-events-auto rounded-md bg-zinc-900 p-1">
          <OptionsDropdown />
        </div>

        {currentDiagram ? (
          <h1 className="pointer-events-auto text-lg font-bold">
            {diagrams[currentDiagram].name}
          </h1>
        ) : null}

        <div className="pointer-events-auto flex flex-col gap-2 rounded-md bg-zinc-900 p-1">
          <InfoPopover />
          <Separator />
          <CreateTableDialog />
          <Separator />
          <Button variant="ghost" size="icon" onClick={onLayout}>
            <LayoutDashboard />
          </Button>
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

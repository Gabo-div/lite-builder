"use client";

import Builder from "@/components/Builder";
import { AlertProvider } from "@/contexts/AlertContext";
import { CollaborationProvider } from "@/contexts/collaborationContext";
import { DiagramProvider } from "@/contexts/diagramContext";
import { ReactFlowProvider } from "@xyflow/react";

export default function Home() {
  // roomId

  return (
    <CollaborationProvider>
      <ReactFlowProvider>
        <DiagramProvider>
          <AlertProvider>
            <Builder />
          </AlertProvider>
        </DiagramProvider>
      </ReactFlowProvider>
    </CollaborationProvider>
  );
}

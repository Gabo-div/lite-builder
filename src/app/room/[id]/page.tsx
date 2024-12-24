"use client";

import Builder from "@/components/Builder";
import { AlertProvider } from "@/contexts/AlertContext";
import { CollaborationProvider } from "@/contexts/collaborationContext";
import { DiagramProvider } from "@/contexts/diagramContext";
import { ReactFlowProvider } from "@xyflow/react";
import { useParams } from "next/navigation";

export default function Room() {
  const params = useParams<{ id: string }>();

  return (
    <CollaborationProvider roomId={params.id}>
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

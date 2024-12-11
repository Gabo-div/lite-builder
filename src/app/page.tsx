"use client";

import Builder from "@/components/Builder";
import { DiagramProvider } from "@/contexts/diagramContext";
import { ReactFlowProvider } from "@xyflow/react";

export default function Home() {
  return (
    <ReactFlowProvider>
      <DiagramProvider>
        <Builder />
      </DiagramProvider>
    </ReactFlowProvider>
  );
}

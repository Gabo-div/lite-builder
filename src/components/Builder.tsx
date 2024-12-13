"use client";

import useDiagram from "@/hooks/useDiagram";
import { Background, ReactFlow } from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import EditTableDialog from "./EditTableDialog";
import Welcome from "./Welcome";
import Buttons from "./Buttons";
import OpenDiagramDialog from "./OpenDiagramDialog";
import ExportImageDialog from "./ExportImageDialog";
import CreateTableDialog from "./CreateTableDialog";

export default function Builder() {
  const { nodeTypes, nodes, edges, onEdgesChange, onNodesChange } =
    useDiagram();

  return (
    <main className="screen-h relative">
      <ReactFlow
        attributionPosition="bottom-left"
        colorMode="dark"
        nodeTypes={nodeTypes}
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        fitView
        fitViewOptions={{ maxZoom: 1, minZoom: 1 }}
        elevateEdgesOnSelect
      >
        <Background />
      </ReactFlow>

      <Welcome />
      <Buttons />

      <CreateTableDialog />
      <EditTableDialog />
      <OpenDiagramDialog />
      <ExportImageDialog />
    </main>
  );
}

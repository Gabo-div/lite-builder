"use client";

import useDiagram from "@/hooks/useDiagram";
import {
  Background,
  Edge,
  EdgeChange,
  Node,
  NodeChange,
  ReactFlow,
  useReactFlow,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import EditTableDialog from "./EditTableDialog";
import Welcome from "./Welcome";
import Buttons from "./Buttons";
import OpenDiagramDialog from "./OpenDiagramDialog";
import ExportImageDialog from "./ExportImageDialog";
import CreateTableDialog from "./CreateTableDialog";
import ShareDiagramDialog from "./ShareDiagramDialog";
import Cursors from "./Cursors";
import { useShallow } from "zustand/react/shallow";
import { MouseEventHandler, useCallback } from "react";
import { useCollaborationStore } from "@/hooks/useCollaborationStore";
import ConnectionInfoDialog from "./ConnectionInfoDialog";

export default function Builder() {
  const { nodeTypes, nodes, edges, onEdgesChange, onNodesChange } =
    useDiagram();

  const { isGuest, state, mode, setUserCursor } = useCollaborationStore(
    useShallow((s) => ({
      isGuest: s.isGuest,
      state: s.state,
      mode: s.mode,
      setUserCursor: s.setUserCursor,
    })),
  );

  const { screenToFlowPosition } = useReactFlow();

  const handleCursor: MouseEventHandler = useCallback(
    (e) => {
      if (state !== "connected") {
        return;
      }

      const { x, y } = screenToFlowPosition({
        x: e.clientX,
        y: e.clientY,
      });

      setUserCursor({
        x,
        y,
      });
    },
    [state, setUserCursor, screenToFlowPosition],
  );

  const handleNodesChange = useCallback(
    (change: NodeChange<Node>[]) => {
      if (isGuest && mode === "READ") {
        return;
      }

      onNodesChange(change);
    },
    [isGuest, mode, onNodesChange],
  );

  const handleEdgesChange = useCallback(
    (change: EdgeChange<Edge>[]) => {
      if (isGuest && mode === "READ") {
        return;
      }

      onEdgesChange(change);
    },
    [isGuest, mode, onEdgesChange],
  );

  return (
    <main className="screen-h relative">
      <ReactFlow
        attributionPosition="bottom-left"
        colorMode="dark"
        nodeTypes={nodeTypes}
        nodes={nodes}
        edges={edges}
        onNodesChange={handleNodesChange}
        onEdgesChange={handleEdgesChange}
        fitView
        fitViewOptions={{ maxZoom: 1, minZoom: 1 }}
        elevateEdgesOnSelect
        onMouseMove={handleCursor}
        onNodeDrag={handleCursor}
      >
        <Background />
      </ReactFlow>

      <Cursors />

      <Welcome />
      <Buttons />

      <ConnectionInfoDialog />

      <CreateTableDialog />
      <EditTableDialog />
      <OpenDiagramDialog />
      <ExportImageDialog />
      <ShareDiagramDialog />
    </main>
  );
}

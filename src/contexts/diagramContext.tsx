import { createContext } from "react";

import NodeTable from "@/components/NodeTable";
import { createRelationEdge } from "@/lib/edges";
import { getLayoutedElements } from "@/lib/layout";
import { createTableNode } from "@/lib/nodes";
import { useAppStore } from "@/stores/appStore";
import { useShallow } from "zustand/react/shallow";
import {
  Edge,
  Node,
  NodeTypes,
  OnEdgesChange,
  OnNodesChange,
  useEdgesState,
  useNodesInitialized,
  useNodesState,
} from "@xyflow/react";
import { useCallback, useEffect, useMemo } from "react";

interface DiagramContextType {
  nodeTypes: NodeTypes;
  nodes: Node[];
  edges: Edge[];
  onNodesChange: OnNodesChange<Node>;
  onEdgesChange: OnEdgesChange<Edge>;
  onLayout: () => void;
}

export const DiagramContext = createContext<DiagramContextType>({
  nodeTypes: {},
  nodes: [],
  edges: [],
  onNodesChange: () => {},
  onEdgesChange: () => {},
  onLayout: () => {},
});

export const DiagramProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);

  const nodesInitialized = useNodesInitialized();

  const onLayout = useCallback(() => {
    const layouted = getLayoutedElements(nodes, edges, "LR");

    setNodes([...layouted.nodes]);
    setEdges([...layouted.edges]);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nodes, edges]);

  useEffect(() => {
    onLayout();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nodesInitialized]);

  const nodeTypes = useMemo(() => ({ table: NodeTable }), []);

  const { currentDiagram, diagrams } = useAppStore(
    useShallow((s) => ({
      currentDiagram: s.currentDiagram,
      diagrams: s.diagrams,
    })),
  );

  useEffect(() => {
    if (!currentDiagram) {
      setNodes([]);
      return;
    }

    const newNodes: Node[] = [];

    diagrams[currentDiagram].tables.forEach((t) => {
      newNodes.push(createTableNode(t));
    });

    setNodes(newNodes);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentDiagram, diagrams]);

  useEffect(() => {
    if (!currentDiagram) {
      setEdges([]);
      return;
    }

    const newEdges: Edge[] = [];

    diagrams[currentDiagram].relations.forEach((e) => {
      newEdges.push(
        createRelationEdge({
          source: [e.sourceTable, e.sourceColumn],
          target: [e.targetTable, e.targetColumn],
        }),
      );
    });

    setEdges(newEdges);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentDiagram, diagrams]);

  const value = {
    nodeTypes,
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onLayout,
  } satisfies DiagramContextType;

  return (
    <DiagramContext.Provider value={value}>{children}</DiagramContext.Provider>
  );
};

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
  useNodesState,
  useReactFlow,
} from "@xyflow/react";
import { useCallback, useEffect, useMemo } from "react";
import { useCollaborationStore } from "@/hooks/useCollaborationStore";

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
  const { fitView } = useReactFlow();

  const { setTablePosition } = useAppStore(
    useShallow((s) => ({
      setTablePosition: s.setTablePosition,
    })),
  );

  const diagram = useCollaborationStore((s) => s.diagram);

  const onLayout = useCallback(() => {
    const layouted = getLayoutedElements(nodes, edges, "LR");

    layouted.nodes.forEach((node) => {
      setTablePosition(node.id, node.position);
    });

    setNodes([...layouted.nodes]);
    setEdges([...layouted.edges]);

    window.requestAnimationFrame(() => fitView());

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nodes, edges]);

  const nodeTypes = useMemo(() => ({ table: NodeTable }), []);

  useEffect(() => {
    if (!diagram) {
      setNodes([]);
      return;
    }

    const newNodes: Node[] = [];

    diagram.tables.forEach((t) => {
      const position = (diagram.positions && diagram.positions[t.name]) || {
        x: 0,
        y: 0,
      };

      newNodes.push(createTableNode(t, position));
    });

    setNodes(newNodes);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [diagram?.tables]);

  useEffect(() => {
    if (!diagram) {
      setEdges([]);
      return;
    }

    const newEdges: Edge[] = [];

    diagram.relations.forEach((e) => {
      newEdges.push(
        createRelationEdge({
          source: [e.sourceTable, e.sourceColumn],
          target: [e.targetTable, e.targetColumn],
        }),
      );
    });

    setEdges(newEdges);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [diagram?.relations]);

  useEffect(() => {
    nodes.forEach((node) => {
      setTablePosition(node.id, node.position);
    });
  }, [nodes, setTablePosition]);

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

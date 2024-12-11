import Dagre from "@dagrejs/dagre";
import { Edge, Node } from "@xyflow/react";

export const getLayoutedElements = (
  nodes: Node[],
  edges: Edge[],
  direction: "TB" | "LR",
) => {
  const g = new Dagre.graphlib.Graph().setDefaultEdgeLabel(() => ({}));

  g.setGraph({
    rankdir: direction,
    align: "UL",
    nodesep: 100,
    edgesep: 50,
    ranksep: 100,
  });

  edges.forEach((edge) => g.setEdge(edge.source, edge.target));
  nodes.forEach((node) =>
    g.setNode(node.id, {
      ...node,
      width: node.measured?.width ?? 0,
      height: node.measured?.height ?? 0,
    }),
  );

  Dagre.layout(g);

  return {
    nodes: nodes.map((node) => {
      const position = g.node(node.id);

      const x = position.x - (node.measured?.width ?? 0) / 2;
      const y = position.y - (node.measured?.height ?? 0) / 2;

      return { ...node, position: { x, y } };
    }),
    edges,
  };
};

export const createRelationEdge = ({
  target: t,
  source: s,
}: {
  source: [string, string];
  target: [string, string];
}) => {
  const [source, sourceHandle] = s;
  const [target, targetHandle] = t;

  return {
    id: s.join("-") + ";" + t.join("-"),
    source,
    sourceHandle,
    target,
    targetHandle,
    type: "step",
    animated: true,
  };
};

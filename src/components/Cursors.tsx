import { useCollaborationStore } from "@/hooks/useCollaborationStore";
import { useReactFlow, useViewport } from "@xyflow/react";
import { MousePointer2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useShallow } from "zustand/react/shallow";

export default function Cursors() {
  const [cursors, setCursors] = useState<
    { x: number; y: number; name: string; color: string }[]
  >([]);

  const { state, users } = useCollaborationStore(
    useShallow((s) => ({
      state: s.state,
      users: s.users,
    })),
  );

  const { flowToScreenPosition } = useReactFlow();
  const { x: viewporX, y: viewportY } = useViewport();

  useEffect(() => {
    const newCursors = Object.values(users).map((user) => {
      const { x, y } = flowToScreenPosition({
        x: user.cursor.x,
        y: user.cursor.y,
      });

      return {
        x,
        y,
        name: user.username,
        color: user.color,
      };
    });

    setCursors(newCursors);
  }, [viewporX, viewportY, users, flowToScreenPosition]);

  if (state !== "connected") {
    return null;
  }

  return (
    <div className="pointer-events-none absolute left-0 top-0 h-full w-full overflow-hidden">
      {cursors.map((cursor, i) => (
        <div
          key={i}
          className="flex w-40 items-center space-x-1"
          style={{
            position: "absolute",
            top: cursor.y,
            left: cursor.x,
            color: cursor.color,
          }}
        >
          <MousePointer2 style={{ fill: cursor.color }} />
          <span className="text-xs font-bold">{cursor.name}</span>
        </div>
      ))}
    </div>
  );
}

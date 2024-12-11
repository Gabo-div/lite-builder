import { DiagramContext } from "@/contexts/diagramContext";
import { useContext } from "react";

export default function useDiagram() {
  return useContext(DiagramContext);
}

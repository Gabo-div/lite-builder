import { Table } from "@/types/Table";

export const createTableNode = (
  table: Table,
  position: { x: number; y: number },
) => {
  return {
    id: table.name,
    type: "table",
    position,
    data: {
      table,
    },
  };
};

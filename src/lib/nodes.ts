import { Table } from "@/types/Table";

export const createTableNode = (table: Table) => {
  return {
    id: table.name,
    type: "table",
    position: { x: 0, y: 0 },
    data: {
      table,
    },
  };
};

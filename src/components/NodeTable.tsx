import { Table } from "@/types/Table";
import { Handle, Position } from "@xyflow/react";
import { Diamond, Fingerprint, Key, Table2 } from "lucide-react";

import { Dialogs, useDialogStore } from "@/stores/dialogStore";

interface Props {
  data: {
    table: Table;
  };
}

export default function NodeTable({ data }: Props) {
  const openDialog = useDialogStore((state) => state.openDialog);

  return (
    <div
      className="group flex min-w-60 flex-col gap-[1px] overflow-hidden rounded-md border border-zinc-800 bg-zinc-800 transition hover:bg-zinc-900"
      onClick={() => openDialog(Dialogs.EditTable, data.table.name)}
    >
      <div className="flex h-8 items-center gap-2 px-2 text-xs">
        <Table2 className="size-4" />
        {data.table.name}
      </div>

      {data.table.columns.map((c) => (
        <div key={data.table.name + c.name} className="relative">
          <Handle
            type="target"
            id={c.name}
            position={Position.Left}
            className="opacity-0"
          />

          <div
            key={data.table.name + c.name}
            className="flex h-8 items-center gap-2 bg-zinc-900 px-2 text-xs transition group-hover:bg-zinc-950"
          >
            {c.flags?.primaryKey ? (
              <Key className="size-4 text-zinc-400" />
            ) : null}
            {c.flags?.unique ? (
              <Fingerprint className="size-4 text-zinc-400" />
            ) : null}
            {c.flags?.notNull ? (
              <Diamond className="size-4 fill-zinc-400 text-zinc-400" />
            ) : (
              <Diamond className="size-4 text-zinc-400" />
            )}

            <span>{c.name}</span>
            <span className="ml-auto text-zinc-500">{c.type}</span>
          </div>

          <Handle
            type="source"
            id={c.name}
            position={Position.Right}
            className="opacity-0"
          />
        </div>
      ))}
    </div>
  );
}

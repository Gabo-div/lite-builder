import { z } from "zod";
import { tableSchema } from "./Table";
import { relationSchema } from "./Relation";

export const diagramSchema = z.object({
  name: z.string(),
  tables: tableSchema.array(),
  relations: relationSchema.array(),
  positions: z
    .record(z.string(), z.object({ x: z.number(), y: z.number() }))
    .nullish(),
});

export type Diagram = z.infer<typeof diagramSchema>;

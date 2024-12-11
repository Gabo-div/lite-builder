import { z } from "zod";
import { tableSchema } from "./Table";
import { relationSchema } from "./Relation";

export const diagramSchema = z.object({
  name: z.string(),
  tables: tableSchema.array(),
  relations: relationSchema.array(),
});

export type Diagram = z.infer<typeof diagramSchema>;

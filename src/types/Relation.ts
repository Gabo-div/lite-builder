import { z } from "zod";

export const relationSchema = z.object({
  sourceTable: z.string(),
  sourceColumn: z.string(),
  targetTable: z.string(),
  targetColumn: z.string(),
});

export type Relation = z.infer<typeof relationSchema>;

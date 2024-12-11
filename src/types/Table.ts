import { z } from "zod";

export const columnFlagsSchema = z.object({
  primaryKey: z.boolean().nullish(),
  notNull: z.boolean().nullish(),
  unique: z.boolean().nullish(),
});

export const columnSchema = z.object({
  name: z.string(),
  type: z.string(),
  flags: columnFlagsSchema.optional(),
});

export const tableSchema = z.object({
  name: z.string(),
  columns: z.array(columnSchema),
});

export type Table = z.infer<typeof tableSchema>;
export type Column = z.infer<typeof columnSchema>;
export type ColumnFlags = z.infer<typeof columnFlagsSchema>;

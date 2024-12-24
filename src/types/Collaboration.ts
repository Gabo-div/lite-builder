import { z } from "zod";
import { diagramSchema } from "./Diagram";
import { DataConnection } from "peerjs";

export const cursorSchema = z.object({
  x: z.number(),
  y: z.number(),
});

export type Cursor = z.infer<typeof cursorSchema>;

export const userSchema = z.object({
  username: z.string(),
  color: z.string(),
  cursor: cursorSchema,
});

export type User = z.infer<typeof userSchema>;

export enum CollaborationMode {
  READ = "READ",
  EDIT = "EDIT",
}

export const messageSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("join"),
    user: userSchema,
  }),
  z.object({
    type: z.literal("sync"),
    mode: z.nativeEnum(CollaborationMode),
    users: z.record(z.string(), userSchema),
    diagram: diagramSchema,
  }),
  z.object({
    type: z.literal("syncUsers"),
    users: z.record(z.string(), userSchema),
  }),
  z.object({
    type: z.literal("syncDiagram"),
    diagram: diagramSchema,
  }),
  z.object({
    type: z.literal("syncMode"),
    mode: z.nativeEnum(CollaborationMode),
  }),
  z.object({
    type: z.literal("user"),
    user: userSchema,
  }),
]);

export type Message = z.infer<typeof messageSchema>;

export type MessageHandler<T extends Message["type"]> = (
  connection: DataConnection,
  message: Message & { type: T },
) => void;

"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useCollaborationStore } from "@/hooks/useCollaborationStore";
import { useShallow } from "zustand/react/shallow";
import { Spinner } from "./ui/spinner";
import { Button } from "./ui/button";

export default function ConnectionInfoDialog() {
  const { isGuest, state } = useCollaborationStore(
    useShallow((s) => ({
      isGuest: s.isGuest,
      state: s.state,
    })),
  );

  return (
    <Dialog open={isGuest && state !== "connected"}>
      {state === "connecting" ? (
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Connection</DialogTitle>
            <DialogDescription>Connecting to the host...</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <div className="flex w-full justify-center">
              <Spinner />
            </div>
          </DialogFooter>
        </DialogContent>
      ) : null}
      {state === "error" ? (
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Connection</DialogTitle>
            <DialogDescription>
              Failed to connect to the host. Make sure the room ID is correct.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => window.location.reload()}>Refresh</Button>
          </DialogFooter>
        </DialogContent>
      ) : null}
      {state === "disconnected" ? (
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Connection</DialogTitle>
            <DialogDescription>Disconnected from the host.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => window.location.reload()}>Refresh</Button>
          </DialogFooter>
        </DialogContent>
      ) : null}
    </Dialog>
  );
}

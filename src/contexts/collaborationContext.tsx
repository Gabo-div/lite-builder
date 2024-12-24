import {
  CollaborationStore,
  createCollaborationStore,
} from "@/stores/collaborationStore";
import { createContext, useState } from "react";
import { StoreApi } from "zustand";

export const CollaborationContext =
  createContext<StoreApi<CollaborationStore> | null>(null);

export const CollaborationProvider = ({
  children,
  roomId,
}: {
  children: React.ReactNode;
  roomId?: string;
}) => {
  const [store] = useState(() =>
    createCollaborationStore(
      roomId ? { isGuest: true, roomId } : { isGuest: false },
    ),
  );

  return (
    <CollaborationContext.Provider value={store}>
      {children}
    </CollaborationContext.Provider>
  );
};

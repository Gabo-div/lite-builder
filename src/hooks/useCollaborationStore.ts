import { CollaborationContext } from "@/contexts/collaborationContext";
import { CollaborationStore } from "@/stores/collaborationStore";
import { useContext } from "react";
import { useStore } from "zustand";

export const useCollaborationStore = <T>(
  selector: (state: CollaborationStore) => T,
) => {
  const store = useContext(CollaborationContext);

  if (store === null) {
    throw new Error(
      "useCollaborationStore must be used within CollaborationProvider",
    );
  }

  return useStore(store, selector);
};

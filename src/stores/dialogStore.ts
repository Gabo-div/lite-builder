import { create } from "zustand";

export enum Dialogs {
  OpenDiagram,
  ExportImage,
  EditTable,
  CreateTable,
  ShareDiagram,
}

interface DialogStore {
  dialogOpen: Dialogs | null;
  dialogParam: unknown;
  setDialogParam: (param: unknown) => void;
  setDialogOpen: (dialog: Dialogs | null) => void;
  openDialog: (dialog: Dialogs, param: unknown) => void;
}

export const useDialogStore = create<DialogStore>((set) => ({
  dialogOpen: null,
  dialogParam: null,
  setDialogParam: (param) => set({ dialogParam: param }),
  setDialogOpen: (dialog) => set({ dialogOpen: dialog }),
  openDialog: (dialog, param) => {
    set({ dialogOpen: dialog, dialogParam: param });
  },
}));

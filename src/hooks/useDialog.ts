import { Dialogs, useDialogStore } from "@/stores/dialogStore";
import { useShallow } from "zustand/react/shallow";

export default function useDialog(dialog: Dialogs) {
  const { dialogOpen, setDialogOpen, dialogParam } = useDialogStore(
    useShallow((s) => {
      return {
        dialogOpen: s.dialogOpen,
        setDialogOpen: s.setDialogOpen,
        dialogParam: s.dialogParam,
      };
    }),
  );

  const open = dialogOpen === dialog;

  const setOpen = (open: boolean) => {
    if (open) {
      setDialogOpen(dialog);
    } else {
      setDialogOpen(null);
    }
  };

  return { open, param: dialogParam, setOpen };
}

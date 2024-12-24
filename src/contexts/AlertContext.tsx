import { createContext, useState } from "react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Alert {
  name: string;
  open: boolean;
  title: string;
  description: string;
  onCancel?: () => void;
  onContinue?: () => void;
}

interface AlertContextType {
  openAlert: (alert: Omit<Alert, "open">) => void;
}

export const AlertContext = createContext<AlertContextType>({
  openAlert: () => {},
});

export const AlertProvider = ({ children }: { children: React.ReactNode }) => {
  const [alerts, setAlerts] = useState<Record<string, Alert>>({});

  const openAlert = (alert: Omit<Alert, "open">) => {
    setAlerts((prev) => ({
      ...prev,
      [alert.name]: { open: true, ...alert },
    }));
  };

  const closeAlert = (id: string) => {
    setAlerts((prev) => {
      const newAlerts = { ...prev };
      newAlerts[id].open = false;
      return newAlerts;
    });
  };

  const handleCancel = (name: string) => {
    if (alerts[name].onCancel) {
      alerts[name].onCancel();
    }

    closeAlert(name);
  };

  const handleContinue = (name: string) => {
    if (alerts[name].onContinue) {
      alerts[name].onContinue();
    }

    closeAlert(name);
  };

  const value = {
    openAlert,
  } satisfies AlertContextType;

  return (
    <AlertContext.Provider value={value}>
      {children}
      {Object.values(alerts).map((alert) => (
        <AlertDialog key={alert.name} open={alert.open}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{alert.title}</AlertDialogTitle>
              <AlertDialogDescription>
                {alert.description}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => handleCancel(alert.name)}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction onClick={() => handleContinue(alert.name)}>
                Continue
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      ))}
    </AlertContext.Provider>
  );
};

import { AlertContext } from "@/contexts/AlertContext";
import { useContext } from "react";

export default function useAlert() {
  return useContext(AlertContext);
}

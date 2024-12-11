import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "./ui/button";
import { Diamond, Fingerprint, Info, Key } from "lucide-react";

export function InfoPopover() {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon">
          <Info />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 bg-zinc-900" align="end">
        <div className="flex flex-col gap-6 py-2">
          <div className="flex items-center gap-2">
            <Key className="size-5" />
            <span className="text-sm">Primary Key</span>
          </div>
          <div className="flex items-center gap-2">
            <Fingerprint className="size-5" />
            <span className="text-sm">Unique</span>
          </div>
          <div className="flex items-center gap-2">
            <Diamond className="size-5 fill-zinc-400" />
            <span className="text-sm">Not Nullable</span>
          </div>
          <div className="flex items-center gap-2">
            <Diamond className="size-5" />
            <span className="text-sm">Nullable</span>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

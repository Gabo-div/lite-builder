"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Button } from "./ui/button";
import { Dialogs } from "@/stores/dialogStore";
import useDialog from "@/hooks/useDialog";
import { ScrollArea } from "@radix-ui/react-scroll-area";
import { Input } from "./ui/input";
import { z } from "zod";
import { CollaborationMode } from "@/types/Collaboration";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";
import { useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { useCollaborationStore } from "@/hooks/useCollaborationStore";
import { useShallow } from "zustand/react/shallow";
import { Spinner } from "./ui/spinner";

const formSchema = z.object({
  username: z.string().min(1),
  mode: z.nativeEnum(CollaborationMode),
});

export default function ShareDiagramDialog() {
  const { open, setOpen } = useDialog(Dialogs.ShareDiagram);

  const { isGuest, roomId, state, start, stop, user, setUser, mode, setMode } =
    useCollaborationStore(
      useShallow((s) => ({
        isGuest: s.isGuest,
        roomId: s.roomId,
        state: s.state,
        start: s.start,
        stop: s.stop,
        user: s.user,
        setUser: s.setUser,
        mode: s.mode,
        setMode: s.setMode,
      })),
    );

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      mode: CollaborationMode.READ,
    },
  });

  useEffect(() => {
    form.reset({
      username: user?.username || "",
      mode,
    });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, mode]);

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    if (!user) {
      return;
    }
    localStorage.setItem("username", values.username);

    setUser({
      ...user,
      username: values.username,
    });

    setMode(values.mode);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="flex max-h-full p-0 sm:max-h-[90%]">
        <ScrollArea className="w-full overflow-y-auto p-6">
          <DialogHeader>
            <DialogTitle>Share Diagram</DialogTitle>
            <DialogDescription>
              Share a diagram to start collaborating.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-2 py-4">
            {state === "connecting" ? (
              <div className="flex w-full justify-center">
                <Spinner />
              </div>
            ) : null}

            {state === "connected" && roomId ? (
              <Form {...form}>
                <form
                  className="space-y-8"
                  autoComplete="off"
                  onSubmit={form.handleSubmit(onSubmit)}
                >
                  <FormField
                    control={form.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Username</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormDescription>
                          This is the name that other users will see.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormItem>
                    <FormLabel>Link</FormLabel>
                    <FormControl>
                      <Input
                        value={`${document.location}room/${roomId}`}
                        readOnly
                      />
                    </FormControl>
                    <FormDescription>
                      Share this link to collaborate.
                    </FormDescription>
                  </FormItem>

                  <FormField
                    control={form.control}
                    name="mode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mode</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger disabled={isGuest}>
                              <SelectValue placeholder="Select a mode" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value={CollaborationMode.READ}>
                              Read
                            </SelectItem>
                            <SelectItem value={CollaborationMode.EDIT} disabled>
                              Read & Edit
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Select the permissions that people with the link will
                          have.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button className="w-full" disabled={!form.formState.isDirty}>
                    Save
                  </Button>
                </form>
              </Form>
            ) : null}
          </div>
          <DialogFooter>
            {!isGuest ? (
              <>
                {state == "connected" && roomId ? (
                  <Button className="w-full" onClick={stop}>
                    Stop Collaboration
                  </Button>
                ) : (
                  <Button
                    className="w-full"
                    onClick={start}
                    disabled={state === "connecting"}
                  >
                    Start Collaboration
                  </Button>
                )}
              </>
            ) : null}
          </DialogFooter>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

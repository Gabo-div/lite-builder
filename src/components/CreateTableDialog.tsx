"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Button } from "./ui/button";
import { Grip, Plus, Trash } from "lucide-react";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Checkbox } from "./ui/checkbox";

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { twJoin } from "tailwind-merge";
import { columnFlagsSchema } from "@/types/Table";
import { useAppStore } from "@/stores/appStore";
import { useEffect, useState } from "react";
import { useShallow } from "zustand/react/shallow";
import { ScrollArea } from "@radix-ui/react-scroll-area";
import { columnTypes } from "@/lib/columns";
import { Reorder } from "motion/react";
import useDialog from "@/hooks/useDialog";
import { Dialogs } from "@/stores/dialogStore";

const formSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Name is required")
    .refine((name) => !name.includes(" "), {
      message: "Name cannot contain spaces",
    }),
  columns: z
    .object({
      name: z
        .string()
        .trim()
        .min(1, "Name is required")
        .refine((name) => !name.includes(" "), {
          message: "Name cannot contain spaces",
        }),
      type: z.string().min(1, "Type is required"),
      flags: columnFlagsSchema,
    })
    .array()
    .min(1, "At least one column is required"),
  relations: z
    .object({
      source: z.string().min(1, "Source is required"),
      target: z.string().min(1, "Target is required"),
    })
    .array(),
});

export default function CreateTableDialog() {
  const { open, setOpen } = useDialog(Dialogs.CreateTable);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      columns: [],
      relations: [],
    },
  });

  const { addTable, addRelation, diagram, getTable } = useAppStore(
    useShallow((s) => ({
      addTable: s.addTable,
      diagram: s.diagrams[s.currentDiagram as string],
      addRelation: s.addRelation,
      getTable: s.getTable,
    })),
  );

  const [sources, setSources] = useState<string[]>([]);
  const [targets, setTargets] = useState<string[]>([]);

  useEffect(() => {
    if (!diagram) {
      return;
    }

    const { unsubscribe } = form.watch((values) => {
      const { columns, name, relations } = values;

      if (!columns || !name || !relations) {
        return;
      }

      const newSources: string[] = [];
      const newTargets: string[] = [];

      diagram.tables.forEach((t) =>
        t.columns.forEach((c) => {
          newTargets.push(`${t.name}.${c.name}`);
        }),
      );

      columns.forEach((c) => {
        if (!c || !c.name) {
          return;
        }

        newSources.push(`${name}.${c.name}`);
        newTargets.push(`${name}.${c.name}`);
      });

      setSources(newSources);
      setTargets(newTargets);
    });

    return () => unsubscribe();
  }, [diagram, form]);

  const [activeDrag, setActiveDrag] = useState(-1);

  const { fields, append, remove, move } = useFieldArray({
    control: form.control,
    name: "columns",
  });

  const {
    fields: relationsFields,
    append: appendRelation,
    remove: removeRelation,
  } = useFieldArray({
    control: form.control,
    name: "relations",
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    if (getTable(values.name)) {
      form.setError("name", {
        type: "manual",
        message: "Table already exists",
      });

      return;
    }

    const columnNames = new Set<string>(values.columns.map((c) => c.name));

    if (columnNames.size !== values.columns.length) {
      form.setError("columns", {
        type: "manual",
        message: "Column names must be unique",
      });

      return;
    }

    const invalidRelation = values.relations.some((r) => {
      const sourceExist = sources.includes(r.source);
      const targetExist = targets.includes(r.target);

      return !sourceExist || !targetExist;
    });

    if (invalidRelation) {
      form.setError("relations", {
        type: "manual",
        message: "Invalid relation",
      });

      return;
    }

    addTable({
      name: values.name,
      columns: values.columns,
    });

    values.relations.forEach((r) => {
      const [sourceTable, sourceColumn] = r.source.split(".");
      const [targetTable, targetColumn] = r.target.split(".");

      addRelation({
        sourceTable,
        sourceColumn,
        targetTable,
        targetColumn,
      });
    });

    form.reset();
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="flex max-h-full p-0 sm:max-h-[90%]">
        <ScrollArea className="w-full overflow-y-auto p-6">
          <DialogHeader className="py-4">
            <DialogTitle>Create Table</DialogTitle>
            <DialogDescription>
              Create a new table adding columns.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-8"
              autoComplete="off"
            >
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-4">
                <p
                  className={twJoin(
                    "text-sm font-medium",
                    form.formState.errors.columns ? "text-destructive" : null,
                  )}
                >
                  Columns
                </p>

                <Table>
                  <TableCaption>
                    <Button
                      type="button"
                      className="w-full"
                      variant="outline"
                      size="icon"
                      onClick={() =>
                        append({
                          name: "",
                          type: "text",
                          flags: {
                            primaryKey: false,
                            unique: false,
                            notNull: false,
                          },
                        })
                      }
                    >
                      <Plus />
                    </Button>
                    {form.formState.errors.columns ? (
                      <p className="text-[0.8rem] font-medium text-destructive">
                        {form.formState.errors.columns.message ||
                          form.formState.errors.columns.root?.message}
                      </p>
                    ) : null}
                  </TableCaption>
                  <TableHeader>
                    <TableRow>
                      <TableHead></TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead className="text-center">PK</TableHead>
                      <TableHead className="text-center">Unique</TableHead>
                      <TableHead className="text-center">NotNull</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <Reorder.Group
                    as="tbody"
                    values={fields}
                    onReorder={(e) => {
                      e.map((item, index) => {
                        const activeElement = fields[activeDrag];
                        if (activeElement && item === activeElement) {
                          move(activeDrag, index);
                        }
                      });
                    }}
                  >
                    {fields.map((field, index) => (
                      <Reorder.Item
                        key={field.id}
                        as="tr"
                        value={field}
                        id={field.id}
                        onDragStart={() => {
                          setActiveDrag(index);
                        }}
                        className="bg-zinc-950"
                      >
                        <TableCell>
                          <Grip className="size-4" />
                        </TableCell>
                        <TableCell>
                          <FormField
                            control={form.control}
                            name={`columns.${index}.name`}
                            render={({ field: f }) => (
                              <FormItem>
                                <FormControl>
                                  <Input
                                    {...f}
                                    placeholder="name"
                                    className="min-w-24"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </TableCell>
                        <TableCell>
                          <FormField
                            control={form.control}
                            name={`columns.${index}.type`}
                            render={({ field: f }) => (
                              <FormItem>
                                <Select
                                  onValueChange={f.onChange}
                                  defaultValue={f.value}
                                >
                                  <FormControl>
                                    <SelectTrigger className="min-w-24">
                                      <SelectValue placeholder="type" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {columnTypes.map((type) => (
                                      <SelectItem key={type} value={type}>
                                        {type}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </TableCell>
                        <TableCell align="center">
                          <FormField
                            control={form.control}
                            name={`columns.${index}.flags.primaryKey`}
                            render={({ field: f }) => (
                              <FormItem>
                                <FormControl>
                                  <Checkbox
                                    checked={!!f.value}
                                    onCheckedChange={f.onChange}
                                  />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                        </TableCell>
                        <TableCell align="center">
                          <FormField
                            control={form.control}
                            name={`columns.${index}.flags.unique`}
                            render={({ field: f }) => (
                              <FormItem>
                                <FormControl>
                                  <Checkbox
                                    checked={!!f.value}
                                    onCheckedChange={f.onChange}
                                  />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                        </TableCell>
                        <TableCell align="center">
                          <FormField
                            control={form.control}
                            name={`columns.${index}.flags.notNull`}
                            render={({ field: f }) => (
                              <FormItem>
                                <FormControl>
                                  <Checkbox
                                    checked={!!f.value}
                                    onCheckedChange={f.onChange}
                                  />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                        </TableCell>
                        <TableCell align="center">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => remove(index)}
                          >
                            <Trash />
                          </Button>
                        </TableCell>
                      </Reorder.Item>
                    ))}
                  </Reorder.Group>
                </Table>
              </div>

              <div className="space-y-4">
                <p
                  className={twJoin(
                    "text-sm font-medium",
                    form.formState.errors.relations ? "text-destructive" : null,
                  )}
                >
                  Relations
                </p>
                <Table>
                  <TableCaption>
                    <Button
                      type="button"
                      className="w-full"
                      variant="outline"
                      size="icon"
                      onClick={() =>
                        appendRelation({
                          source: "",
                          target: "",
                        })
                      }
                    >
                      <Plus />
                    </Button>
                    {form.formState.errors.relations ? (
                      <p className="text-[0.8rem] font-medium text-destructive">
                        {form.formState.errors.relations.message ||
                          form.formState.errors.relations.root?.message}
                      </p>
                    ) : null}
                  </TableCaption>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Source</TableHead>
                      <TableHead>Target</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {relationsFields.map((field, index) => (
                      <TableRow key={field.id}>
                        <TableCell>
                          <FormField
                            control={form.control}
                            name={`relations.${index}.source`}
                            render={({ field: f }) => (
                              <FormItem>
                                <Select
                                  onValueChange={f.onChange}
                                  defaultValue={f.value}
                                >
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="source" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {sources.map((option) => (
                                      <SelectItem
                                        key={"source:" + option}
                                        value={option}
                                      >
                                        {option}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </TableCell>
                        <TableCell>
                          <FormField
                            control={form.control}
                            name={`relations.${index}.target`}
                            render={({ field: f }) => (
                              <FormItem>
                                <Select
                                  onValueChange={f.onChange}
                                  defaultValue={f.value}
                                >
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="target" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {targets.map((option) => (
                                      <SelectItem
                                        key={"target:" + option}
                                        value={option}
                                      >
                                        {option}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </TableCell>
                        <TableCell align="center">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeRelation(index)}
                          >
                            <Trash />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <Button type="submit" className="w-full">
                Create
              </Button>
            </form>
          </Form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

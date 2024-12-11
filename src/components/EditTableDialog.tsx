"use client";

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

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Button } from "./ui/button";
import { Plus, Trash } from "lucide-react";
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
import { useShallow } from "zustand/react/shallow";
import { Dialogs } from "@/stores/dialogStore";
import useDialog from "@/hooks/useDialog";
import { useEffect, useState } from "react";
import { ScrollArea } from "@radix-ui/react-scroll-area";
import { columnTypes } from "@/lib/columns";

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
      source: z.string(),
      target: z.string(),
    })
    .array(),
});

export default function EditTableForm() {
  const { open, setOpen, param: tableName } = useDialog(Dialogs.EditTable);

  const {
    editTable,
    getTable,
    getRelations,
    diagram,
    editTableRelations,
    deleteTable,
  } = useAppStore(
    useShallow((s) => ({
      editTable: s.editTable,
      getTable: s.getTable,
      diagram: s.diagrams[s.currentDiagram as string],
      getRelations: s.getRelations,
      editTableRelations: s.editTableRelations,
      deleteTable: s.deleteTable,
    })),
  );

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      columns: [],
      relations: [],
    },
  });

  const [sources, setSources] = useState<string[]>([]);
  const [targets, setTargets] = useState<string[]>([]);

  useEffect(() => {
    if (!diagram) {
      return;
    }

    const newSources: string[] = [];
    const newTargets: string[] = [];

    diagram.tables.forEach((t) =>
      t.columns.forEach((c) => {
        if (t.name === tableName) {
          newSources.push(`${t.name}.${c.name}`);
        }
        newTargets.push(`${t.name}.${c.name}`);
      }),
    );

    setSources(newSources);
    setTargets(newTargets);
  }, [diagram, tableName]);

  useEffect(() => {
    if (!open || typeof tableName !== "string") {
      return;
    }

    const currentTable = getTable(tableName);

    if (currentTable) {
      form.reset({
        name: currentTable.name,
        columns: currentTable.columns,
        relations: getRelations(tableName).map((r) => {
          return {
            source: `${r.sourceTable}.${r.sourceColumn}`,
            target: `${r.targetTable}.${r.targetColumn}`,
          };
        }),
      });
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tableName, getTable, open]);

  const { fields, append, remove } = useFieldArray({
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
    if (typeof tableName !== "string") {
      return;
    }

    if (values.name !== tableName && getTable(values.name)) {
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

    editTableRelations(
      tableName,
      values.relations.map((r) => {
        const [sourceTable, sourceColumn] = r.source.split(".");
        const [targetTable, targetColumn] = r.target.split(".");
        return {
          sourceTable,
          sourceColumn,
          targetTable,
          targetColumn,
        };
      }),
    );

    editTable(tableName, values);

    setOpen(false);
  }

  const onDelete = () => {
    if (typeof tableName !== "string") {
      return;
    }

    deleteTable(tableName);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="flex max-h-full p-0 sm:max-h-[90%]">
        <ScrollArea className="w-full overflow-y-auto p-6">
          <DialogHeader className="py-4">
            <DialogTitle>Edit Table</DialogTitle>
            <DialogDescription>
              Edit the table name and columns.
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
                      <TableHead>Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead className="text-center">PK</TableHead>
                      <TableHead className="text-center">Unique</TableHead>
                      <TableHead className="text-center">NotNull</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {fields.map((field, index) => (
                      <TableRow key={field.id}>
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
                      </TableRow>
                    ))}
                  </TableBody>
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
                      onClick={() => appendRelation({ source: "", target: "" })}
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
                                        key={"source" + option}
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
                                        key={"target" + option}
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

              <div className="flex flex-col gap-2">
                <Button type="submit" disabled={!form.formState.isDirty}>
                  Save
                </Button>
                <Button type="button" variant="destructive" onClick={onDelete}>
                  Delete
                </Button>
              </div>
            </form>
          </Form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

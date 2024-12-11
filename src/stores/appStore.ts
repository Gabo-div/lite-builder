import { Diagram } from "@/types/Diagram";
import { create } from "zustand";
import { v4 as uuidv4 } from "uuid";
import { Table } from "@/types/Table";
import { Relation } from "@/types/Relation";

import { persist } from "zustand/middleware";

interface AppStore {
  currentDiagram: string | null;
  diagrams: Record<string, Diagram>;

  openDiagram: (diagramId: string) => void;
  createDiagram: () => void;
  deleteDiagram: (diagramId: string) => void;
  editDiagramName: (diagramId: string, newName: string) => void;

  getTable: (tableName: string) => Table | null;
  addTable: (newTable: Table) => void;
  editTable: (tableName: string, newTable: Table) => void;
  deleteTable: (tableName: string) => void;

  addRelation: (newRelation: Relation) => void;
  getRelations: (tableName: string) => Relation[];
  editTableRelations: (tableName: string, newRelations: Relation[]) => void;
}

export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
      currentDiagram: null,
      diagrams: {},
      openDiagram: (diagramId) => {
        set((state) => ({ ...state, currentDiagram: diagramId }));
      },
      createDiagram: () => {
        set((state) => ({
          ...state,
          diagrams: {
            ...state.diagrams,
            [uuidv4()]: {
              name: `New Diagram ${Object.keys(state.diagrams).length + 1}`,
              tables: [],
              relations: [],
            },
          },
        }));
      },
      deleteDiagram: (diagramId) => {
        set((state) => {
          const diagrams = { ...state.diagrams };
          delete diagrams[diagramId];

          return {
            ...state,
            currentDiagram:
              state.currentDiagram === diagramId ? null : state.currentDiagram,
            diagrams,
          };
        });
      },
      editDiagramName: (diagramId, newDiagramName) => {
        set((state) => {
          return {
            diagrams: {
              ...state.diagrams,
              [diagramId]: {
                ...state.diagrams[diagramId],
                name: newDiagramName,
              },
            },
          };
        });
      },
      getTable: (tableName) => {
        const currentDiagram = get().currentDiagram;

        if (!currentDiagram) {
          return null;
        }

        const currentDiagramData = get().diagrams[currentDiagram];

        return (
          currentDiagramData.tables.find((t) => t.name === tableName) || null
        );
      },
      addTable: (newTable) => {
        set((state) => {
          const currentDiagram = state.currentDiagram;

          if (!currentDiagram) {
            return state;
          }

          const currentDiagramData = state.diagrams[currentDiagram];
          const tableExists = currentDiagramData.tables.some(
            (t) => t.name === newTable.name,
          );

          if (tableExists) {
            return state;
          }

          return {
            ...state,
            diagrams: {
              ...state.diagrams,
              [currentDiagram]: {
                ...currentDiagramData,
                tables: [...currentDiagramData.tables, newTable],
              },
            },
          };
        });
      },
      editTable: (tableName, newTable) => {
        set((state) => {
          const currentDiagram = state.currentDiagram;

          if (!currentDiagram) {
            return state;
          }

          const currentDiagramData = state.diagrams[currentDiagram];

          const tableExists = currentDiagramData.tables.some(
            (t) => t.name === newTable.name,
          );

          if (tableExists && tableName !== newTable.name) {
            return state;
          }

          const tableIndex = currentDiagramData.tables.findIndex(
            (t) => t.name === tableName,
          );

          if (tableIndex === -1) {
            return state;
          }

          const newTables = [...currentDiagramData.tables];
          newTables[tableIndex] = newTable;

          const newRelations = currentDiagramData.relations.map((r) => ({
            sourceTable:
              r.sourceTable === tableName ? newTable.name : r.sourceTable,
            sourceColumn: r.sourceColumn,
            targetTable:
              r.targetTable === tableName ? newTable.name : r.targetTable,
            targetColumn: r.targetColumn,
          }));

          return {
            ...state,
            diagrams: {
              ...state.diagrams,
              [currentDiagram]: {
                ...currentDiagramData,
                tables: newTables,
                relations: newRelations,
              },
            },
          };
        });
      },
      deleteTable: (tableName) => {
        set((state) => {
          const currentDiagram = state.currentDiagram;

          if (!currentDiagram) {
            return state;
          }

          const currentDiagramData = state.diagrams[currentDiagram];

          const newTables = currentDiagramData.tables.filter(
            (t) => t.name !== tableName,
          );

          const newRelations = currentDiagramData.relations.filter(
            (r) => r.sourceTable !== tableName && r.targetTable !== tableName,
          );

          return {
            diagrams: {
              ...state.diagrams,
              [currentDiagram]: {
                name: currentDiagramData.name,
                tables: newTables,
                relations: newRelations,
              },
            },
          };
        });
      },
      addRelation: (newRelation) => {
        set((state) => {
          const currentDiagram = state.currentDiagram;

          if (!currentDiagram) {
            return state;
          }

          const currentDiagramData = state.diagrams[currentDiagram];

          return {
            diagrams: {
              ...state.diagrams,
              [currentDiagram]: {
                ...currentDiagramData,
                relations: [...currentDiagramData.relations, newRelation],
              },
            },
          };
        });
      },
      getRelations: (tableName: string) => {
        const currentDiagram = get().currentDiagram;

        if (!currentDiagram) {
          return [];
        }

        const currentDiagramData = get().diagrams[currentDiagram];

        return currentDiagramData.relations.filter(
          (r) => r.sourceTable === tableName,
        );
      },
      editTableRelations: (tableName, newRelations) => {
        set((state) => {
          const currentDiagram = state.currentDiagram;

          if (!currentDiagram) {
            return state;
          }

          const currentDiagramData = state.diagrams[currentDiagram];

          const hasOtherTable = newRelations.some(
            (r) => r.sourceTable !== tableName,
          );

          if (hasOtherTable) {
            return state;
          }

          const relationWithoutTable = currentDiagramData.relations.filter(
            (r) => r.sourceTable !== tableName,
          );

          const relations = [...relationWithoutTable, ...newRelations];

          return {
            diagrams: {
              ...state.diagrams,
              [currentDiagram]: {
                ...currentDiagramData,
                relations,
              },
            },
          };
        });
      },
    }),

    {
      name: "app-store",
    },
  ),
);

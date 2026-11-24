import { DatabaseSync } from "node:sqlite";
import { PANES } from "../config/index.js";

type AppStatus = "loaded" | "error";

export type TableEntry = {
  name: string;
  rowCount: number;
};

export type GlobalState = {
  databaseUrl: string;
  tables: TableEntry[];
  selectedTable: string;
  status: AppStatus;
  errorMessage: string;
};

export type QueryProps = {
  globalState: GlobalState;
  dbConnection: DatabaseSync | undefined;
  defaultPageSize: number;
  isActive: boolean;
  paneNumber: number;
  paginationFocusRequest: number;
};

export type Row = Record<string, unknown>;

export type SelectTableFn = (tableName: string) => void;

export type MainProps = {
  db: string;
  dbConnection: DatabaseSync;
  tables: TableEntry[];
};

export type StatusScreenProps = {
  width: number;
  height: number;
  message: string;
  detail?: string;
  variant: "loading" | "error";
};

export type PaneId = (typeof PANES)[keyof typeof PANES];

export type SidebarProps = {
  globalState: GlobalState;
  onSelectTable: SelectTableFn;
  isActive: boolean;
  paneNumber: number;
};

export type SidebarMode = "browse" | "filter";
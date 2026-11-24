import { useCallback, useState } from "react";
import { Box, Text, useApp, useInput } from "ink";
import { DatabaseSync } from "node:sqlite";
import { PANES, paneFromShiftKey, type PaneId } from "./panes.js";
import Sidebar from "./core/sidebar.js";
import Query from "./core/query.js";
import useTerminalDimensions from "../hooks/use-terminal-dimensions.js";

// ---------------------------------------------------------------------------
// Gruvbox Dark palette
// ---------------------------------------------------------------------------
const GRUVBOX = {
  bg: "#282828",
  bgHard: "#1d2021",
  bgSoft: "#32302f",
  fg: "#ebdbb2",
  fgMuted: "#a89984",
  fgDim: "#7c6f64",
  border: "#504945",
  accentYellow: "#fabd2f",
  accentGreen: "#b8bb26",
  accentRed: "#fb4934",
  accentAqua: "#8ec07c",
  accentOrange: "#fe8019",
};

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
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

type SelectTableFn = (tableName: string) => void;

type MainProps = {
  db: string;
  dbConnection: DatabaseSync;
  tables: TableEntry[];
};

type StatusScreenProps = {
  width: number;
  height: number;
  message: string;
  detail?: string;
  variant: "loading" | "error";
};

// ---------------------------------------------------------------------------
// Status screen (error / loading fallback)
// ---------------------------------------------------------------------------
function StatusScreen({
  width,
  height,
  message,
  detail,
  variant,
}: StatusScreenProps) {
  const isError = variant === "error";
  const accentColor = isError ? GRUVBOX.accentRed : GRUVBOX.accentYellow;

  return (
    <Box
      flexDirection="column"
      width={width}
      height={height}
      padding={1}
      borderStyle="round"
      borderColor={accentColor}
      backgroundColor={GRUVBOX.bgHard}
    >
      <Text bold color={accentColor}>
        {isError ? "ERROR" : "LOADING"} — {message}
      </Text>
      {detail ? (
        <Box marginTop={1}>
          <Text color={isError ? GRUVBOX.fg : GRUVBOX.fgMuted}>{detail}</Text>
        </Box>
      ) : null}
    </Box>
  );
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
export default function Main({ db, dbConnection, tables }: MainProps) {
  const { columns, rows } = useTerminalDimensions();
  const { exit } = useApp();

  // Clamp dimensions: some terminals report 0×0 briefly on resize.
  // `rows - 1` reserves Ink's last line for the cursor reset.
  const cols = Math.max(columns, 20);
  const rowsClamped = Math.max(rows - 1, 8);

  // The parent (index.ts) already opened the DB and read the schema,
  // so we are "loaded" the moment Main mounts. Status only flips to
  // "error" if the connection is missing entirely.
  const [globalState, setGlobalState] = useState<GlobalState>({
    databaseUrl: db,
    tables,
    selectedTable: tables[0]?.name ?? "",
    status: "loaded",
    errorMessage: "",
  });

  const [activePane, setActivePane] = useState<PaneId>(PANES.SIDEBAR);
  const [paginationFocusRequest, setPaginationFocusRequest] = useState(0);

  // Commit a table selection. Only called from Sidebar on Enter.
  const handleSelectTable: SelectTableFn = useCallback((tableName: string) => {
    setGlobalState((prev) =>
      prev.selectedTable === tableName
        ? prev
        : { ...prev, selectedTable: tableName },
    );
  }, []);

  // -------------------------------------------------------------------------
  // Global keyboard: pane switching + quit.
  // Pane-local keys (j/k/Enter/etc.) live inside each pane's own useInput.
  // -------------------------------------------------------------------------
  useInput((input, key) => {
    // Quit
    if (input === "q" || (key.ctrl && input === "c")) {
      exit();
      return;
    }

    if (input === "#") {
      setActivePane(PANES.QUERY);
      setPaginationFocusRequest((request) => request + 1);
      return;
    }

    // Shift+<n> → focus pane n
    const target = paneFromShiftKey(input);
    if (target !== null && target !== activePane) {
      setActivePane(target);
    }
  });

  // -------------------------------------------------------------------------
  // Error branch — no DB connection
  // -------------------------------------------------------------------------
  if (globalState.status === "error") {
    return (
      <StatusScreen
        width={cols}
        height={rowsClamped}
        variant="error"
        message={globalState.databaseUrl}
        detail={globalState.errorMessage || "Unable to open database."}
      />
    );
  }

  // -------------------------------------------------------------------------
  // Workspace
  // -------------------------------------------------------------------------
  return (
    <Box
      flexDirection="row"
      width={cols}
      height={rowsClamped}
      alignItems="stretch"
      backgroundColor={GRUVBOX.bg}
    >
      <Sidebar
        globalState={globalState}
        onSelectTable={handleSelectTable}
        isActive={activePane === PANES.SIDEBAR}
        paneNumber={PANES.SIDEBAR}
      />
      <Query
        globalState={globalState}
        dbConnection={dbConnection}
        defaultPageSize={10}
        isActive={activePane === PANES.QUERY}
        paneNumber={PANES.QUERY}
        paginationFocusRequest={paginationFocusRequest}
      />
    </Box>
  );
}

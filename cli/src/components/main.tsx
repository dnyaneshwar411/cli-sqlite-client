import { useCallback, useState } from "react";
import { Box, Text, useApp, useInput } from "ink";
import Sidebar from "./sidebar.js";
import Query from "./query.js";
import useTerminalDimensions from "../hooks/use-terminal-dimensions.js";
import { GRUVBOX, PANES } from "../config/index.js";
import { GlobalState, MainProps, PaneId, SelectTableFn, StatusScreenProps, TableEntry } from "../types/index.js";
import { paneFromShiftKey } from "../helpers/index.js";

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

export default function Main({ db, dbConnection, tables }: MainProps) {
  const { columns, rows } = useTerminalDimensions();
  const { exit } = useApp();

  const cols = Math.max(columns, 20);
  const rowsClamped = Math.max(rows - 1, 8);

  const [globalState, setGlobalState] = useState<GlobalState>({
    databaseUrl: db,
    tables,
    selectedTable: tables[0]?.name ?? "",
    status: "loaded",
    errorMessage: "",
  });

  const [activePane, setActivePane] = useState<PaneId>(PANES.SIDEBAR);
  const [paginationFocusRequest, setPaginationFocusRequest] = useState(0);

  const handleSelectTable: SelectTableFn = useCallback((tableName: string) => {
    setGlobalState((prev) =>
      prev.selectedTable === tableName
        ? prev
        : { ...prev, selectedTable: tableName },
    );
  }, []);

  useInput((input, key) => {
    if (input === "q" || (key.ctrl && input === "c")) {
      exit();
      return;
    }

    if (input === "#") {
      setActivePane(PANES.QUERY);
      setPaginationFocusRequest((request) => request + 1);
      return;
    }

    const target = paneFromShiftKey(input);
    if (target !== null && target !== activePane) {
      setActivePane(target);
    }
  });

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

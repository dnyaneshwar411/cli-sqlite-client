import { useEffect, useMemo, useState } from "react";
import { Box, Text, useInput } from "ink";
import type { GlobalState, TableEntry } from "../main.js";

// ---------------------------------------------------------------------------
// Gruvbox palette
// ---------------------------------------------------------------------------
const GRUVBOX = {
  bgHard: "#1d2021",
  bg: "#282828",
  bgSoft: "#32302f",
  bgSelected: "#3c3836",
  fg: "#ebdbb2",
  fgMuted: "#a89984",
  fgDim: "#7c6f64",
  border: "#504945",
  accentYellow: "#fabd2f",
  accentGreen: "#b8bb26",
  accentOrange: "#fe8019",
};

const SIDEBAR_WIDTH = 30;
const SCHEMA_LABEL = "schema: main";
const SQLITE_VERSION_LABEL = "sqlite 3.45.1";
const FILTER_PLACEHOLDER = "filter tables..";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
type SelectTableFn = (tableName: string) => void;

type SidebarProps = {
  globalState: GlobalState;
  onSelectTable: SelectTableFn;
  /** When false, this pane ignores every keystroke. */
  isActive: boolean;
  /** Pane number shown in the header (e.g. 1). */
  paneNumber: number;
};

type SidebarMode = "browse" | "filter";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function extractFileName(dbPath: string): string {
  const parts = dbPath.split(/[/\\]/);
  return parts[parts.length - 1] || dbPath;
}

// ---------------------------------------------------------------------------
// Sidebar
// ---------------------------------------------------------------------------
export default function Sidebar({
  globalState,
  onSelectTable,
  isActive,
  paneNumber,
}: SidebarProps) {
  const [filterQuery, setFilterQuery] = useState<string>("");
  const [mode, setMode] = useState<SidebarMode>("browse");
  const [highlightedIndex, setHighlightedIndex] = useState<number>(0);

  const fileName = useMemo(
    () => extractFileName(globalState.databaseUrl),
    [globalState.databaseUrl],
  );

  const filteredTables: TableEntry[] = useMemo(() => {
    const trimmed = filterQuery.trim().toLowerCase();
    if (!trimmed) return globalState.tables;
    return globalState.tables.filter((t: any) =>
      t.name.toLowerCase().includes(trimmed),
    );
  }, [globalState.tables, filterQuery]);

  // Reset the cursor when the visible LIST changes (filter edits, reloads).
  // Crucially NOT when selectedTable changes — the user may still be browsing.
  useEffect(() => {
    setHighlightedIndex((prev) => {
      if (filteredTables.length === 0) return 0;
      if (prev < filteredTables.length) return prev;
      return 0;
    });
  }, [filteredTables]);

  // When the pane loses focus, drop out of filter mode so the cursor/blur
  // state doesn't leak across pane switches.
  useEffect(() => {
    if (!isActive && mode === "filter") {
      setMode("browse");
    }
  }, [isActive, mode]);

  // -------------------------------------------------------------------------
  // Keyboard handling — gated by isActive via Ink's { isActive } option.
  // -------------------------------------------------------------------------
  useInput(
    (input, key) => {
      // ---- FILTER MODE ----
      if (mode === "filter") {
        if (key.escape) {
          setMode("browse");
          return;
        }
        if (key.return) {
          const chosen = filteredTables[highlightedIndex];
          if (chosen) onSelectTable(chosen.name);
          setMode("browse");
          return;
        }
        if (key.backspace || key.delete) {
          setFilterQuery((prev) => prev.slice(0, -1));
          return;
        }
        if (
          !key.ctrl &&
          !key.meta &&
          input &&
          input.length === 1 &&
          input >= " "
        ) {
          setFilterQuery((prev) => prev + input);
        }
        return;
      }

      // ---- BROWSE MODE ----
      // "/" focuses the filter box.
      if (input === "/") {
        setMode("filter");
        return;
      }
      // Cursor movement only — does NOT change the committed selection.
      if (key.upArrow || input === "k") {
        setHighlightedIndex((prev) =>
          prev > 0 ? prev - 1 : Math.max(0, filteredTables.length - 1),
        );
        return;
      }
      if (key.downArrow || input === "j") {
        setHighlightedIndex((prev) =>
          prev < filteredTables.length - 1 ? prev + 1 : 0,
        );
        return;
      }
      // Enter is the ONLY key that commits a table selection.
      if (key.return) {
        const chosen = filteredTables[highlightedIndex];
        if (chosen) onSelectTable(chosen.name);
        return;
      }
      // Esc while browsing just blurs (no-op for now, keeps the API consistent).
      if (key.escape) {
        return;
      }
    },
    { isActive },
  );

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------
  const borderColor = isActive ? GRUVBOX.accentYellow : GRUVBOX.border;

  return (
    <Box
      flexDirection="column"
      width={SIDEBAR_WIDTH}
      height="100%"
      backgroundColor={GRUVBOX.bgHard}
      borderStyle="single"
      borderRight
      borderTop={false}
      borderBottom={false}
      borderLeft={false}
      borderColor={borderColor}
      justifyContent="space-between"
    >
      <Box flexDirection="column">
        {/* ---- Header: pane number, db file name, table count ---- */}
        <Box
          paddingX={1}
          paddingY={1}
          justifyContent="space-between"
          alignItems="center"
          borderStyle="single"
          borderBottom
          borderTop={false}
          borderLeft={false}
          borderRight={false}
          borderColor={GRUVBOX.border}
        >
          <Box>
            <Text color={GRUVBOX.accentYellow} bold>
              [{paneNumber}]
            </Text>
            <Text color={GRUVBOX.accentGreen}> ● </Text>
            <Text bold color={GRUVBOX.fg}>
              {fileName}
            </Text>
          </Box>
          <Text color={GRUVBOX.fgMuted}>
            {globalState.tables.length} tables
          </Text>
        </Box>

        {/* ---- Filter input ---- */}
        <Box paddingX={2} paddingTop={1} paddingBottom={1}>
          <Box
            width="100%"
            paddingX={1}
            justifyContent="space-between"
            alignItems="center"
            borderStyle="single"
            borderColor={
              mode === "filter" ? GRUVBOX.accentYellow : GRUVBOX.border
            }
            backgroundColor={mode === "filter" ? GRUVBOX.bg : GRUVBOX.bgHard}
          >
            <Text
              color={
                filterQuery
                  ? GRUVBOX.fg
                  : mode === "filter"
                    ? GRUVBOX.fgMuted
                    : GRUVBOX.fgDim
              }
            >
              {filterQuery || FILTER_PLACEHOLDER}
              {mode === "filter" ? "▌" : ""}
            </Text>
            <Text
              color={mode === "filter" ? GRUVBOX.accentYellow : GRUVBOX.fgDim}
            >
              /
            </Text>
          </Box>
        </Box>

        {/* ---- Table list ---- */}
        <Box flexDirection="column" paddingX={1}>
          {filteredTables.map((table, index) => {
            const isSelected = table.name === globalState.selectedTable;
            const isCursor =
              isActive && mode === "browse" && index === highlightedIndex;

            // Cursor background is independent of committed selection.
            const rowBackground = isCursor ? GRUVBOX.bgSelected : undefined;

            // Committed selection takes the orange accent; cursor takes
            // bold fg so both signals are visible independently.
            const nameColor = isSelected
              ? GRUVBOX.accentOrange
              : isCursor
                ? GRUVBOX.fg
                : GRUVBOX.fgMuted;

            const rowColor = isSelected ? GRUVBOX.fg : GRUVBOX.fgDim;

            return (
              <Box
                key={table.name}
                paddingX={1}
                justifyContent="space-between"
                alignItems="center"
                backgroundColor={rowBackground}
              >
                <Box>
                  <Box width={2}>
                    <Text color={GRUVBOX.accentOrange}>
                      {isCursor ? "▸" : " "}
                    </Text>
                  </Box>
                  <Text bold={isSelected || isCursor} color={nameColor}>
                    {table.name}
                  </Text>
                </Box>
                <Text color={rowColor}>
                  {table.rowCount.toLocaleString("en-IN")}
                </Text>
              </Box>
            );
          })}

          {filteredTables.length === 0 && (
            <Box paddingX={2} paddingY={1}>
              <Text color={GRUVBOX.fgDim}>No matching tables</Text>
            </Box>
          )}
        </Box>
      </Box>

      {/* ---- Bottom schema / sqlite version strip ---- */}
      <Box
        paddingX={2}
        paddingY={1}
        justifyContent="space-between"
        alignItems="center"
        borderStyle="single"
        borderTop
        borderBottom={false}
        borderLeft={false}
        borderRight={false}
        borderColor={GRUVBOX.border}
      >
        <Text color={GRUVBOX.fgDim}>{SCHEMA_LABEL}</Text>
        <Text color={GRUVBOX.fgDim}>{SQLITE_VERSION_LABEL}</Text>
      </Box>
    </Box>
  );
}

import { useEffect, useMemo, useState } from "react";
import { Box, Text, useInput } from "ink";
import { SidebarMode, SidebarProps, TableEntry } from "../types/index.js";
import { extractFileName } from "../helpers/index.js";
import { FILTER_PLACEHOLDER, GRUVBOX, SCHEMA_LABEL, SIDEBAR_WIDTH, SQLITE_VERSION_LABEL } from "../config/index.js";

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

  useEffect(() => {
    setHighlightedIndex((prev) => {
      if (filteredTables.length === 0) return 0;
      if (prev < filteredTables.length) return prev;
      return 0;
    });
  }, [filteredTables]);

  useEffect(() => {
    if (!isActive && mode === "filter") {
      setMode("browse");
    }
  }, [isActive, mode]);

  useInput(
    (input, key) => {
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

      if (input === "/") {
        setMode("filter");
        return;
      }
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
      if (key.return) {
        const chosen = filteredTables[highlightedIndex];
        if (chosen) onSelectTable(chosen.name);
        return;
      }
      if (key.escape) {
        return;
      }
    },
    { isActive },
  );

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

        <Box flexDirection="column" paddingX={1}>
          {filteredTables.map((table, index) => {
            const isSelected = table.name === globalState.selectedTable;
            const isCursor =
              isActive && mode === "browse" && index === highlightedIndex;

            const rowBackground = isCursor ? GRUVBOX.bgSelected : undefined;

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
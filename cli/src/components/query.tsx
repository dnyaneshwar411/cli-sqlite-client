import { useEffect, useMemo, useRef, useState } from "react";
import { Box, Text, useInput } from "ink";
import { GRUVBOX, PAGE_SIZES } from "../config/index.js";
import { QueryProps, Row } from "../types/index.js";

function quoteIdentifier(identifier: string) {
  return `"${identifier.replaceAll('"', '""')}"`;
}

function plainValue(value: unknown, maxWidth: number) {
  const text = value === null || value === undefined ? "NULL" : String(value);
  const oneLine = text.replace(/\s+/g, " ");
  return oneLine.length > maxWidth ? `${oneLine.slice(0, Math.max(1, maxWidth - 1))}…` : oneLine;
}

function MetaCell({ label, value, last = false }: { label: string; value: string | number; last?: boolean }) {
  return (
    <Box
      flexGrow={1}
      paddingX={2}
      borderStyle="single"
      borderTop={false}
      borderBottom={false}
      borderLeft={false}
      borderRight={!last}
      borderColor={GRUVBOX.border}
    >
      <Text color={GRUVBOX.fgMuted}>{label} </Text>
      <Text bold color={GRUVBOX.fg}>{value}</Text>
    </Box>
  );
}

function Action({ children, selected, disabled = false }: { children: string; selected: boolean; disabled?: boolean }) {
  return (
    <Box backgroundColor={selected ? GRUVBOX.bgSelected : undefined} paddingX={1}>
      <Text bold={selected} color={disabled ? GRUVBOX.fgDim : selected ? GRUVBOX.accentYellow : GRUVBOX.fgMuted}>{children}</Text>
    </Box>
  );
}

export default function Query({
  globalState,
  dbConnection,
  defaultPageSize,
  isActive,
  paginationFocusRequest,
}: QueryProps) {
  const [activeSubPane, setActiveSubPane] = useState<"grid" | "pagination">("grid");
  const [rowCursor, setRowCursor] = useState(0);
  const [scrollOffset, setScrollOffset] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(defaultPageSize);
  const [paginationCursor, setPaginationCursor] = useState(0);
  const [pageSizeMenuOpen, setPageSizeMenuOpen] = useState(false);
  const [pageSizeCursor, setPageSizeCursor] = useState(0);
  const [refreshKey, setRefreshKey] = useState(0);
  const pendingG = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const data = useMemo(() => {
    if (!dbConnection || !globalState.selectedTable) {
      return { columns: [] as string[], rows: [] as Row[], count: 0, duration: 0 };
    }

    const startedAt = performance.now();
    const table = quoteIdentifier(globalState.selectedTable);
    const count = Number((dbConnection.prepare(`SELECT COUNT(*) AS count FROM ${table}`).get() as { count: number | bigint }).count);
    const rows = dbConnection
      .prepare(`SELECT * FROM ${table} LIMIT ? OFFSET ?`)
      .all(pageSize, (currentPage - 1) * pageSize) as Row[];

    return {
      columns: rows[0] ? Object.keys(rows[0]) : [],
      rows,
      count,
      duration: Math.max(1, Math.round(performance.now() - startedAt)),
    };
  }, [currentPage, dbConnection, globalState.selectedTable, pageSize, refreshKey]);

  const totalPages = Math.max(1, Math.ceil(data.count / pageSize));
  const offset = (currentPage - 1) * pageSize;
  const paginationFocused = isActive && activeSubPane === "pagination";
  const startRow = data.rows.length ? offset + 1 : 0;
  const endRow = offset + data.rows.length;
  const terminalRows = (process.stdout as any).rows || 24;
  const visibleRowCount = Math.max(1, terminalRows - (pageSizeMenuOpen ? 10 : 9));

  useEffect(() => {
    setCurrentPage(1);
    setRowCursor(0);
    setScrollOffset(0);
  }, [globalState.selectedTable]);

  useEffect(() => {
    setCurrentPage((page) => Math.min(page, totalPages));
    setRowCursor((cursor) => Math.min(cursor, Math.max(0, data.rows.length - 1)));
    setScrollOffset((scroll) => Math.min(scroll, Math.max(0, data.rows.length - visibleRowCount)));
  }, [data.rows.length, totalPages, visibleRowCount]);

  useEffect(() => {
    setScrollOffset((scroll) => {
      if (rowCursor < scroll) return rowCursor;
      if (rowCursor >= scroll + visibleRowCount) return rowCursor - visibleRowCount + 1;
      return scroll;
    });
  }, [rowCursor, visibleRowCount]);

  useEffect(() => () => {
    if (pendingG.current) clearTimeout(pendingG.current);
  }, []);

  useEffect(() => {
    if (!isActive) setActiveSubPane("grid");
  }, [isActive]);

  useEffect(() => {
    if (paginationFocusRequest > 0) setActiveSubPane("pagination");
  }, [paginationFocusRequest]);

  useInput((input, key) => {
    if (input === "#") {
      setActiveSubPane("pagination");
      return;
    }

    if (activeSubPane === "grid") {
      if (key.tab) setActiveSubPane("pagination");
      if (input === "G") {
        setRowCursor(Math.max(0, data.rows.length - 1));
        return;
      }
      if (input === "g") {
        if (pendingG.current) {
          clearTimeout(pendingG.current);
          pendingG.current = undefined;
          setRowCursor(0);
        } else {
          pendingG.current = setTimeout(() => {
            pendingG.current = undefined;
          }, 500);
        }
        return;
      }
      if (key.downArrow || input === "j") {
        setRowCursor((cursor) => Math.min(Math.max(0, data.rows.length - 1), cursor + 1));
      }
      if (key.upArrow || input === "k") setRowCursor((cursor) => Math.max(0, cursor - 1));
      return;
    }

    if (pageSizeMenuOpen) {
      if (key.escape) {
        setPageSizeMenuOpen(false);
      } else if (key.leftArrow || key.upArrow || input === "h" || input === "k") {
        setPageSizeCursor((cursor) => Math.max(0, cursor - 1));
      } else if (key.rightArrow || key.downArrow || input === "l" || input === "j") {
        setPageSizeCursor((cursor) => Math.min(PAGE_SIZES.length - 1, cursor + 1));
      } else if (key.return) {
        setPageSize(PAGE_SIZES[pageSizeCursor]!);
        setCurrentPage(1);
        setRowCursor(0);
        setScrollOffset(0);
        setPageSizeMenuOpen(false);
      }
      return;
    }

    if (key.tab) {
      setActiveSubPane("grid");
    } else if (key.leftArrow || input === "h") {
      setPaginationCursor((cursor) => Math.max(0, cursor - 1));
    } else if (key.rightArrow || input === "l") {
      setPaginationCursor((cursor) => Math.min(3, cursor + 1));
    } else if (input === "n") {
      setCurrentPage((page) => Math.min(totalPages, page + 1));
      setRowCursor(0);
      setScrollOffset(0);
    } else if (input === "p") {
      setCurrentPage((page) => Math.max(1, page - 1));
      setRowCursor(0);
      setScrollOffset(0);
    } else if (key.return) {
      if (paginationCursor === 0 && currentPage > 1) {
        setCurrentPage((page) => page - 1);
        setRowCursor(0);
        setScrollOffset(0);
      } else if (paginationCursor === 1 && currentPage < totalPages) {
        setCurrentPage((page) => page + 1);
        setRowCursor(0);
        setScrollOffset(0);
      } else if (paginationCursor === 2) {
        setPageSizeCursor(Math.max(0, PAGE_SIZES.indexOf(pageSize)));
        setPageSizeMenuOpen(true);
      } else if (paginationCursor === 3) {
        setRefreshKey((key) => key + 1);
      }
    }
  }, { isActive });

  const gridColumns = data.columns.slice(0, 5);
  const visibleRows = data.rows.slice(scrollOffset, scrollOffset + visibleRowCount);

  return (
    <Box flexDirection="column" flexGrow={1} minWidth={0} backgroundColor={GRUVBOX.bg}>
      <Box flexDirection="row" borderStyle="single" borderTop={false} borderLeft={false} borderRight={false} borderBottom borderColor={GRUVBOX.border}>
        <MetaCell label="ROWS" value={data.count} />
        <MetaCell label="PAGE" value={`${currentPage} / ${totalPages}`} />
        <MetaCell label="DURATION" value={`${data.duration} ms`} />
        <MetaCell label="COLUMNS" value={data.columns.length} />
        <MetaCell label="OFFSET" value={offset} last />
      </Box>

      <Box flexGrow={1} flexDirection="column" overflow="hidden">
        <Box paddingX={1} flexDirection="row" backgroundColor={GRUVBOX.bgSoft} borderStyle="single" borderTop={false} borderLeft={false} borderRight={false} borderBottom borderColor={GRUVBOX.border}>
          <Box width={6} paddingX={1} justifyContent="flex-end">
            <Text color={GRUVBOX.fgMuted}>#</Text>
          </Box>
          {gridColumns.map((column, index) => (
            <Box key={column} width={index === 0 ? 10 : index === gridColumns.length - 1 ? 20 : undefined} flexGrow={index > 0 && index < gridColumns.length - 1 ? 1 : 0} paddingX={1}>
              <Text color={GRUVBOX.fgMuted}>{column.toUpperCase()}</Text>
            </Box>
          ))}
        </Box>

        {visibleRows.map((row, visibleIndex) => {
          const index = scrollOffset + visibleIndex;
          const highlighted = isActive && activeSubPane === "grid" && index === rowCursor;
          return (
            <Box
              key={offset + index}
              paddingX={1}
              flexDirection="row"
              backgroundColor={highlighted ? GRUVBOX.bgSelected : GRUVBOX.bg}
            >
              <Box width={6} paddingX={1} justifyContent="flex-end">
                <Text color={highlighted ? GRUVBOX.accentYellow : GRUVBOX.fgDim}>{offset + index + 1}</Text>
              </Box>
              {gridColumns.map((column, columnIndex) => (
                <Box key={column} width={columnIndex === 0 ? 10 : columnIndex === gridColumns.length - 1 ? 20 : undefined} flexGrow={columnIndex > 0 && columnIndex < gridColumns.length - 1 ? 1 : 0} paddingX={1} justifyContent={columnIndex === 0 ? "flex-end" : undefined}>
                  <Text bold={highlighted && columnIndex < 2} color={column === "created_at" ? GRUVBOX.fgMuted : GRUVBOX.fg}>
                    {plainValue(row[column], columnIndex === 0 ? 8 : columnIndex === gridColumns.length - 1 ? 18 : 40)}
                  </Text>
                </Box>
              ))}
            </Box>
          );
        })}
      </Box>

      {pageSizeMenuOpen && (
        <Box paddingX={2} gap={1} backgroundColor={GRUVBOX.bgSoft}>
          <Text color={GRUVBOX.fgMuted}>ROWS / PAGE</Text>
          {PAGE_SIZES.map((size, index) => (
            <Text key={size} bold={index === pageSizeCursor} color={index === pageSizeCursor ? GRUVBOX.accentYellow : GRUVBOX.fgMuted} backgroundColor={index === pageSizeCursor ? GRUVBOX.bgSelected : undefined}>
              {` ${size} `}
            </Text>
          ))}
          <Text color={GRUVBOX.fgDim}>←/→ select · Enter apply · Esc cancel</Text>
        </Box>
      )}

      <Box flexDirection="row" justifyContent="space-between" paddingX={2} borderStyle="single" borderTop borderBottom={false} borderLeft={false} borderRight={false} borderColor={GRUVBOX.border}>
        <Box gap={2} alignItems="center">
          <Action selected={paginationFocused && paginationCursor === 0} disabled={currentPage === 1}>← prev</Action>
          <Text color={paginationFocused ? GRUVBOX.accentYellow : GRUVBOX.fgMuted}>{`page ${currentPage} / ${totalPages}`}</Text>
          <Action selected={paginationFocused && paginationCursor === 1} disabled={currentPage === totalPages}>next →</Action>
        </Box>
        <Box gap={2} alignItems="center">
          <Text color={GRUVBOX.fgMuted}>{`Rows ${startRow}–${endRow} of ${data.count}`}</Text>
          <Action selected={paginationFocused && paginationCursor === 2}>{`${pageSize} / page`}</Action>
          <Action selected={paginationFocused && paginationCursor === 3}>↻ refresh</Action>
        </Box>
      </Box>

      <Box paddingX={2} backgroundColor={GRUVBOX.bgHard}>
        <Text color={GRUVBOX.fgDim}>{`SELECT * FROM ${quoteIdentifier(globalState.selectedTable)} LIMIT ${pageSize} OFFSET ${offset}; `}</Text>
        <Text color={GRUVBOX.accentGreen}>{`${data.duration} ms`}</Text>
      </Box>
    </Box>
  );
}

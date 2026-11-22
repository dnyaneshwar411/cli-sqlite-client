import { useEffect, useState } from "react";
import type { DatabaseSync } from "node:sqlite";
import { Box, Text, useApp, useInput, useStdout } from "ink";
import type { UI_STATE } from "../types/index.js";
import { Badge, DataGrid, gruvbox, Panel, StatusBar } from "./ui/gruvbox.js";

interface AppProps {
  conn: DatabaseSync;
  initialState: UI_STATE;
}

const LIMITS = [10, 25, 50];

function quoteIdent(identifier: string): string {
  return `"${identifier.replaceAll('"', '""')}"`;
}

function fetchPage(
  conn: DatabaseSync,
  table: string,
  limit: number,
  page: number,
) {
  const safeTable = quoteIdent(table);
  const { count } = conn
    .prepare(`SELECT COUNT(*) AS count FROM ${safeTable}`)
    .get() as { count: number };

  const totalPages = Math.max(1, Math.ceil(count / limit));
  const clampedPage = Math.min(Math.max(1, page), totalPages);
  const offset = (clampedPage - 1) * limit;

  const rows = conn
    .prepare(`SELECT * FROM ${safeTable} LIMIT ? OFFSET ?`)
    .all(limit, offset) as Record<string, unknown>[];

  return { totalRows: count, totalPages, page: clampedPage, rows };
}

function useTerminalDimensions() {
  const { stdout } = useStdout();
  const [size, setSize] = useState({
    columns: stdout?.columns || 80,
    rows: stdout?.rows || 24,
  });

  useEffect(() => {
    if (!stdout) return;
    const handleResize = () => {
      setSize({
        columns: stdout.columns || 80,
        rows: stdout.rows || 24,
      });
    };
    stdout.on("resize", handleResize);
    return () => {
      stdout.off("resize", handleResize);
    };
  }, [stdout]);

  return size;
}

export default function App({ conn, initialState }: AppProps) {
  const { exit } = useApp();
  const { columns, rows: termRows } = useTerminalDimensions();

  const [tables] = useState<string[]>(initialState.tables);
  const [focusPane, setFocusPane] = useState<"sidebar" | "rows">("sidebar");
  const [cursorIndex, setCursorIndex] = useState(0);
  const [selectedTable, setSelectedTable] = useState<string>(
    initialState.selectedTable || initialState.tables[0] || "",
  );
  const [limit, setLimit] = useState<number>(10);
  const [page, setPage] = useState<number>(1);

  const pageData = selectedTable
    ? fetchPage(conn, selectedTable, limit, page)
    : {
      totalRows: 0,
      totalPages: 1,
      page: 1,
      rows: [] as Record<string, unknown>[],
    };

  useInput((input, key) => {
    if (input === "q" || (key.ctrl && input === "c")) {
      exit();
      return;
    }

    if (key.tab) {
      setFocusPane((prev) => (prev === "sidebar" ? "rows" : "sidebar"));
      return;
    }

    if (focusPane === "sidebar") {
      if (tables.length === 0) return;
      if (key.upArrow || input === "k") {
        setCursorIndex((prev) => Math.max(0, prev - 1));
      } else if (key.downArrow || input === "j") {
        setCursorIndex((prev) => Math.min(tables.length - 1, prev + 1));
      } else if (key.return) {
        const picked = tables[cursorIndex];
        if (picked) {
          setSelectedTable(picked);
          setPage(1);
          setFocusPane("rows");
        }
      }
      return;
    }

    if (key.escape || input === "h") {
      setFocusPane("sidebar");
    } else if (input === "n" || key.rightArrow || input === "l") {
      setPage((prev) => Math.min(pageData.totalPages, prev + 1));
    } else if (input === "p" || key.leftArrow) {
      setPage((prev) => Math.max(1, prev - 1));
    } else if (input === "c") {
      setLimit((prev) => {
        const idx = LIMITS.indexOf(prev);
        return LIMITS[(idx + 1) % LIMITS.length] ?? 10;
      });
      setPage(1);
    }
  });

  const bodyHeight = Math.max(5, termRows - 2);
  const sidebarWidth = Math.min(30, Math.max(20, Math.floor(columns * 0.24)));
  const gridMaxWidth = Math.max(20, columns - sidebarWidth - 4);
  const gridMaxRows = Math.max(1, bodyHeight - 6);

  return (
    <Box flexDirection="column" width={columns} height={termRows}>
      {/* Top Bar */}
      <Box
        width={columns}
        height={1}
        justifyContent="space-between"
        paddingX={1}
        backgroundColor={gruvbox.bgSoft}
      >
        <Box gap={1}>
          <Badge
            label={focusPane === "sidebar" ? "TABLES" : "ROWS"}
            color={gruvbox.bg}
            bgColor={focusPane === "sidebar" ? gruvbox.yellow : gruvbox.aqua}
          />
          <Text bold color={gruvbox.orange}>
            {selectedTable || "NO_TABLE"}
          </Text>
        </Box>
        <Text color={gruvbox.fgDim}>
          limit={limit} · page={pageData.page}/{pageData.totalPages}
        </Text>
      </Box>

      {/* Main Split Workspace */}
      <Box flexDirection="row" width={columns} height={bodyHeight}>
        <Panel
          title={`TABLES (${tables.length})`}
          focused={focusPane === "sidebar"}
          width={sidebarWidth}
          height={bodyHeight}
        >
          {tables.length === 0 ? (
            <Text color={gruvbox.fgDim}>No user tables</Text>
          ) : (
            tables.slice(0, Math.max(1, bodyHeight - 4)).map((table, idx) => {
              const isCursor = idx === cursorIndex;
              const isSelected = table === selectedTable;
              return (
                <Text
                  key={table}
                  bold={isCursor || isSelected}
                  color={
                    isCursor
                      ? gruvbox.yellow
                      : isSelected
                        ? gruvbox.aqua
                        : gruvbox.fg
                  }
                >
                  {isCursor ? "▸ " : "  "}
                  {table}
                  {isSelected ? " •" : ""}
                </Text>
              );
            })
          )}
        </Panel>

        <Panel
          title={selectedTable ? `ROWS: ${selectedTable}` : "ROWS"}
          focused={focusPane === "rows"}
          height={bodyHeight}
          flexGrow={1}
        >
          <DataGrid
            rows={pageData.rows}
            maxRows={gridMaxRows}
            maxWidth={gridMaxWidth}
          />
        </Panel>
      </Box>

      {/* Bottom Status Bar */}
      <StatusBar
        width={columns}
        left="Tab: pane · j/k: move · Enter: select · n/p: page · c: limit · h/Esc: back · q: quit"
        right={`${pageData.totalRows} rows`}
      />
    </Box>
  );
}

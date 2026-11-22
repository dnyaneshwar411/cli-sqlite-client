import type { ReactNode } from "react";
import { Box, Text } from "ink";

export const gruvbox = {
  bg: "#282828",
  bgSoft: "#32302f",
  bgHover: "#3c3836",
  fg: "#ebdbb2",
  fgDim: "#a89984",
  red: "#fb4934",
  green: "#b8bb26",
  yellow: "#fabd2f",
  blue: "#83a598",
  purple: "#d3869b",
  aqua: "#8ec07c",
  orange: "#fe8019",
  border: "#504945",
  borderActive: "#fabd2f",
} as const;

interface PanelProps {
  title: string;
  focused?: boolean;
  width?: number | `${number}%`;
  height?: number;
  flexGrow?: number;
  children: ReactNode;
}

export function Panel({
  title,
  focused = false,
  width,
  height,
  flexGrow,
  children,
}: PanelProps) {
  return (
    <Box
      flexDirection="column"
      width={width}
      height={height}
      flexGrow={flexGrow}
      borderStyle="single"
      borderColor={focused ? gruvbox.borderActive : gruvbox.border}
      paddingX={1}
    >
      <Text bold color={focused ? gruvbox.yellow : gruvbox.fgDim}>
        {focused ? `[${title}]` : ` ${title} `}
      </Text>
      <Box flexDirection="column" flexGrow={1} marginTop={1}>
        {children}
      </Box>
    </Box>
  );
}

interface BadgeProps {
  label: string;
  color: string;
  bgColor?: string;
}

export function Badge({ label, color, bgColor }: BadgeProps) {
  return (
    <Text bold color={color} backgroundColor={bgColor}>
      {` ${label} `}
    </Text>
  );
}

interface DataGridProps {
  rows: Record<string, unknown>[];
  maxRows: number;
  maxWidth: number;
}

function formatCell(value: unknown, colWidth: number): string {
  if (value === null || value === undefined) return "NULL".padEnd(colWidth);
  const raw = typeof value === "object" ? JSON.stringify(value) : String(value);
  const clean = raw.replace(/\s+/g, " ");
  const clipped =
    clean.length > colWidth ? `${clean.slice(0, Math.max(1, colWidth - 1))}…` : clean;
  return clipped.padEnd(colWidth);
}

export function DataGrid({ rows, maxRows, maxWidth }: DataGridProps) {
  if (rows.length === 0) {
    return <Text color={gruvbox.fgDim}>No rows in this page.</Text>;
  }

  const columns = Object.keys(rows[0]!);
  const visibleCols = columns.slice(0, Math.max(1, Math.floor(maxWidth / 22)));
  const colWidth = Math.max(
    10,
    Math.min(24, Math.floor((maxWidth - (visibleCols.length - 1) * 3) / visibleCols.length)),
  );

  const headerLine = visibleCols
    .map((col) => formatCell(col, colWidth))
    .join(" │ ");
  const separatorLine = "─".repeat(Math.min(maxWidth, headerLine.length));

  return (
    <Box flexDirection="column">
      <Text bold color={gruvbox.aqua}>
        {headerLine}
      </Text>
      <Text color={gruvbox.border}>{separatorLine}</Text>
      {rows.slice(0, maxRows).map((row, idx) => (
        <Text key={idx} color={idx % 2 === 0 ? gruvbox.fg : gruvbox.fgDim}>
          {visibleCols.map((col) => formatCell(row[col], colWidth)).join(" │ ")}
        </Text>
      ))}
    </Box>
  );
}

interface StatusBarProps {
  left: string;
  right: string;
  width: number;
}

export function StatusBar({ left, right, width }: StatusBarProps) {
  return (
    <Box
      width={width}
      height={1}
      justifyContent="space-between"
      paddingX={1}
      backgroundColor={gruvbox.bgSoft}
    >
      <Text color={gruvbox.fgDim}>{left}</Text>
      <Text bold color={gruvbox.green}>
        {right}
      </Text>
    </Box>
  );
}

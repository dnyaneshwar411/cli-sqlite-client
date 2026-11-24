// Shared pane registry so Main and every pane agree on numbers and names.
export const PANES = {
  SIDEBAR: 1,
  QUERY: 2,
} as const;

export type PaneId = (typeof PANES)[keyof typeof PANES];

export function paneFromShiftKey(input: string): PaneId | null {
  if (input === "1" || input === "!") return PANES.SIDEBAR;
  if (input === "2" || input === "@") return PANES.QUERY;
  return null;
}

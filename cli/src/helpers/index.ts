import { PANES } from "../config/index.js";
import { PaneId } from "../types/index.js";

export function paneFromShiftKey(input: string): PaneId | null {
  if (input === "1" || input === "!") return PANES.SIDEBAR;
  if (input === "2" || input === "@") return PANES.QUERY;
  return null;
}

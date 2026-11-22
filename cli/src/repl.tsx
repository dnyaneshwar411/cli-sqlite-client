import { DatabaseSync } from "node:sqlite";
import { UI_STATE } from "./types/index.js";
import { render } from "ink";
import App from "./components/app.js";

const STATE: UI_STATE = {
  tables: [],
  selectedTable: "",
};

function findDbTables(conn: DatabaseSync) {
  const query = conn.prepare(`
    SELECT name 
    FROM sqlite_schema 
    WHERE type = 'table' 
      AND name NOT LIKE 'sqlite_%'
  `);
  const rows = query.all();
  rows.forEach((table) => STATE.tables.push(table.name as string));
}

export function startConfiguration(filePath: string) {
  const conn = new DatabaseSync(filePath);
  findDbTables(conn);

  process.stdin.setRawMode(true);
  process.stdin.resume();
  process.stdin.setEncoding("utf8");

  render(<App conn={conn} initialState={STATE} />);
  process.stdin.on("data", function(key: string) {
    switch (key) {
      case "q": {
        process.exit(1);
      }
    }
  });
}
/**
  1. How do setup the database conn
  2. Use it wherever required
*/

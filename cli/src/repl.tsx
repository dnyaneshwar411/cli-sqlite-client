import { render } from "ink";
import Main from "./components/main.js";
import { DatabaseSync } from "node:sqlite";
import { TableEntry } from "./types/index.js";

// Alternate screen + cursor control (nvim-style full-terminal takeover)
const ALT_ON = "\x1b[?1049h";
const ALT_OFF = "\x1b[?1049l";
const CURSOR_HIDE = "\x1b[?25l";
const CURSOR_SHOW = "\x1b[?25h";

let tornDown = false;
function teardown() {
  if (tornDown) return;
  tornDown = true;
  process.stdout.write(CURSOR_SHOW + ALT_OFF);
}
process.on("exit", teardown);
process.on("SIGINT", () => {
  teardown();
  process.exit(0);
});
process.on("SIGTERM", () => {
  teardown();
  process.exit(0);
});

const SYSTEM_TABLES_FILTER = "name NOT LIKE 'sqlite_%'";

const setup = function(filePath: string) {
  try {
    const dbConnection = new DatabaseSync(filePath, { open: true });

    const tableRows = dbConnection
      .prepare(
        `SELECT name FROM sqlite_master WHERE type = 'table' AND ${SYSTEM_TABLES_FILTER} ORDER BY name ASC`,
      )
      .all() as Array<{ name: string }>;

    const parsedTables: TableEntry[] = tableRows.map(({ name }) => {
      const safeIdent = `"${name.replaceAll('"', '""')}"`;
      const countRow = dbConnection!
        .prepare(`SELECT COUNT(*) AS count FROM ${safeIdent}`)
        .get() as { count?: number | bigint } | undefined;
      return { name, rowCount: Number(countRow?.count ?? 0) };
    });

    return {
      dbConnection,
      tables: parsedTables,
    };
  } catch (error) {
    console.error(error);
    return {
      dbConnection: undefined,
      tables: [],
    };
  }
};

export function startConfiguration(filePath: string) {
  process.stdout.write(ALT_ON + CURSOR_HIDE);

  const { dbConnection, tables } = setup(filePath);
  if (!dbConnection) {
    console.error(`error: could not open "${filePath}". see message above.`);
    return process.exit(1);
  }
  const connection = dbConnection;

  const app = render(
    <Main db={filePath} dbConnection={connection} tables={tables} />,
    {
      exitOnCtrlC: false,
    },
  );

  app
    .waitUntilExit()
    .then(() => {
      connection.close();
      teardown();
      process.exit(0);
    })
    .catch((error) => {
      console.error(error, "ERROR OCURRED IN CATCH BLOCK GLOBAL");
      teardown();
      process.exit(1);
    });
}

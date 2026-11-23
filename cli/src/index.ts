#!/usr/bin/env node
import { existsSync, statSync } from "node:fs";
import { resolve } from "node:path";
import { parseArgs } from "node:util";
import { startConfiguration } from "./repl.js";

const config = {
  db: "./storage.db",
};

const { values, positionals } = parseArgs({
  allowPositionals: true,
  options: {
    file: {
      type: "string",
      short: "f",
    },
    help: {
      type: "boolean",
      short: "h",
      default: false,
    },
  },
});

if (values.help) {
  console.log("Usage: sqlite-tui [-f <path>] [file]");
  process.exit(0);
}

setDatabasePath(config, values, positionals);

const isValidConfiguration = checkValidConfiguration(config.db);

if (!isValidConfiguration) {
  console.error(`Invalid database path: ${resolve(config.db)}`);
  process.exit(1);
}

function checkValidConfiguration(filePath: string): boolean {
  if (!filePath || !existsSync(filePath)) {
    return false;
  }

  return statSync(filePath).isFile();
}

function setDatabasePath(
  targetConfig: { db: string },
  parsedValues: { file?: string },
  positionalArgs: string[],
): void {
  const selectedFile = parsedValues.file ?? positionalArgs[0];
  if (selectedFile) {
    targetConfig.db = selectedFile;
  }
}

startConfiguration(config.db);

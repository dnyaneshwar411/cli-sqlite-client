# SQLite Viewer (TUI)

A terminal user interface (TUI) for browsing and inspecting SQLite database files directly in your terminal. Built with Node.js, React, and [Ink](https://github.com/vadimdemedes/ink), featuring a retro Gruvbox dark theme.

---

## 📹 Preview

<p align="center">
  <video src="public/preview.mp4" controls width="100%" poster="https://via.placeholder.com/800x450?text=SQLite+Viewer+Preview"></video>
</p>

> *Note: Place your demo recording video at `public/preview.mp4` to display the video preview.*

---

## ✨ Features

- ⚡ **Native SQLite Integration**: Uses Node.js built-in `node:sqlite` module for fast, synchronous database querying without heavy native dependencies.
- 🎨 **Gruvbox Theme**: Modern TUI styling using the iconic Gruvbox color palette.
- 🗂️ **Dual-Pane Interface**:
  - **Tables Sidebar**: Browse all non-system tables in your database with live cursor indicators.
  - **Data Grid**: View rows formatted cleanly into auto-proportioned columns.
- 📄 **Scrollable Data Grid**: Keep the active row visible while browsing a page; pagination and the SQL readout stay pinned.
- 🔢 **Row Numbers**: Every displayed row has a serial number that continues across pages.
- ⌨️ **Vim & Keyboard Controls**: Navigate with `j`/`k`, jump with `gg` and `G`, and control pagination without leaving the keyboard.
- 📐 **Responsive Terminal Layout**: Automatically adjusts sidebar dimensions, column widths, and line height when resizing your terminal.

---

## 📋 Prerequisites

- **Node.js**: v22.5.0 or higher (requires native `node:sqlite` support).
- **Package Manager**: [pnpm](https://pnpm.io/) (v12.x recommended), `npm`, or `yarn`.

---

## 🛠️ Usage

Run the CLI directly against a SQLite database. GitHub renders a copy button on each command block.

```bash
npx sqlite-cli path/to/database.db
```

```bash
pnpm dlx sqlite-cli path/to/database.db
```

### Run from a local clone

```bash
git clone https://github.com/dnyaneshwar411/cli-sqlite-client.git
cd cli-sqlite-client/cli
pnpm install
pnpm run exe -- path/to/database.db
```

```bash
# Using an explicit file flag
pnpm run exe -- path/to/database.db
pnpm run exe -- -f path/to/database.db
```

### Command Line Options

| Option | Short | Description |
| :--- | :--- | :--- |
| `--file <path>` | `-f` | Path to the SQLite database file to inspect |
| `--help` | `-h` | Show CLI usage help |

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
| :--- | :--- |
| <kbd>Tab</kbd> | Switch between the grid and pagination controls |
| <kbd>j</kbd> / <kbd>↓</kbd> | Move cursor down in Tables sidebar |
| <kbd>k</kbd> / <kbd>↑</kbd> | Move cursor up in Tables sidebar |
| <kbd>Enter</kbd> | Select highlighted table and switch focus to Data Grid |
| <kbd>j</kbd> / <kbd>k</kbd> / <kbd>↑</kbd> / <kbd>↓</kbd> | Scroll the active data row |
| <kbd>g</kbd><kbd>g</kbd> | Jump to the first row on the current page |
| <kbd>G</kbd> | Jump to the last row on the current page |
| <kbd>Shift</kbd>+<kbd>3</kbd> | Focus the pagination controls |
| <kbd>h</kbd> / <kbd>l</kbd> / <kbd>←</kbd> / <kbd>→</kbd> | Select a pagination action |
| <kbd>Enter</kbd> | Activate Previous, Next, page limit, or Refresh |
| <kbd>↑</kbd> / <kbd>↓</kbd> | Choose a page limit (`10`, `20`, `50`) after opening the page-limit control |
| <kbd>Esc</kbd> | Close the page-limit picker |
| <kbd>q</kbd> / <kbd>Ctrl+C</kbd> | Quit application |

---

## 📁 Codebase Overview (`cli/src`)

- **`src/index.ts`**: Main entry point. Parses command line arguments (`parseArgs`), validates the provided database path, and boots the CLI.
- **`src/repl.tsx`**: Initializes `DatabaseSync` connection via `node:sqlite`, fetches database schema tables, and mounts the React/Ink app UI.
- **`src/components/main.tsx`**: Coordinates global pane focus, table selection, and the Shift+3 pagination shortcut.
- **`src/components/core/query.tsx`**: Queries the selected table, maintains the scroll window and row cursor, and renders sticky pagination controls.
- **`src/types/index.ts`**: TypeScript definitions for application and UI state.

---

## 📜 License

This project is licensed under the ISC License.

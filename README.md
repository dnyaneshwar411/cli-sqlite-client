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
- 📄 **Pagination & Custom Limits**: Easily paginate through large datasets with configurable page sizes (`10`, `25`, `50` rows per page).
- ⌨️ **Vim & Keyboard Controls**: Supports both Vim-style navigation (`j`, `k`, `h`, `l`) and standard arrow keys.
- 📐 **Responsive Terminal Layout**: Automatically adjusts sidebar dimensions, column widths, and line height when resizing your terminal.

---

## 📋 Prerequisites

- **Node.js**: v22.5.0 or higher (requires native `node:sqlite` support).
- **Package Manager**: [pnpm](https://pnpm.io/) (v12.x recommended), `npm`, or `yarn`.

---

## 🚀 Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/sqlite-viewer.git
   cd sqlite-viewer/cli
   ```

2. **Install dependencies:**
   ```bash
   pnpm install
   ```

---

## 🛠️ Usage

Pass the path to your target SQLite database file using either positional arguments or the `-f` flag:

```bash
# Using positional argument
pnpm run exe -- path/to/database.db

# Using the -f / --file flag
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
| <kbd>Tab</kbd> | Toggle active pane focus between **Tables Sidebar** and **Rows Data Grid** |
| <kbd>j</kbd> / <kbd>↓</kbd> | Move cursor down in Tables sidebar |
| <kbd>k</kbd> / <kbd>↑</kbd> | Move cursor up in Tables sidebar |
| <kbd>Enter</kbd> | Select highlighted table and switch focus to Data Grid |
| <kbd>h</kbd> / <kbd>Esc</kbd> | Switch focus back to Tables sidebar |
| <kbd>n</kbd> / <kbd>l</kbd> / <kbd>→</kbd> | Next page of rows |
| <kbd>p</kbd> / <kbd>←</kbd> | Previous page of rows |
| <kbd>c</kbd> | Cycle row limit size (`10` → `25` → `50`) |
| <kbd>q</kbd> / <kbd>Ctrl+C</kbd> | Quit application |

---

## 📁 Codebase Overview (`cli/src`)

- **`src/index.ts`**: Main entry point. Parses command line arguments (`parseArgs`), validates the provided database path, and boots the CLI.
- **`src/repl.tsx`**: Initializes `DatabaseSync` connection via `node:sqlite`, fetches database schema tables, and mounts the React/Ink app UI.
- **`src/components/app.tsx`**: Core TUI application component. Manages terminal window dimensions, panel focus states, keyboard event hooks (`useInput`), and SQL query execution/pagination logic.
- **`src/components/ui/gruvbox.tsx`**: UI components (`Panel`, `DataGrid`, `Badge`, `StatusBar`) styled with Gruvbox theme palette tokens.
- **`src/types/index.ts`**: TypeScript definitions for application and UI state.

---

## 📜 License

This project is licensed under the ISC License.

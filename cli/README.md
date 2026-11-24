# sqlite-cli

> A TUI-inspired SQLite database browser for the terminal — inspect `.db` files without leaving your shell.

[![npm version](https://img.shields.io/npm/v/sqlite-cli.svg)](https://www.npmjs.com/package/sqlite-cli)
[![license](https://img.shields.io/npm/l/sqlite-cli.svg)](https://github.com/dnyaneshwar411/cli-sqlite-client/blob/main/LICENSE)
[![node](https://img.shields.io/badge/node-%3E%3D22.5-brightgreen.svg)](https://nodejs.org)

**Demo & docs:** https://cli-sqlite-client.vercel.app
**Repository:** https://github.com/dnyaneshwar411/cli-sqlite-client

---

## Overview

**SQLite Viewer** (`sqlite-cli`) is a terminal database browser built for people who live in the shell. Open a `.db` file, walk the schema, page through rows, and read your data without spinning up a GUI — all with Vim-style keys and a Gruvbox palette that does not fight your eyes.

It is built with **Node.js**, **SQLite**, **React**, and **[Ink](https://github.com/vadimdemedes/ink)**, and is designed around a simple idea: *inspect SQLite without leaving your flow.*

---

## Features

- 🖥️ **Two-pane workspace** — a sidebar for schema navigation and a grid for row data, with keyboard-driven switching between panes
- 🎨 **Gruvbox palette** — a warm, low-contrast theme that is easy on the eyes during long sessions
- ⌨️ **Vim-style keybindings** — `j`/`k` to move, `gg`/`G` to jump to first/last row, `/` to filter, and more
- 📄 **Pagination** — page through large tables with `n`/`p`, and control rows per page
- 🔍 **Filter input** — quick row search with `/`, `Esc` to exit filtering and return to browse mode
- ⚡ **Fast inspection** — runs directly against SQLite files and shows query timing (e.g. `11 ms`) in the status bar
- 🧭 **Schema walk** — select tables from the sidebar with `Enter` to load their rows into the grid

---

## How It Works — The Workspace

The tool presents a **two-pane browser**:

- **Pane 1 (sidebar)** — the list of tables in your database
- **Pane 2 (query pane)** — the data grid showing rows for the selected table

Switch between panes with `Tab`, move with `j`/`k`, and select a table with `Enter`.

**Example — the `users` table**

Selecting the `users` table ("Account records with profile metadata and lifecycle state") renders a grid such as:

| id | username | email | created_at | status |
|----|----------|-------|------------|--------|
| 1 | bhamilton43 | bjarne.hamilton@mailbox.org | 2023-11-11 14:34:58 | active |
| 2 | gthompson98 | guido.thompson@gmail.com | 2023-12-25 10:52:55 | active |
| 3 | dborg83 | donald.borg@hey.com | 2023-11-25 12:28:18 | invited |
| 4 | mturing93 | margaret.turing@outlook.com | 2023-10-06 23:46:28 | suspended |
| 5 | rthompson36 | radia.thompson@fastmail.com | 2023-10-03 16:54:50 | active |
| 6 | sdijkstra90 | sophie.dijkstra@fastmail.com | 2023-11-05 13:34:10 | active |
| 7 | dthompson42 | dennis.thompson@outlook.com | 2023-11-04 12:32:52 | pending |
| 8 | drossum11 | donald.rossum@fastmail.com | 2023-11-27 12:19:20 | suspended |
| 9 | khamilton91 | katherine.hamilton@hey.com | 2023-12-17 23:09:30 | invited |
| 10 | gtorvalds14 | guido.torvalds@hey.com | 2023-11-16 15:25:37 | invited |

The grid also displays pagination controls (`← prev page 1 / 25 next →`), a row counter (`Rows 1–10 of 248`), a page-size selector (`10 / page`), a refresh action (`↻ refresh`), and the SQL the view is running with timing:



---

## Requirements

- **Node.js 22.5+**

---

## Installation & Usage

### Run without installing

```bash
# run directly without installing
$ npx sqlite-cli path/to/database.db
```

### Setup from source

```$ git clone https://github.com/dnyaneshwar411/cli-sqlite-client
$ cd cli-sqlite-client/cli
$ npm install
```

### Usage (from source)

```
# open a database by positional path
$ npm run exe -- path/to/database.db

# or pass it explicitly with --file
$ npm run exe -- -f path/to/database.db
```

### Install globally

```
npm install -g sqlite-cli
sqlite-cli path/to/database.db
```

## Keyboard Reference

Everything is reachable without touching the mouse.

| Key | Action |
| --- | --- |
| `Shift+1` | Focus sidebar (pane 1) |
| `Shift+2` | Focus query pane (pane 2) |
| `Tab` | Toggle between grid and pagination |
| `j` / `↓` | Move cursor down |
| `k` / `↑` | Move cursor up |
| `Enter` | Select / commit table |
| `/` | Focus filter input |
| `Esc` | Exit filter / return to browse |
| `n` | Next page |
| `p` | Previous page |
| `h` / `l` | Navigate pagination controls (`←`/`→`) |
| `gg` | Jump to first row |
| `G` | Jump to last row |
| `q` / `Ctrl+C` | Quit |

---

## Tech Stack

| Layer | Technology |
| --- | --- |
| Runtime | Node.js |
| Database | SQLite |
| UI rendering | React + [Ink](https://github.com/vadimdemedes/ink) (terminal UI) |
| Theme | Gruvbox |

---

## Development

Clone the repository and install dependencies:

```bash
git clone https://github.com/dnyaneshwar411/cli-sqlite-client
cd cli-sqlite-client/cli
npm install
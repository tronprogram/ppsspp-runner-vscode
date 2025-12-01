# PPSSPP Runner

Run your PSP homebrew projects directly from VS Code.

This extension automatically will detect any `EBOOT.PBP` in your workspace directory and will launch it in PPSSPP. This is really intended for anyone trying to use the QuickGame Lua API.

## Features

- **Open PPSSPP**
  - Adds a Run button to VS Code when editing `.lua` files
- **Stop PPSSPP directly from VS Code**
  - Shows a Stop button while PPSSPP is running
- **Detects executable directories**
  - Detects common PPSSPP installation directories on Windows/macOS/Linux
  - Finds `EBOOT.PBP` in your workspace automatically
- **Keybinding**
  - `Ctrl+Shift+R`/`Command+Shift+R` — Run in PPSSPP

## Requirements

- PPSSPP installed on your system
- A PSP homebrew project with:
  - `EBOOT.PBP` in the workspace root

## Settings

| Setting                   | Description                                                      |
| ------------------------- | ---------------------------------------------------------------- |
| `ppssppRunner.ppssppPath` | Path to your PPSSPP executable (auto-detected if empty)          |
| `ppssppRunner.ebootPath`  | Path to `EBOOT.PBP` (defaults to `${workspaceFolder}/EBOOT.PBP`) |

## Commands

| Command                     | Description                                    |
| --------------------------- | ---------------------------------------------- |
| **Run EBOOT.PBP in PPSSPP** | Launches PPSSPP with the specified `EBOOT.PBP` |
| **Stop PPSSPP**             | Terminates the current running PPSSPP instance |

## License

MIT License © 2025 tronprogram

import * as vscode from "vscode";
import { spawn, ChildProcess } from "child_process";
import * as fs from "fs";
import * as path from "path";

let runningProcess: ChildProcess | null = null;
let statusItem: vscode.StatusBarItem;

export function activate(context: vscode.ExtensionContext) {
  const config = vscode.workspace.getConfiguration("ppssppRunner");

  // Status bar item
  statusItem = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Left
  );
  statusItem.text = "$(run) PPSSPP running (click to stop)";
  statusItem.command = "ppssppRunner.stop";
  statusItem.hide();
  context.subscriptions.push(statusItem);

  // RUN COMMAND
  context.subscriptions.push(
    vscode.commands.registerCommand("ppssppRunner.run", async () => {
      let ppssppPath = config.get<string>("ppssppPath") || null;
      let ebootPath = config.get<string>("ebootPath") || null;

      // Resolve PPSSPP path
      if (!ppssppPath) {
        ppssppPath = await detectPPSSPP();
        if (ppssppPath) {
          await config.update(
            "ppssppPath",
            ppssppPath,
            vscode.ConfigurationTarget.Global
          );
        }
      }

      // Resolve EBOOT path
      if (!ebootPath) {
        ebootPath = await detectEboot();
        if (ebootPath) {
          await config.update(
            "ebootPath",
            ebootPath,
            vscode.ConfigurationTarget.Workspace
          );
        }
      }

      if (!ppssppPath) {
        vscode.window.showErrorMessage(
          "PPSSPP executable not found. Configure ppssppRunner.ppssppPath."
        );
        await setRunningContext(false);
        return;
      }

      if (!ebootPath) {
        vscode.window.showErrorMessage(
          "EBOOT.PBP not found in workspace. Configure ppssppRunner.ebootPath or place EBOOT.PBP in the workspace root."
        );
        await setRunningContext(false);
        return;
      }

      startPPSSPP(ppssppPath, ebootPath);
    })
  );

  // STOP COMMAND
  context.subscriptions.push(
    vscode.commands.registerCommand("ppssppRunner.stop", () => {
      if (!runningProcess) {
        vscode.window.showWarningMessage("PPSSPP is not running.");
        return;
      }
      stopPPSSPP();
    })
  );

  // Ensure context starts as "not running"
  setRunningContext(false);
}

async function detectPPSSPP(): Promise<string | null> {
  const candidates: string[] = [];

  if (process.platform === "win32") {
    candidates.push(
      "C:\\Program Files\\PPSSPP\\PPSSPPWindows64.exe",
      "C:\\Program Files (x86)\\PPSSPP\\PPSSPPWindows.exe"
    );
  } else if (process.platform === "darwin") {
    // PPSSPP SDL build on macOS, adjust if you use the non-SDL app
    candidates.push(
      "/Applications/PPSSPPSDL.app/Contents/MacOS/PPSSPPSDL",
      "/Applications/PPSSPP.app/Contents/MacOS/PPSSPP"
    );
  } else {
    candidates.push(
      "/usr/bin/ppsspp",
      "/usr/local/bin/ppsspp",
      "/usr/bin/PPSSPPSDL",
      "/usr/local/bin/PPSSPPSDL"
    );
  }

  for (const guess of candidates) {
    if (fs.existsSync(guess)) {
      return guess;
    }
  }

  // Fall back to manual selection
  const picked = await vscode.window.showOpenDialog({
    canSelectMany: false,
    openLabel: "Select PPSSPP executable",
  });

  if (!picked || picked.length === 0) {
    return null;
  }

  return picked[0].fsPath;
}

async function detectEboot(): Promise<string | null> {
  const folders = vscode.workspace.workspaceFolders;
  if (!folders || folders.length === 0) {
    return null;
  }

  const root = folders[0].uri.fsPath;
  const eboot = path.join(root, "EBOOT.PBP");

  return fs.existsSync(eboot) ? eboot : null;
}

function startPPSSPP(ppssppPath: string, ebootPath: string) {
  if (runningProcess) {
    vscode.window.showWarningMessage("PPSSPP is already running.");
    return;
  }

  vscode.window.showInformationMessage("Launching PPSSPP…");

  statusItem.show();
  setRunningContext(true);

  runningProcess = spawn(ppssppPath, [ebootPath], {
    detached: true,
    stdio: "ignore",
  });

  runningProcess.on("exit", () => {
    runningProcess = null;
    statusItem.hide();
    setRunningContext(false);
    vscode.window.showInformationMessage("PPSSPP closed.");
  });
}

function stopPPSSPP() {
  if (runningProcess) {
    runningProcess.kill("SIGTERM");
    runningProcess = null;
    statusItem.hide();
    setRunningContext(false);
    vscode.window.showInformationMessage("PPSSPP stopped.");
  }
}

async function setRunningContext(isRunning: boolean) {
  await vscode.commands.executeCommand(
    "setContext",
    "ppssppRunner.running",
    isRunning
  );
}

export function deactivate() {
  if (runningProcess) {
    runningProcess.kill("SIGTERM");
  }
  setRunningContext(false);
}
